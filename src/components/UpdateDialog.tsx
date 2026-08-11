/**
 * 更新弹窗组件 + 更新检查 Hook
 * 通过 tauri-plugin-updater 检查/下载/安装更新（自动校验签名）
 * 便携版（exe 旁有 portable.txt）不进行自动检查更新
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Sparkles, Package } from 'lucide-react';
import { check, type Update } from '@tauri-apps/plugin-updater';
import { isPortable } from '../api/hardware';

interface UpdateInfo {
  version: string;
  releaseNotes: string;
}

interface UpdateDialogProps {
  /** 弹窗是否打开 */
  open: boolean;
  /** 关闭弹窗回调 */
  onOpenChange: (open: boolean) => void;
  /** 更新信息 */
  updateInfo: UpdateInfo | null;
  /** 是否便携版（便携版提示手动下载，不内置安装） */
  portable?: boolean;
  /** 点击"立即更新"回调（下载并安装） */
  onInstall?: () => Promise<void>;
  /** 安装中状态 */
  installing?: boolean;
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

export function UpdateDialog({ open, onOpenChange, updateInfo, portable, onInstall, installing }: UpdateDialogProps) {
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
                      <p className="text-sm text-[var(--color-text-secondary)]">--</p>
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
                      建议更新到最新版本以获得更好的体验和新功能。更新包已签名校验，安全可靠。
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
                  {portable ? (
                    <button
                      onClick={onInstall}
                      disabled={installing}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-lg transition-colors px-5 py-2.5 text-xs font-semibold"
                    >
                      {installing ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>跳转中...</span>
                        </>
                      ) : (
                        <>
                          <Package className="w-3.5 h-3.5" />
                          <span>前往下载页</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={onInstall}
                      disabled={installing}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-lg transition-colors px-5 py-2.5 text-xs font-semibold"
                    >
                      {installing ? (
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
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

/**
 * 更新检查 Hook
 * - 自动检查：非便携版启动 3 秒后检查一次
 * - 手动检查：checkForUpdates()（返回是否发现新版本）
 * - 安装：installUpdate()（下载并安装，安装器模式）
 * 便携版：跳过自动检查，安装时跳转 GitHub Releases 下载页
 */
export function useUpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [isPortableMode, setIsPortableMode] = useState(false);
  const updateRef = useRef<Update | null>(null);

  // 执行检查（auto=true 为自动检查，失败静默；手动检查失败抛给调用方提示）
  const performCheck = useCallback(async (auto: boolean): Promise<boolean> => {
    if (isPortableMode) return false;
    setChecking(true);
    try {
      const update = await check();
      if (update) {
        updateRef.current = update;
        setUpdateInfo({ version: update.version, releaseNotes: update.body || '- 性能优化和 Bug 修复' });
        setShowDialog(true);
        return true;
      }
      return false;
    } catch (err) {
      console.log('Update check failed:', err);
      if (auto) return false;
      throw err;
    } finally {
      setChecking(false);
    }
  }, [isPortableMode]);

  // 启动时检测便携版 + 自动检查（非便携版延迟 3 秒）
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    isPortable().then(p => {
      if (cancelled) return;
      setIsPortableMode(p);
      if (!p) {
        timer = window.setTimeout(() => {
          performCheck(true).catch(() => {});
        }, 3000);
      }
    });
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [performCheck]);

  // 安装更新（安装版：下载并安装；便携版：跳转 GitHub Releases 下载页）
  const installUpdate = useCallback(async (): Promise<void> => {
    if (isPortableMode) {
      // 便携版无内置更新，跳转 GitHub Releases 页面手动下载
      window.open('https://github.com/Chunyu33/nano-stat/releases/latest', '_blank');
      setShowDialog(false);
      return;
    }
    if (!updateRef.current) return;
    setInstalling(true);
    try {
      await updateRef.current.downloadAndInstall();
      // 安装完成后应用会自动重启（Tauri updater 默认行为）
    } catch (err) {
      console.log('Install failed:', err);
    } finally {
      setInstalling(false);
    }
  }, [isPortableMode]);

  return {
    updateInfo,
    showDialog,
    setShowDialog,
    checkForUpdates: () => performCheck(false),
    checking,
    installing,
    installUpdate,
    isPortableMode,
  };
}
