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
