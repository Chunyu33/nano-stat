//! GPU 信息采集模块
//! 
//! 支持 NVIDIA (NVML)、AMD 和 Intel 集显 (WMI)

use super::types::GpuInfo;
use nvml_wrapper::Nvml;
use std::sync::Mutex;
use once_cell::sync::Lazy;
use serde::Deserialize;

/// 全局 NVML 实例 (用于 NVIDIA 显卡)
static NVML: Lazy<Mutex<Option<Nvml>>> = Lazy::new(|| {
    Mutex::new(Nvml::init().ok())
});

/// WMI GPU 信息结构
#[derive(Deserialize, Debug)]
#[serde(rename_all = "PascalCase")]
#[allow(dead_code)]
struct Win32VideoController {
    name: Option<String>,
    adapter_ram: Option<u64>,
    driver_version: Option<String>,
}

/// GPU 品牌类型
#[derive(Debug, Clone, PartialEq)]
enum GpuBrand {
    Nvidia,
    Amd,
    Intel,
    Unknown,
}

/// 检测 GPU 品牌
fn detect_gpu_brand(name: &str) -> GpuBrand {
    let name_lower = name.to_lowercase();
    if name_lower.contains("nvidia") || name_lower.contains("geforce") || name_lower.contains("quadro") || name_lower.contains("rtx") || name_lower.contains("gtx") {
        GpuBrand::Nvidia
    } else if name_lower.contains("amd") || name_lower.contains("radeon") || name_lower.contains("rx ") {
        GpuBrand::Amd
    } else if name_lower.contains("intel") || name_lower.contains("uhd") || name_lower.contains("iris") || name_lower.contains("hd graphics") {
        GpuBrand::Intel
    } else {
        GpuBrand::Unknown
    }
}

/// 通过 NVML 获取 NVIDIA GPU 信息
fn get_nvidia_gpu_info() -> Option<GpuInfo> {
    let nvml_guard = NVML.lock().ok()?;
    let nvml = nvml_guard.as_ref()?;
    
    let device = nvml.device_by_index(0).ok()?;
    
    let name = device.name().unwrap_or_else(|_| "Unknown GPU".to_string());
    
    let memory_info = device.memory_info().ok()?;
    let vram_total = memory_info.total / (1024 * 1024);
    let vram_used = memory_info.used / (1024 * 1024);
    
    let utilization = device.utilization_rates().ok();
    let usage = utilization.map(|u| u.gpu as f32).unwrap_or(0.0);
    
    let temperature = device.temperature(nvml_wrapper::enum_wrappers::device::TemperatureSensor::Gpu).ok().map(|t| t as f32);
    let power_usage = device.power_usage().ok().map(|p| p as f32 / 1000.0);
    let core_clock = device.clock_info(nvml_wrapper::enum_wrappers::device::Clock::Graphics).ok();
    let memory_clock = device.clock_info(nvml_wrapper::enum_wrappers::device::Clock::Memory).ok();
    
    let pcie_info = device.pci_info().ok().map(|_| {
        format!("PCIe x{} @ Gen{}", 
            device.current_pcie_link_width().unwrap_or(0),
            device.current_pcie_link_gen().unwrap_or(0)
        )
    });
    
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

/// 通过 WMI 获取 GPU 信息 (AMD/Intel/通用)
fn get_wmi_gpu_info() -> Option<GpuInfo> {
    let wmi_con = wmi::WMIConnection::new(wmi::COMLibrary::new().ok()?).ok()?;
    
    let results: Vec<Win32VideoController> = wmi_con.query().ok()?;
    
    // 优先选择独立显卡 (AMD > Intel)
    let gpu = results.into_iter()
        .filter(|g| g.name.is_some())
        .max_by_key(|g| {
            let name = g.name.as_ref().unwrap();
            let brand = detect_gpu_brand(name);
            match brand {
                GpuBrand::Amd => 2,
                GpuBrand::Intel => 1,
                _ => 0,
            }
        })?;
    
    let name = gpu.name.unwrap_or_else(|| "Unknown GPU".to_string());
    let brand = detect_gpu_brand(&name);
    let brand_str = match brand {
        GpuBrand::Amd => "AMD",
        GpuBrand::Intel => "Intel",
        _ => "Unknown",
    }.to_string();
    
    // WMI 返回的显存单位是字节，转换为 MB
    let vram_total = gpu.adapter_ram.unwrap_or(0) / (1024 * 1024);
    
    Some(GpuInfo {
        name,
        brand: brand_str,
        vram_total,
        vram_used: 0, // WMI 无法获取已用显存
        usage: 0.0,   // WMI 无法获取使用率
        temperature: None, // WMI 无法获取温度
        power_usage: None,
        core_clock: None,
        memory_clock: None,
        pcie_info: None,
        driver_version: gpu.driver_version,
    })
}

/// 获取 GPU 详细信息 (自动检测品牌)
pub fn get_gpu_info() -> Option<GpuInfo> {
    // 优先尝试 NVML (NVIDIA)
    if let Some(info) = get_nvidia_gpu_info() {
        return Some(info);
    }
    
    // 回退到 WMI (AMD/Intel)
    get_wmi_gpu_info()
}

/// 获取当前 GPU 使用率
pub fn get_gpu_usage() -> f32 {
    // 只有 NVIDIA 可以通过 NVML 获取使用率
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
    // 只有 NVIDIA 可以通过 NVML 获取温度
    let nvml_guard = NVML.lock().ok()?;
    let nvml = nvml_guard.as_ref()?;
    let device = nvml.device_by_index(0).ok()?;
    
    device.temperature(nvml_wrapper::enum_wrappers::device::TemperatureSensor::Gpu)
        .ok()
        .map(|t| t as f32)
}
