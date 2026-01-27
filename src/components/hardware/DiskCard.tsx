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
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>存储设备</h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{disks.length} 个磁盘</p>
        </div>
      </div>

      {/* 磁盘列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {disks.slice(0, 4).map((disk, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-primary)', fontWeight: 500, minWidth: '36px', textAlign: 'center' }}>
              {disk.mount_point}
            </span>
            <span style={{ fontSize: '12px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(249, 115, 22, 0.2)', color: '#f97316' }}>
              {disk.disk_type}
            </span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden" style={{ flex: 1 }}>
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    disk.usage > 90 ? 'bg-red-500' : disk.usage > 70 ? 'bg-orange-500' : 'bg-orange-400'
                  }`}
                  style={{ width: `${disk.usage}%` }}
                />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', minWidth: '90px', textAlign: 'right' }}>
                {disk.used.toFixed(0)} / {disk.total.toFixed(0)} GB
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
