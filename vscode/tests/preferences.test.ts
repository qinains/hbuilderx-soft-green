import assert from 'node:assert/strict';
import test from 'node:test';
import { createExtensionHost } from './helpers/extensionHost';

for (const mode of [undefined, 'manual', 'system']) {
  for (const autoDetect of [false, true]) {
    test(`activation and config changes preserve preferences: mode=${mode}, autoDetect=${autoDetect}`, async () => {
      const host = createExtensionHost({
        ...(mode ? { 'hbuilderxSoftGreen.autoSwitchMode': mode } : {}),
        'window.autoDetectColorScheme': autoDetect
      });
      host.extension.activate({ subscriptions: [] } as any);
      await host.settle();
      host.change('hbuilderxSoftGreen.lightTime', '08:00');
      await host.settle();
      host.extension.deactivate();
      assert.deepEqual(host.writes, []);
      assert.equal(host.timers.size, 0);
    });
  }
}

test('missing configuration falls back to passive manual mode', async () => {
  const host = createExtensionHost({}, false);
  await host.switcher.startAutoSwitch();
  assert.equal(host.config.getConfig().autoSwitchMode, 'manual');
  assert.deepEqual(host.writes, []);
});

test('explicit toggle changes only extension mode and current theme', async () => {
  const host = createExtensionHost({ 'hbuilderxSoftGreen.autoSwitchMode': 'scheduled' });
  await host.switcher.toggleTheme();
  assert.deepEqual(host.writes, [
    { key: 'hbuilderxSoftGreen.autoSwitchMode', value: 'manual', target: 1 },
    { key: 'workbench.colorTheme', value: 'HBuilderX Soft Green Light', target: 1 }
  ]);
});

test('toggle warns rather than disabling native auto-detection', async () => {
  const host = createExtensionHost({ 'window.autoDetectColorScheme': true });
  await host.switcher.toggleTheme();
  assert.deepEqual(host.writes, []);
  assert.equal(host.warnings.length, 1);
  assert.match(host.warnings[0], /window\.autoDetectColorScheme/);
});

for (const mode of ['scheduled', 'seasonal']) {
  test(`${mode} switches only the current theme when opted in`, async () => {
    const host = createExtensionHost({ 'hbuilderxSoftGreen.autoSwitchMode': mode });
    await host.switcher.startAutoSwitch();
    assert.deepEqual(host.writes, [
      { key: 'workbench.colorTheme', value: 'HBuilderX Soft Green Light', target: 1 }
    ]);
    assert.equal(host.timers.size, 1);
    host.settings['hbuilderxSoftGreen.autoSwitchMode'] = 'manual';
    await host.switcher.handleConfigChange();
    assert.equal(host.timers.size, 0);
    assert.equal(host.writes.length, 1);
  });

  test(`${mode} pauses when native auto-detection is enabled`, async () => {
    const host = createExtensionHost({
      'hbuilderxSoftGreen.autoSwitchMode': mode,
      'window.autoDetectColorScheme': true
    });
    await host.switcher.startAutoSwitch();
    assert.deepEqual(host.writes, []);
    assert.equal(host.timers.size, 0);
    assert.equal(host.warnings.length, 1);
  });
}

test('timer checks native auto-detection again before changing the theme', async () => {
  const host = createExtensionHost({ 'hbuilderxSoftGreen.autoSwitchMode': 'scheduled' });
  await host.switcher.startAutoSwitch();
  host.writes.length = 0;
  host.settings['window.autoDetectColorScheme'] = true;
  host.settings['workbench.colorTheme'] = 'User Selected Theme';
  await host.tick();
  assert.deepEqual(host.writes, []);
  assert.equal(host.timers.size, 0);
  assert.equal(host.warnings.length, 1);
});

test('native setting changes pause and resume an opted-in schedule', async () => {
  const host = createExtensionHost({ 'hbuilderxSoftGreen.autoSwitchMode': 'scheduled' });
  host.extension.activate({ subscriptions: [] } as any);
  await host.settle();
  host.writes.length = 0;
  host.change('window.autoDetectColorScheme', true);
  await host.settle();
  assert.equal(host.timers.size, 0);
  assert.deepEqual(host.writes, []);
  host.change('window.autoDetectColorScheme', false);
  await host.settle();
  assert.equal(host.timers.size, 1);
  host.extension.deactivate();
});

test('switching to manual while a scheduled update is pending does not restart its timer', async () => {
  const host = createExtensionHost({ 'hbuilderxSoftGreen.autoSwitchMode': 'scheduled' });
  const pending = host.switcher.startAutoSwitch();
  host.settings['hbuilderxSoftGreen.autoSwitchMode'] = 'manual';
  await host.switcher.handleConfigChange();
  await pending;
  assert.equal(host.timers.size, 0);
});

test('deactivation while the initial scheduled update is pending does not restart its timer', async () => {
  const host = createExtensionHost({ 'hbuilderxSoftGreen.autoSwitchMode': 'scheduled' });
  const pending = host.switcher.startAutoSwitch();
  host.extension.deactivate();
  await pending;
  assert.equal(host.timers.size, 0);
});

for (const exit of ['manual', 'deactivate']) {
  test(`${exit} while a timer-triggered update is pending prevents rescheduling`, async () => {
    const host = createExtensionHost({ 'hbuilderxSoftGreen.autoSwitchMode': 'scheduled' });
    await host.switcher.startAutoSwitch();
    host.settings['workbench.colorTheme'] = 'User Selected Theme';
    const pending = host.tick();
    if (exit === 'manual') {
      host.settings['hbuilderxSoftGreen.autoSwitchMode'] = 'manual';
      await host.switcher.handleConfigChange();
    } else {
      host.extension.deactivate();
    }
    await pending;
    assert.equal(host.timers.size, 0);
  });
}
