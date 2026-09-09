// src/configManager.ts

import * as vscode from 'vscode';
import { validateTimeFormat } from './seasonalTimes';

export type SwitchMode = 'system' | 'scheduled' | 'seasonal' | 'manual';

export interface ThemeConfig {
  autoSwitchMode: SwitchMode;
  lightTime: string;
  darkTime: string;
}

const CONFIG_SECTION = 'hbuilderxSoftGreen';

/**
 * Get current configuration
 */
export function getConfig(): ThemeConfig {
  const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
  return {
    autoSwitchMode: config.get<SwitchMode>('autoSwitchMode') || 'manual',
    lightTime: config.get<string>('lightTime') || '07:00',
    darkTime: config.get<string>('darkTime') || '19:00'
  };
}

/**
 * Update configuration value
 */
export async function updateConfig(key: string, value: unknown): Promise<void> {
  const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
  await config.update(key, value, vscode.ConfigurationTarget.Global);
}

/**
 * Set auto-switch mode
 */
export async function setMode(mode: SwitchMode): Promise<void> {
  await updateConfig('autoSwitchMode', mode);
  if (mode === 'system') {
    vscode.window.showInformationMessage(
      'HBuilderX Soft Green: System mode uses your existing editor preferences. ' +
      'Configure window.autoDetectColorScheme and workbench.preferredLightColorTheme / ' +
      'workbench.preferredDarkColorTheme in Settings if desired; this extension does not change them.'
    );
    return;
  }
  vscode.window.showInformationMessage(`HBuilderX Soft Green: Mode set to ${mode}`);
}

/**
 * Set light theme time (for scheduled mode)
 */
export async function setLightTime(): Promise<void> {
  const input = await vscode.window.showInputBox({
    prompt: 'Enter light theme time (HH:MM format)',
    placeHolder: '07:00',
    value: getConfig().lightTime,
    validateInput: (value) => {
      if (!validateTimeFormat(value)) {
        return 'Invalid format. Use HH:MM (e.g., 07:00)';
      }
      return null;
    }
  });

  if (input) {
    await updateConfig('lightTime', input);
    vscode.window.showInformationMessage(`HBuilderX Soft Green: Light time set to ${input}`);
  }
}

/**
 * Set dark theme time (for scheduled mode)
 */
export async function setDarkTime(): Promise<void> {
  const input = await vscode.window.showInputBox({
    prompt: 'Enter dark theme time (HH:MM format)',
    placeHolder: '19:00',
    value: getConfig().darkTime,
    validateInput: (value) => {
      if (!validateTimeFormat(value)) {
        return 'Invalid format. Use HH:MM (e.g., 19:00)';
      }
      return null;
    }
  });

  if (input) {
    await updateConfig('darkTime', input);
    vscode.window.showInformationMessage(`HBuilderX Soft Green: Dark time set to ${input}`);
  }
}
