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
    <div className="card" style={{ padding: '16px' }}>
      {/* 卡片标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
          <Wifi className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-100">网络</h3>
          <p className="text-xs text-gray-500">{network.interfaces.length} 个接口</p>
        </div>
      </div>

      {/* 总流量统计 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        <div className="bg-[#0f1419] rounded-lg" style={{ padding: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-400">下载</span>
          </div>
          <p className="text-base font-bold text-green-400">{formatRate(totalRxRate)}</p>
          <p className="text-xs text-gray-500">总计: {formatBytes(totalRx)}</p>
        </div>
        <div className="bg-[#0f1419] rounded-lg" style={{ padding: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-400">上传</span>
          </div>
          <p className="text-base font-bold text-blue-400">{formatRate(totalTxRate)}</p>
          <p className="text-xs text-gray-500">总计: {formatBytes(totalTx)}</p>
        </div>
      </div>

      {/* 网络接口列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '80px', overflowY: 'auto' }}>
        {network.interfaces.slice(0, 3).map((iface, index) => (
          <div key={index} className="bg-[#0f1419] rounded" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px' }}>
            <span className="text-xs text-gray-400 truncate" style={{ maxWidth: '80px' }} title={iface.name}>{iface.name}</span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span className="text-xs text-green-400 font-medium" title={`下载: ${formatRate(iface.rx_rate)}`}>↓ {formatRate(iface.rx_rate)}</span>
              <span className="text-xs text-blue-400 font-medium" title={`上传: ${formatRate(iface.tx_rate)}`}>↑ {formatRate(iface.tx_rate)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
