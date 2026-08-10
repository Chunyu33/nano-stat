/**
 * 更新弹窗组件
 * 检测到新版本时显示更新引导
 */

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Sparkles } from 'lucide-react';
import { getVersion } from '@tauri-apps/api/app';

interface UpdateInfo {
  version: string;
  releaseNotes: string;
  downloadUrl: string;
}

interface UpdateDialogProps {
  /** 弹窗是否打开 */
  open: boolean;
  /** 关闭弹窗回调 */
  onOpenChange: (open: boolean) => void;
  /** 更新信息 */
  updateInfo: UpdateInfo | null;
}

/** 遮罩层动画 */
const overlayMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.18 },
};

/** 弹窗内容动画 */
const contentMotion = {
  initial: { opacity: 0, scale: 0.95, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 12 },
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

export function UpdateDialog({ open, onOpenChange, updateInfo }: UpdateDialogProps) {
  const [downloading, setDownloading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('1.0.0');

  // 获取当前版本号（动态读取，避免硬编码不同步）
  useEffect(() => {
    getVersion().then(v => setCurrentVersion(v)).catch(() => {});
  }, []);

  const handleDownload = () => {
    if (updateInfo?.downloadUrl) {
      setDownloading(true);
      // 打开下载链接
      window.open(updateInfo.downloadUrl, '_blank');
      setTimeout(() => {
        setDownloading(false);
        onOpenChange(false);
      }, 1000);
    }
  };

  if (!updateInfo) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* 遮罩层 */}
            <Dialog.Overlay forceMount asChild>
              <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" {...overlayMotion} />
            </Dialog.Overlay>

            {/* 弹窗内容（跟随主题变量） */}
            <Dialog.Content forceMount asChild>
              <motion.div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] rounded-xl shadow-2xl z-50 overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border)]"
                {...contentMotion}
              >
                {/* 标题栏 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-sidebar)]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-green-400" />
                    </div>
                    <Dialog.Title className="text-base font-semibold text-[var(--color-text-primary)]">
                      发现新版本
                    </Dialog.Title>
                  </div>
                  <Dialog.Close asChild>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg-input)]">
                      <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* 内容 */}
                <div className="p-5">
                  {/* 版本信息 */}
                  <div className="flex items-center justify-between mb-4 p-4 rounded-lg border bg-[var(--color-bg-input)] border-[var(--color-border)]">
                    <div>
                      <p className="mb-1 text-xs text-[var(--color-text-muted)]">新版本</p>
                      <p className="text-lg font-bold text-green-400">v{updateInfo.version}</p>
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-xs text-[var(--color-text-muted)]">当前版本</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">v{currentVersion}</p>
                    </div>
                  </div>

                  {/* 更新说明 */}
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-medium text-[var(--color-text-primary)]">更新内容</p>
                    <div className="p-3 rounded-lg border max-h-32 overflow-y-auto bg-[var(--color-bg-input)] border-[var(--color-border)]">
                      <p className="whitespace-pre-wrap leading-relaxed text-xs text-[var(--color-text-secondary)]">
                        {updateInfo.releaseNotes || '- 性能优化和 Bug 修复'}
                      </p>
                    </div>
                  </div>

                  {/* 提示 */}
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg mb-4">
                    <p className="text-xs text-cyan-400">
                      建议更新到最新版本以获得更好的体验和新功能。
                    </p>
                  </div>
                </div>

                {/* 底部按钮 */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-sidebar)]">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="px-4 py-2 rounded-lg transition-colors text-xs font-medium text-[var(--color-text-secondary)] bg-transparent"
                  >
                    稍后提醒
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-lg transition-colors px-5 py-2.5 text-xs font-semibold"
                  >
                    {downloading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>下载中...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>立即更新</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

// 语义化版本比较：a > b 返回 1，a < b 返回 -1，相等返回 0
// 支持 "v1.0.0" / "1.0.0" / "1.0.0-beta" 等常见格式（预发布后缀按 0 处理）
function compareVersions(a: string, b: string): number {
  const parse = (v: string) =>
    v.replace(/^v/i, '').split(/[-+]/)[0].split('.').map(n => parseInt(n, 10) || 0);
  const pa = parse(a);
  const pb = parse(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

// 检查更新的 Hook
export function useUpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const checkForUpdates = async () => {
    try {
      // 获取当前应用版本（与 tauri.conf.json 保持一致，避免硬编码不同步）
      const currentVersion = await getVersion();
      // 这里可以替换为实际的更新检查 API
      // 示例：从 GitHub Releases 获取最新版本
      const response = await fetch(
        'https://api.github.com/repos/Chunyu33/nano-stat/releases/latest',
        { headers: { 'Accept': 'application/vnd.github.v3+json' } }
      );
      
      if (response.ok) {
        const data = await response.json();
        const latestVersion = data.tag_name?.replace('v', '') || '';
        
        // 语义化版本比较：仅当远端版本确实比当前版本新才提示更新
        // （避免远端 tag 比本地旧时误报，如本地 1.0.1 遇到远端 v1.0.0）
        if (latestVersion && compareVersions(latestVersion, currentVersion) > 0) {
          setUpdateInfo({
            version: latestVersion,
            releaseNotes: data.body || '',
            downloadUrl: data.html_url || '',
          });
          setShowDialog(true);
        }
      }
    } catch (err) {
      console.log('Update check failed:', err);
    }
  };

  useEffect(() => {
    // 启动时检查更新（延迟 3 秒）
    const timer = setTimeout(checkForUpdates, 3000);
    return () => clearTimeout(timer);
  }, []);

  return {
    updateInfo,
    showDialog,
    setShowDialog,
    checkForUpdates,
  };
}
