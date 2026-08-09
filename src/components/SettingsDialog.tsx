/**
 * 设置弹窗组件
 * 提供游戏内监控的配置选项
 * 
 * 特性：
 * - 所有设置实时预览（防抖 150ms 同步后端，overlay 通过 settings-changed 事件即时更新）
 * - 透明度只作用于监控面板背景，文字指标保持不透明
 * - 支持 8 个位置（四边中间 + 四角）
 * - framer-motion 过渡动画
 */

import { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Settings2, Eye, Play, Square, Sun, Moon, Laptop } from 'lucide-react';
import type { MonitorSettings, MonitorPosition, DisplayItems } from '../types/hardware';
import { showOverlayWindow, hideOverlayWindow, updateOverlayPosition, updateMonitorSettings } from '../api/hardware';
import { useTheme, type ThemeMode } from '../hooks/useTheme';
import { Checkbox } from './ui/Checkbox';

interface SettingsDialogProps {
  /** 弹窗是否打开 */
  open: boolean;
  /** 关闭弹窗回调 */
  onOpenChange: (open: boolean) => void;
  /** 当前设置 */
  settings: MonitorSettings;
  /** 保存设置回调 */
  onSave: (settings: MonitorSettings) => void;
}

/** 位置选项配置（四边中间 + 四角） */
const positionOptions: { value: MonitorPosition; label: string }[] = [
  { value: 'TopLeft', label: '左上角' },
  { value: 'TopCenter', label: '顶部中间' },
  { value: 'TopRight', label: '右上角' },
  { value: 'LeftCenter', label: '左侧中间' },
  { value: 'RightCenter', label: '右侧中间' },
  { value: 'BottomLeft', label: '左下角' },
  { value: 'BottomCenter', label: '底部中间' },
  { value: 'BottomRight', label: '右下角' },
];

/** 刷新间隔选项 */
const refreshIntervalOptions = [
  { value: 500, label: '500ms' },
  { value: 1000, label: '1秒' },
  { value: 2000, label: '2秒' },
  { value: 5000, label: '5秒' },
];

/** 主题选项配置 */
const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'dark', label: '深色', icon: Moon },
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'system', label: '跟随系统', icon: Laptop },
];

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

export function SettingsDialog({ open, onOpenChange, settings, onSave }: SettingsDialogProps) {
  // 本地状态，用于编辑
  const [localSettings, setLocalSettings] = useState<MonitorSettings>(settings);
  // 主题
  const { theme, setTheme } = useTheme();
  // ref 同步最新设置，避免异步回调中使用过期的闭包值
  const settingsRef = useRef(localSettings);
  // 防抖定时器
  const debounceRef = useRef<number | null>(null);

  // 当外部设置变化时同步
  useEffect(() => {
    setLocalSettings(settings);
    settingsRef.current = settings;
  }, [settings]);

  // 实时预览：本地设置变更后防抖同步到后端，
  // overlay 监听 settings-changed 事件即时更新（透明度/显示项/刷新间隔等）
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      updateMonitorSettings(localSettings).catch(err => {
        console.error('Failed to sync settings:', err);
      });
    }, 150);
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [localSettings]);

  // 更新本地设置并同步 ref（保证后续异步操作读到最新值）
  const updateLocalSettings = (next: MonitorSettings) => {
    setLocalSettings(next);
    settingsRef.current = next;
  };

  // 处理开关变更 - 立即显示/隐藏悬浮窗口
  const handleEnabledChange = async (enabled: boolean) => {
    const next = { ...settingsRef.current, enabled };
    updateLocalSettings(next);
    try {
      if (enabled) {
        await showOverlayWindow();
      } else {
        await hideOverlayWindow();
      }
    } catch (err) {
      console.error('Failed to toggle overlay:', err);
    }
  };

  // 处理位置变更 - 立即更新悬浮窗口位置（移动窗口 + 持久化）
  const handlePositionChange = async (position: MonitorPosition) => {
    const next = { ...settingsRef.current, position };
    updateLocalSettings(next);
    try {
      await updateOverlayPosition(position);
    } catch (err) {
      console.error('Failed to update overlay position:', err);
    }
  };

  // 处理显示项变更
  const handleDisplayItemChange = (key: keyof DisplayItems, value: boolean) => {
    updateLocalSettings({
      ...settingsRef.current,
      display_items: { ...settingsRef.current.display_items, [key]: value },
    });
  };

  // 处理刷新间隔变更
  const handleRefreshIntervalChange = (interval: number) => {
    updateLocalSettings({ ...settingsRef.current, refresh_interval: interval });
  };

  // 处理透明度变更
  const handleOpacityChange = (opacity: number) => {
    updateLocalSettings({ ...settingsRef.current, opacity });
  };

  // 处理文字大小变更
  const handleFontSizeChange = (fontSize: number) => {
    updateLocalSettings({ ...settingsRef.current, font_size: fontSize });
  };

  // 保存设置
  const handleSave = async () => {
    onSave(localSettings);

    // 根据启用状态控制悬浮窗口
    if (localSettings.enabled) {
      try {
        await showOverlayWindow();
      } catch (err) {
        console.error('Failed to show overlay:', err);
      }
    } else {
      try {
        await hideOverlayWindow();
      } catch (err) {
        console.error('Failed to hide overlay:', err);
      }
    }

    onOpenChange(false);
  };

  // 测试悬浮窗口
  const handleTestOverlay = async () => {
    try {
      await showOverlayWindow();
    } catch (err) {
      console.error('Failed to show overlay:', err);
    }
  };

  // 关闭悬浮窗口
  const handleCloseOverlay = async () => {
    try {
      await hideOverlayWindow();
    } catch (err) {
      console.error('Failed to hide overlay:', err);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* 遮罩层 */}
            <Dialog.Overlay forceMount asChild>
              <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" {...overlayMotion} />
            </Dialog.Overlay>

            {/* 弹窗内容 */}
            <Dialog.Content forceMount asChild>
              <motion.div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] max-h-[85vh] rounded-xl shadow-2xl z-50 overflow-hidden"
                style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
                {...contentMotion}
              >
                {/* 标题栏 */}
                <div
                  className="flex items-center justify-between"
                  style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-sidebar)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Settings2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <Dialog.Title style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      设置
                    </Dialog.Title>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg-input)]"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* 设置内容 */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', maxHeight: '60vh' }}>
                  {/* 游戏内监控开关 */}
                  <div
                    className="flex items-center justify-between rounded-lg"
                    style={{ padding: '16px', backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>游戏内监控</p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>在游戏中显示硬件性能监控面板</p>
                      </div>
                    </div>
                    {/* 主题化开关 */}
                    <button
                      onClick={() => handleEnabledChange(!localSettings.enabled)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        localSettings.enabled ? 'bg-emerald-500' : 'bg-gray-600'
                      }`}
                      style={{ boxShadow: localSettings.enabled ? '0 0 8px var(--color-card-glow)' : 'none' }}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
                          localSettings.enabled ? 'left-5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 悬浮窗口测试按钮 */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleTestOverlay}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors border border-green-500/30"
                      style={{ padding: '12px 16px' }}
                    >
                      <Play className="w-4 h-4" />
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>显示悬浮窗口</span>
                    </button>
                    <button
                      onClick={handleCloseOverlay}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/30"
                      style={{ padding: '12px 16px' }}
                    >
                      <Square className="w-4 h-4" />
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>关闭悬浮窗口</span>
                    </button>
                  </div>

                  {/* 监控面板位置 - 四边中间 + 四角 */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>面板位置</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      {positionOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => handlePositionChange(option.value)}
                          className={`rounded-lg font-medium transition-all ${
                            localSettings.position === option.value
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] hover:text-[var(--color-text-primary)]'
                          }`}
                          style={{ padding: '10px 8px', fontSize: '12px' }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 显示项目 - 可复用主题化 Checkbox */}
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '12px' }}>显示项目</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[
                        { key: 'cpu' as const, label: 'CPU 使用率' },
                        { key: 'cpu_temp' as const, label: 'CPU 温度' },
                        { key: 'gpu' as const, label: 'GPU 使用率' },
                        { key: 'gpu_temp' as const, label: 'GPU 温度' },
                        { key: 'memory' as const, label: '内存使用率' },
                        { key: 'network' as const, label: '网络速率' },
                        { key: 'fps' as const, label: '帧率 (FPS)' },
                      ].map(item => (
                        <div
                          key={item.key}
                          className="flex items-center rounded-lg transition-colors border"
                          style={{ padding: '10px 14px', backgroundColor: 'var(--color-bg-input)', borderColor: 'var(--color-border)' }}
                        >
                          <Checkbox
                            checked={localSettings.display_items[item.key]}
                            onChange={value => handleDisplayItemChange(item.key, value)}
                            label={item.label}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 刷新间隔 */}
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '12px' }}>刷新间隔</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {refreshIntervalOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => handleRefreshIntervalChange(option.value)}
                          className={`flex-1 rounded-lg font-medium transition-all ${
                            localSettings.refresh_interval === option.value
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] hover:text-[var(--color-text-primary)]'
                          }`}
                          style={{ padding: '10px 16px', fontSize: '13px' }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 背景透明度（只影响面板背景，文字指标保持不透明） */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>背景透明度</p>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>{localSettings.opacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={localSettings.opacity}
                      onChange={e => handleOpacityChange(Number(e.target.value))}
                      className="w-full h-2 bg-[var(--color-bg-input)] rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-[var(--color-border)]"
                    />
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                      仅调整监控面板背景透明度，文字与数值保持清晰可见
                    </p>
                  </div>

                  {/* 文字大小（容器随字号自适应） */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>文字大小</p>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>{localSettings.font_size}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="20"
                      value={localSettings.font_size}
                      onChange={e => handleFontSizeChange(Number(e.target.value))}
                      className="w-full h-2 bg-[var(--color-bg-input)] rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-[var(--color-border)]"
                    />
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                      面板文字大小（10-20px），悬浮窗口尺寸会随之自适应
                    </p>
                  </div>

                  {/* 主题切换 */}
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '12px' }}>主题</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {themeOptions.map(option => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => setTheme(option.value)}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-lg font-medium transition-all ${
                              theme === option.value
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] hover:text-[var(--color-text-primary)]'
                            }`}
                            style={{ padding: '10px 16px', fontSize: '13px' }}
                          >
                            <Icon className="w-4 h-4" />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 底部按钮 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-sidebar)' }}>
                  <button
                    onClick={() => onOpenChange(false)}
                    style={{
                      padding: '10px 20px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--color-text-secondary)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: '10px 24px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: '#10b981',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    保存设置
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
