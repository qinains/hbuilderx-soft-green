import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

export function createExtensionHost(overrides: Record<string, unknown> = {}, useDefaults = true) {
  const manifest = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf8'));
  const settings: Record<string, unknown> = {
    'window.autoDetectColorScheme': false,
    'workbench.colorTheme': 'Default Dark Modern',
    'workbench.preferredLightColorTheme': 'Default Light Modern',
    'workbench.preferredDarkColorTheme': 'Default Dark Modern'
  };
  if (useDefaults) {
    for (const [key, property] of Object.entries(manifest.contributes.configuration.properties)) {
      settings[key] = (property as { default: unknown }).default;
    }
  }
  Object.assign(settings, overrides);
  const writes: { key: string; value: unknown; target: number }[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const timers = new Map<number, () => void>();
  const listeners: ((event: { affectsConfiguration(key: string): boolean }) => void)[] = [];
  let timerId = 0;
  const disposable = { dispose() {} };
  const vscode = {
    ConfigurationTarget: { Global: 1 },
    ColorThemeKind: { Light: 1, Dark: 2, HighContrast: 3, HighContrastLight: 4 },
    StatusBarAlignment: { Right: 2 },
    workspace: {
      getConfiguration: (section: string) => ({
        get: (key: string) => settings[`${section}.${key}`],
        update: async (key: string, value: unknown, target: number) => {
          writes.push({ key: `${section}.${key}`, value, target });
          settings[`${section}.${key}`] = value;
        }
      }),
      onDidChangeConfiguration: (listener: typeof listeners[number]) => {
        listeners.push(listener);
        return disposable;
      }
    },
    window: {
      activeColorTheme: { kind: 2 },
      createStatusBarItem: () => ({ ...disposable, show() {} }),
      showInformationMessage: async () => undefined,
      showWarningMessage: async (message: string) => { warnings.push(message); },
      showErrorMessage: async (message: string) => { errors.push(message); }
    },
    commands: { registerCommand: () => disposable }
  };
  const fixedTime = new Date(2026, 8, 9, 12).getTime();
  class Clock extends Date {
    constructor(value?: string | number | Date) {
      super(value === undefined ? fixedTime : value instanceof Date ? value.getTime() : value);
    }
    static now() { return fixedTime; }
  }
  const cache = new Map<string, { exports: any }>();
  function load(filename: string): any {
    if (cache.has(filename)) return cache.get(filename)!.exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    }).outputText;
    runInNewContext(source, {
      module, exports: module.exports, Date: Clock, console,
      require: (id: string) => {
        if (id === 'vscode') return vscode;
        if (id.startsWith('.')) return load(resolve(dirname(filename), `${id}.ts`));
        throw new Error(`Unexpected dependency: ${id}`);
      },
      setTimeout: (callback: () => void) => {
        timers.set(++timerId, callback);
        return timerId;
      },
      clearTimeout: (id: number) => timers.delete(id)
    }, { filename });
    return module.exports;
  }
  return {
    settings, writes, warnings, errors, timers,
    extension: load(resolve(__dirname, '../../src/extension.ts')) as typeof import('../../src/extension'),
    switcher: load(resolve(__dirname, '../../src/themeSwitcher.ts')) as typeof import('../../src/themeSwitcher'),
    config: load(resolve(__dirname, '../../src/configManager.ts')) as typeof import('../../src/configManager'),
    change(key: string, value: unknown) {
      settings[key] = value;
      for (const listener of listeners) {
        listener({ affectsConfiguration: section => key === section || key.startsWith(`${section}.`) });
      }
    },
    async settle() {
      await new Promise<void>(done => setImmediate(done));
      if (errors.length) throw new Error(errors.join('\n'));
    },
    async tick() {
      const next = timers.entries().next().value;
      if (!next) throw new Error('No scheduled switch');
      timers.delete(next[0]);
      next[1]();
      await this.settle();
    }
  };
}
