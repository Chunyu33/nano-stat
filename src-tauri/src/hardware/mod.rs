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
pub mod game;
pub mod lhm;
pub mod fps;
pub mod display;
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
        display: display::get_display_info(),
    }
}

/// 获取实时监控数据（用于游戏内监控面板）
pub fn get_realtime_stats() -> RealtimeStats {
    let mut sys = SYSTEM.lock().unwrap();
    
    // 实时监控只关心 CPU、内存的使用率，避免 refresh_all 的全量开销
    // （磁盘、进程等静态数据由 get_hardware_overview 负责）
    sys.refresh_cpu_usage();
    sys.refresh_memory();
    
    // FPS 采集：始终按前台窗口进程统计（全屏游戏=游戏帧率，桌面=前台应用帧率），
    // 拿不到前台进程（如悬浮窗自身在前台）时才统计所有进程。
    // 避免混入 DWM 合成器与后台应用的 Present 事件导致数值偏高。
    let is_game_active = game::is_game_active();
    fps::set_target_pid(game::get_foreground_pid());
    fps::settle_fps();
    
    RealtimeStats {
        cpu_usage: cpu::get_cpu_usage(&sys),
        cpu_temp: cpu::get_cpu_temperature(&sys),
        gpu_usage: gpu::get_gpu_usage(),
        gpu_temp: gpu::get_gpu_temperature(),
        memory_usage: memory::get_memory_usage(&sys),
        network_stats: network::get_network_stats(&sys),
        is_game_active,
        // 始终返回 FPS（非游戏时是桌面整体帧率），前端全程显示
        fps: fps::get_fps(),
        timestamp: chrono::Utc::now().timestamp_millis(),
    }
}
