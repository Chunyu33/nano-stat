/**
 * 硬件信息类型定义
 * 与 Rust 后端的类型定义保持一致
 */

/** CPU 详细信息 */
export interface CpuInfo {
  /** CPU 名称 */
  name: string;
  /** 核心数 */
  cores: number;
  /** 线程数 */
  threads: number;
  /** 当前频率 (MHz) */
  frequency: number;
  /** CPU 使用率 (0-100) */
  usage: number;
  /** CPU 温度 (摄氏度) */
  temperature: number | null;
  /** 每核心使用率 */
  per_core_usage: number[];
}

/** GPU 详细信息 */
export interface GpuInfo {
  /** GPU 名称 */
  name: string;
  /** 品牌 */
  brand: string;
  /** 显存大小 (MB) */
  vram_total: number;
  /** 已用显存 (MB) */
  vram_used: number;
  /** GPU 使用率 (0-100) */
  usage: number;
  /** GPU 温度 (摄氏度) */
  temperature: number | null;
  /** 功耗 (W) */
  power_usage: number | null;
  /** 核心频率 (MHz) */
  core_clock: number | null;
  /** 显存频率 (MHz) */
  memory_clock: number | null;
  /** PCIe 信息 */
  pcie_info: string | null;
  /** 驱动版本 */
  driver_version: string | null;
}

/** 内存信息 */
export interface MemoryInfo {
  /** 总内存 (MB) */
  total: number;
  /** 已用内存 (MB) */
  used: number;
  /** 可用内存 (MB) */
  available: number;
  /** 使用率 (0-100) */
  usage: number;
  /** 内存类型 */
  memory_type: string | null;
  /** 内存频率 (MHz) */
  frequency: number | null;
}

/** 磁盘信息 */
export interface DiskInfo {
  /** 磁盘名称 */
  name: string;
  /** 挂载点 */
  mount_point: string;
  /** 磁盘类型 */
  disk_type: string;
  /** 总容量 (GB) */
  total: number;
  /** 已用空间 (GB) */
  used: number;
  /** 可用空间 (GB) */
  available: number;
  /** 使用率 (0-100) */
  usage: number;
}

/** 网络接口信息 */
export interface NetworkInterface {
  /** 接口名称 */
  name: string;
  /** 接收字节数 */
  rx_bytes: number;
  /** 发送字节数 */
  tx_bytes: number;
  /** 接收速率 (bytes/s) */
  rx_rate: number;
  /** 发送速率 (bytes/s) */
  tx_rate: number;
}

/** 网络信息 */
export interface NetworkInfo {
  /** 网络接口列表 */
  interfaces: NetworkInterface[];
}

/** 完整的硬件概览信息 */
export interface HardwareOverview {
  /** CPU 信息 */
  cpu: CpuInfo;
  /** GPU 信息 */
  gpu: GpuInfo | null;
  /** 内存信息 */
  memory: MemoryInfo;
  /** 磁盘列表 */
  disks: DiskInfo[];
  /** 网络信息 */
  network: NetworkInfo;
}

/** 网络统计数据 */
export interface NetworkStats {
  /** 下载速率 (KB/s) */
  download_rate: number;
  /** 上传速率 (KB/s) */
  upload_rate: number;
  /** 延迟 (ms) */
  latency: number | null;
}

/** 实时监控数据 */
export interface RealtimeStats {
  /** CPU 使用率 (0-100) */
  cpu_usage: number;
  /** GPU 使用率 (0-100) */
  gpu_usage: number;
  /** GPU 温度 */
  gpu_temp: number | null;
  /** 内存使用率 (0-100) */
  memory_usage: number;
  /** 网络统计 */
  network_stats: NetworkStats;
  /** 时间戳 */
  timestamp: number;
}

/** 监控面板位置 */
export type MonitorPosition = 'TopCenter' | 'BottomCenter' | 'LeftCenter' | 'RightCenter';

/** 显示项目配置 */
export interface DisplayItems {
  /** 显示 CPU 使用率 */
  cpu: boolean;
  /** 显示 GPU 使用率 */
  gpu: boolean;
  /** 显示 GPU 温度 */
  gpu_temp: boolean;
  /** 显示内存使用率 */
  memory: boolean;
  /** 显示网络速率 */
  network: boolean;
  /** 显示帧率 */
  fps: boolean;
}

/** 监控设置 */
export interface MonitorSettings {
  /** 是否启用游戏内监控 */
  enabled: boolean;
  /** 监控面板位置 */
  position: MonitorPosition;
  /** 显示项目 */
  display_items: DisplayItems;
  /** 刷新间隔 (ms) */
  refresh_interval: number;
  /** 透明度 (0-100) */
  opacity: number;
}
