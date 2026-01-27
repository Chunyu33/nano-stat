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
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }} className="flex-1 text-left">硬件概览</h2>
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* 折叠时显示简要信息 */}
      {isCollapsed && (
        <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="text-xs text-gray-500">
            CPU: <span className="text-emerald-400 font-medium">{data.cpu.usage.toFixed(0)}%</span>
          </div>
          {data.gpu && (
            <div className="text-xs text-gray-500">
              GPU: <span className="text-green-400 font-medium">{data.gpu.usage.toFixed(0)}%</span>
            </div>
          )}
          <div className="text-xs text-gray-500">
            内存: <span className="text-purple-400 font-medium">{data.memory.usage.toFixed(0)}%</span>
          </div>
          <div className="text-xs text-gray-500">
            磁盘: <span className="text-orange-400 font-medium">{data.disks.length}个</span>
          </div>
        </div>
      )}

      {/* 展开时显示完整内容 */}
      {!isCollapsed && (
        <>

      {/* CPU 信息 */}
      <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-gray-400">处理器</span>
        </div>
        <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '6px' }}>{data.cpu.name}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }} className="text-xs">
          <div style={{ color: 'var(--color-text-muted)' }}>
            核心数: <span style={{ color: 'var(--color-text-secondary)' }}>{data.cpu.cores}</span>
          </div>
          <div style={{ color: 'var(--color-text-muted)' }}>
            线程数: <span style={{ color: 'var(--color-text-secondary)' }}>{data.cpu.threads}</span>
          </div>
          <div style={{ color: 'var(--color-text-muted)' }}>
            频率: <span className="text-emerald-400 font-medium">{data.cpu.frequency}MHz</span>
          </div>
          <div style={{ color: 'var(--color-text-muted)' }}>
            使用率: <span className="text-emerald-400 font-medium">{data.cpu.usage.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* GPU 信息 */}
      {data.gpu && (
        <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <MonitorPlay className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs text-gray-400">显卡</span>
          </div>
          <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '6px' }}>{data.gpu.name}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
            <div style={{ color: 'var(--color-text-muted)' }}>
              显存: <span style={{ color: 'var(--color-text-secondary)' }}>{(data.gpu.vram_total / 1024).toFixed(0)}GB</span>
              <span className="text-green-400 ml-1">({data.gpu.vram_used > 0 ? ((data.gpu.vram_used / data.gpu.vram_total) * 100).toFixed(0) : 0}% 已用)</span>
            </div>
            {data.gpu.pcie_info && (
              <div style={{ color: 'var(--color-text-muted)' }}>
                总线: <span style={{ color: 'var(--color-text-secondary)' }}>{data.gpu.pcie_info}</span>
              </div>
            )}
            {data.gpu.driver_version && (
              <div style={{ color: 'var(--color-text-muted)' }}>
                驱动: <span style={{ color: 'var(--color-text-secondary)' }}>{data.gpu.driver_version}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 内存信息 */}
      <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <MemoryStick className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs text-gray-400">内存</span>
        </div>
        <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          {data.memory.memory_type || 'DDR4'} {(data.memory.total / 1024).toFixed(0)}GB
        </p>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          已用: <span className="text-purple-400 font-medium">{(data.memory.used / 1024).toFixed(1)}GB</span>
          <span className="mx-2">|</span>
          可用: <span style={{ color: 'var(--color-text-secondary)' }}>{(data.memory.available / 1024).toFixed(1)}GB</span>
        </div>
      </div>

      {/* 磁盘信息 */}
      <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <HardDrive className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs text-gray-400">存储</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.disks.slice(0, 4).map((disk, index) => (
            <div key={index} className="text-xs">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{disk.name || disk.mount_point}</span>
                <span style={{ fontSize: '12px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}>{disk.disk_type}</span>
              </div>
              <div style={{ color: 'var(--color-text-muted)' }}>
                容量: <span className="text-orange-400">{disk.total.toFixed(0)}GB</span>
                <span className="mx-1">|</span>
                可用: <span style={{ color: 'var(--color-text-secondary)' }}>{disk.available.toFixed(0)}GB</span>
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
        <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>主显示器</p>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          分辨率: <span style={{ color: 'var(--color-text-secondary)' }}>1920×1080</span>
          <span className="mx-2">|</span>
          刷新率: <span className="text-blue-400 font-medium">165Hz</span>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
