/**
 * 游戏内监控页面
 * 展示监控预览和配置说明（合并为单一盒子：上方实时预览，下方当前配置）
 */

import { Monitor, Settings, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight } from 'lucide-react';
import { useMonitorSettings } from '../hooks/useMonitorSettings';
import { useHardwareData } from '../hooks/useHardwareData';
import { formatSpeed } from '../utils/format';
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

/** 预览面板固定字号（不跟随设置，避免预览溢出；只同步位置/显示项/透明度） */
const PREVIEW_FONT_SIZE = 12;

/** 配置信息行组件（当前配置区复用） */
function ConfigRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg" style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-input)' }}>
      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{label}</span>
      {children}
    </div>
  );
}

export function MonitorPage() {
  const { settings } = useMonitorSettings();
  const { realtime } = useHardwareData(1000);

  const PositionIcon = positionIcons[settings.position];
  const isVertical = verticalPositions.includes(settings.position);

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
          <Monitor className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)' }}>游戏内监控</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>在游戏中实时显示硬件性能数据</p>
        </div>
      </div>

      {/* 合并容器：预览 + 当前配置（占满可用宽度） */}
      <div className="card w-full" style={{ padding: '24px' }}>
        {/* 监控面板预览 */}
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '16px' }}>监控面板预览</h2>

        {/* 模拟屏幕（宽度撑满容器，高度固定，预览面板只同步位置/显示项/透明度，字号固定） */}
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #0b0f16 0%, #111827 60%, #0a0e14 100%)',
            border: '1px solid #2d3748',
            height: '240px',
          }}
        >
          {/* 监控面板预览（仿真实 overlay 样式） */}
          <div
            className={`absolute rounded-md ${positionClasses[settings.position]}`}
            style={{
              backgroundColor: `rgba(15, 23, 42, ${settings.opacity / 100})`,
              border: '1px solid rgba(71, 85, 105, 0.5)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
              padding: '6px 10px',
              fontSize: `${PREVIEW_FONT_SIZE}px`,
              color: '#f7fafc',
              whiteSpace: isVertical ? 'normal' : 'nowrap',
              maxWidth: '94%',
              maxHeight: '94%',
              overflow: 'hidden',
            }}
          >
            <div className={`flex ${isVertical ? 'flex-col gap-0.5' : 'flex-row gap-3'}`}>
              {settings.display_items.cpu && (
                <div className="flex items-center gap-0.5">
                  <span style={{ color: '#9ca3af' }}>CPU</span>
                  <span className="font-bold" style={{ color: '#0ea5e9' }}>{realtime?.cpu_usage.toFixed(0) || '--'}%</span>
                </div>
              )}
              {settings.display_items.gpu && (
                <div className="flex items-center gap-0.5">
                  <span style={{ color: '#9ca3af' }}>GPU</span>
                  <span className="font-bold" style={{ color: '#10b981' }}>{realtime?.gpu_usage.toFixed(0) || '--'}%</span>
                </div>
              )}
              {settings.display_items.cpu_temp && (
                <div className="flex items-center gap-0.5">
                  <span style={{ color: '#9ca3af' }}>CPU温度</span>
                  <span className="font-bold" style={{ color: '#f59e0b' }}>{realtime?.cpu_temp?.toFixed(0) || '--'}°C</span>
                </div>
              )}
              {settings.display_items.gpu_temp && (
                <div className="flex items-center gap-0.5">
                  <span style={{ color: '#9ca3af' }}>GPU温度</span>
                  <span className="font-bold" style={{ color: '#f59e0b' }}>{realtime?.gpu_temp?.toFixed(0) || '--'}°C</span>
                </div>
              )}
              {settings.display_items.memory && (
                <div className="flex items-center gap-0.5">
                  <span style={{ color: '#9ca3af' }}>内存</span>
                  <span className="font-bold" style={{ color: '#a855f7' }}>{realtime?.memory_usage.toFixed(0) || '--'}%</span>
                </div>
              )}
              {settings.display_items.network && (
                <div className="flex items-center gap-0.5">
                  <span style={{ color: '#9ca3af' }}>网络</span>
                  <span className="font-bold" style={{ color: '#3b82f6' }}>↓{formatSpeed(realtime?.network_stats.download_rate ?? 0)}</span>
                </div>
              )}
              {settings.display_items.fps && (
                <div className="flex items-center gap-0.5">
                  <span style={{ color: '#9ca3af' }}>FPS</span>
                  <span className="font-bold" style={{ color: '#eab308' }}>{realtime?.fps != null ? realtime.fps.toFixed(0) : '--'}</span>
                </div>
              )}
            </div>
          </div>

          {/* 屏幕中心提示 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span style={{ color: '#3f4a5c', fontSize: '12px', letterSpacing: '0.1em' }}>游戏画面区域</span>
          </div>
        </div>

        {/* 当前配置 */}
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '24px 0 16px' }}>当前配置</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* 启用状态 */}
          <ConfigRow label="监控状态">
            <span className={`font-semibold ${settings.enabled ? 'text-green-400' : 'text-gray-500'}`} style={{ fontSize: '13px' }}>
              {settings.enabled ? '已启用' : '已禁用'}
            </span>
          </ConfigRow>

          {/* 面板位置 */}
          <ConfigRow label="面板位置">
            <div className="flex items-center gap-2">
              <PositionIcon className="w-4 h-4 text-emerald-400" />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{positionLabels[settings.position]}</span>
            </div>
          </ConfigRow>

          {/* 刷新间隔 */}
          <ConfigRow label="刷新间隔">
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {settings.refresh_interval >= 1000 ? `${settings.refresh_interval / 1000}秒` : `${settings.refresh_interval}ms`}
            </span>
          </ConfigRow>

          {/* 透明度 */}
          <ConfigRow label="背景透明度">
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{settings.opacity}%</span>
          </ConfigRow>

          {/* 文字大小 */}
          <ConfigRow label="文字大小">
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{settings.font_size}px</span>
          </ConfigRow>
        </div>

        {/* 显示项目 */}
        <div className="rounded-lg" style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-input)', marginTop: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '10px' }}>显示项目</span>
          <div className="flex flex-wrap gap-2">
            {settings.display_items.cpu && (
              <span className="bg-cyan-500/20 text-cyan-400 font-medium rounded" style={{ padding: '4px 10px', fontSize: '11px' }}>CPU</span>
            )}
            {settings.display_items.cpu_temp && (
              <span className="bg-red-500/20 text-red-400 font-medium rounded" style={{ padding: '4px 10px', fontSize: '11px' }}>CPU温度</span>
            )}
            {settings.display_items.gpu && (
              <span className="bg-green-500/20 text-green-400 font-medium rounded" style={{ padding: '4px 10px', fontSize: '11px' }}>GPU</span>
            )}
            {settings.display_items.gpu_temp && (
              <span className="bg-orange-500/20 text-orange-400 font-medium rounded" style={{ padding: '4px 10px', fontSize: '11px' }}>GPU温度</span>
            )}
            {settings.display_items.memory && (
              <span className="bg-purple-500/20 text-purple-400 font-medium rounded" style={{ padding: '4px 10px', fontSize: '11px' }}>内存</span>
            )}
            {settings.display_items.network && (
              <span className="bg-blue-500/20 text-blue-400 font-medium rounded" style={{ padding: '4px 10px', fontSize: '11px' }}>网络</span>
            )}
            {settings.display_items.fps && (
              <span className="bg-yellow-500/20 text-yellow-400 font-medium rounded" style={{ padding: '4px 10px', fontSize: '11px' }}>FPS</span>
            )}
          </div>
        </div>

        {/* 提示信息 */}
        <div style={{ marginTop: '16px', padding: '14px 16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px' }}>
          <div className="flex items-start gap-3">
            <Settings className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>如何修改设置？</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                点击左侧菜单栏的"设置"按钮，可调整面板位置、显示项目、刷新间隔、透明度与文字大小；
                设置修改后悬浮窗口实时生效。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
