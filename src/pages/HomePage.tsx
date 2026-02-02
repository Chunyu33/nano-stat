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
      <div className="flex items-center justify-end px-6 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-4">
          {loading && (
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }} className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              加载中...
            </span>
          )}
          <div className="flex items-center gap-2" style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            <Clock className="w-4 h-4" />
            <span>{currentTime}</span>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-2 rounded-lg transition-all hover:opacity-80"
            style={{ 
              padding: '6px 14px', 
              fontSize: '13px', 
              color: 'var(--color-text-secondary)', 
              backgroundColor: 'var(--color-bg-input)',
              border: '1px solid var(--color-border)'
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
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
      <div className="flex-1 overflow-auto" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px' }}>
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

            {/* 内存、磁盘卡片 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              {overview ? (
                <>
                  <MemoryCard memory={overview.memory} />
                  <DiskCard disks={overview.disks} />
                </>
              ) : (
                <>
                  <div className="card p-6 animate-pulse">
                    <div className="h-40 bg-gray-700/50 rounded-lg"></div>
                  </div>
                  <div className="card p-6 animate-pulse">
                    <div className="h-40 bg-gray-700/50 rounded-lg"></div>
                  </div>
                </>
              )}
            </div>

            {/* 网络卡片 - 右侧整行 */}
            {overview ? (
              <NetworkCard network={overview.network} />
            ) : (
              <div className="card p-6 animate-pulse">
                <div className="h-40 bg-gray-700/50 rounded-lg"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
