//! 显示器信息采集模块
//! 
//! 通过 Win32 EnumDisplaySettingsW 获取主显示器**当前**模式
//! （分辨率、刷新率），反映用户当前实际使用的显示器参数。

use windows_sys::Win32::Graphics::Gdi::{EnumDisplaySettingsW, DEVMODEW, ENUM_CURRENT_SETTINGS};
use super::types::DisplayInfo;

/// 获取主显示器当前模式信息
/// 
/// 使用 ENUM_CURRENT_SETTINGS 读取当前生效的显示模式，
/// 而不是保存的/默认的旧模式，确保换显示器后数值即时正确。
pub fn get_display_info() -> DisplayInfo {
    unsafe {
        // DEVMODEW 需先初始化 dmSize，再交给 API 填充
        let mut mode: DEVMODEW = std::mem::zeroed();
        mode.dmSize = std::mem::size_of::<DEVMODEW>() as u16;

        // lpszDeviceName 传 null 表示主显示器（primary display）
        let ok = EnumDisplaySettingsW(
            std::ptr::null(),
            ENUM_CURRENT_SETTINGS,
            &mut mode,
        );

        if ok != 0 {
            DisplayInfo {
                width: mode.dmPelsWidth,
                height: mode.dmPelsHeight,
                refresh_rate: mode.dmDisplayFrequency,
            }
        } else {
            // 查询失败时返回零值，前端显示 "--"
            DisplayInfo {
                width: 0,
                height: 0,
                refresh_rate: 0,
            }
        }
    }
}
