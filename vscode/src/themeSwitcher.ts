import * as vscode from 'vscode';
import { getConfig, updateConfig } from './configManager';
import { getCurrentSeasonalTimes, parseTime } from './seasonalTimes';
import {
  ThemeKind,
  needsThemeSwitch,
  shouldBeLightAtTime,
  themeNameFor,
  toggleTarget
} from './themePolicy';

let nextSwitchTimeout: ReturnType<typeof setTimeout> | null = null;
let switchGeneration = 0;

function getConfiguredThemeName(): string {
  return vscode.workspace.getConfiguration('workbench').get<string>('colorTheme') || '';
}

function getActiveThemeKind(): ThemeKind {
  const kind = vscode.window.activeColorTheme.kind;
  return kind === vscode.ColorThemeKind.Dark || kind === vscode.ColorThemeKind.HighContrast
    ? 'dark'
    : 'light';
}

function hasNativeAutoDetectConflict(): boolean {
  if (vscode.workspace.getConfiguration('window').get<boolean>('autoDetectColorScheme') !== true) {
    return false;
  }
  vscode.window.showWarningMessage(
    'HBuilderX Soft Green: Theme switching is paused because window.autoDetectColorScheme is enabled. ' +
    'Use the editor\'s preferred light/dark themes, or disable this setting yourself to use extension switching. ' +
    'Your preferences have not been changed.'
  );
  return true;
}

export async function switchTheme(kind: ThemeKind): Promise<boolean> {
  if (hasNativeAutoDetectConflict()) {
    return false;
  }
  if (!needsThemeSwitch(getConfiguredThemeName(), kind)) {
    return true;
  }
  await vscode.workspace.getConfiguration('workbench').update(
    'colorTheme',
    themeNameFor(kind),
    vscode.ConfigurationTarget.Global
  );
  return true;
}

export async function toggleTheme(): Promise<void> {
  if (hasNativeAutoDetectConflict()) {
    return;
  }
  const currentThemeName = getConfiguredThemeName();
  const activeKind = getActiveThemeKind();
  await updateConfig('autoSwitchMode', 'manual');
  stopAutoSwitch();
  const nextTheme = toggleTarget(currentThemeName, activeKind);
  if (await switchTheme(nextTheme)) {
    vscode.window.showInformationMessage(`HBuilderX Soft Green: Switched to ${nextTheme} theme (manual mode)`);
  }
}

export function shouldUseLightThemeNow(now = new Date()): boolean {
  const config = getConfig();

  if (config.autoSwitchMode === 'scheduled') {
    return shouldBeLightAtTime(now, config.lightTime, config.darkTime);
  }
  if (config.autoSwitchMode === 'seasonal') {
    const times = getCurrentSeasonalTimes();
    return shouldBeLightAtTime(now, times.sunrise, times.sunset);
  }
  return getActiveThemeKind() === 'light';
}

export function getNextSwitchTime(now = new Date()): Date {
  const config = getConfig();
  const times = config.autoSwitchMode === 'scheduled'
    ? { sunrise: config.lightTime, sunset: config.darkTime }
    : getCurrentSeasonalTimes();
  const targetTime = shouldUseLightThemeNow(now) ? times.sunset : times.sunrise;
  const parsed = parseTime(targetTime);
  const nextSwitch = new Date(now);
  nextSwitch.setHours(parsed.hours, parsed.minutes, 0, 0);

  if (nextSwitch <= now) {
    nextSwitch.setDate(nextSwitch.getDate() + 1);
  }
  return nextSwitch;
}

export async function startAutoSwitch(): Promise<void> {
  const config = getConfig();
  stopAutoSwitch();
  const generation = switchGeneration;
  if (config.autoSwitchMode === 'scheduled' || config.autoSwitchMode === 'seasonal') {
    if (await applyScheduledTheme() && generation === switchGeneration) {
      scheduleNextSwitch(generation);
    }
  }
}

export function stopAutoSwitch(): void {
  // Invalidate pending async updates as well as the currently registered timer.
  switchGeneration++;
  if (nextSwitchTimeout) {
    clearTimeout(nextSwitchTimeout);
    nextSwitchTimeout = null;
  }
}

async function applyScheduledTheme(): Promise<boolean> {
  const desired: ThemeKind = shouldUseLightThemeNow() ? 'light' : 'dark';
  return switchTheme(desired);
}

function scheduleNextSwitch(generation: number): void {
  const delay = Math.max(0, getNextSwitchTime().getTime() - Date.now());
  nextSwitchTimeout = setTimeout(() => {
    if (generation !== switchGeneration) {
      return;
    }
    nextSwitchTimeout = null;
    void applyScheduledTheme()
      .then(applied => {
        const mode = getConfig().autoSwitchMode;
        if (applied && generation === switchGeneration &&
            (mode === 'scheduled' || mode === 'seasonal')) {
          scheduleNextSwitch(generation);
        }
      })
      .catch(reportError);
  }, delay);
}

function reportError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error('HBuilderX Soft Green theme switching failed:', error);
  vscode.window.showErrorMessage(`HBuilderX Soft Green: Theme switching failed: ${message}`);
}

export async function handleConfigChange(): Promise<void> {
  await startAutoSwitch();
}
