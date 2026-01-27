//! 硬件信息数据类型定义
//! 
//! 定义所有硬件信息相关的数据结构，用于前后端通信

use serde::{Deserialize, Serialize};

/// 完整的硬件概览信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HardwareOverview {
    /// CPU 信息
    pub cpu: CpuInfo,
    /// GPU 信息
    pub gpu: Option<GpuInfo>,
    /// 内存信息
    pub memory: MemoryInfo,
    /// 磁盘列表
    pub disks: Vec<DiskInfo>,
    /// 网络信息
    pub network: NetworkInfo,
}

/// CPU 详细信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuInfo {
    /// CPU 名称（如 "Intel Core i5-10600KF"）
    pub name: String,
    /// 核心数
    pub cores: u32,
    /// 线程数
    pub threads: u32,
    /// 当前频率 (MHz)
    pub frequency: u64,
    /// CPU 使用率 (0-100)
    pub usage: f32,
    /// CPU 温度 (摄氏度，可能不可用)
    pub temperature: Option<f32>,
    /// 每核心使用率
    pub per_core_usage: Vec<f32>,
}

/// GPU 详细信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuInfo {
    /// GPU 名称（如 "NVIDIA GeForce RTX 3070"）
    pub name: String,
    /// 品牌
    pub brand: String,
    /// 显存大小 (MB)
    pub vram_total: u64,
    /// 已用显存 (MB)
    pub vram_used: u64,
    /// GPU 使用率 (0-100)
    pub usage: f32,
    /// GPU 温度 (摄氏度)
    pub temperature: Option<f32>,
    /// 功耗 (W)
    pub power_usage: Option<f32>,
    /// 核心频率 (MHz)
    pub core_clock: Option<u32>,
    /// 显存频率 (MHz)
    pub memory_clock: Option<u32>,
    /// PCIe 信息
    pub pcie_info: Option<String>,
    /// 驱动版本
    pub driver_version: Option<String>,
}

/// 内存信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryInfo {
    /// 总内存 (MB)
    pub total: u64,
    /// 已用内存 (MB)
    pub used: u64,
    /// 可用内存 (MB)
    pub available: u64,
    /// 使用率 (0-100)
    pub usage: f32,
    /// 内存类型（如 "DDR4"）
    pub memory_type: Option<String>,
    /// 内存频率 (MHz)
    pub frequency: Option<u32>,
}

/// 磁盘信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskInfo {
    /// 磁盘名称
    pub name: String,
    /// 挂载点
    pub mount_point: String,
    /// 磁盘类型（SSD/HDD）
    pub disk_type: String,
    /// 总容量 (GB)
    pub total: f64,
    /// 已用空间 (GB)
    pub used: f64,
    /// 可用空间 (GB)
    pub available: f64,
    /// 使用率 (0-100)
    pub usage: f32,
}

/// 网络信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkInfo {
    /// 网络接口列表
    pub interfaces: Vec<NetworkInterface>,
}

/// 网络接口信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkInterface {
    /// 接口名称
    pub name: String,
    /// 接收字节数
    pub rx_bytes: u64,
    /// 发送字节数
    pub tx_bytes: u64,
    /// 接收速率 (bytes/s)
    pub rx_rate: f64,
    /// 发送速率 (bytes/s)
    pub tx_rate: f64,
}

/// 实时监控数据（用于游戏内监控）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RealtimeStats {
    /// CPU 使用率 (0-100)
    pub cpu_usage: f32,
    /// CPU 温度
    pub cpu_temp: Option<f32>,
    /// GPU 使用率 (0-100)
    pub gpu_usage: f32,
    /// GPU 温度
    pub gpu_temp: Option<f32>,
    /// 内存使用率 (0-100)
    pub memory_usage: f32,
    /// 网络统计
    pub network_stats: NetworkStats,
    /// 时间戳
    pub timestamp: i64,
}

/// 网络统计数据
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkStats {
    /// 下载速率 (KB/s)
    pub download_rate: f64,
    /// 上传速率 (KB/s)
    pub upload_rate: f64,
    /// 延迟 (ms)
    pub latency: Option<f64>,
}

/// 监控设置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorSettings {
    /// 是否启用游戏内监控
    pub enabled: bool,
    /// 监控面板位置
    pub position: MonitorPosition,
    /// 显示项目
    pub display_items: DisplayItems,
    /// 刷新间隔 (ms)
    pub refresh_interval: u32,
    /// 透明度 (0-100)
    pub opacity: u8,
}

/// 监控面板位置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MonitorPosition {
    /// 顶部中间
    TopCenter,
    /// 底部中间
    BottomCenter,
    /// 左侧中间
    LeftCenter,
    /// 右侧中间
    RightCenter,
}

impl Default for MonitorPosition {
    fn default() -> Self {
        MonitorPosition::TopCenter
    }
}

/// 显示项目配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayItems {
    /// 显示 CPU 使用率
    pub cpu: bool,
    /// 显示 CPU 温度
    pub cpu_temp: bool,
    /// 显示 GPU 使用率
    pub gpu: bool,
    /// 显示 GPU 温度
    pub gpu_temp: bool,
    /// 显示内存使用率
    pub memory: bool,
    /// 显示网络速率
    pub network: bool,
    /// 显示帧率
    pub fps: bool,
}

impl Default for DisplayItems {
    fn default() -> Self {
        DisplayItems {
            cpu: true,
            cpu_temp: false,
            gpu: true,
            gpu_temp: true,
            memory: true,
            network: true,
            fps: false,
        }
    }
}

impl Default for MonitorSettings {
    fn default() -> Self {
        MonitorSettings {
            enabled: false,
            position: MonitorPosition::default(),
            display_items: DisplayItems::default(),
            refresh_interval: 1000,
            opacity: 80,
        }
    }
}
