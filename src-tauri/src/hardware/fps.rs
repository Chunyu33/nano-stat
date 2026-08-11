//! 游戏 FPS 采集模块（ETW 无注入方案）
//! 
//! 通过 Windows 事件跟踪（ETW）监听 D3D9 / DXGI 的 Present 事件，
//! 统计前台游戏进程每秒的 Present 调用次数，得到真实游戏帧率。
//! 
//! 安全性：纯系统级事件监听，不注入游戏进程、不修改游戏内存，
//! 反作弊系统（如 CF 的 TenProtect）检测不到。
//! 
//! 事件结构（来自 PresentMon 的公开定义）：
//! - Microsoft-Windows-D3D9  {783ACA0A-790E-4D7F-8451-AA850511C6B9}
//!     Present_Start = 0x0001, Present_Stop = 0x0002
//! - Microsoft-Windows-DXGI  {CA11C036-0102-4A2D-A6AD-F03CFED5D3C9}
//!     Present_Start = 0x002A, Present_Stop = 0x002B
//!   Channel 0x10 (Analytic), Keyword 0x8000000000000002
//! 
//! 注意：ETW 实时监听需要管理员权限（或 Performance Log Users 组成员）。

use std::ffi::c_void;
use std::collections::VecDeque;
use std::sync::atomic::{AtomicBool, AtomicU32, AtomicU64, Ordering};
use std::sync::Mutex;
use std::time::{Duration, Instant};
use once_cell::sync::Lazy;
use windows::core::{GUID, PCWSTR};
use windows::Win32::Foundation::WIN32_ERROR;
use windows::Win32::System::Diagnostics::Etw::{
    EnableTraceEx2, OpenTraceW, ProcessTrace, StartTraceW, StopTraceW, CONTROLTRACE_HANDLE,
    EVENT_RECORD, EVENT_TRACE_LOGFILEW, EVENT_TRACE_PROPERTIES, TRACE_LEVEL_INFORMATION,
};

/// D3D9 Provider GUID
const PROVIDER_D3D9: GUID = GUID::from_u128(0x783ACA0A_790E_4D7F_8451_AA850511C6B9);
/// DXGI Provider GUID
const PROVIDER_DXGI: GUID = GUID::from_u128(0xCA11C036_0102_4A2D_A6AD_F03CFED5D3C9);

/// D3D9 Present_Start 事件 ID
const D3D9_PRESENT_START: u16 = 0x0001;
/// DXGI Present_Start 事件 ID
const DXGI_PRESENT_START: u16 = 0x002A;

/// 事件匹配 Keyword（Analytic channel）
const PRESENT_KEYWORD: u64 = 0x8000000000000002;

/// ETW 控制码：启用 provider
const EVENT_TRACE_CONTROL_ENABLE: u32 = 1;
/// 实时跟踪模式
const PROCESS_TRACE_MODE_REAL_TIME: u32 = 0x0100;
/// 事件记录模式（EVENT_RECORD 回调）
const PROCESS_TRACE_MODE_EVENT_RECORD: u32 = 0x10000000;

/// 会话名称（实时跟踪；UTF-16 带结尾 NUL，泄漏为静态以保持指针长期有效）
static SESSION_NAME: Lazy<Vec<u16>> = Lazy::new(|| {
    "NanoStat-FPS-Trace".encode_utf16().chain(std::iter::once(0)).collect()
});

/// 共享计数状态（回调线程与结算线程之间通过原子操作通信）
struct FpsShared {
    /// 当前统计窗口内的 Present 计数（回调原子累加）
    present_count: AtomicU64,
    /// 目标进程 PID（0 表示不过滤，统计所有进程）
    target_pid: AtomicU32,
    /// 最近结算的 FPS（由结算线程写入，读取线程消费）
    last_fps: Mutex<Option<f64>>,
    /// 最近结算的 1% Low FPS（帧时间 99 百分位换算）
    last_fps_1pct: Mutex<Option<f64>>,
    /// 最近结算的平均帧时间 (ms)
    last_frame_time: Mutex<Option<f64>>,
}

impl FpsShared {
    fn new() -> Self {
        FpsShared {
            present_count: AtomicU64::new(0),
            target_pid: AtomicU32::new(0),
            last_fps: Mutex::new(None),
            last_fps_1pct: Mutex::new(None),
            last_frame_time: Mutex::new(None),
        }
    }
}

/// 共享状态（Lazy 静态，永不 drop，回调通过 UserContext 访问是安全的）
static SHARED: Lazy<FpsShared> = Lazy::new(FpsShared::new);
/// 是否已启动
static STARTED: AtomicBool = AtomicBool::new(false);
/// 统计窗口开始时间（结算用）
static WINDOW_START: Lazy<Mutex<Instant>> = Lazy::new(|| Mutex::new(Instant::now()));
/// 前台进程连续无帧的结算次数（超过阈值自动回退统计所有进程）
static ZERO_FRAME_COUNT: AtomicU32 = AtomicU32::new(0);

/// 帧时间戳环形缓冲上限（约 34 秒 @60fps，覆盖 1% Low 统计窗口）
const MAX_FRAME_SAMPLES: usize = 2048;
/// 计算 1% Low 所需的最少帧数（帧太少时百分位无统计意义）
const MIN_FRAME_SAMPLES: usize = 20;

/// 目标进程的帧时间戳环形缓冲（Instant，Windows 底层即 QPC，由 ETW 回调写入）
/// 只记录通过 PID 过滤后的帧，保证 1% Low 只反映目标进程（游戏）的帧率波动
static FRAME_TIMESTAMPS: Lazy<Mutex<VecDeque<Instant>>> = Lazy::new(|| Mutex::new(VecDeque::new()));

/// ETW 事件回调（在 ProcessTrace 的线程上执行，要求极快返回）
unsafe extern "system" fn on_event(record: *mut EVENT_RECORD) {
    if record.is_null() {
        return;
    }
    let record = &*record;
    // UserContext 在 OpenTraceW 时设置，指向 SHARED
    let shared = record.UserContext as *const FpsShared;
    if shared.is_null() {
        return;
    }
    let shared = unsafe { &*shared };

    // 只关心 Present_Start 事件（每帧一次）
    let header = &record.EventHeader;
    let is_present_start =
        (header.ProviderId == PROVIDER_D3D9 && header.EventDescriptor.Id == D3D9_PRESENT_START)
            || (header.ProviderId == PROVIDER_DXGI && header.EventDescriptor.Id == DXGI_PRESENT_START);

    if !is_present_start {
        return;
    }

    // 过滤目标进程（0 = 不过滤）
    let pid = shared.target_pid.load(Ordering::Relaxed);
    if pid != 0 && header.ProcessId != pid {
        return;
    }

    shared.present_count.fetch_add(1, Ordering::Relaxed);

    // 记录帧时间戳（Instant 底层是 QPC，开销 ~20ns，每帧一次可忽略）：
    // 回调要求极快返回，这里只做一次环形缓冲追加（满则丢弃最旧一帧）
    if let Ok(mut stamps) = FRAME_TIMESTAMPS.lock() {
        if stamps.len() >= MAX_FRAME_SAMPLES {
            stamps.pop_front();
        }
        stamps.push_back(Instant::now());
    }
}

/// 设置目标进程（前台游戏），None 表示统计所有进程的 Present
/// 目标变化时清零计数并重置统计窗口，避免跨进程的脏数据
pub fn set_target_pid(pid: Option<u32>) {
    let p = pid.unwrap_or(0);
    if SHARED.target_pid.swap(p, Ordering::SeqCst) != p {
        SHARED.present_count.store(0, Ordering::Relaxed);
        *WINDOW_START.lock().unwrap() = Instant::now();
        *SHARED.last_fps.lock().unwrap() = None;
        *SHARED.last_fps_1pct.lock().unwrap() = None;
        *SHARED.last_frame_time.lock().unwrap() = None;
        // 帧时间戳缓冲随目标进程切换清空，防止跨进程帧混入 1% Low 统计
        FRAME_TIMESTAMPS.lock().unwrap().clear();
    }
}

/// 获取最近结算的 FPS
pub fn get_fps() -> Option<f64> {
    *SHARED.last_fps.lock().unwrap()
}

/// 每秒结算 FPS（由 get_realtime_stats 周期性调用）
pub fn settle_fps() {
    let now = Instant::now();
    let elapsed = {
        let mut window_start = WINDOW_START.lock().unwrap();
        let elapsed = now.duration_since(*window_start);
        if elapsed >= Duration::from_secs(1) {
            *window_start = now;
            elapsed
        } else {
            return;
        }
    };

    let count = SHARED.present_count.swap(0, Ordering::Relaxed);
    let fps = count as f64 / elapsed.as_secs_f64();
    *SHARED.last_fps.lock().unwrap() = Some(fps);

    // 智能回退：前台进程连续 3 秒无帧（如浏览器渲染在 GPU 子进程）时，
    // 回退为统计所有进程的 Present，保证桌面场景 FPS 始终有值。
    // 切回前台（目标 PID 变化）时 set_target_pid 会重置，游戏场景依然精确。
    let target = SHARED.target_pid.load(Ordering::Relaxed);
    if target != 0 && count == 0 {
        let zeroes = ZERO_FRAME_COUNT.fetch_add(1, Ordering::Relaxed) + 1;
        if zeroes >= 3 {
            ZERO_FRAME_COUNT.store(0, Ordering::Relaxed);
            set_target_pid(None);
        }
    } else {
        ZERO_FRAME_COUNT.store(0, Ordering::Relaxed);
    }

    // 帧时间统计：仅目标进程明确（游戏前台，未回退）时计算 1% Low / 平均帧时间。
    // 回退为统计所有进程时缓冲混入桌面帧，1% Low 无意义，置 None。
    if target != 0 {
        let (fps_1pct, frame_time) = compute_frame_stats();
        *SHARED.last_fps_1pct.lock().unwrap() = fps_1pct;
        *SHARED.last_frame_time.lock().unwrap() = frame_time;
    } else {
        *SHARED.last_fps_1pct.lock().unwrap() = None;
        *SHARED.last_frame_time.lock().unwrap() = None;
    }
}

/// 从帧时间戳缓冲计算 1% Low FPS 与平均帧时间 (ms)
///
/// 1% Low 定义（PresentMon 惯例）：帧时间升序排序后取 99 百分位
/// （即最慢的 1% 帧的帧时间），再换算为 FPS = 1000 / 帧时间。
/// 帧数不足或帧时间异常（≤0.5ms 或 ≥1000ms）时返回 None。
fn compute_frame_stats() -> (Option<f64>, Option<f64>) {
    let stamps = FRAME_TIMESTAMPS.lock().unwrap();
    if stamps.len() < MIN_FRAME_SAMPLES {
        return (None, None);
    }

    // 相邻帧间隔 → 毫秒（Instant 差值）
    let mut diffs: Vec<f64> = stamps
        .iter()
        .zip(stamps.iter().skip(1))
        .map(|(&a, &b)| b.duration_since(a).as_secs_f64() * 1000.0)
        .collect();

    if diffs.len() < MIN_FRAME_SAMPLES {
        return (None, None);
    }

    // 平均帧时间：窗口总时长 / 帧间隔数（与 FPS 互为倒数，口径一致）
    let avg_ms = diffs.iter().sum::<f64>() / diffs.len() as f64;

    // 99 百分位帧时间：升序排序后取 99% 分位索引（最慢的 1% 帧）
    diffs.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    let idx = ((diffs.len() as f64) * 0.99).ceil() as usize - 1;
    let p99_ms = diffs[idx.min(diffs.len() - 1)];

    let fps_1pct = if p99_ms > 0.5 && p99_ms < 1000.0 {
        Some(1000.0 / p99_ms)
    } else {
        None
    };
    let frame_time = if avg_ms > 0.0 && avg_ms < 1000.0 {
        Some(avg_ms)
    } else {
        None
    };

    (fps_1pct, frame_time)
}

/// 获取最近结算的 1% Low FPS
pub fn get_fps_1pct() -> Option<f64> {
    *SHARED.last_fps_1pct.lock().unwrap()
}

/// 获取最近结算的平均帧时间 (ms)
pub fn get_frame_time() -> Option<f64> {
    *SHARED.last_frame_time.lock().unwrap()
}

/// 启动 ETW FPS 监听（幂等）
pub fn ensure_fps_monitor() {
    if STARTED.swap(true, Ordering::SeqCst) {
        return;
    }

    unsafe {
        // 1. 创建实时跟踪会话
        // BufferSize 必须包含会话名空间（Windows 会把名字复制进缓冲尾部）
        let name_bytes = SESSION_NAME.len() * 2;
        let total = std::mem::size_of::<EVENT_TRACE_PROPERTIES>() + name_bytes;
        let mut buffer = vec![0u8; total];
        let props = buffer.as_mut_ptr() as *mut EVENT_TRACE_PROPERTIES;

        (*props).Wnode.BufferSize = total as u32;
        (*props).Wnode.ClientContext = 1; // QPC 时间戳
        (*props).BufferSize = 64;
        (*props).MinimumBuffers = 2;
        (*props).MaximumBuffers = 16;
        (*props).LogFileMode = PROCESS_TRACE_MODE_REAL_TIME as u32;
        (*props).FlushTimer = 1;
        (*props).LoggerNameOffset = 0;

        let session_name = PCWSTR(SESSION_NAME.as_ptr());

        let mut trace_handle = CONTROLTRACE_HANDLE::default();
        let status = StartTraceW(&mut trace_handle, session_name, props);
        if status != WIN32_ERROR(0) {
            // 会话可能已存在（上次异常退出残留），停止同名会话后重试一次
            let mut stop_props: EVENT_TRACE_PROPERTIES = std::mem::zeroed();
            stop_props.Wnode.BufferSize = std::mem::size_of::<EVENT_TRACE_PROPERTIES>() as u32;
            let stop_handle = CONTROLTRACE_HANDLE::default();
            let _ = StopTraceW(stop_handle, session_name, &mut stop_props);
            let mut trace_handle2 = CONTROLTRACE_HANDLE::default();
            let status2 = StartTraceW(&mut trace_handle2, session_name, props);
            if status2 != WIN32_ERROR(0) {
                // FPS 不可用（无权限等）
                return;
            }
            trace_handle = trace_handle2;
        }

        // 2. 启用两个 provider（Analytic channel, Keyword 匹配 Present 事件）
        let level = TRACE_LEVEL_INFORMATION as u8;
        let d3d9_guid = PROVIDER_D3D9;
        let dxgi_guid = PROVIDER_DXGI;
        let _ = EnableTraceEx2(
            trace_handle,
            &d3d9_guid,
            EVENT_TRACE_CONTROL_ENABLE,
            level,
            PRESENT_KEYWORD,
            0,
            0,
            None,
        );
        let _ = EnableTraceEx2(
            trace_handle,
            &dxgi_guid,
            EVENT_TRACE_CONTROL_ENABLE,
            level,
            PRESENT_KEYWORD,
            0,
            0,
            None,
        );
        let _ = d3d9_guid;
        let _ = dxgi_guid;

        // 3. 打开实时跟踪流（回调的 UserContext 指向共享状态）
        let mut logfile: EVENT_TRACE_LOGFILEW = std::mem::zeroed();
        logfile.LoggerName = windows::core::PWSTR(SESSION_NAME.as_ptr() as *mut u16);
        logfile.Anonymous1.ProcessTraceMode =
            PROCESS_TRACE_MODE_REAL_TIME | PROCESS_TRACE_MODE_EVENT_RECORD;
        logfile.Anonymous2.EventRecordCallback = Some(on_event);
        logfile.Context = &*SHARED as *const FpsShared as *mut c_void;

        let process_handle = OpenTraceW(&mut logfile);
        if process_handle.Value == u64::MAX {
            return;
        }

        // 4. ProcessTrace 阻塞，放后台线程运行
        std::thread::spawn(move || {
            let handles = [process_handle];
            let _ = ProcessTrace(&handles, None, None);
            // 会话结束（应用退出/被停止）
        });
    }
}
