//! NanoStat - 硬件监控应用
//! 
//! 类似游戏++的硬件监控工具，提供：
//! - 硬件概览信息展示
//! - 游戏内实时监控面板
//! - 可自定义的监控设置

pub mod hardware;

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

/// 检查 LHM 温度采集所需的 PawnIO 驱动是否缺失（供 UI 提示引导安装）
#[tauri::command]
fn is_lhm_driver_missing() -> bool {
    hardware::lhm::is_driver_missing()
}

/// 获取当前监控设置
#[tauri::command]
fn get_monitor_settings() -> MonitorSettings {
    MONITOR_SETTINGS.lock().unwrap().clone()
}

/// 更新监控设置
#[tauri::command]
async fn update_monitor_settings(
    app: tauri::AppHandle,
    settings: MonitorSettings,
) -> Result<(), String> {
    let mut current = MONITOR_SETTINGS.lock()
        .map_err(|e| format!("Failed to lock settings: {}", e))?;
    *current = settings.clone();
    
    // 保存到文件
    save_settings_to_file(&settings)?;
    
    // 通知悬浮窗口设置已变更（前端监听后更新显示）
    drop(current);
    use tauri::Emitter;
    let _ = app.emit("settings-changed", &settings);
    
    // 位置/字号变化时同步调整悬浮窗口尺寸（容器随字号自适应，幂等）
    if let Some(window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        let _ = update_overlay_position(&window, &settings.position);
    }
    
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
    
    // 计算窗口尺寸（根据位置、显示项与字号调整，紧凑尺寸）
    let (width, height) = overlay_window_size(&settings.position, &settings);
    let (width, height) = (width as i32, height as i32);
    
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
    // 边距：给悬浮窗保留明确的屏幕外沿呼吸空间
    let margin = 16.0;
    match position {
        MonitorPosition::TopCenter => (
            (screen_width - window_width) / 2.0,
            margin,
        ),
        MonitorPosition::BottomCenter => (
            (screen_width - window_width) / 2.0,
            screen_height - window_height - margin,
        ),
        MonitorPosition::LeftCenter => (
            margin,
            (screen_height - window_height) / 2.0,
        ),
        MonitorPosition::RightCenter => (
            screen_width - window_width - margin,
            (screen_height - window_height) / 2.0,
        ),
        MonitorPosition::TopLeft => (margin, margin),
        MonitorPosition::TopRight => (screen_width - window_width - margin, margin),
        MonitorPosition::BottomLeft => (margin, screen_height - window_height - margin),
        MonitorPosition::BottomRight => (
            screen_width - window_width - margin,
            screen_height - window_height - margin,
        ),
    }
}

/// 根据位置、显示项数量与文字大小返回窗口尺寸（容器随内容自适应，保证不裁剪）
fn overlay_window_size(position: &MonitorPosition, settings: &MonitorSettings) -> (f64, f64) {
    // 字号范围 10-20，超出时钳制（默认 12）
    let fs = settings.font_size.clamp(10, 20) as f64;
    // 启用的显示项数量（决定水平宽度 / 垂直高度）
    let d = &settings.display_items;
    let n = [
        d.cpu, d.cpu_temp, d.gpu, d.gpu_temp, d.memory, d.network, d.fps,
    ]
    .iter()
    .filter(|v| **v)
    .count()
    .max(1) as f64;

    match position {
        // 水平条（上下中 + 四角）：
        // 宽度 = padding 28px + 每项约 5.5em + 项间距 1.1em×(n-1)，
        // 每项内容（标签+数值）按 7.0em 估算（含中文标签余量），随字号线性增长
        MonitorPosition::TopCenter
        | MonitorPosition::BottomCenter
        | MonitorPosition::TopLeft
        | MonitorPosition::TopRight
        | MonitorPosition::BottomLeft
        | MonitorPosition::BottomRight => {
            let width = 28.0 + fs * (7.0 * n - 1.1);
            (width, fs * 2.4 + 14.0)
        }
        // 垂直条（左右中）：
        // 高度按实际 CSS 行高与行间距估算，避免窗口比内容高出一大截。
        MonitorPosition::LeftCenter | MonitorPosition::RightCenter => {
            let width = 28.0 + fs * 7.0;
            let height = 18.0 + n * (fs * 1.2) + (n - 1.0) * (fs * 0.35);
            (width, height)
        }
    }
}

/// 更新悬浮窗口位置的辅助函数
fn update_overlay_position(window: &tauri::WebviewWindow, position: &MonitorPosition) -> Result<(), String> {
    // 读取当前设置的文字大小，窗口尺寸随字号自适应
    let settings = MONITOR_SETTINGS.lock()
        .map_err(|e| format!("Failed to lock settings: {}", e))?
        .clone();
    
    let monitor = window.primary_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("No primary monitor found")?;
    
    let screen_size = monitor.size();
    let scale_factor = monitor.scale_factor();
    
    // 根据位置、显示项与字号调整窗口尺寸
    let (width, height) = overlay_window_size(position, &settings);
    
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
            is_lhm_driver_missing,
            get_monitor_settings,
            update_monitor_settings,
            show_overlay_window,
            hide_overlay_window,
            update_overlay_position_cmd,
        ])
        .setup(|app| {
            // 启动页切换：前端就绪后关闭 splash、显示主窗口（带 8s 超时兜底）
            {
                use tauri::Listener;
                if let (Some(main), Some(splash)) = (
                    app.get_webview_window("main"),
                    app.get_webview_window("splash"),
                ) {
                    let main_clone = main.clone();
                    let splash_clone = splash.clone();
                    app.listen("main-ready", move |_| {
                        let _ = splash_clone.close();
                        let _ = main_clone.show();
                        let _ = main_clone.set_focus();
                    });
                    // 兜底：8 秒后仍未收到就绪事件也切换（防止 splash 卡死）
                    std::thread::spawn(move || {
                        std::thread::sleep(std::time::Duration::from_secs(8));
                        let _ = splash.close();
                        let _ = main.show();
                    });
                }
            }

            // 启动 LHM 温度采集桥接进程（懒加载；驱动可选，未安装时自动回退 WMI）
            hardware::lhm::ensure_bridge(app.handle());
            // 启动 ETW FPS 监听（无注入；需要管理员权限）
            hardware::fps::ensure_fps_monitor();
            
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
            
            // 如果设置中启用了游戏内监控，自动显示悬浮窗口
            let settings = MONITOR_SETTINGS.lock().unwrap().clone();
            if settings.enabled {
                let app_handle = app.handle().clone();
                // 延迟一点启动，确保主窗口已经准备好
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_millis(500));
                    tauri::async_runtime::block_on(async {
                        let _ = show_overlay_window(app_handle).await;
                    });
                });
            }
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
