/**
 * 首页组件
 * 展示硬件概览信息，类似游戏++的布局
 */

import { useHardwareData } from '../hooks/useHardwareData';
import { HardwareOverviewSection } from '../components/hardware/HardwareOverviewSection';
import { CpuCard, GpuCard, MemoryCard, DiskCard, NetworkCard } from '../components/hardware';
import { Clock, RefreshCw } from 'lucide-react';

export function HomePage() {
  const { overview, cpuHistory, gpuHistory, loading, error, refresh } = useHardwareData(1000);

  // 获取当前时间
  const currentTime = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[#1e2a3d]">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-100">硬件信息</h1>
          {loading && (
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              加载中...
            </span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{currentTime}</span>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white bg-[#1e2a3d] hover:bg-[#2d3748] rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-8 mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* 主内容区域 */}
      <div className="flex-1 overflow-auto" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
          {/* 左侧：硬件概览 */}
          <div>
            <HardwareOverviewSection data={overview} />
          </div>

          {/* 右侧：详细信息卡片 */}
          <div>
            {/* CPU 和 GPU 卡片 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {overview ? (
                <>
                  <CpuCard cpu={overview.cpu} usageHistory={cpuHistory} />
                  <GpuCard gpu={overview.gpu} usageHistory={gpuHistory} />
                </>
              ) : (
                <>
                  <div className="card p-6 animate-pulse">
                    <div className="h-48 bg-gray-700/50 rounded-lg"></div>
                  </div>
                  <div className="card p-6 animate-pulse">
                    <div className="h-48 bg-gray-700/50 rounded-lg"></div>
                  </div>
                </>
              )}
            </div>

            {/* 内存、磁盘、网络卡片 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              {overview ? (
                <>
                  <MemoryCard memory={overview.memory} />
                  <DiskCard disks={overview.disks} />
                  <NetworkCard network={overview.network} />
                </>
              ) : (
                <>
                  <div className="card p-6 animate-pulse">
                    <div className="h-40 bg-gray-700/50 rounded-lg"></div>
                  </div>
                  <div className="card p-6 animate-pulse">
                    <div className="h-40 bg-gray-700/50 rounded-lg"></div>
                  </div>
                  <div className="card p-6 animate-pulse">
                    <div className="h-40 bg-gray-700/50 rounded-lg"></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
