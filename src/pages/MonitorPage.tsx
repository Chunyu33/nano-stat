/**
 * 游戏内监控页面
 * 展示监控预览和配置说明
 */

import { Monitor, Settings, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useMonitorSettings } from '../hooks/useMonitorSettings';
import { useHardwareData } from '../hooks/useHardwareData';
import type { MonitorPosition } from '../types/hardware';

/** 位置图标映射 */
const positionIcons: Record<MonitorPosition, typeof ArrowUp> = {
  TopCenter: ArrowUp,
  BottomCenter: ArrowDown,
  LeftCenter: ArrowLeft,
  RightCenter: ArrowRight,
};

/** 位置标签映射 */
const positionLabels: Record<MonitorPosition, string> = {
  TopCenter: '顶部中间',
  BottomCenter: '底部中间',
  LeftCenter: '左侧中间',
  RightCenter: '右侧中间',
};

export function MonitorPage() {
  const { settings } = useMonitorSettings();
  const { realtime } = useHardwareData(1000);

  const PositionIcon = positionIcons[settings.position];

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ padding: '24px' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1 }}>
        {/* 左侧：监控预览 */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '20px' }}>监控面板预览</h2>
          
          {/* 模拟屏幕 */}
          <div className="relative rounded-xl overflow-hidden" style={{ backgroundColor: '#0a0e14', border: '1px solid #2d3748', height: '200px' }}>
            {/* 监控面板预览 - 简化显示 */}
            <div
              className={`absolute rounded-md ${
                settings.position === 'TopCenter' ? 'top-2 left-1/2 -translate-x-1/2' :
                settings.position === 'BottomCenter' ? 'bottom-2 left-1/2 -translate-x-1/2' :
                settings.position === 'LeftCenter' ? 'left-2 top-1/2 -translate-y-1/2' :
                'right-2 top-1/2 -translate-y-1/2'
              }`}
              style={{ 
                opacity: settings.opacity / 100,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                padding: '6px 10px',
                fontSize: '10px',
                maxWidth: settings.position === 'LeftCenter' || settings.position === 'RightCenter' ? '80px' : '90%'
              }}
            >
              <div className={`flex ${
                settings.position === 'LeftCenter' || settings.position === 'RightCenter' 
                  ? 'flex-col gap-1' 
                  : 'flex-row gap-3 flex-wrap'
              }`}>
                {settings.display_items.cpu && (
                  <div className="flex items-center gap-1">
                    <span style={{ color: '#94a3b8' }}>CPU</span>
                    <span className="text-cyan-400 font-medium">{realtime?.cpu_usage.toFixed(0) || '--'}%</span>
                  </div>
                )}
                {settings.display_items.gpu && (
                  <div className="flex items-center gap-1">
                    <span style={{ color: '#94a3b8' }}>GPU</span>
                    <span className="text-green-400 font-medium">{realtime?.gpu_usage.toFixed(0) || '--'}%</span>
                  </div>
                )}
                {settings.display_items.gpu_temp && (
                  <div className="flex items-center gap-1">
                    <span style={{ color: '#94a3b8' }}>温度</span>
                    <span className="text-orange-400 font-medium">{realtime?.gpu_temp?.toFixed(0) || '--'}°C</span>
                  </div>
                )}
                {settings.display_items.memory && (
                  <div className="flex items-center gap-1">
                    <span style={{ color: '#94a3b8' }}>内存</span>
                    <span className="text-purple-400 font-medium">{realtime?.memory_usage.toFixed(0) || '--'}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* 屏幕中心提示 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span style={{ color: '#475569', fontSize: '12px' }}>游戏画面区域</span>
            </div>
          </div>
        </div>

        {/* 右侧：当前配置 */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '16px' }}>当前配置</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 启用状态 */}
            <div className="flex items-center justify-between rounded-lg" style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-input)' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>监控状态</span>
              <span className={`font-semibold ${
                settings.enabled ? 'text-green-400' : 'text-gray-500'
              }`} style={{ fontSize: '13px' }}>
                {settings.enabled ? '已启用' : '已禁用'}
              </span>
            </div>

            {/* 面板位置 */}
            <div className="flex items-center justify-between rounded-lg" style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-input)' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>面板位置</span>
              <div className="flex items-center gap-2">
                <PositionIcon className="w-4 h-4 text-emerald-400" />
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{positionLabels[settings.position]}</span>
              </div>
            </div>

            {/* 刷新间隔 */}
            <div className="flex items-center justify-between rounded-lg" style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-input)' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>刷新间隔</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{settings.refresh_interval}ms</span>
            </div>

            {/* 透明度 */}
            <div className="flex items-center justify-between rounded-lg" style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-input)' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>透明度</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{settings.opacity}%</span>
            </div>

            {/* 显示项目 */}
            <div className="rounded-lg" style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-input)' }}>
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
          </div>

          {/* 提示信息 */}
          <div style={{ marginTop: '16px', padding: '14px 16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px' }}>
            <div className="flex items-start gap-3">
              <Settings className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>如何修改设置？</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  点击右上角的设置按钮打开设置面板，可以调整监控面板的位置、显示项目等选项。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
