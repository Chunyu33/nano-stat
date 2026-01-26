/**
 * GPU 信息卡片组件
 * 展示 GPU 详细信息和使用率图表
 */

import { MonitorPlay } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import type { GpuInfo } from '../../types/hardware';

interface GpuCardProps {
  /** GPU 信息数据 */
  gpu: GpuInfo | null;
  /** 历史使用率数据 */
  usageHistory: number[];
}

export function GpuCard({ gpu, usageHistory }: GpuCardProps) {
  // 将历史数据转换为图表格式
  const chartData = usageHistory.map((value, index) => ({
    index,
    usage: value,
  }));

  // 如果没有 GPU 信息
  if (!gpu) {
    return (
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
            <MonitorPlay className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-100">显卡</h3>
            <p className="text-xs text-gray-500">未检测到 NVIDIA GPU</p>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500 text-sm">
          暂不支持非 NVIDIA 显卡
        </div>
      </div>
    );
  }

  // 计算显存使用率
  const vramUsagePercent = gpu.vram_total > 0 ? (gpu.vram_used / gpu.vram_total) * 100 : 0;

  return (
    <div className="card" style={{ padding: '16px' }}>
      {/* 卡片标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
          <MonitorPlay className="w-4 h-4 text-green-400" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="text-sm font-semibold text-gray-100">显卡</h3>
          <p className="text-xs text-gray-500 truncate">{gpu.name}</p>
        </div>
      </div>

      {/* 主要信息区域 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        {/* D3D 占用 */}
        <div className="bg-[#0f1419] rounded-lg" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="text-xs text-gray-400">D3D 占用</span>
            <span className="text-xl font-bold text-green-400">
              {gpu.usage.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${gpu.usage}%` }}
            />
          </div>
        </div>

        {/* Total 占用 */}
        <div className="bg-[#0f1419] rounded-lg" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="text-xs text-gray-400">Total 占用</span>
            <span className="text-xl font-bold text-green-400">
              {gpu.usage.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${gpu.usage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 使用率图表 */}
      <div className="bg-[#0f1419] rounded-lg" style={{ height: '80px', marginBottom: '14px', padding: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={[0, 100]} hide />
            <Area
              type="monotone"
              dataKey="usage"
              stroke="#10b981"
              strokeWidth={1.5}
              fill="url(#gpuGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 详细信息 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }} className="text-xs">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="text-gray-500">显存</span>
          <span className="text-gray-300">
            {(gpu.vram_used / 1024).toFixed(1)} / {(gpu.vram_total / 1024).toFixed(0)} GB ({vramUsagePercent.toFixed(0)}%)
          </span>
        </div>
        {gpu.temperature && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-gray-500">温度</span>
            <span className="text-orange-400 font-medium">{gpu.temperature.toFixed(0)}°C</span>
          </div>
        )}
        {gpu.power_usage && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-gray-500">功耗</span>
            <span className="text-gray-300">{gpu.power_usage.toFixed(0)}W</span>
          </div>
        )}
        {gpu.core_clock && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-gray-500">核心频率</span>
            <span className="text-green-400 font-medium">{gpu.core_clock} MHz</span>
          </div>
        )}
      </div>
    </div>
  );
}
