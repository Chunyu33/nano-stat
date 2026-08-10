/**
 * 自定义标题栏组件
 * 提供窗口拖拽、最小化、最大化、关闭功能
 */

import { useState } from 'react';
import { Minus, Square, X, Settings } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface TitleBarProps {
  /** 打开设置弹窗的回调 */
  onOpenSettings: () => void;
  /** 当前页面标题 */
  title: string;
}

export function TitleBar({ onOpenSettings, title }: TitleBarProps) {
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
        transition: 'background-color 0.3s ease',
        paddingRight: '0'
      }}
    >
      {/* 左侧 Logo 和标题 */}
      <div className="flex items-center gap-3" style={{ marginLeft: '8px' }}>
        <div className="flex items-center gap-2">
          <img src="/icons/32x32.png" alt="NanoStat" className="w-6 h-6" />
          <span className="text-sm font-semibold text-emerald-400">NanoStat</span>
        </div>
      </div>

      {/* 中间标题 */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{title}</span>
      </div>

      {/* 右侧按钮 */}
      <div className="flex items-center gap-0 h-full no-drag">
        {/* 设置按钮 */}
        <button
          onClick={onOpenSettings}
          className="w-10 h-full flex items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-input)] hover:text-[var(--color-text-primary)]"
          title="设置"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* 窗口控制按钮 */}
        <button
          onClick={handleMinimize}
          className="w-10 h-full flex items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-input)] hover:text-[var(--color-text-primary)]"
          title="最小化"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-10 h-full flex items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-input)] hover:text-[var(--color-text-primary)]"
          title={isMaximized ? '还原' : '最大化'}
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleClose}
          className="w-10 h-full flex items-center justify-center text-[var(--color-text-secondary)] transition-colors hover:bg-red-500 hover:text-white"
          title="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
