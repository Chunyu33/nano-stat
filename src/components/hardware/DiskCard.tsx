/**
 * 磁盘信息卡片组件
 * 展示所有磁盘的使用情况
 */

import { HardDrive } from 'lucide-react';
import type { DiskInfo } from '../../types/hardware';

interface DiskCardProps {
  /** 磁盘信息列表 */
  disks: DiskInfo[];
}

export function DiskCard({ disks }: DiskCardProps) {
  return (
    <div className="card" style={{ padding: '16px' }}>
      {/* 卡片标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center">
          <HardDrive className="w-4 h-4 text-orange-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-100">存储设备</h3>
          <p className="text-xs text-gray-500">{disks.length} 个磁盘</p>
        </div>
      </div>

      {/* 磁盘列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '160px', overflowY: 'auto' }}>
        {disks.map((disk, index) => (
          <div key={index} className="bg-[#0f1419] rounded-lg" style={{ padding: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="text-xs font-medium text-gray-200">
                  {disk.mount_point}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                  {disk.disk_type}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {disk.used.toFixed(0)} / {disk.total.toFixed(0)} GB
              </span>
            </div>
            
            {/* 使用率进度条 */}
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  disk.usage > 90 
                    ? 'bg-red-500' 
                    : disk.usage > 70 
                      ? 'bg-orange-500' 
                      : 'bg-orange-400'
                }`}
                style={{ width: `${disk.usage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
