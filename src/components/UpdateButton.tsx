/**
 * 检查更新组件（独立组件）
 *
 * 自包含更新检查的全部逻辑（useUpdateChecker + 更新弹窗 + 结果轻提示）：
 * - variant='icon'：标题栏图标按钮（无文案，点击检查更新 / 便携版弹下载渠道）
 * - variant='full'：页面内按钮（"关于"页版本信息卡片格样式，主题色 emerald）
 * - variant='silent'：无按钮，仅静默执行自动检查（有更新才弹窗），
 *   由 App 挂载一份负责启动自动检查
 * - 便携版：点击不查询远端，直接弹出下载渠道弹窗（GitHub Releases / 夸克网盘）
 */

import { useState } from 'react';
import { RefreshCw, Package } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { UpdateDialog, useUpdateChecker } from './UpdateDialog';

interface UpdateButtonProps {
  /** 组件形态：标题栏图标按钮 / 页面内按钮 / 静默检查（不渲染按钮） */
  variant?: 'icon' | 'full' | 'silent';
  /** 是否启用启动后自动检查（App 静默实例传 true；按钮传 false 避免重复检查） */
  autoCheck?: boolean;
}

export function UpdateButton({ variant = 'full', autoCheck = true }: UpdateButtonProps) {
  const {
    updateInfo,
    showDialog,
    setShowDialog,
    checkForUpdates,
    checking,
    installing,
    installUpdate,
    isPortableMode,
  } = useUpdateChecker(autoCheck);
  // 手动检查结果轻提示（无更新/失败时提示；静默模式不渲染）
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  // 手动检查更新（便携版由 hook 内部直接弹出下载渠道）
  const handleClick = async () => {
    try {
      const found = await checkForUpdates();
      if (!found && !isPortableMode) {
        showToast('已是最新版本 ✓');
      }
    } catch {
      showToast('检查更新失败，请稍后再试');
    }
  };

  return (
    <>
      {variant === 'icon' && (
        /* 标题栏图标按钮：与标题栏其他按钮同风格（无文案，悬停高亮） */
        <button
          onClick={handleClick}
          disabled={checking}
          className="w-10 h-full flex items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-input)] hover:text-[var(--color-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed"
          title={isPortableMode ? '便携版手动下载渠道' : '检查更新'}
        >
          {isPortableMode ? (
            <Package className="w-4 h-4" />
          ) : (
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          )}
        </button>
      )}

      {variant === 'full' && (
        /* 页面内按钮：与"关于"页版本信息卡片同风格（主题色 emerald） */
        <button
          onClick={handleClick}
          disabled={checking}
          className="w-full h-full rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] px-3 py-2.5 flex items-center justify-center gap-1.5 text-emerald-400 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/5 disabled:opacity-60 disabled:cursor-not-allowed"
          title="检查更新"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          <span className="text-[13px] font-semibold">{checking ? '检查中...' : '检查更新'}</span>
        </button>
      )}

      {/* 更新弹窗（便携版显示手动下载渠道） */}
      <UpdateDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        updateInfo={updateInfo}
        portable={isPortableMode}
        onInstall={installUpdate}
        installing={installing}
      />

      {/* 手动检查结果轻提示（静默模式不渲染） */}
      {variant !== 'silent' && (
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="fixed top-16 right-6 z-[100] px-4 py-2.5 rounded-lg text-xs font-medium shadow-lg"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
