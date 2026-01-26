//! GPU 信息采集模块
//! 
//! 负责采集 NVIDIA GPU 相关信息，使用 NVML 库

use super::types::GpuInfo;
use nvml_wrapper::Nvml;
use std::sync::Mutex;
use once_cell::sync::Lazy;

/// 全局 NVML 实例
static NVML: Lazy<Mutex<Option<Nvml>>> = Lazy::new(|| {
    Mutex::new(Nvml::init().ok())
});

/// 获取 GPU 详细信息
pub fn get_gpu_info() -> Option<GpuInfo> {
    let nvml_guard = NVML.lock().ok()?;
    let nvml = nvml_guard.as_ref()?;
    
    // 获取第一个 GPU 设备
    let device = nvml.device_by_index(0).ok()?;
    
    // 获取 GPU 名称
    let name = device.name().unwrap_or_else(|_| "Unknown GPU".to_string());
    
    // 获取显存信息
    let memory_info = device.memory_info().ok()?;
    let vram_total = memory_info.total / (1024 * 1024); // 转换为 MB
    let vram_used = memory_info.used / (1024 * 1024);
    
    // 获取 GPU 使用率
    let utilization = device.utilization_rates().ok();
    let usage = utilization.map(|u| u.gpu as f32).unwrap_or(0.0);
    
    // 获取温度
    let temperature = device.temperature(nvml_wrapper::enum_wrappers::device::TemperatureSensor::Gpu).ok().map(|t| t as f32);
    
    // 获取功耗
    let power_usage = device.power_usage().ok().map(|p| p as f32 / 1000.0); // 转换为 W
    
    // 获取核心频率
    let core_clock = device.clock_info(nvml_wrapper::enum_wrappers::device::Clock::Graphics).ok();
    
    // 获取显存频率
    let memory_clock = device.clock_info(nvml_wrapper::enum_wrappers::device::Clock::Memory).ok();
    
    // 获取 PCIe 信息
    let pcie_info = device.pci_info().ok().map(|_| {
        format!("PCIe x{} @ Gen{}", 
            device.current_pcie_link_width().unwrap_or(0),
            device.current_pcie_link_gen().unwrap_or(0)
        )
    });
    
    // 获取驱动版本
    let driver_version = nvml.sys_driver_version().ok();
    
    Some(GpuInfo {
        name,
        brand: "NVIDIA".to_string(),
        vram_total,
        vram_used,
        usage,
        temperature,
        power_usage,
        core_clock,
        memory_clock,
        pcie_info,
        driver_version,
    })
}

/// 获取当前 GPU 使用率
pub fn get_gpu_usage() -> f32 {
    let nvml_guard = match NVML.lock() {
        Ok(guard) => guard,
        Err(_) => return 0.0,
    };
    
    let nvml = match nvml_guard.as_ref() {
        Some(nvml) => nvml,
        None => return 0.0,
    };
    
    let device = match nvml.device_by_index(0) {
        Ok(device) => device,
        Err(_) => return 0.0,
    };
    
    device.utilization_rates()
        .map(|u| u.gpu as f32)
        .unwrap_or(0.0)
}

/// 获取当前 GPU 温度
pub fn get_gpu_temperature() -> Option<f32> {
    let nvml_guard = NVML.lock().ok()?;
    let nvml = nvml_guard.as_ref()?;
    let device = nvml.device_by_index(0).ok()?;
    
    device.temperature(nvml_wrapper::enum_wrappers::device::TemperatureSensor::Gpu)
        .ok()
        .map(|t| t as f32)
}
