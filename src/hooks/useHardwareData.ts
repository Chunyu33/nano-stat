/**
 * 硬件数据 Hook
 * 管理硬件信息的获取和实时更新
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getHardwareOverview, getRealtimeStats } from '../api/hardware';
import type { HardwareOverview, RealtimeStats } from '../types/hardware';

/** 历史数据最大长度 */
const HISTORY_MAX_LENGTH = 60;

interface UseHardwareDataResult {
  /** 硬件概览数据 */
  overview: HardwareOverview | null;
  /** 实时统计数据 */
  realtime: RealtimeStats | null;
  /** CPU 使用率历史 */
  cpuHistory: number[];
  /** GPU 使用率历史 */
  gpuHistory: number[];
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 手动刷新 */
  refresh: () => Promise<void>;
}

/**
 * 硬件数据管理 Hook
 * @param refreshInterval 刷新间隔（毫秒）
 */
export function useHardwareData(refreshInterval = 1000): UseHardwareDataResult {
  const [overview, setOverview] = useState<HardwareOverview | null>(null);
  const [realtime, setRealtime] = useState<RealtimeStats | null>(null);
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [gpuHistory, setGpuHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 使用 ref 避免闭包问题
  const intervalRef = useRef<number | null>(null);

  // 获取硬件概览数据
  const fetchOverview = useCallback(async () => {
    try {
      const data = await getHardwareOverview();
      setOverview(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch hardware overview:', err);
      setError(err instanceof Error ? err.message : '获取硬件信息失败');
    }
  }, []);

  // 获取实时数据
  const fetchRealtime = useCallback(async () => {
    try {
      const data = await getRealtimeStats();
      setRealtime(data);
      
      // 更新历史数据
      setCpuHistory(prev => {
        const newHistory = [...prev, data.cpu_usage];
        return newHistory.slice(-HISTORY_MAX_LENGTH);
      });
      
      setGpuHistory(prev => {
        const newHistory = [...prev, data.gpu_usage];
        return newHistory.slice(-HISTORY_MAX_LENGTH);
      });
    } catch (err) {
      console.error('Failed to fetch realtime stats:', err);
    }
  }, []);

  // 刷新所有数据
  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchOverview(), fetchRealtime()]);
    setLoading(false);
  }, [fetchOverview, fetchRealtime]);

  // 初始化和定时刷新
  useEffect(() => {
    // 初始加载
    refresh();

    // 设置定时刷新
    intervalRef.current = window.setInterval(() => {
      fetchOverview();
      fetchRealtime();
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refresh, fetchOverview, fetchRealtime, refreshInterval]);

  return {
    overview,
    realtime,
    cpuHistory,
    gpuHistory,
    loading,
    error,
    refresh,
  };
}
