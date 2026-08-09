# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-08-08

### Added

- **CPU temperature** via WMI (`MSAcpi_ThermalZoneTemperature`, backed by sysinfo components).
  Availability depends on motherboard/BIOS support — laptops and some boards expose a thermal zone,
  while many desktops (e.g. CPUs without iGPU) report nothing and fall back to `N/A`.
  Results are cached (5s on success, 60s on failure) to avoid repeated slow WMI queries.
- **LibreHardwareMonitor (LHM) bridge** — a native (NativeAOT, no .NET runtime needed) sidecar
  process reads CPU/GPU/motherboard temperatures via the PawnIO kernel driver (MSR access).
  Driver-optional design: if PawnIO is installed (run as admin) full CPU/motherboard temps are
  reported; otherwise it gracefully falls back to WMI → `N/A`, and the CPU card shows an
  install-guide hint. The bridge exits automatically when the parent process closes (stdin EOF).
- **Foreground game detection** (`is_game_active` in realtime stats): the overlay now checks whether a
  fullscreen window is in the foreground (kept for future real FPS capture; FPS row stays visible).
- **Real game FPS via ETW** (no injection): a Windows Event Tracing session listens for
  D3D9/DXGI `Present_Start` events and counts frames per second for the **foreground window process**
  (per-game when a fullscreen game is active). If the foreground process emits no frames for 3 s
  (e.g. a browser rendering in GPU child processes), it falls back to the overall desktop frame rate,
  so FPS is always shown — accurate in-game, never inflated by DWM/background processes.
  Safe against anti-cheat systems (no process injection, no memory modification) — same technique
  as NVIDIA FrameView / PresentMon. Requires administrator (or Performance Log Users) privileges.
- **Settings change events**: the Rust backend now emits a `settings-changed` event when settings are
  saved, so the overlay updates instantly instead of polling every second.

### UI / UX

- **Reusable themed checkbox** — new `Checkbox` component (`src/components/ui/Checkbox.tsx`) following
  the app's emerald theme variables, used by the settings dialog.
- **Modal transitions** — `framer-motion` added; settings and update dialogs now animate
  (fade + scale) on open/close.
- **Background-only opacity** — the overlay's transparency setting now affects only the panel
  background (via `--panel-bg-alpha`), while text/values stay fully opaque.
- **Live preview** — settings changes (opacity, display items, refresh interval) sync to the backend
  debounced (150 ms) and apply to the overlay immediately without pressing Save.
- **Four corner positions** — overlay can now be placed at top-left / top-right / bottom-left /
  bottom-right (compact horizontal bar), in addition to the four edge-center positions.
- **Font size setting** — new "文字大小" slider (10–20 px) in the settings dialog; the overlay's
  window size scales automatically with the chosen font size **and the number of enabled display
  items** (width ≈ 28px + 7.0em/item, so content is never clipped).
- Overlay is now positioned closer to the screen edges (margin 20 → 6 px).
- **Network rate auto-scaling** — download speed now formats as KB/s → MB/s → GB/s
  (`src/utils/format.ts`, shared by overlay and monitor page) instead of raw KB numbers.
- **Monitor page layout** — preview and current-config panels merged into a single container that
  fills the full width; the preview keeps a fixed font size (only position / display items / opacity
  are synced), so it never overflows and stays tidy.
- Update dialog now follows the app theme (was hardcoded dark).

### Fixed

- **Monitor info was hardcoded** — the hardware overview page showed a hardcoded `1920×1080 / 165Hz`
  regardless of the actual monitor. Display info is now queried live via Win32
  `EnumDisplaySettingsW(ENUM_CURRENT_SETTINGS)` (new `display.rs`), so resolution and refresh rate
  always reflect the current monitor (verified: 2560×1440 @ 144Hz).

### Changed

- `get_realtime_stats` now refreshes only CPU usage and memory (via `refresh_cpu_usage()` /
  `refresh_memory()`) instead of a full `refresh_all()`, reducing per-tick overhead.
- Hardware overview is now fetched at low frequency (initial load + manual refresh only); live usage
  values on the home page come from the realtime stats stream.
- GPU empty-state copy updated: AMD/Intel (WMI) basic info is supported, the placeholder no longer
  claims "NVIDIA only".
- Version number is now read dynamically from the app (no more hardcoded `v1.0.0` in the update dialog).

### Fixed

- Settings dialog stale-closure bug: rapid consecutive edits could overwrite earlier unsaved changes
  because handlers captured outdated `localSettings`. A ref now keeps the latest values in sync.
- GPU card empty-state text was misleading ("暂不支持非 NVIDIA 显卡" although AMD/Intel basics work).
- `Cargo.toml` version was out of sync with `tauri.conf.json` / `package.json` (0.1.0 vs 1.0.0);
  all three are now aligned.

### Docs

- Rewrote `README.md` (English, concise) and `README-zh.md` (Chinese), cross-linking both.
- Added `CHANGELOG-zh.md` (Chinese changelog) mirroring this file.
- Added `LICENSE` (MIT).

## [1.0.0] - 2026-01-27

### Added

- Initial release: hardware overview (CPU/GPU/memory/disk/network), in-game overlay monitor,
  system tray, theme switching, update checker.
