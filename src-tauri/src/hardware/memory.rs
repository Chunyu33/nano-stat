//! 内存信息采集模块
//! 
//! 负责采集系统内存使用情况

use sysinfo::System;
use super::types::MemoryInfo;

/// 获取内存详细信息
pub fn get_memory_info(sys: &System) -> MemoryInfo {
    let total = sys.total_memory() / (1024 * 1024); // 转换为 MB
    let used = sys.used_memory() / (1024 * 1024);
    let available = sys.available_memory() / (1024 * 1024);
    
    // 计算使用率
    let usage = if total > 0 {
        (used as f32 / total as f32) * 100.0
    } else {
        0.0
    };
    
    MemoryInfo {
        total,
        used,
        available,
        usage,
        memory_type: None, // sysinfo 不提供内存类型信息
        frequency: None,   // sysinfo 不提供内存频率信息
    }
}

/// 获取当前内存使用率
pub fn get_memory_usage(sys: &System) -> f32 {
    let total = sys.total_memory();
    let used = sys.used_memory();
    
    if total > 0 {
        (used as f32 / total as f32) * 100.0
    } else {
        0.0
    }
}
