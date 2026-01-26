//! CPU 信息采集模块
//! 
//! 负责采集 CPU 相关信息，包括型号、核心数、频率、使用率等

use sysinfo::System;
use super::types::CpuInfo;

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
        temperature: None, // sysinfo 在 Windows 上不直接提供 CPU 温度
        per_core_usage,
    }
}

/// 获取当前 CPU 使用率
pub fn get_cpu_usage(sys: &System) -> f32 {
    sys.global_cpu_usage()
}
