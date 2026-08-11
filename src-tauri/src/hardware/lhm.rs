//! LHM (LibreHardwareMonitor) 桥接模块
//! 
//! 管理 lhm-bridge 子进程的生命周期：
//! - 懒启动：首次需要 CPU 温度时才拉起 bridge 子进程
//! - bridge 持续输出 JSON Lines 温度流（每 1 秒一行），本模块后台线程解析缓存
//! - 若 PawnIO 驱动未安装，bridge 输出错误标记退出，本模块标记 driver_missing，
//!   上层回退到 WMI / N/A
//! 
//! 协议（JSON Lines over stdout）：
//!   {"cpu_temp":55.2,"gpu_temp":63.4,"mb_temp":42.0,"timestamp":1723000000000}
//!   错误: {"error":"PAWNIO_NOT_INSTALLED"}  + exit code 2

use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
// Windows 扩展：creation_flags（隐藏子进程控制台窗口）
#[cfg(windows)]
use std::os::windows::process::CommandExt;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use once_cell::sync::Lazy;
use serde::Deserialize;
use tauri::Manager;

/// bridge 输出的温度快照（与 C# 端字段对应）
#[derive(Debug, Clone, Deserialize)]
struct TempSnapshot {
    #[serde(default)]
    cpu_temp: Option<f32>,
    #[serde(default)]
    gpu_temp: Option<f32>,
    #[serde(default)]
    mb_temp: Option<f32>,
    #[serde(default)]
    error: Option<String>,
}

/// LHM 桥接状态
struct LhmState {
    /// 子进程句柄（None 表示未启动/已退出）
    child: Option<Child>,
    /// 最近一次温度快照
    snapshot: Option<TempSnapshot>,
    /// 快照时间（用于新鲜度检查）
    last_update: Instant,
    /// PawnIO 驱动是否未安装（决定上层是否回退 WMI）
    driver_missing: bool,
    /// 是否已尝试启动（避免重复拉起失败的进程）
    started: bool,
}

impl LhmState {
    fn new() -> Self {
        LhmState {
            child: None,
            snapshot: None,
            last_update: Instant::now() - Duration::from_secs(60),
            driver_missing: false,
            started: false,
        }
    }
}

static LHM_STATE: Lazy<Mutex<LhmState>> = Lazy::new(|| Mutex::new(LhmState::new()));

/// 找到 bridge 可执行文件路径（优先打包后的 resources，其次开发目录）
fn find_bridge_path(app: &tauri::AppHandle) -> Option<PathBuf> {
    // 打包后：resources 保留相对结构（lhm-bridge/bin/.../lhm-bridge.exe）或扁平放置
    if let Ok(resource_dir) = app.path().resource_dir() {
        let candidates = [
            resource_dir.join("lhm-bridge/bin/Release/net8.0/win-x64/publish/lhm-bridge.exe"),
            resource_dir.join("lhm-bridge.exe"),
        ];
        for path in candidates {
            if path.exists() {
                return Some(path);
            }
        }
    }

    // 开发时：项目内 publish 产物
    let dev = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("lhm-bridge/bin/Release/net8.0/win-x64/publish/lhm-bridge.exe");
    if dev.exists() {
        return Some(dev);
    }

    None
}

/// 启动 bridge 子进程（幂等，只启动一次）
pub fn ensure_bridge(app: &tauri::AppHandle) {
    let mut state = LHM_STATE.lock().unwrap();
    if state.started {
        return;
    }
    state.started = true;

    let Some(path) = find_bridge_path(app) else {
        // bridge 未打包，标记不可用（上层回退 WMI）
        return;
    };

    let Ok(mut child) = Command::new(&path)
        .stdin(Stdio::piped()) // 保持 stdin 打开，父进程退出时 bridge 检测到 EOF 自行退出
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        // 隐藏子进程控制台窗口：bridge 是控制台子系统程序，
        // GUI 父进程（NanoStat）启动它时默认会新建 cmd 窗口，这里用 CREATE_NO_WINDOW 阻止
        .creation_flags(0x0800_0000) // CREATE_NO_WINDOW
        .spawn()
    else {
        return;
    };

    let stdout = match child.stdout.take() {
        Some(s) => s,
        None => {
            let _ = child.kill();
            return;
        }
    };

    state.child = Some(child);

    // 后台线程持续读取并解析 JSON Lines
    std::thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            let Ok(line) = line else { break };
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }

            // 解析失败或空快照行直接跳过
            let Ok(snap) = serde_json::from_str::<TempSnapshot>(trimmed) else {
                continue;
            };

            // 错误标记：PawnIO 未安装
            if snap.error.as_deref() == Some("PAWNIO_NOT_INSTALLED") {
                let mut state = LHM_STATE.lock().unwrap();
                state.driver_missing = true;
                state.snapshot = None;
                continue;
            }

            // 更新缓存
            let mut state = LHM_STATE.lock().unwrap();
            state.snapshot = Some(snap);
            state.last_update = Instant::now();
        }
        // stdout 关闭 = bridge 退出
        let mut state = LHM_STATE.lock().unwrap();
        state.child = None;
    });
}

/// PawnIO 驱动是否未安装（供 UI 提示用）
pub fn is_driver_missing() -> bool {
    LHM_STATE.lock().unwrap().driver_missing
}

/// 获取 CPU 温度（来自 LHM），数据超过 3 秒视为过期返回 None
pub fn get_cpu_temp() -> Option<f32> {
    let state = LHM_STATE.lock().unwrap();
    if state.driver_missing || state.child.is_none() {
        return None;
    }
    if state.last_update.elapsed() > Duration::from_secs(3) {
        return None;
    }
    state.snapshot.as_ref()?.cpu_temp
}

/// 获取 GPU 温度（来自 LHM，NVML 不可用时的补充数据源）
pub fn get_gpu_temp() -> Option<f32> {
    let state = LHM_STATE.lock().unwrap();
    if state.driver_missing || state.child.is_none() {
        return None;
    }
    if state.last_update.elapsed() > Duration::from_secs(3) {
        return None;
    }
    state.snapshot.as_ref()?.gpu_temp
}

/// 获取主板温度（预留能力，供后续 UI 扩展展示）
#[allow(dead_code)]
pub fn get_mb_temp() -> Option<f32> {
    let state = LHM_STATE.lock().unwrap();
    if state.driver_missing || state.child.is_none() {
        return None;
    }
    if state.last_update.elapsed() > Duration::from_secs(3) {
        return None;
    }
    state.snapshot.as_ref()?.mb_temp
}
