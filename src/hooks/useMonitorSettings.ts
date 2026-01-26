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
    gpu: true,
    gpu_temp: true,
    memory: true,
    network: true,
    fps: false,
  },
  refresh_interval: 1000,
  opacity: 80,
};

interface UseMonitorSettingsResult {
  /** 当前设置 */
  settings: MonitorSettings;
  /** 是否正在加载 */
  loading: boolean;
  /** 保存设置 */
  saveSettings: (settings: MonitorSettings) => Promise<void>;
}

/**
 * 监控设置管理 Hook
 */
export function useMonitorSettings(): UseMonitorSettingsResult {
  const [settings, setSettings] = useState<MonitorSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getMonitorSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load monitor settings:', err);
        // 使用默认设置
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

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
    saveSettings,
  };
}
