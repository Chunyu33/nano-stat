/**
 * 硬件信息 API 模块
 * 封装与 Rust 后端的通信
 */

import { invoke } from '@tauri-apps/api/core';
import type { HardwareOverview, RealtimeStats, MonitorSettings, MonitorPosition } from '../types/hardware';

/**
 * 获取硬件概览信息
 * @returns 完整的硬件信息
 */
export async function getHardwareOverview(): Promise<HardwareOverview> {
  return await invoke<HardwareOverview>('get_hardware_overview');
}

/**
 * 获取实时监控数据
 * @returns 实时监控数据
 */
export async function getRealtimeStats(): Promise<RealtimeStats> {
  return await invoke<RealtimeStats>('get_realtime_stats');
}

/**
 * 获取监控设置
 * @returns 当前监控设置
 */
export async function getMonitorSettings(): Promise<MonitorSettings> {
  return await invoke<MonitorSettings>('get_monitor_settings');
}

/**
 * 更新监控设置
 * @param settings 新的监控设置
 */
export async function updateMonitorSettings(settings: MonitorSettings): Promise<void> {
  await invoke('update_monitor_settings', { settings });
}

/**
 * 显示游戏内监控悬浮窗口
 */
export async function showOverlayWindow(): Promise<void> {
  await invoke('show_overlay_window');
}

/**
 * 隐藏游戏内监控悬浮窗口
 */
export async function hideOverlayWindow(): Promise<void> {
  await invoke('hide_overlay_window');
}

/**
 * 更新悬浮窗口位置
 * @param position 新的位置
 */
export async function updateOverlayPosition(position: MonitorPosition): Promise<void> {
  await invoke('update_overlay_position_cmd', { position });
}
