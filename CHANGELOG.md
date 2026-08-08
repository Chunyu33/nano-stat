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
- **Foreground game detection** (`is_game_active` in realtime stats): the overlay now checks whether a
  fullscreen window is in the foreground and only renders the FPS item while a game is active,
  instead of showing a placeholder `--` at all times.
- **Settings change events**: the Rust backend now emits a `settings-changed` event when settings are
  saved, so the overlay updates instantly instead of polling every second.

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
