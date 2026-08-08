//! CPU 信息采集模块
//! 
//! 负责采集 CPU 相关信息，包括型号、核心数、频率、使用率等

use sysinfo::{System, Components};
use super::types::CpuInfo;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use once_cell::sync::Lazy;

/// CPU 温度缓存（WMI 查询较慢，避免每次实时刷新都查询）
struct TempCache {
    /// 上次查询时间
    timestamp: Instant,
    /// 缓存的温度值
    value: Option<f32>,
    /// 查询失败时的重试间隔（查询不到时延长，避免反复慢查询）
    retry_interval: Duration,
}

/// 温度缓存：查询成功 5 秒内复用；查询失败 60 秒后再重试
static TEMP_CACHE: Lazy<Mutex<TempCache>> = Lazy::new(|| {
    Mutex::new(TempCache {
        timestamp: Instant::now() - Duration::from_secs(10),
        value: None,
        retry_interval: Duration::from_secs(60),
    })
});

/// 获取 CPU 详细信息
pub fn get_cpu_info(sys: &System) -> CpuInfo {
    let cpus = sys.cpus();
    
    // 获取 CPU 名称（从第一个核心获取）
    let name = cpus.first()
        .map(|cpu| cpu.brand().to_string())
        .unwrap_or_else(|| "Unknown CPU".to_string());
    
    // 计算平均频率
    let frequency = if !cpus.is_empty() {
        cpus.iter().map(|cpu| cpu.frequency()).sum::<u64>() / cpus.len() as u64
    } else {
        0
    };
    
    // 计算总体 CPU 使用率
    let usage = sys.global_cpu_usage();
    
    // 获取每核心使用率
    let per_core_usage: Vec<f32> = cpus.iter()
        .map(|cpu| cpu.cpu_usage())
        .collect();
    
    // 物理核心数（sysinfo 提供的是逻辑核心数）
    let physical_cores = sys.physical_core_count().unwrap_or(cpus.len()) as u32;
    let threads = cpus.len() as u32;
    
    CpuInfo {
        name,
        cores: physical_cores,
        threads,
        frequency,
        usage,
        temperature: get_cpu_temperature(sys),
        per_core_usage,
    }
}

/// 获取当前 CPU 使用率
pub fn get_cpu_usage(sys: &System) -> f32 {
    sys.global_cpu_usage()
}

/// 获取 CPU 温度
/// 
/// 通过 WMI (MSAcpi_ThermalZoneTemperature) 获取，不同主板/笔记本支持情况不同：
/// - 部分笔记本/主板可以读到（热区温度）
/// - 台式机（尤其无核显 CPU）通常读不到，返回 None
/// 
/// 带 5 秒缓存，避免每次实时刷新都触发 WMI 查询
pub fn get_cpu_temperature(_sys: &System) -> Option<f32> {
    // 检查缓存是否仍然有效
    {
        let cache = TEMP_CACHE.lock().ok()?;
        if cache.timestamp.elapsed() < cache.retry_interval {
            return cache.value;
        }
    }
    
    // WMI 查询（较慢，仅在缓存过期时执行）
    let value = query_cpu_temperature();
    
    // 更新缓存：查询成功用 5 秒间隔，失败用 60 秒间隔（避免反复慢查询）
    if let Ok(mut cache) = TEMP_CACHE.lock() {
        cache.timestamp = Instant::now();
        cache.value = value;
        cache.retry_interval = if value.is_some() {
            Duration::from_secs(5)
        } else {
            Duration::from_secs(60)
        };
    }
    
    value
}

/// 通过 sysinfo Components 查询 CPU 温度（底层是 WMI MSAcpi_ThermalZoneTemperature）
fn query_cpu_temperature() -> Option<f32> {
    let components = Components::new_with_refreshed_list();
    
    // 筛选与 CPU 相关的热区（标签通常包含 CPU/Processor/Thermal）
    components.list().iter()
        .find(|c| {
            let label = c.label().to_lowercase();
            label.contains("cpu") || label.contains("processor") || label.contains("thermal")
        })
        .map(|c| c.temperature())
        .or_else(|| components.list().first().map(|c| c.temperature()))
}
