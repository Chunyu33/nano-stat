/**
 * 游戏内监控页面
 * 展示监控预览和配置说明（合并为单一盒子：上方实时预览，下方当前配置）
 */

import { Monitor, Settings, RefreshCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight } from 'lucide-react';
import { useMonitorSettings } from '../hooks/useMonitorSettings';
import { useHardwareData } from '../hooks/useHardwareData';
import { formatSpeed, formatGb, formatDiskRate } from '../utils/format';
import type { MonitorPosition } from '../types/hardware';

/** 位置图标映射 */
const positionIcons: Record<MonitorPosition, typeof ArrowUp> = {
  TopCenter: ArrowUp,
  BottomCenter: ArrowDown,
  LeftCenter: ArrowLeft,
  RightCenter: ArrowRight,
  TopLeft: ArrowUpLeft,
  TopRight: ArrowUpRight,
  BottomLeft: ArrowDownLeft,
  BottomRight: ArrowDownRight,
};

/** 位置标签映射 */
const positionLabels: Record<MonitorPosition, string> = {
  TopCenter: '顶部中间',
  BottomCenter: '底部中间',
  LeftCenter: '左侧中间',
  RightCenter: '右侧中间',
  TopLeft: '左上角',
  TopRight: '右上角',
  BottomLeft: '左下角',
  BottomRight: '右下角',
};

/** 位置 CSS 类映射（预览模拟屏幕内的定位） */
const positionClasses: Record<MonitorPosition, string> = {
  TopCenter: 'top-2 left-1/2 -translate-x-1/2',
  BottomCenter: 'bottom-2 left-1/2 -translate-x-1/2',
  LeftCenter: 'left-2 top-1/2 -translate-y-1/2',
  RightCenter: 'right-2 top-1/2 -translate-y-1/2',
  TopLeft: 'top-2 left-2',
  TopRight: 'top-2 right-2',
  BottomLeft: 'bottom-2 left-2',
  BottomRight: 'bottom-2 right-2',
};

/** 垂直布局位置（仅左右居中） */
const verticalPositions: MonitorPosition[] = ['LeftCenter', 'RightCenter'];

/** 配置信息行组件（当前配置区复用） */
function ConfigRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg p-3 px-4 bg-[var(--color-bg-input)]">
      <span className="text-[13px] text-[var(--color-text-muted)]">{label}</span>
      {children}
    </div>
  );
}

export function MonitorPage() {
  const { settings, loading: settingsLoading, refreshSettings } = useMonitorSettings();
  const { realtime } = useHardwareData(1000);

  const PositionIcon = positionIcons[settings.position];
  const isVertical = verticalPositions.includes(settings.position);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
          <Monitor className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">游戏内监控</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">在游戏中实时显示硬件性能数据</p>
        </div>
      </div>

      {/* 合并容器：预览 + 当前配置（占满可用宽度） */}
      <div className="card w-full p-6">
        {/* 监控面板预览 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">监控面板预览</h2>
          <button
            type="button"
            onClick={() => void refreshSettings()}
            disabled={settingsLoading}
            title="刷新预览设置"
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-input)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-emerald-500/50 hover:text-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${settingsLoading ? 'animate-spin' : ''}`} />
            刷新预览
          </button>
        </div>

        {/* 模拟屏幕（宽度撑满容器，高度固定，预览面板只同步位置/显示项/透明度，字号固定） */}
        <div className="relative rounded-xl overflow-hidden h-[240px] bg-[linear-gradient(160deg,#0b0f16_0%,#111827_60%,#0a0e14_100%)] border border-[#2d3748]">
          {/* 监控面板预览（仿真实 overlay 样式） */}
          <div
            className={`absolute rounded-md ${positionClasses[settings.position]} border border-[rgba(71,85,105,0.5)] shadow-[0_2px_8px_rgba(0,0,0,0.35)] px-2.5 py-1.5 text-[12px] text-[#f7fafc] max-w-[94%] max-h-[94%] overflow-hidden`}
            style={{
              backgroundColor: `rgba(15, 23, 42, ${settings.opacity / 100})`,
              whiteSpace: isVertical ? 'normal' : 'nowrap',
            }}
          >
            <div className={`flex ${isVertical ? 'flex-col gap-0.5' : 'flex-row gap-3'}`}>
              {settings.display_items.cpu && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[#9ca3af]">CPU</span>
                  <span className="font-bold text-[#0ea5e9]">{realtime?.cpu_usage.toFixed(0) || '--'}%</span>
                </div>
              )}
              {settings.display_items.gpu && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[#9ca3af]">GPU</span>
                  <span className="font-bold text-[#10b981]">{realtime?.gpu_usage.toFixed(0) || '--'}%</span>
                </div>
              )}
              {settings.display_items.cpu_temp && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[#9ca3af]">CPU温度</span>
                  <span className="font-bold text-[#f59e0b]">{realtime?.cpu_temp?.toFixed(0) || '--'}°C</span>
                </div>
              )}
              {settings.display_items.gpu_temp && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[#9ca3af]">GPU温度</span>
                  <span className="font-bold text-[#f59e0b]">{realtime?.gpu_temp?.toFixed(0) || '--'}°C</span>
                </div>
              )}
              {settings.display_items.memory && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[#9ca3af]">内存</span>
                  <span className="font-bold text-[#a855f7]">
                    {realtime?.memory_usage.toFixed(0) || '--'}%
                    {realtime ? ` ${formatGb(realtime.memory_used)}/${formatGb(realtime.memory_total)}` : ''}
                  </span>
                </div>
              )}
              {settings.display_items.network && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[#9ca3af]">网络</span>
                  <span className="font-bold text-[#3b82f6]">↓{formatSpeed(realtime?.network_stats.download_rate ?? 0)}</span>
                </div>
              )}
              {settings.display_items.fps && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[#9ca3af]">FPS</span>
                  <span className="font-bold text-[#eab308]">{realtime?.fps != null ? realtime.fps.toFixed(0) : '--'}</span>
                </div>
              )}
              {settings.display_items.fps_1pct && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[#9ca3af]">1%Low</span>
                  <span className="font-bold text-[#eab308]">{realtime?.fps_1pct != null ? realtime.fps_1pct.toFixed(0) : '--'}</span>
                </div>
              )}
              {settings.display_items.vram && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[#9ca3af]">显存</span>
                  <span className="font-bold text-[#10b981]">
                    {realtime?.vram_used != null && realtime?.vram_total != null
                      ? `${formatGb(realtime.vram_used)}/${formatGb(realtime.vram_total)}`
                      : '--'}
                  </span>
                </div>
              )}
              {settings.display_items.disk && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[#9ca3af]">磁盘</span>
                  <span className="font-bold text-[#3b82f6]">
                    ↓{realtime?.disk_read_rate != null ? formatDiskRate(realtime.disk_read_rate) : '--'}{' '}
                    ↑{realtime?.disk_write_rate != null ? formatDiskRate(realtime.disk_write_rate) : '--'}
                  </span>
                </div>
              )}
              {settings.display_items.cpu_freq && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[#9ca3af]">CPU频率</span>
                  <span className="font-bold text-[#0ea5e9]">
                    {realtime?.cpu_frequency != null ? `${(realtime.cpu_frequency / 1000).toFixed(2)}G` : '--'}
                  </span>
                </div>
              )}
              {settings.display_items.gpu_freq && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[#9ca3af]">GPU频率</span>
                  <span className="font-bold text-[#10b981]">
                    {realtime?.gpu_clock != null ? `${(realtime.gpu_clock / 1000).toFixed(2)}G` : '--'}
                  </span>
                </div>
              )}
              {settings.display_items.gpu_power && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[#9ca3af]">GPU功耗</span>
                  <span className="font-bold text-[#f59e0b]">
                    {realtime?.gpu_power != null ? `${realtime.gpu_power.toFixed(0)}W` : '--'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 屏幕中心提示 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[#3f4a5c] text-xs tracking-[0.1em]">游戏画面区域</span>
          </div>
        </div>

        {/* 当前配置 */}
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mt-6 mb-4">当前配置</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* 启用状态 */}
          <ConfigRow label="监控状态">
            <span className={`font-semibold text-[13px] ${settings.enabled ? 'text-green-400' : 'text-gray-500'}`}>
              {settings.enabled ? '已启用' : '已禁用'}
            </span>
          </ConfigRow>

          {/* 面板位置 */}
          <ConfigRow label="面板位置">
            <div className="flex items-center gap-2">
              <PositionIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{positionLabels[settings.position]}</span>
            </div>
          </ConfigRow>

          {/* 刷新间隔 */}
          <ConfigRow label="刷新间隔">
            <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
              {settings.refresh_interval >= 1000 ? `${settings.refresh_interval / 1000}秒` : `${settings.refresh_interval}ms`}
            </span>
          </ConfigRow>

          {/* 透明度 */}
          <ConfigRow label="背景透明度">
            <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{settings.opacity}%</span>
          </ConfigRow>

          {/* 文字大小 */}
          <ConfigRow label="文字大小">
            <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{settings.font_size}px</span>
          </ConfigRow>
        </div>

        {/* 显示项目 */}
        <div className="rounded-lg p-3 px-4 bg-[var(--color-bg-input)] mt-3">
          <span className="block text-[13px] text-[var(--color-text-muted)] mb-2.5">显示项目</span>
          <div className="flex flex-wrap gap-2">
            {settings.display_items.cpu && (
              <span className="bg-cyan-500/20 text-cyan-400 font-medium rounded px-2.5 py-1 text-[11px]">CPU</span>
            )}
            {settings.display_items.cpu_temp && (
              <span className="bg-red-500/20 text-red-400 font-medium rounded px-2.5 py-1 text-[11px]">CPU温度</span>
            )}
            {settings.display_items.gpu && (
              <span className="bg-green-500/20 text-green-400 font-medium rounded px-2.5 py-1 text-[11px]">GPU</span>
            )}
            {settings.display_items.gpu_temp && (
              <span className="bg-orange-500/20 text-orange-400 font-medium rounded px-2.5 py-1 text-[11px]">GPU温度</span>
            )}
            {settings.display_items.memory && (
              <span className="bg-purple-500/20 text-purple-400 font-medium rounded px-2.5 py-1 text-[11px]">内存</span>
            )}
            {settings.display_items.network && (
              <span className="bg-blue-500/20 text-blue-400 font-medium rounded px-2.5 py-1 text-[11px]">网络</span>
            )}
            {settings.display_items.fps && (
              <span className="bg-yellow-500/20 text-yellow-400 font-medium rounded px-2.5 py-1 text-[11px]">FPS</span>
            )}
            {settings.display_items.fps_1pct && (
              <span className="bg-yellow-500/20 text-yellow-400 font-medium rounded px-2.5 py-1 text-[11px]">1%Low</span>
            )}
            {settings.display_items.vram && (
              <span className="bg-green-500/20 text-green-400 font-medium rounded px-2.5 py-1 text-[11px]">显存</span>
            )}
            {settings.display_items.disk && (
              <span className="bg-blue-500/20 text-blue-400 font-medium rounded px-2.5 py-1 text-[11px]">磁盘</span>
            )}
            {settings.display_items.cpu_freq && (
              <span className="bg-cyan-500/20 text-cyan-400 font-medium rounded px-2.5 py-1 text-[11px]">CPU频率</span>
            )}
            {settings.display_items.gpu_freq && (
              <span className="bg-green-500/20 text-green-400 font-medium rounded px-2.5 py-1 text-[11px]">GPU频率</span>
            )}
            {settings.display_items.gpu_power && (
              <span className="bg-orange-500/20 text-orange-400 font-medium rounded px-2.5 py-1 text-[11px]">GPU功耗</span>
            )}
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-4 p-3.5 px-4 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] rounded-[10px]">
          <div className="flex items-start gap-3">
            <Settings className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-[var(--color-text-primary)] mb-1">如何修改设置？</p>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                点击标题栏右侧的"设置"按钮，可调整面板位置、显示项目、刷新间隔、透明度与文字大小；
                设置修改后悬浮窗口实时生效。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
