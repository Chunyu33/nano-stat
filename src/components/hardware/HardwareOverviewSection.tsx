/**
 * 硬件概览左侧区域组件
 * 展示 CPU、GPU、内存、磁盘、网络的概览信息
 */

import { useState } from 'react';
import { Cpu, MonitorPlay, MemoryStick, HardDrive, Monitor, ChevronDown, ChevronRight } from 'lucide-react';
import type { HardwareOverview } from '../../types/hardware';

interface HardwareOverviewSectionProps {
  /** 硬件概览数据 */
  data: HardwareOverview | null;
}

export function HardwareOverviewSection({ data }: HardwareOverviewSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!data) {
    return (
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="h-4 bg-gray-700/50 rounded w-1/3"></div>
          <div className="h-20 bg-gray-700/50 rounded-lg"></div>
          <div className="h-20 bg-gray-700/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '16px' }}>
      {/* 标题 - 可点击折叠 */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isCollapsed ? '0' : '16px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Cpu className="w-4 h-4 text-emerald-400" />
        </div>
        <h2 className="text-sm font-semibold text-gray-100 flex-1 text-left">硬件概览</h2>
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* 可折叠内容 */}
      {!isCollapsed && (
        <>

      {/* CPU 信息 */}
      <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #1e2a3d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-gray-400">处理器</span>
        </div>
        <p className="text-xs text-gray-100 font-medium" style={{ marginBottom: '6px' }}>{data.cpu.name}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }} className="text-xs">
          <div className="text-gray-500">
            核心数: <span className="text-gray-300">{data.cpu.cores}</span>
          </div>
          <div className="text-gray-500">
            线程数: <span className="text-gray-300">{data.cpu.threads}</span>
          </div>
          <div className="text-gray-500">
            频率: <span className="text-emerald-400 font-medium">{data.cpu.frequency}MHz</span>
          </div>
          <div className="text-gray-500">
            使用率: <span className="text-emerald-400 font-medium">{data.cpu.usage.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* GPU 信息 */}
      {data.gpu && (
        <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #1e2a3d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <MonitorPlay className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs text-gray-400">显卡</span>
          </div>
          <p className="text-xs text-gray-100 font-medium" style={{ marginBottom: '6px' }}>{data.gpu.name}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }} className="text-xs">
            <div className="text-gray-500">
              显存: <span className="text-gray-300">{(data.gpu.vram_total / 1024).toFixed(0)}GB</span>
              <span className="text-green-400 ml-1">({data.gpu.vram_used > 0 ? ((data.gpu.vram_used / data.gpu.vram_total) * 100).toFixed(0) : 0}% 已用)</span>
            </div>
            {data.gpu.pcie_info && (
              <div className="text-gray-500">
                总线: <span className="text-gray-300">{data.gpu.pcie_info}</span>
              </div>
            )}
            {data.gpu.driver_version && (
              <div className="text-gray-500">
                驱动: <span className="text-gray-300">{data.gpu.driver_version}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 内存信息 */}
      <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #1e2a3d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <MemoryStick className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs text-gray-400">内存</span>
        </div>
        <p className="text-xs text-gray-100 font-medium" style={{ marginBottom: '4px' }}>
          {data.memory.memory_type || 'DDR4'} {(data.memory.total / 1024).toFixed(0)}GB
        </p>
        <div className="text-xs text-gray-500">
          已用: <span className="text-purple-400 font-medium">{(data.memory.used / 1024).toFixed(1)}GB</span>
          <span className="mx-2">|</span>
          可用: <span className="text-gray-300">{(data.memory.available / 1024).toFixed(1)}GB</span>
        </div>
      </div>

      {/* 磁盘信息 */}
      <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #1e2a3d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <HardDrive className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs text-gray-400">存储</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.disks.slice(0, 4).map((disk, index) => (
            <div key={index} className="text-xs">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span className="text-gray-200 font-medium">{disk.name || disk.mount_point}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{disk.disk_type}</span>
              </div>
              <div className="text-gray-500">
                容量: <span className="text-orange-400">{disk.total.toFixed(0)}GB</span>
                <span className="mx-1">|</span>
                可用: <span className="text-gray-300">{disk.available.toFixed(0)}GB</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 显示器信息 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Monitor className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs text-gray-400">显示器</span>
        </div>
        <p className="text-xs text-gray-100 font-medium" style={{ marginBottom: '4px' }}>主显示器</p>
        <div className="text-xs text-gray-500">
          分辨率: <span className="text-gray-300">1920×1080</span>
          <span className="mx-2">|</span>
          刷新率: <span className="text-blue-400 font-medium">165Hz</span>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
