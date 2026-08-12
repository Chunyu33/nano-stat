/**
 * 监控设置 Hook
 * 管理游戏内监控的配置
 */

import { useState, useEffect, useCallback } from 'react';
import { getMonitorSettings, updateMonitorSettings } from '../api/hardware';
import type { MonitorSettings } from '../types/hardware';

/** 默认监控设置 */
const defaultSettings: MonitorSettings = {
  enabled: false,
  position: 'TopCenter',
  display_items: {
    cpu: true,
    cpu_temp: false,
    gpu: true,
    gpu_temp: true,
    memory: true,
    network: true,
    fps: false,
    fps_1pct: true,
    vram: true,
    disk: true,
    cpu_freq: false,
    gpu_freq: false,
    gpu_power: false,
  },
  refresh_interval: 1000,
  opacity: 80,
  font_size: 12,
};

interface UseMonitorSettingsResult {
  /** 当前设置 */
  settings: MonitorSettings;
  /** 是否正在加载 */
  loading: boolean;
  /** 重新读取设置，用于同步其他窗口保存的配置 */
  refreshSettings: () => Promise<void>;
  /** 保存设置 */
  saveSettings: (settings: MonitorSettings) => Promise<void>;
}

/**
 * 监控设置管理 Hook
 */
export function useMonitorSettings(): UseMonitorSettingsResult {
  const [settings, setSettings] = useState<MonitorSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // 加载设置，也用于同步设置弹窗保存后的最新配置
  const refreshSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMonitorSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load monitor settings:', err);
      // 初次加载失败时保留默认设置；刷新失败时保留当前设置
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  // 保存设置
  const saveSettings = useCallback(async (newSettings: MonitorSettings) => {
    try {
      await updateMonitorSettings(newSettings);
      setSettings(newSettings);
    } catch (err) {
      console.error('Failed to save monitor settings:', err);
      throw err;
    }
  }, []);

  return {
    settings,
    loading,
    refreshSettings,
    saveSettings,
  };
}
