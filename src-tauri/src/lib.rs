//! NanoStat - 硬件监控应用
//! 
//! 类似游戏++的硬件监控工具，提供：
//! - 硬件概览信息展示
//! - 游戏内实时监控面板
//! - 可自定义的监控设置

mod hardware;

use hardware::types::{HardwareOverview, RealtimeStats, MonitorSettings, MonitorPosition};
use std::sync::Mutex;
use std::fs;
use std::path::PathBuf;
use once_cell::sync::Lazy;
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

/// 获取配置文件路径
fn get_config_path() -> PathBuf {
    let config_dir = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("NanoStat");
    
    // 确保目录存在
    fs::create_dir_all(&config_dir).ok();
    
    config_dir.join("settings.json")
}

/// 从文件加载设置
fn load_settings_from_file() -> MonitorSettings {
    let path = get_config_path();
    if path.exists() {
        if let Ok(content) = fs::read_to_string(&path) {
            if let Ok(settings) = serde_json::from_str(&content) {
                return settings;
            }
        }
    }
    MonitorSettings::default()
}

/// 保存设置到文件
fn save_settings_to_file(settings: &MonitorSettings) -> Result<(), String> {
    let path = get_config_path();
    let content = serde_json::to_string_pretty(settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write settings file: {}", e))?;
    Ok(())
}

/// 全局监控设置
static MONITOR_SETTINGS: Lazy<Mutex<MonitorSettings>> = Lazy::new(|| {
    Mutex::new(load_settings_from_file())
});

/// 悬浮窗口标签
const OVERLAY_WINDOW_LABEL: &str = "overlay";

/// 获取硬件概览信息
/// 
/// 返回完整的系统硬件信息，包括 CPU、GPU、内存、磁盘和网络
#[tauri::command]
fn get_hardware_overview() -> HardwareOverview {
    hardware::get_hardware_overview()
}

/// 获取实时监控数据
/// 
/// 返回用于游戏内监控面板的实时数据
#[tauri::command]
fn get_realtime_stats() -> RealtimeStats {
    hardware::get_realtime_stats()
}

/// 获取当前监控设置
#[tauri::command]
fn get_monitor_settings() -> MonitorSettings {
    MONITOR_SETTINGS.lock().unwrap().clone()
}

/// 更新监控设置
#[tauri::command]
fn update_monitor_settings(settings: MonitorSettings) -> Result<(), String> {
    let mut current = MONITOR_SETTINGS.lock()
        .map_err(|e| format!("Failed to lock settings: {}", e))?;
    *current = settings.clone();
    
    // 保存到文件
    save_settings_to_file(&settings)?;
    
    Ok(())
}

/// 显示游戏内监控悬浮窗口
#[tauri::command]
async fn show_overlay_window(app: tauri::AppHandle) -> Result<(), String> {
    let settings = MONITOR_SETTINGS.lock()
        .map_err(|e| format!("Failed to lock settings: {}", e))?
        .clone();
    
    // 如果窗口已存在，直接显示
    if let Some(window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        window.show().map_err(|e| e.to_string())?;
        update_overlay_position(&window, &settings.position)?;
        return Ok(());
    }
    
    // 获取主显示器信息
    let monitor = app.primary_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("No primary monitor found")?;
    
    let screen_size = monitor.size();
    let scale_factor = monitor.scale_factor();
    
    // 计算窗口尺寸（根据位置调整，紧凑尺寸）
    let (width, height) = match settings.position {
        MonitorPosition::TopCenter | MonitorPosition::BottomCenter => (520, 42),
        MonitorPosition::LeftCenter | MonitorPosition::RightCenter => (110, 200),
    };
    
    // 计算窗口位置
    let (x, y) = calculate_overlay_position(
        &settings.position,
        screen_size.width as f64 / scale_factor,
        screen_size.height as f64 / scale_factor,
        width as f64,
        height as f64,
    );
    
    // 创建悬浮窗口
    let window = WebviewWindowBuilder::new(
        &app,
        OVERLAY_WINDOW_LABEL,
        WebviewUrl::App("overlay.html".into()),
    )
    .title("NanoStat Monitor")
    .inner_size(width as f64, height as f64)
    .position(x, y)
    .decorations(false)
    .transparent(true)
    .always_on_top(true)
    .skip_taskbar(true)
    .resizable(false)
    .focused(false)
    .build()
    .map_err(|e| e.to_string())?;
    
    // 设置窗口透明度
    window.set_ignore_cursor_events(true).ok();
    
    Ok(())
}

/// 隐藏游戏内监控悬浮窗口
#[tauri::command]
async fn hide_overlay_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// 更新悬浮窗口位置
#[tauri::command]
async fn update_overlay_position_cmd(app: tauri::AppHandle, position: MonitorPosition) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        update_overlay_position(&window, &position)?;
    }
    Ok(())
}

/// 计算悬浮窗口位置
fn calculate_overlay_position(
    position: &MonitorPosition,
    screen_width: f64,
    screen_height: f64,
    window_width: f64,
    window_height: f64,
) -> (f64, f64) {
    match position {
        MonitorPosition::TopCenter => (
            (screen_width - window_width) / 2.0,
            20.0,
        ),
        MonitorPosition::BottomCenter => (
            (screen_width - window_width) / 2.0,
            screen_height - window_height - 60.0,
        ),
        MonitorPosition::LeftCenter => (
            20.0,
            (screen_height - window_height) / 2.0,
        ),
        MonitorPosition::RightCenter => (
            screen_width - window_width - 20.0,
            (screen_height - window_height) / 2.0,
        ),
    }
}

/// 更新悬浮窗口位置的辅助函数
fn update_overlay_position(window: &tauri::WebviewWindow, position: &MonitorPosition) -> Result<(), String> {
    let monitor = window.primary_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("No primary monitor found")?;
    
    let screen_size = monitor.size();
    let scale_factor = monitor.scale_factor();
    
    // 根据位置调整窗口尺寸
    let (width, height) = match position {
        MonitorPosition::TopCenter | MonitorPosition::BottomCenter => (520.0, 42.0),
        MonitorPosition::LeftCenter | MonitorPosition::RightCenter => (110.0, 200.0),
    };
    
    // 先设置窗口尺寸
    window.set_size(tauri::Size::Logical(tauri::LogicalSize::new(width, height)))
        .map_err(|e| e.to_string())?;
    
    let (x, y) = calculate_overlay_position(
        position,
        screen_size.width as f64 / scale_factor,
        screen_size.height as f64 / scale_factor,
        width,
        height,
    );
    
    window.set_position(tauri::Position::Logical(tauri::LogicalPosition::new(x, y)))
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_hardware_overview,
            get_realtime_stats,
            get_monitor_settings,
            update_monitor_settings,
            show_overlay_window,
            hide_overlay_window,
            update_overlay_position_cmd,
        ])
        .setup(|app| {
            // 创建系统托盘
            use tauri::tray::{TrayIconBuilder, MouseButton, MouseButtonState};
            use tauri::menu::{MenuBuilder, MenuItemBuilder};
            
            // 创建菜单项
            let show_item = MenuItemBuilder::with_id("show", "显示主窗口").build(app)?;
            let quit_item = MenuItemBuilder::with_id("quit", "退出").build(app)?;
            
            // 创建菜单
            let menu = MenuBuilder::new(app)
                .item(&show_item)
                .separator()
                .item(&quit_item)
                .build()?;
            
            // 创建托盘图标
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| {
                    match event.id().as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::Click { button, button_state, .. } = event {
                        if button == MouseButton::Left && button_state == MouseButtonState::Up {
                            if let Some(window) = tray.app_handle().get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
