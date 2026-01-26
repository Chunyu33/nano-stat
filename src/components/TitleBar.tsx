/**
 * 自定义标题栏组件
 * 提供窗口拖拽、最小化、最大化、关闭功能
 */

import { useState } from 'react';
import { Minus, Square, X, Settings, Copy } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface TitleBarProps {
  /** 打开设置弹窗的回调 */
  onOpenSettings: () => void;
}

export function TitleBar({ onOpenSettings }: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  // 最小化窗口
  const handleMinimize = async () => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.minimize();
    } catch (err) {
      console.error('Failed to minimize:', err);
    }
  };

  // 最大化/还原窗口
  const handleMaximize = async () => {
    try {
      const appWindow = getCurrentWindow();
      const maximized = await appWindow.isMaximized();
      if (maximized) {
        await appWindow.unmaximize();
        setIsMaximized(false);
      } else {
        await appWindow.maximize();
        setIsMaximized(true);
      }
    } catch (err) {
      console.error('Failed to maximize:', err);
    }
  };

  // 最小化到托盘（隐藏窗口）
  const handleClose = async () => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.hide();
    } catch (err) {
      console.error('Failed to hide:', err);
    }
  };

  return (
    <header 
      className="drag-region h-10 flex items-center justify-between px-4"
      style={{ 
        backgroundColor: 'var(--color-bg-sidebar)', 
        borderBottom: '1px solid var(--color-border)',
        transition: 'background-color 0.3s ease'
      }}
    >
      {/* 左侧 Logo 和标题 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <Copy className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-emerald-400">NanoStat</span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>v1.0.0</span>
      </div>

      {/* 中间标题 */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>硬件信息</span>
      </div>

      {/* 右侧按钮 */}
      <div className="flex items-center gap-1 no-drag">
        {/* 设置按钮 */}
        <button
          onClick={onOpenSettings}
          className="w-8 h-8 flex items-center justify-center rounded transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          title="设置"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* 窗口控制按钮 */}
        <button
          onClick={handleMinimize}
          className="w-8 h-8 flex items-center justify-center rounded transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          title="最小化"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-8 h-8 flex items-center justify-center rounded transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          title={isMaximized ? '还原' : '最大化'}
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-600 transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          title="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
