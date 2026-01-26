//! 网络信息采集模块
//! 
//! 负责采集网络接口信息和流量统计

use sysinfo::{System, Networks};
use super::types::{NetworkInfo, NetworkInterface, NetworkStats};
use std::sync::Mutex;
use std::collections::HashMap;
use once_cell::sync::Lazy;

/// 上次采集的网络数据，用于计算速率
struct LastNetworkData {
    /// 上次采集时间
    timestamp: std::time::Instant,
    /// 各接口的接收字节数
    rx_bytes: HashMap<String, u64>,
    /// 各接口的发送字节数
    tx_bytes: HashMap<String, u64>,
}

static LAST_NETWORK_DATA: Lazy<Mutex<LastNetworkData>> = Lazy::new(|| {
    Mutex::new(LastNetworkData {
        timestamp: std::time::Instant::now(),
        rx_bytes: HashMap::new(),
        tx_bytes: HashMap::new(),
    })
});

/// 获取网络信息
pub fn get_network_info(_sys: &System) -> NetworkInfo {
    let networks = Networks::new_with_refreshed_list();
    let mut last_data = LAST_NETWORK_DATA.lock().unwrap();
    let now = std::time::Instant::now();
    let elapsed = now.duration_since(last_data.timestamp).as_secs_f64();
    
    let interfaces: Vec<NetworkInterface> = networks.iter().map(|(name, data)| {
        let rx_bytes = data.total_received();
        let tx_bytes = data.total_transmitted();
        
        // 计算速率
        let (rx_rate, tx_rate) = if elapsed > 0.0 {
            let last_rx = last_data.rx_bytes.get(name).copied().unwrap_or(rx_bytes);
            let last_tx = last_data.tx_bytes.get(name).copied().unwrap_or(tx_bytes);
            
            let rx_diff = rx_bytes.saturating_sub(last_rx) as f64;
            let tx_diff = tx_bytes.saturating_sub(last_tx) as f64;
            
            (rx_diff / elapsed, tx_diff / elapsed)
        } else {
            (0.0, 0.0)
        };
        
        // 更新上次数据
        last_data.rx_bytes.insert(name.clone(), rx_bytes);
        last_data.tx_bytes.insert(name.clone(), tx_bytes);
        
        NetworkInterface {
            name: name.clone(),
            rx_bytes,
            tx_bytes,
            rx_rate,
            tx_rate,
        }
    }).collect();
    
    last_data.timestamp = now;
    
    NetworkInfo { interfaces }
}

/// 获取网络统计数据（用于实时监控）
pub fn get_network_stats(_sys: &System) -> NetworkStats {
    let networks = Networks::new_with_refreshed_list();
    let mut last_data = LAST_NETWORK_DATA.lock().unwrap();
    let now = std::time::Instant::now();
    let elapsed = now.duration_since(last_data.timestamp).as_secs_f64();
    
    let mut total_rx_rate = 0.0;
    let mut total_tx_rate = 0.0;
    
    for (name, data) in networks.iter() {
        let rx_bytes = data.total_received();
        let tx_bytes = data.total_transmitted();
        
        if elapsed > 0.0 {
            let last_rx = last_data.rx_bytes.get(name).copied().unwrap_or(rx_bytes);
            let last_tx = last_data.tx_bytes.get(name).copied().unwrap_or(tx_bytes);
            
            total_rx_rate += rx_bytes.saturating_sub(last_rx) as f64 / elapsed;
            total_tx_rate += tx_bytes.saturating_sub(last_tx) as f64 / elapsed;
        }
        
        last_data.rx_bytes.insert(name.clone(), rx_bytes);
        last_data.tx_bytes.insert(name.clone(), tx_bytes);
    }
    
    last_data.timestamp = now;
    
    // 转换为 KB/s
    NetworkStats {
        download_rate: total_rx_rate / 1024.0,
        upload_rate: total_tx_rate / 1024.0,
        latency: None, // 延迟需要额外的网络测试
    }
}
