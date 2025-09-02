import test from 'node:test';
import assert from 'node:assert/strict';

const trackModulePath = '../lib/analytics/track.ts';

// Minimal DOM stubs for Meta Pixel initialization
function setupDom() {
  globalThis.window = {} as any;
  globalThis.document = {
    createElement: () => ({ async: false, src: '' }),
    head: { appendChild: () => {} },
  } as any;
}

test('track initializes Meta only when pixel ID exists', async () => {
  // Scenario without pixel ID
  setupDom();
  const envModule = await import('../lib/env');
  envModule.env.NEXT_PUBLIC_META_PIXEL_ID = undefined as any;
  const trackMod1 = await import(trackModulePath + '?noid');
  trackMod1.track('TestEvent');
  assert.equal((globalThis.window as any).fbq, undefined);

  // Scenario with pixel ID
  setupDom();
  envModule.env.NEXT_PUBLIC_META_PIXEL_ID = 'abc123';
  const trackMod2 = await import(trackModulePath + '?withid');
  trackMod2.track('TestEvent');
  assert.equal(typeof (globalThis.window as any).fbq, 'function');
});
