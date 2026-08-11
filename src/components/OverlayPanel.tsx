/**
 * 游戏内监控悬浮面板组件
 * 轻量级实时硬件监控显示
 */

import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { RealtimeStats, MonitorSettings } from '../types/hardware';
import { formatSpeed, formatGb, formatDiskRate } from '../utils/format';

/** 默认设置 */
const defaultSettings: MonitorSettings = {
  enabled: true,
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

export function OverlayPanel() {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [settings, setSettings] = useState<MonitorSettings>(defaultSettings);

  // 加载设置并监听设置变更事件（替代原来的每秒轮询）
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
    
    // 监听主窗口设置变更事件，实时响应（位置切换、显示项调整等）
    const unlistenPromise = listen<MonitorSettings>('settings-changed', (event) => {
      setSettings(event.payload);
    });
    return () => {
      unlistenPromise.then(unlisten => unlisten()).catch(() => {});
    };
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

  // 判断是否为垂直布局（仅左右居中位置；四角使用水平紧凑条）
  const isVertical = settings.position === 'LeftCenter' || settings.position === 'RightCenter';

  // 面板样式：透明度只作用于背景（--panel-bg-alpha），文字指标保持不透明；
  // 文字大小通过 --panel-font-size 控制（容器尺寸由 Rust 端随字号自适应）
  const panelStyle = {
    '--panel-bg-alpha': settings.opacity / 100,
    '--panel-font-size': `${settings.font_size}px`,
  } as CSSProperties;

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

      {/* CPU 温度 */}
      {settings.display_items.cpu_temp && (
        <div className="monitor-item">
          <span className="monitor-label">CPU温度</span>
          <span className="monitor-value text-temp">
            {stats?.cpu_temp?.toFixed(0) ?? '--'}°C
          </span>
        </div>
      )}

      {/* GPU 温度 */}
      {settings.display_items.gpu_temp && (
        <div className="monitor-item">
          <span className="monitor-label">GPU温度</span>
          <span className="monitor-value text-temp">
            {stats?.gpu_temp?.toFixed(0) ?? '--'}°C
          </span>
        </div>
      )}

      {/* 内存使用率 + 已用容量（GB） */}
      {settings.display_items.memory && (
        <div className="monitor-item">
          <span className="monitor-label">内存</span>
          <span className="monitor-value text-memory">
            {stats?.memory_usage.toFixed(0) ?? '--'}%{' '}
            {stats ? `${formatGb(stats.memory_used)}/${formatGb(stats.memory_total)}` : ''}
          </span>
        </div>
      )}

      {/* 网络速率（自动换算 KB/s → MB/s → GB/s） */}
      {settings.display_items.network && (
        <div className="monitor-item">
          <span className="monitor-label">网络</span>
          <span className="monitor-value text-network">
            ↓{formatSpeed(stats?.network_stats.download_rate ?? 0)}
          </span>
        </div>
      )}

      {/* FPS：全程显示（游戏前台为游戏帧率，非游戏为桌面整体帧率） */}
      {settings.display_items.fps && (
        <div className="monitor-item">
          <span className="monitor-label">FPS</span>
          <span className="monitor-value text-fps">
            {stats?.fps != null ? stats.fps.toFixed(0) : '--'}
          </span>
        </div>
      )}

      {/* 1% Low FPS（帧时间 99 百分位换算；仅游戏前台且有足够帧数时有效） */}
      {settings.display_items.fps_1pct && (
        <div className="monitor-item">
          <span className="monitor-label">1%Low</span>
          <span className="monitor-value text-fps">
            {stats?.fps_1pct != null ? stats.fps_1pct.toFixed(0) : '--'}
          </span>
        </div>
      )}

      {/* 显存占用（已用/总量） */}
      {settings.display_items.vram && (
        <div className="monitor-item">
          <span className="monitor-label">显存</span>
          <span className="monitor-value text-gpu">
            {stats?.vram_used != null && stats?.vram_total != null
              ? `${formatGb(stats.vram_used)}/${formatGb(stats.vram_total)}`
              : '--'}
          </span>
        </div>
      )}

      {/* 磁盘读写速率（紧凑单位，如 ↓12.3M ↑2.1M 表示 MB/s） */}
      {settings.display_items.disk && (
        <div className="monitor-item">
          <span className="monitor-label">磁盘</span>
          <span className="monitor-value text-network">
            ↓{stats?.disk_read_rate != null ? formatDiskRate(stats.disk_read_rate) : '--'}{' '}
            ↑{stats?.disk_write_rate != null ? formatDiskRate(stats.disk_write_rate) : '--'}
          </span>
        </div>
      )}

      {/* CPU 当前频率 */}
      {settings.display_items.cpu_freq && (
        <div className="monitor-item">
          <span className="monitor-label">CPU频率</span>
          <span className="monitor-value text-cpu">
            {stats?.cpu_frequency != null ? `${(stats.cpu_frequency / 1000).toFixed(2)}G` : '--'}
          </span>
        </div>
      )}

      {/* GPU 核心频率 */}
      {settings.display_items.gpu_freq && (
        <div className="monitor-item">
          <span className="monitor-label">GPU频率</span>
          <span className="monitor-value text-gpu">
            {stats?.gpu_clock != null ? `${(stats.gpu_clock / 1000).toFixed(2)}G` : '--'}
          </span>
        </div>
      )}

      {/* GPU 功耗 */}
      {settings.display_items.gpu_power && (
        <div className="monitor-item">
          <span className="monitor-label">GPU功耗</span>
          <span className="monitor-value text-temp">
            {stats?.gpu_power != null ? `${stats.gpu_power.toFixed(0)}W` : '--'}
          </span>
        </div>
      )}
    </div>
  );
}
