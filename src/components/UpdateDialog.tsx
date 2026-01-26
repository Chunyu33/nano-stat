/**
 * 更新弹窗组件
 * 检测到新版本时显示更新引导
 */

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Download, Sparkles } from 'lucide-react';

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

export function UpdateDialog({ open, onOpenChange, updateInfo }: UpdateDialogProps) {
  const [downloading, setDownloading] = useState(false);

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
      <Dialog.Portal>
        {/* 遮罩层 */}
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        
        {/* 弹窗内容 */}
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-[#141a24] border border-[#2a3441] rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* 标题栏 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3441] bg-[#0f1419]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-green-400" />
              </div>
              <Dialog.Title className="text-base font-semibold text-gray-100">
                发现新版本
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2a3441] transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </Dialog.Close>
          </div>

          {/* 内容 */}
          <div style={{ padding: '20px' }}>
            {/* 版本信息 */}
            <div className="flex items-center justify-between mb-4 p-4 bg-[#0f1419] rounded-lg border border-[#2a3441]">
              <div>
                <p className="text-xs text-gray-500 mb-1">新版本</p>
                <p className="text-lg font-bold text-green-400">v{updateInfo.version}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">当前版本</p>
                <p className="text-sm text-gray-400">v1.0.0</p>
              </div>
            </div>

            {/* 更新说明 */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-100 mb-2">更新内容</p>
              <div className="p-3 bg-[#0f1419] rounded-lg border border-[#2a3441] max-h-32 overflow-y-auto">
                <p className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed">
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', padding: '16px 20px', borderTop: '1px solid #2a3441', background: '#0f1419' }}>
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-[#2a3441]"
            >
              稍后提醒
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-5 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white text-xs font-semibold rounded-lg transition-colors"
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// 检查更新的 Hook
export function useUpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const checkForUpdates = async () => {
    try {
      // 这里可以替换为实际的更新检查 API
      // 示例：从 GitHub Releases 获取最新版本
      const response = await fetch(
        'https://api.github.com/repos/Chunyu33/nano-stat/releases/latest',
        { headers: { 'Accept': 'application/vnd.github.v3+json' } }
      );
      
      if (response.ok) {
        const data = await response.json();
        const latestVersion = data.tag_name?.replace('v', '') || '';
        const currentVersion = '1.0.0';
        
        // 简单的版本比较
        if (latestVersion && latestVersion !== currentVersion) {
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
