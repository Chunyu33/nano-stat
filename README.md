# NanoStat - 硬件监控应用

类似游戏++的硬件监控工具，基于 Tauri + React + TypeScript 构建。

## 功能特性

- **硬件概览**：实时展示 CPU、GPU、内存、磁盘、网络等硬件信息
- **游戏内监控**：可配置的悬浮监控面板，支持四个位置（上/下/左/右中间）
- **自定义设置**：可调整显示项目、刷新间隔、透明度等

## 技术栈

- **前端**：React 19 + TypeScript + TailwindCSS + Recharts
- **后端**：Rust + Tauri 2
- **系统信息**：sysinfo + nvml-wrapper (NVIDIA GPU)

## 开发环境

### 前置要求

- Node.js 18+
- Rust 1.70+
- NVIDIA 显卡驱动（用于 GPU 信息采集）

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run tauri dev
```

### 构建发布版本

```bash
npm run tauri build
```

## 项目结构

```
nano-stat/
├── src/                    # 前端源码
│   ├── api/               # API 调用模块
│   ├── components/        # React 组件
│   │   └── hardware/      # 硬件信息卡片组件
│   ├── hooks/             # 自定义 Hooks
│   ├── pages/             # 页面组件
│   ├── styles/            # 样式文件
│   └── types/             # TypeScript 类型定义
├── src-tauri/             # Rust 后端源码
│   └── src/
│       ├── hardware/      # 硬件信息采集模块
│       │   ├── cpu.rs     # CPU 信息
│       │   ├── gpu.rs     # GPU 信息 (NVIDIA)
│       │   ├── memory.rs  # 内存信息
│       │   ├── disk.rs    # 磁盘信息
│       │   ├── network.rs # 网络信息
│       │   └── types.rs   # 数据类型定义
│       └── lib.rs         # 主入口和 Tauri 命令
└── overlay.html           # 悬浮窗口入口页面
```

## 推荐 IDE 配置

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 许可证

MIT
