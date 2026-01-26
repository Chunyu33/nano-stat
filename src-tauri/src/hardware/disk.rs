//! 磁盘信息采集模块
//! 
//! 负责采集系统磁盘信息，包括容量、使用情况等

use sysinfo::{System, Disks};
use super::types::DiskInfo;

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
