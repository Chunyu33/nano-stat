# NanoStat

<p align="center">
  <img src="./public/assets/show.png" alt="NanoStat Screenshot" width="720">
</p>

<p align="center">
  <a href="https://github.com/Chunyu33/nano-stat/releases"><img src="https://img.shields.io/badge/version-1.1.0-blue.svg" alt="Version"></a>
  <img src="https://img.shields.io/badge/Tauri-2.x-24C8DB?logo=tauri&logoColor=white" alt="Tauri">
  <img src="https://img.shields.io/badge/Rust-2021-000000?logo=rust&logoColor=white" alt="Rust">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=0B1B2B" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-4-38BDF8?logo=tailwindcss&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
</p>

<p align="center">
  <b>English</b> | <a href="README-zh.md">简体中文</a>
</p>

A lightweight, modern desktop hardware monitoring tool for Windows — real-time hardware stats and an in-game overlay, inspired by GamePP-style monitoring.

## Features

- **Hardware overview** — CPU / GPU / memory / disk / network cards with live charts
- **In-game overlay** — transparent, always-on-top monitor; configurable position, display items, refresh interval, and opacity
- **Smart FPS item** — the FPS row stays visible; foreground fullscreen-game detection is wired for future real FPS capture
- **Wide GPU support** — NVIDIA via NVML (full telemetry); AMD / Intel via WMI (basic info)
- **CPU temperature** — WMI thermal zone out of the box; with the optional PawnIO kernel driver
  (run as admin) full MSR-based CPU/motherboard temps via the LibreHardwareMonitor bridge
- **Polish** — custom title bar, collapsible sidebar, dark/light themes, system tray

## Getting Started

Prerequisites: Windows 10/11, Node.js 18+, Rust 1.70+.

```bash
# Install dependencies
npm install

# Development (Tauri)
npm run tauri dev

# Production build
npm run tauri build
```

> For full NVIDIA telemetry, install the official GPU driver (NVML enabled).

## Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS, Radix UI, Recharts
- **Desktop**: Tauri 2
- **Backend**: Rust — sysinfo, systemstat, nvml-wrapper, wmi

## Documentation

- [简体中文文档](./README-zh.md)
- [Changelog](./CHANGELOG.md) · [更新日志](./CHANGELOG-zh.md)

## Contributing

Bug reports, feature suggestions, and PRs are welcome. Open an issue first to discuss direction, then submit a PR.

## License

[MIT](./LICENSE)
