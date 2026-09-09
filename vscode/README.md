# HBuilderX Soft Green for VS Code

A soft green light and dark theme family for VS Code.

## Features

- Light and dark variants
- Manual mode by default, with optional scheduled and seasonal switching
- System switching through your own native editor preferences
- Quick theme toggle from the status bar

## Respecting your preferences

Installing or starting the extension does not change your theme preferences by default.
Manual and system modes do not write any editor settings on startup or configuration changes.
The extension never changes `window.autoDetectColorScheme`,
`workbench.preferredLightColorTheme`, or `workbench.preferredDarkColorTheme`.

- **Manual (default):** Select a theme using the editor's color theme picker, or use
  the status-bar toggle. The toggle enters manual mode and changes only the current theme.
- **System:** Leaves switching entirely to the editor. This mode does not enable
  native auto-detection or select preferred themes for you. To follow your system
  with this theme family, configure these settings yourself:

  ```json
  {
    "window.autoDetectColorScheme": true,
    "workbench.preferredLightColorTheme": "HBuilderX Soft Green Light",
    "workbench.preferredDarkColorTheme": "HBuilderX Soft Green Dark"
  }
  ```

- **Scheduled / Seasonal:** Explicitly opt in to changing the current theme at
  configured times or approximate seasonal sunrise/sunset times. These modes still
  apply on startup when previously selected. They pause, with a warning, while
  native auto-detection is enabled and resume when you disable it yourself.

The status-bar toggle also skips switching and shows a warning when native
auto-detection is enabled, rather than disabling it or overriding your preferred themes.

### Upgrading from earlier versions

Earlier versions may have overwritten the three native settings listed above.
Your previous values were not backed up, so the extension cannot safely restore
them. Review them in Settings and choose your desired values. This update neither
resets nor overwrites them. Previously selected scheduled/seasonal modes remain
enabled; choose manual mode if you no longer want automatic switching.

## Development

```bash
npm install
npm run compile
npm run package
```

## License

MIT
