/**
 * 通用格式化工具
 */

/**
 * 将网络速率（KB/s）格式化为可读单位
 * - < 1024 KB/s   → "xxx KB/s"
 * - < 1024 MB/s   → "x.xx MB/s"
 * - 否则          → "x.xx GB/s"
 */
export function formatSpeed(kbPerSec: number): string {
  if (!Number.isFinite(kbPerSec) || kbPerSec < 0) {
    return '--';
  }
  if (kbPerSec < 1024) {
    return `${kbPerSec.toFixed(0)} KB/s`;
  }
  const mb = kbPerSec / 1024;
  if (mb < 1024) {
    return `${mb.toFixed(1)} MB/s`;
  }
  return `${(mb / 1024).toFixed(2)} GB/s`;
}

/**
 * 将 MB 数值格式化为 GB（保留 1 位小数，如 8192 → "8.0G"）
 * 用于显存/内存容量显示
 */
export function formatGb(mb: number): string {
  if (!Number.isFinite(mb) || mb < 0) {
    return '--';
  }
  return `${(mb / 1024).toFixed(1)}G`;
}

/**
 * 将磁盘速率（MB/s）格式化为紧凑单位
 * - < 1 MB/s → "xxxK"（KB/s）
 * - 否则      → "x.xM"（MB/s，1 位小数）
 * 用于悬浮窗磁盘读写速率（空间有限，省略单位后缀的完整写法）
 */
export function formatDiskRate(mbs: number): string {
  if (!Number.isFinite(mbs) || mbs < 0) {
    return '--';
  }
  if (mbs < 1) {
    return `${(mbs * 1024).toFixed(0)}K`;
  }
  return `${mbs.toFixed(1)}M`;
}
