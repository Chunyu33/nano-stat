//! 硬件信息采集模块
//! 
//! 该模块负责采集系统硬件信息，包括：
//! - CPU 信息和使用率
//! - GPU 信息和使用率（NVIDIA）
//! - 内存使用情况
//! - 磁盘信息
//! - 网络流量统计

pub mod cpu;
pub mod gpu;
pub mod memory;
pub mod disk;
pub mod network;
pub mod types;

use types::*;
use std::sync::Mutex;
use once_cell::sync::Lazy;
use sysinfo::System;

/// 全局系统信息实例，用于持续监控
pub static SYSTEM: Lazy<Mutex<System>> = Lazy::new(|| {
    let mut sys = System::new_all();
    sys.refresh_all();
    Mutex::new(sys)
});

/// 获取完整的硬件概览信息
pub fn get_hardware_overview() -> HardwareOverview {
    let mut sys = SYSTEM.lock().unwrap();
    sys.refresh_all();
    
    HardwareOverview {
        cpu: cpu::get_cpu_info(&sys),
        gpu: gpu::get_gpu_info(),
        memory: memory::get_memory_info(&sys),
        disks: disk::get_disk_info(&sys),
        network: network::get_network_info(&sys),
    }
}

/// 获取实时监控数据（用于游戏内监控面板）
pub fn get_realtime_stats() -> RealtimeStats {
    let mut sys = SYSTEM.lock().unwrap();
    sys.refresh_all();
    
    RealtimeStats {
        cpu_usage: cpu::get_cpu_usage(&sys),
        cpu_temp: cpu::get_cpu_temperature(&sys),
        gpu_usage: gpu::get_gpu_usage(),
        gpu_temp: gpu::get_gpu_temperature(),
        memory_usage: memory::get_memory_usage(&sys),
        network_stats: network::get_network_stats(&sys),
        timestamp: chrono::Utc::now().timestamp_millis(),
    }
}
