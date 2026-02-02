/**
 * 网络信息卡片组件
 * 展示网络接口和流量统计
 */

import { Wifi } from 'lucide-react';
import type { NetworkInfo } from '../../types/hardware';

interface NetworkCardProps {
  /** 网络信息数据 */
  network: NetworkInfo;
}

/**
 * 格式化字节数为可读格式
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes.toFixed(0)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * 格式化速率
 */
function formatRate(bytesPerSec: number): string {
  if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
}

export function NetworkCard({ network }: NetworkCardProps) {
  // 计算总流量
  const totalRx = network.interfaces.reduce((sum, iface) => sum + iface.rx_bytes, 0);
  const totalTx = network.interfaces.reduce((sum, iface) => sum + iface.tx_bytes, 0);
  const totalRxRate = network.interfaces.reduce((sum, iface) => sum + iface.rx_rate, 0);
  const totalTxRate = network.interfaces.reduce((sum, iface) => sum + iface.tx_rate, 0);

  return (
    <div className="card" style={{ padding: '16px', minHeight: '200px' }}>
      {/* 标题 + 总流量同一行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
          <Wifi className="w-4 h-4 text-blue-400" />
        </div>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>网络</h3>
          <p className="text-xs text-gray-500">{network.interfaces.length} 个接口</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <div className="bg-[var(--color-bg-input)] rounded-lg" style={{ padding: '6px 10px', minWidth: '120px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-400">下载</span>
            </div>
            <p className="text-xs font-semibold text-green-400">{formatRate(totalRxRate)}</p>
            <p className="text-[10px] text-gray-500">总计: {formatBytes(totalRx)}</p>
          </div>
          <div className="bg-[var(--color-bg-input)] rounded-lg" style={{ padding: '6px 10px', minWidth: '120px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-400">上传</span>
            </div>
            <p className="text-xs font-semibold text-blue-400">{formatRate(totalTxRate)}</p>
            <p className="text-[10px] text-gray-500">总计: {formatBytes(totalTx)}</p>
          </div>
        </div>
      </div>

      {/* 网络接口列表 - 固定高度可滚动 */}
      {network.interfaces.length > 0 && (
        <div 
          style={{ 
            maxHeight: '140px', 
            overflowY: 'auto', 
            overflowX: 'hidden'
          }}
          className="scrollbar-thin"
        >
          {network.interfaces.map((iface, index) => (
            <div 
              key={index} 
              className="bg-[var(--color-bg-input)] rounded-lg" 
              style={{ padding: '6px 10px', marginBottom: index < network.interfaces.length - 1 ? '6px' : 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span 
                  className="text-xs text-gray-400 truncate" 
                  style={{ minWidth: '80px', flexShrink: 0 }} 
                  title={iface.name}
                >
                  {iface.name}
                </span>
                <div className="flex text-xs" style={{ width: '140px', justifyContent: 'flex-end' }}>
                  <span className="text-green-400 font-medium" style={{ width: '70px', textAlign: 'right' }}>↓{formatRate(iface.rx_rate)}</span>
                  <span className="text-blue-400 font-medium" style={{ width: '70px', textAlign: 'right' }}>↑{formatRate(iface.tx_rate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
