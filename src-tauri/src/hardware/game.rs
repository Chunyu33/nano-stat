//! 游戏前台窗口检测模块
//! 
//! 通过 Win32 API 检测当前前台窗口是否为全屏应用（游戏），
//! 用于决定悬浮面板是否显示 FPS 栏。
//! 
//! 说明：这是安全无注入的启发式检测 —— 前台窗口可见且覆盖屏幕大部分区域
//! 即视为游戏。后续如需真实 FPS 采集（D3D Present Hook），
//! 可在检测到游戏时再激活采集器。

use windows_sys::Win32::Foundation::HWND;
use windows_sys::Win32::UI::WindowsAndMessaging::{
    GetForegroundWindow, GetWindowRect, GetWindowThreadProcessId, IsWindowVisible,
    GetSystemMetrics, SM_CXSCREEN, SM_CYSCREEN,
};

/// 获取前台窗口的进程 PID（用于 FPS 采集按进程过滤）
/// 排除自身进程，返回 None 表示无有效前台窗口
pub fn get_foreground_pid() -> Option<u32> {
    unsafe {
        // 获取前台窗口
        let hwnd: HWND = GetForegroundWindow();
        if hwnd.is_null() {
            return None;
        }

        // 窗口必须可见
        if IsWindowVisible(hwnd) == 0 {
            return None;
        }

        // 排除自身进程的窗口（主窗口、悬浮窗口）
        let mut pid: u32 = 0;
        GetWindowThreadProcessId(hwnd, &mut pid);
        if pid == 0 || pid == std::process::id() {
            return None;
        }

        Some(pid)
    }
}

/// 判断前台窗口是否被判定为"游戏"（全屏/无边框全屏窗口）
pub fn is_game_active() -> bool {
    unsafe {
        // 获取前台窗口
        let hwnd: HWND = GetForegroundWindow();
        if hwnd.is_null() {
            return false;
        }

        // 窗口必须可见
        if IsWindowVisible(hwnd) == 0 {
            return false;
        }

        // 排除自身进程的窗口（主窗口、悬浮窗口）
        let mut pid: u32 = 0;
        GetWindowThreadProcessId(hwnd, &mut pid);
        if pid == std::process::id() {
            return false;
        }

        // 获取窗口矩形
        let mut rect = windows_sys::Win32::Foundation::RECT {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        };
        if GetWindowRect(hwnd, &mut rect) == 0 {
            return false;
        }

        let window_w = (rect.right - rect.left) as i32;
        let window_h = (rect.bottom - rect.top) as i32;
        if window_w <= 0 || window_h <= 0 {
            return false;
        }

        // 获取主屏幕尺寸（物理像素）
        let screen_w = GetSystemMetrics(SM_CXSCREEN);
        let screen_h = GetSystemMetrics(SM_CYSCREEN);
        if screen_w <= 0 || screen_h <= 0 {
            return false;
        }

        // 窗口覆盖屏幕 >= 95% 视为全屏（兼容无边框窗口化，留 5% 容差）
        let cover_w = window_w as f32 / screen_w as f32;
        let cover_h = window_h as f32 / screen_h as f32;
        cover_w >= 0.95 && cover_h >= 0.95
    }
}
