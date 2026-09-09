# Change Log

All notable changes to the "HBuilderX Soft Green Theme" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.1.3] - 2026-09-09

### Changed

- Rename the extension display name to "HBuilderX Soft Green Theme" and describe both light and dark variants
- Preserve the extension ID and existing light/dark theme names for compatibility

## [1.1.2] - 2026-09-09

### Fixed

- Default to manual mode and stop modifying native system detection or preferred light/dark themes in all modes
- Leave system-mode configuration to the user; manual and system activation no longer write editor preferences
- Pause scheduled/seasonal switching and skip manual toggles with a warning when native auto-detection is enabled
- Prevent pending automatic updates from restarting timers after switching to manual mode or deactivating
- Document how to review preferences overwritten by older versions without guessing or resetting user choices

## [1.1.1] - 2026-08-31

### Fixed

- Use the editor's native color-scheme detection instead of polling the operating system every five minutes
- Enforce the exact HBuilderX light/dark theme instead of treating any theme with the same brightness as equivalent
- Make the status-bar toggle enter manual mode before switching
- Improve light and dark UI text contrast in tabs, breadcrumbs, notifications, buttons, and extension views

## [1.1.0] - 2026-05-26

### Added

- Dark theme variant (`HBuilderX Soft Green Dark`)
- Auto-switch extension with four modes:
  - **System**: Follow OS theme (macOS, Linux, Windows)
  - **Scheduled**: Switch at user-defined times
  - **Seasonal**: Auto-adjust by month (approx sunrise/sunset)
  - **Manual**: Toggle via status bar button
- Configuration settings in VSCode preferences
- Commands for mode selection and time setting
- Status bar button (`$(color-mode)` icon) for quick toggle
- Default mode set to `system` (follows OS theme automatically)

### Changed

- TypeScript build system with webpack bundling
- Extension activates on startup (`onStartupFinished`)
- Warm dark background (#1e2419, not pure black)
- Consistent green accent across both themes

## [1.0.9] - 2026-01-07

### Changed

- Trae bug fix

## [1.0.8] - 2025-06-20

### Changed

- Enhanced log level colors with better visibility and standard conventions
- Improved editor highlighting for better text distinction
- Added comprehensive support for various log file formats and scopes
- Enabled debug console color settings for consistent log display
- Fixed log DEBUG level visibility issue ([#15](https://github.com/qinains/hbuilderx-soft-green/issues/15))

## [1.0.7] - 2025-01-11

### Changed

- Simplify code

## [1.0.6] - 2025-01-10

### Changed

- Change More Soft Green

## [1.0.5] - 2023-05-15

### Changed

- Change tabsBorder color

## [1.0.4] - 2023-03-12

### Changed

- Change button、checkbox、dropdownBackground color

## [1.0.3] - 2023-03-11

### Changed

- Change editor.selectionBackground

## [1.0.2] - 2020-08-20

### Changed

- Change terminal.ansiBrightYellow

## [1.0.1] - 2019-01-16

### Changed

- Change statusBar.debuggingBackground to green

## [1.0.0] - 2019-01-02

### Added

- release 1.0.0

## [0.0.6] - 2019-01-02

### Added

- Add install & develop document

## [0.0.5] - 2019-12-31

### Changed

- Change icon

## [0.0.4] - 2019-12-31

### Added

- Add search preview image

### Changed

- Change tab.border

## [0.0.3] - 2019-12-31

### Changed

- Change icon

## [0.0.2] - 2019-12-31

### Added

- Add preview image

## [0.0.1] - 2019-12-31

### Added

- Add icon
