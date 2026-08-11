//! 磁盘信息采集模块
//! 
//! 负责采集系统磁盘信息，包括容量、使用情况、读写速率等

use sysinfo::{System, Disks};
use super::types::DiskInfo;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use once_cell::sync::Lazy;
use windows::core::w;
use windows::Win32::System::Performance::{
    PdhAddEnglishCounterW, PdhCloseQuery, PdhCollectQueryData, PdhGetFormattedCounterValue,
    PdhOpenQueryW, PDH_FMT_COUNTERVALUE, PDH_FMT_DOUBLE, PDH_HCOUNTER, PDH_HQUERY,
};

/// PDH 磁盘计数器查询句柄（惰性初始化一次，进程生命周期内复用）
struct PdhState {
    query: PDH_HQUERY,
    read_counter: PDH_HCOUNTER,
    write_counter: PDH_HCOUNTER,
}

// PDH 查询句柄可在多线程使用（同一查询的所有访问由下方 Mutex 串行化），
// windows crate 的句柄 newtype 未声明 Send，这里安全地补上标记
unsafe impl Send for PdhState {}

/// PDH 查询状态；None 表示尚未初始化
static PDH_STATE: Lazy<Mutex<Option<PdhState>>> = Lazy::new(|| Mutex::new(None));
/// 初始化失败标记（如计数器不存在），避免每秒反复重试打开
static PDH_INIT_FAILED: AtomicBool = AtomicBool::new(false);

/// 获取所有磁盘信息
pub fn get_disk_info(_sys: &System) -> Vec<DiskInfo> {
    let disks = Disks::new_with_refreshed_list();
    
    disks.iter().map(|disk| {
        let total_bytes = disk.total_space();
        let available_bytes = disk.available_space();
        let used_bytes = total_bytes.saturating_sub(available_bytes);
        
        // 转换为 GB
        let total = total_bytes as f64 / (1024.0 * 1024.0 * 1024.0);
        let used = used_bytes as f64 / (1024.0 * 1024.0 * 1024.0);
        let available = available_bytes as f64 / (1024.0 * 1024.0 * 1024.0);
        
        // 计算使用率
        let usage = if total > 0.0 {
            (used / total * 100.0) as f32
        } else {
            0.0
        };
        
        // 判断磁盘类型
        let disk_type = if disk.is_removable() {
            "Removable".to_string()
        } else {
            match disk.kind() {
                sysinfo::DiskKind::SSD => "SSD".to_string(),
                sysinfo::DiskKind::HDD => "HDD".to_string(),
                _ => "Unknown".to_string(),
            }
        };
        
        DiskInfo {
            name: disk.name().to_string_lossy().to_string(),
            mount_point: disk.mount_point().to_string_lossy().to_string(),
            disk_type,
            total,
            used,
            available,
            usage,
        }
    }).collect()
}

/// 获取磁盘读写速率（MB/s，所有物理磁盘合计）
///
/// 通过 PDH 计数器 `PhysicalDisk(_Total)\Disk Read/Write Bytes/sec` 读取：
/// - 查询句柄惰性初始化一次，进程生命周期内复用（开销 <1ms）
/// - 计数器路径用 `PdhAddEnglishCounter`，不受中文系统本地化影响
/// - 首次采集后需间隔 ≥1s 才有有效速率，数据无效时返回 None（前端显示 --）
pub fn get_disk_rates() -> Option<(f64, f64)> {
    // 初始化失败则永久回退（避免每秒重试打开）
    if PDH_INIT_FAILED.load(Ordering::Relaxed) {
        return None;
    }

    let mut guard = PDH_STATE.lock().ok()?;
    if guard.is_none() {
        let mut query = PDH_HQUERY::default();
        if unsafe { PdhOpenQueryW(None, 0, &mut query) } != 0 {
            PDH_INIT_FAILED.store(true, Ordering::Relaxed);
            return None;
        }

        let mut read_counter = PDH_HCOUNTER::default();
        let mut write_counter = PDH_HCOUNTER::default();
        let ok = unsafe {
            PdhAddEnglishCounterW(query, w!("\\PhysicalDisk(_Total)\\Disk Read Bytes/sec"), 0, &mut read_counter) == 0
                && PdhAddEnglishCounterW(query, w!("\\PhysicalDisk(_Total)\\Disk Write Bytes/sec"), 0, &mut write_counter) == 0
        };
        if !ok {
            unsafe { PdhCloseQuery(query) };
            PDH_INIT_FAILED.store(true, Ordering::Relaxed);
            return None;
        }

        *guard = Some(PdhState { query, read_counter, write_counter });
    }
    let state = guard.as_ref()?;

    // 收集新数据（速率计数器需要两次采集间隔 ≥1s 才有效）
    unsafe { PdhCollectQueryData(state.query) };

    let read = read_pdh_counter(state.read_counter)?;
    let written = read_pdh_counter(state.write_counter)?;

    // bytes/s → MB/s
    Some((read / (1024.0 * 1024.0), written / (1024.0 * 1024.0)))
}

/// 读取 PDH 计数器当前值（bytes/s）；数据无效（首次采集后间隔不足等）返回 None
fn read_pdh_counter(counter: PDH_HCOUNTER) -> Option<f64> {
    let mut value = PDH_FMT_COUNTERVALUE::default();
    let status = unsafe { PdhGetFormattedCounterValue(counter, PDH_FMT_DOUBLE, None, &mut value) };
    // API 成功且数据有效（PDH_CSTATUS_VALID_DATA == 0）
    if status != 0 || value.CStatus != 0 {
        return None;
    }
    Some(unsafe { value.Anonymous.doubleValue })
}
