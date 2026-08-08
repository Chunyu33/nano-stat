# 更新日志

本项目所有重要变更都会记录在本文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]（未发布）

## [1.1.0] - 2026-08-08

### 新增

- **CPU 温度采集**：通过 WMI（`MSAcpi_ThermalZoneTemperature`，由 sysinfo components 实现）。
  是否可用取决于主板/BIOS 支持 —— 部分笔记本和主板能读到热区温度，
  而许多台式机（如无核显的 CPU）读不到，此时显示 N/A。
  温度结果带缓存（成功 5 秒、失败 60 秒），避免频繁触发慢速 WMI 查询。
- **前台游戏检测**（实时数据中的 `is_game_active`）：悬浮面板现在会检测前台是否为全屏窗口，
  仅在检测到游戏时显示 FPS 栏，不再在非游戏状态下一直显示占位的 `--`。
- **设置变更事件**：Rust 后端在保存设置时会发出 `settings-changed` 事件，
  悬浮窗口即时响应，取代原来每秒轮询设置的方式。

### 变更

- `get_realtime_stats` 改为只刷新 CPU 使用率和内存（`refresh_cpu_usage()` / `refresh_memory()`），
  不再全量 `refresh_all()`，降低每次刷新的开销。
- 硬件概览改为低频获取（仅首次加载和手动刷新）；首页卡片上的实时使用率改为来自实时数据流。
- 更新了 GPU 空状态文案：AMD/Intel（WMI）基础信息已支持，占位文案不再声称"仅支持 NVIDIA"。
- 版本号改为从应用动态读取（更新弹窗中不再硬编码 `v1.0.0`）。

### 修复

- 设置弹窗的闭包过期 bug：快速连续编辑时，旧的回调可能覆盖之前未保存的修改。
  现在通过 ref 保持最新值同步。
- GPU 卡片的空状态文案误导（"暂不支持非 NVIDIA 显卡"，但 AMD/Intel 基础信息实际已支持）。
- `Cargo.toml` 版本号与 `tauri.conf.json` / `package.json` 不一致（0.1.0 vs 1.0.0），
  现已全部对齐为 1.1.0。

### 文档

- 重写 `README.md`（英文精简版）和 `README-zh.md`（中文版），两份文档互相引用。
- 新增 `CHANGELOG-zh.md`（中文更新日志），与本文档同步。
- 新增 `LICENSE`（MIT）。

## [1.0.0] - 2026-01-27

### 新增

- 首个正式版本：硬件概览（CPU/GPU/内存/磁盘/网络）、游戏内悬浮监控、
  系统托盘、主题切换、更新检查。
