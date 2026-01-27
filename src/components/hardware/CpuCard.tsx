/**
 * CPU 信息卡片组件
 * 展示 CPU 详细信息和使用率图表
 */

import { Cpu } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import type { CpuInfo } from '../../types/hardware';

interface CpuCardProps {
  /** CPU 信息数据 */
  cpu: CpuInfo;
  /** 历史使用率数据 */
  usageHistory: number[];
}

export function CpuCard({ cpu, usageHistory }: CpuCardProps) {
  // 将历史数据转换为图表格式
  const chartData = usageHistory.map((value, index) => ({
    index,
    usage: value,
  }));

  // 根据使用率确定颜色
  const getUsageColor = (usage: number) => {
    if (usage >= 90) return '#ef4444'; // 红色 - 高负载
    if (usage >= 70) return '#f59e0b'; // 橙色 - 中等负载
    return '#0ea5e9'; // 蓝色 - 正常
  };

  const usageColor = getUsageColor(cpu.usage);

  return (
    <div className="card" style={{ padding: '16px' }}>
      {/* 卡片标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
          <Cpu className="w-4 h-4 text-emerald-400" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>处理器</h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }} className="truncate">{cpu.name}</p>
        </div>
      </div>

      {/* 主要信息区域 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        {/* 使用率 */}
        <div className="bg-[var(--color-bg-input)] rounded-lg" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>占用</span>
            <span className="text-xl font-bold" style={{ color: usageColor }}>
              {cpu.usage.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${cpu.usage}%`, backgroundColor: usageColor }}
            />
          </div>
        </div>

        {/* 温度 */}
        <div className="bg-[var(--color-bg-input)] rounded-lg" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>温度</span>
            <span className="text-xl font-bold text-emerald-400">
              {cpu.temperature ? `${cpu.temperature.toFixed(0)}°C` : 'N/A'}
            </span>
          </div>
          <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${cpu.temperature ? (cpu.temperature / 100) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* 使用率图表 */}
      <div className="bg-[var(--color-bg-input)] rounded-lg" style={{ height: '80px', marginBottom: '14px', padding: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={[0, 100]} hide />
            <Area
              type="monotone"
              dataKey="usage"
              stroke="#0ea5e9"
              strokeWidth={1.5}
              fill="url(#cpuGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 详细信息 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        <div className="text-center">
          <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted)' }}>核心数</span>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{cpu.cores}</span>
        </div>
        <div className="text-center">
          <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted)' }}>线程数</span>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{cpu.threads}</span>
        </div>
        <div className="text-center">
          <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted)' }}>频率</span>
          <span className="text-emerald-400 text-sm font-medium">{cpu.frequency} MHz</span>
        </div>
      </div>
    </div>
  );
}
