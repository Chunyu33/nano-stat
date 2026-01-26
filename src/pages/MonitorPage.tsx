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
        <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center">
          <Monitor className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-100">游戏内监控</h1>
          <p className="text-sm text-gray-500 mt-1">在游戏中实时显示硬件性能数据</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1 }}>
        {/* 左侧：监控预览 */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 className="text-base font-semibold text-gray-100" style={{ marginBottom: '20px' }}>监控面板预览</h2>
          
          {/* 模拟屏幕 */}
          <div className="relative bg-[#0a0e14] rounded-xl border border-[#2d3748] aspect-video">
            {/* 监控面板预览 */}
            <div
              className={`absolute bg-[#1a2332]/90 border border-[#2d3748] rounded-lg p-3 text-xs ${
                settings.position === 'TopCenter' ? 'top-2 left-1/2 -translate-x-1/2' :
                settings.position === 'BottomCenter' ? 'bottom-2 left-1/2 -translate-x-1/2' :
                settings.position === 'LeftCenter' ? 'left-2 top-1/2 -translate-y-1/2' :
                'right-2 top-1/2 -translate-y-1/2'
              }`}
              style={{ opacity: settings.opacity / 100 }}
            >
              <div className={`flex gap-4 ${
                settings.position === 'LeftCenter' || settings.position === 'RightCenter' 
                  ? 'flex-col' 
                  : 'flex-row'
              }`}>
                {settings.display_items.cpu && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">CPU</span>
                    <span className="text-cyan-400 font-medium">
                      {realtime?.cpu_usage.toFixed(0) || '--'}%
                    </span>
                  </div>
                )}
                {settings.display_items.gpu && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">GPU</span>
                    <span className="text-green-400 font-medium">
                      {realtime?.gpu_usage.toFixed(0) || '--'}%
                    </span>
                  </div>
                )}
                {settings.display_items.gpu_temp && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">温度</span>
                    <span className="text-orange-400 font-medium">
                      {realtime?.gpu_temp?.toFixed(0) || '--'}°C
                    </span>
                  </div>
                )}
                {settings.display_items.memory && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">内存</span>
                    <span className="text-purple-400 font-medium">
                      {realtime?.memory_usage.toFixed(0) || '--'}%
                    </span>
                  </div>
                )}
                {settings.display_items.network && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">网络</span>
                    <span className="text-blue-400 font-medium">
                      ↓{realtime?.network_stats.download_rate.toFixed(0) || '--'}KB/s
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 屏幕中心提示 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-600 text-sm">游戏画面区域</span>
            </div>
          </div>
        </div>

        {/* 右侧：当前配置 */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 className="text-base font-semibold text-gray-100" style={{ marginBottom: '20px' }}>当前配置</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 启用状态 */}
            <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl">
              <span className="text-sm text-gray-400">监控状态</span>
              <span className={`text-sm font-semibold ${
                settings.enabled ? 'text-green-400' : 'text-gray-500'
              }`}>
                {settings.enabled ? '已启用' : '已禁用'}
              </span>
            </div>

            {/* 面板位置 */}
            <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl">
              <span className="text-sm text-gray-400">面板位置</span>
              <div className="flex items-center gap-2">
                <PositionIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-gray-200">{positionLabels[settings.position]}</span>
              </div>
            </div>

            {/* 刷新间隔 */}
            <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl">
              <span className="text-sm text-gray-400">刷新间隔</span>
              <span className="text-sm font-medium text-gray-200">{settings.refresh_interval}ms</span>
            </div>

            {/* 透明度 */}
            <div className="flex items-center justify-between p-4 bg-[#0f1419] rounded-xl">
              <span className="text-sm text-gray-400">透明度</span>
              <span className="text-sm font-medium text-gray-200">{settings.opacity}%</span>
            </div>

            {/* 显示项目 */}
            <div className="p-4 bg-[#0f1419] rounded-xl">
              <span className="text-sm text-gray-400 block mb-3">显示项目</span>
              <div className="flex flex-wrap gap-3">
                {settings.display_items.cpu && (
                  <span className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-lg">CPU</span>
                )}
                {settings.display_items.gpu && (
                  <span className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-lg">GPU</span>
                )}
                {settings.display_items.gpu_temp && (
                  <span className="px-3 py-1.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-lg">温度</span>
                )}
                {settings.display_items.memory && (
                  <span className="px-3 py-1.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-lg">内存</span>
                )}
                {settings.display_items.network && (
                  <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-lg">网络</span>
                )}
                {settings.display_items.fps && (
                  <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-lg">FPS</span>
                )}
              </div>
            </div>
          </div>

          {/* 提示信息 */}
          <div style={{ marginTop: '24px', padding: '20px' }} className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <div className="flex items-start gap-4">
              <Settings className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-200 mb-2">如何修改设置？</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  点击右上角的设置按钮（齿轮图标）打开设置面板，可以调整监控面板的位置、显示项目、刷新间隔等选项。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
