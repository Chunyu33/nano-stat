/**
 * 硬件概览左侧区域组件
 * 展示 CPU、GPU、内存、磁盘、网络的概览信息
 */

import { useState } from 'react';
import { Cpu, MonitorPlay, MemoryStick, HardDrive, Monitor, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import type { HardwareOverview } from '../../types/hardware';

interface HardwareOverviewSectionProps {
  /** 硬件概览数据 */
  data: HardwareOverview | null;
}

/** 生成硬件信息文本 */
function generateHardwareInfoText(data: HardwareOverview): string {
  const lines: string[] = [];
  lines.push('=== 硬件信息 ===\n');
  
  // CPU
  lines.push('【处理器】');
  lines.push(`型号: ${data.cpu.name}`);
  lines.push(`核心/线程: ${data.cpu.cores}核 / ${data.cpu.threads}线程`);
  lines.push(`频率: ${data.cpu.frequency}MHz`);
  lines.push(`使用率: ${data.cpu.usage.toFixed(1)}%`);
  lines.push('');
  
  // GPU
  if (data.gpu) {
    lines.push('【显卡】');
    lines.push(`型号: ${data.gpu.name}`);
    lines.push(`显存: ${(data.gpu.vram_total / 1024).toFixed(0)}GB`);
    if (data.gpu.driver_version) {
      lines.push(`驱动版本: ${data.gpu.driver_version}`);
    }
    lines.push('');
  }
  
  // 内存
  lines.push('【内存】');
  lines.push(`类型: ${data.memory.memory_type || 'DDR4'}`);
  lines.push(`容量: ${(data.memory.total / 1024).toFixed(0)}GB`);
  lines.push(`已用: ${(data.memory.used / 1024).toFixed(1)}GB (${data.memory.usage.toFixed(1)}%)`);
  lines.push('');
  
  // 磁盘
  lines.push('【存储设备】');
  data.disks.forEach(disk => {
    lines.push(`${disk.name || disk.mount_point} (${disk.disk_type}): ${disk.total.toFixed(0)}GB, 可用 ${disk.available.toFixed(0)}GB`);
  });
  lines.push('');
  
  // 显示器
  if (data.display && data.display.width > 0 && data.display.refresh_rate > 0) {
    lines.push('【显示器】');
    lines.push(`分辨率: ${data.display.width}×${data.display.height}`);
    lines.push(`刷新率: ${data.display.refresh_rate}Hz`);
  }
  
  return lines.join('\n');
}

export function HardwareOverviewSection({ data }: HardwareOverviewSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  // 复制硬件信息
  const handleCopyInfo = async () => {
    if (!data) return;
    try {
      const text = generateHardwareInfoText(data);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!data) {
    return (
      <div className="card p-4">
        <div className="flex flex-col gap-4">
          <div className="h-4 bg-gray-700/50 rounded w-1/3"></div>
          <div className="h-20 bg-gray-700/50 rounded-lg"></div>
          <div className="h-20 bg-gray-700/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      {/* 标题栏 */}
      <div className={`flex items-center gap-2.5 ${isCollapsed ? 'mb-0' : 'mb-4'}`}>
        {/* 折叠按钮 */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2.5 flex-1 bg-transparent border-none cursor-pointer p-0"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <h2 className="flex-1 text-left text-sm font-semibold text-[var(--color-text-primary)]">硬件概览</h2>
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {/* 复制按钮 */}
        <button
          onClick={handleCopyInfo}
          className={`flex items-center gap-1.5 rounded-md transition-all hover:bg-[var(--color-bg-input)] px-2.5 py-1.5 text-[11px] border border-[var(--color-border)] bg-transparent ${
            copied ? 'text-emerald-500' : 'text-[var(--color-text-muted)]'
          }`}
          title="复制硬件信息"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              复制
            </>
          )}
        </button>
      </div>

      {/* 内容区域 - 使用半折叠效果 */}
      <div style={{ 
        position: 'relative',
        maxHeight: isCollapsed ? '260px' : '1000px',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-in-out'
      }}>
        {/* CPU 信息 */}
        <div className="mb-3.5 pb-3.5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 mb-2">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-gray-400">处理器</span>
          </div>
          <p className="text-xs font-medium text-[var(--color-text-primary)] mb-1.5">{data.cpu.name}</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="text-[var(--color-text-muted)]">
              核心数: <span className="text-[var(--color-text-secondary)]">{data.cpu.cores}</span>
            </div>
            <div className="text-[var(--color-text-muted)]">
              线程数: <span className="text-[var(--color-text-secondary)]">{data.cpu.threads}</span>
            </div>
            <div className="text-[var(--color-text-muted)]">
              频率: <span className="text-emerald-400 font-medium">{data.cpu.frequency}MHz</span>
            </div>
            <div className="text-[var(--color-text-muted)]">
              使用率: <span className="text-emerald-400 font-medium">{data.cpu.usage.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* GPU 信息 */}
        {data.gpu && (
          <div className="mb-3.5 pb-3.5 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-1.5 mb-2">
              <MonitorPlay className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-gray-400">显卡</span>
            </div>
            <p className="text-xs font-medium text-[var(--color-text-primary)] mb-1.5">{data.gpu.name}</p>
            <div className="flex flex-col gap-0.5 text-xs">
              <div className="text-[var(--color-text-muted)]">
                显存: <span className="text-[var(--color-text-secondary)]">{(data.gpu.vram_total / 1024).toFixed(0)}GB</span>
                <span className="text-green-400 ml-1">({data.gpu.vram_used > 0 ? ((data.gpu.vram_used / data.gpu.vram_total) * 100).toFixed(0) : 0}% 已用)</span>
              </div>
              {data.gpu.pcie_info && (
                <div className="text-[var(--color-text-muted)]">
                  总线: <span className="text-[var(--color-text-secondary)]">{data.gpu.pcie_info}</span>
                </div>
              )}
              {data.gpu.driver_version && (
                <div className="text-[var(--color-text-muted)]">
                  驱动: <span className="text-[var(--color-text-secondary)]">{data.gpu.driver_version}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 内存信息 */}
        <div className="mb-3.5 pb-3.5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 mb-2">
            <MemoryStick className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-gray-400">内存</span>
          </div>
          <p className="text-xs font-medium text-[var(--color-text-primary)] mb-1">
            {data.memory.memory_type || 'DDR4'} {(data.memory.total / 1024).toFixed(0)}GB
          </p>
          <div className="text-xs text-[var(--color-text-muted)]">
            已用: <span className="text-purple-400 font-medium">{(data.memory.used / 1024).toFixed(1)}GB</span>
            <span className="mx-2">|</span>
            可用: <span className="text-[var(--color-text-secondary)]">{(data.memory.available / 1024).toFixed(1)}GB</span>
          </div>
        </div>

        {/* 磁盘信息 */}
        <div className="mb-3.5 pb-3.5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 mb-2">
            <HardDrive className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs text-gray-400">存储</span>
          </div>
          <div className="flex flex-col gap-2">
            {data.disks.slice(0, 4).map((disk, index) => (
              <div key={index} className="text-xs">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium text-[var(--color-text-primary)]">{disk.name || disk.mount_point}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-bg-input)] text-[var(--color-text-muted)]">{disk.disk_type}</span>
                </div>
                <div className="text-[var(--color-text-muted)]">
                  容量: <span className="text-orange-400">{disk.total.toFixed(0)}GB</span>
                  <span className="mx-1">|</span>
                  可用: <span className="text-[var(--color-text-secondary)]">{disk.available.toFixed(0)}GB</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 显示器信息（动态获取当前模式，非硬编码） */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-gray-400">显示器</span>
          </div>
          <p className="text-xs font-medium text-[var(--color-text-primary)] mb-1">主显示器</p>
          <div className="text-xs text-[var(--color-text-muted)]">
            分辨率: <span className="text-[var(--color-text-secondary)]">
              {data.display && data.display.width > 0
                ? `${data.display.width}×${data.display.height}`
                : '--'}
            </span>
            <span className="mx-2">|</span>
            刷新率: <span className="text-blue-400 font-medium">
              {data.display && data.display.refresh_rate > 0 ? `${data.display.refresh_rate}Hz` : '--'}
            </span>
          </div>
        </div>

        {/* 占位 */}
        <div className="h-[33px]" />

        {/* 折叠时的渐变蒙版 */}
        {isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 h-[60px] pointer-events-none bg-[linear-gradient(to_bottom,transparent,var(--color-bg-card))]" />
        )}
      </div>

      {/* 展开/收起提示 */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-full flex items-center justify-center gap-1 mt-2 py-1.5 bg-transparent border-none cursor-pointer text-[var(--color-text-muted)] text-[11px] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          点击展开更多
        </button>
      )}
    </div>
  );
}
