/**
 * 游戏内监控悬浮面板组件
 * 轻量级实时硬件监控显示
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { RealtimeStats, MonitorSettings } from '../types/hardware';

/** 默认设置 */
const defaultSettings: MonitorSettings = {
  enabled: true,
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

export function OverlayPanel() {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [settings, setSettings] = useState<MonitorSettings>(defaultSettings);

  // 加载设置并定时刷新
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await invoke<MonitorSettings>('get_monitor_settings');
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    loadSettings();
    
    // 每秒检查设置变化（用于响应位置切换）
    const settingsInterval = setInterval(loadSettings, 1000);
    return () => clearInterval(settingsInterval);
  }, []);

  // 定时获取实时数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await invoke<RealtimeStats>('get_realtime_stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    // 立即获取一次
    fetchStats();

    // 设置定时器
    const interval = setInterval(fetchStats, settings.refresh_interval);

    return () => clearInterval(interval);
  }, [settings.refresh_interval]);

  // 判断是否为垂直布局
  const isVertical = settings.position === 'LeftCenter' || settings.position === 'RightCenter';

  // 面板样式
  const panelStyle = {
    opacity: settings.opacity / 100,
  };

  return (
    <div
      className={`overlay-panel ${isVertical ? 'overlay-vertical' : 'overlay-horizontal'}`}
      style={panelStyle}
    >
      {/* CPU 使用率 */}
      {settings.display_items.cpu && (
        <div className="monitor-item">
          <span className="monitor-label">CPU</span>
          <span className="monitor-value text-cpu">
            {stats?.cpu_usage.toFixed(0) ?? '--'}%
          </span>
        </div>
      )}

      {/* GPU 使用率 */}
      {settings.display_items.gpu && (
        <div className="monitor-item">
          <span className="monitor-label">GPU</span>
          <span className="monitor-value text-gpu">
            {stats?.gpu_usage.toFixed(0) ?? '--'}%
          </span>
        </div>
      )}

      {/* GPU 温度 */}
      {settings.display_items.gpu_temp && (
        <div className="monitor-item">
          <span className="monitor-label">温度</span>
          <span className="monitor-value text-temp">
            {stats?.gpu_temp?.toFixed(0) ?? '--'}°C
          </span>
        </div>
      )}

      {/* 内存使用率 */}
      {settings.display_items.memory && (
        <div className="monitor-item">
          <span className="monitor-label">内存</span>
          <span className="monitor-value text-memory">
            {stats?.memory_usage.toFixed(0) ?? '--'}%
          </span>
        </div>
      )}

      {/* 网络速率 */}
      {settings.display_items.network && (
        <div className="monitor-item">
          <span className="monitor-label">网络</span>
          <span className="monitor-value text-network">
            ↓{stats?.network_stats.download_rate.toFixed(0) ?? '--'}KB/s
          </span>
        </div>
      )}

      {/* FPS（预留） */}
      {settings.display_items.fps && (
        <div className="monitor-item">
          <span className="monitor-label">FPS</span>
          <span className="monitor-value text-fps">--</span>
        </div>
      )}
    </div>
  );
}
