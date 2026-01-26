/**
 * 内存信息卡片组件
 * 展示内存使用情况
 */

import { MemoryStick } from 'lucide-react';
import type { MemoryInfo } from '../../types/hardware';

interface MemoryCardProps {
  /** 内存信息数据 */
  memory: MemoryInfo;
}

export function MemoryCard({ memory }: MemoryCardProps) {
  // 转换为 GB 显示
  const totalGB = (memory.total / 1024).toFixed(0);
  const usedGB = (memory.used / 1024).toFixed(1);
  const availableGB = (memory.available / 1024).toFixed(1);

  return (
    <div className="card" style={{ padding: '16px' }}>
      {/* 卡片标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
          <MemoryStick className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-100">内存</h3>
          <p className="text-xs text-gray-500">
            {memory.memory_type || 'DDR4'} {totalGB}GB
          </p>
        </div>
      </div>

      {/* 内存使用可视化 */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="text-xs text-gray-400">使用率</span>
          <span className="text-xl font-bold text-purple-400">
            {memory.usage.toFixed(0)}%
          </span>
        </div>
        
        {/* 进度条 */}
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-300"
            style={{ width: `${memory.usage}%` }}
          />
        </div>
      </div>

      {/* 详细信息 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="bg-[#0f1419] rounded-lg text-center" style={{ padding: '10px' }}>
          <span className="text-gray-500 block text-xs">已使用</span>
          <span className="text-gray-200 font-semibold text-base">{usedGB} GB</span>
        </div>
        <div className="bg-[#0f1419] rounded-lg text-center" style={{ padding: '10px' }}>
          <span className="text-gray-500 block text-xs">可用</span>
          <span className="text-gray-200 font-semibold text-base">{availableGB} GB</span>
        </div>
      </div>
    </div>
  );
}
