import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DARK_THEME,
  LIGHT_THEME,
  needsThemeSwitch,
  shouldBeLightAtTime,
  toggleTarget
} from '../src/themePolicy';

test('requested theme switches select the exact HBuilderX theme', () => {
  assert.equal(needsThemeSwitch('Default Dark Modern', 'dark'), true);
  assert.equal(needsThemeSwitch(DARK_THEME, 'dark'), false);
  assert.equal(needsThemeSwitch('Default Light Modern', 'light'), true);
  assert.equal(needsThemeSwitch(LIGHT_THEME, 'light'), false);
});

test('manual toggle switches between the two extension themes', () => {
  assert.equal(toggleTarget(LIGHT_THEME, 'light'), 'dark');
  assert.equal(toggleTarget(DARK_THEME, 'dark'), 'light');
  assert.equal(toggleTarget('Default Dark Modern', 'dark'), 'light');
  assert.equal(toggleTarget('Default Light Modern', 'light'), 'dark');
  assert.equal(toggleTarget('', 'light'), 'dark');
  assert.equal(toggleTarget('', 'dark'), 'light');
});

test('scheduled mode supports daytime and overnight light windows', () => {
  assert.equal(shouldBeLightAtTime(new Date(2026, 7, 31, 12, 0), '07:00', '19:00'), true);
  assert.equal(shouldBeLightAtTime(new Date(2026, 7, 31, 22, 0), '07:00', '19:00'), false);
  assert.equal(shouldBeLightAtTime(new Date(2026, 7, 31, 23, 0), '19:00', '07:00'), true);
  assert.equal(shouldBeLightAtTime(new Date(2026, 7, 31, 12, 0), '19:00', '07:00'), false);
});
