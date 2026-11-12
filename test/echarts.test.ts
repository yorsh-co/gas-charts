import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { loadGasCharts } from './harness';

describe('vendored ECharts', () => {
  const { exports } = loadGasCharts();
  const js = exports._GAS_CHARTS_ECHARTS_JS;

  it('contains no sequences that break an inline script', () => {
    expect(js.toLowerCase()).not.toContain('</script');
    expect(js).not.toContain('<!--');
  });

  it('starts with the Apache license banner', () => {
    expect(js.trimStart().startsWith('/*')).toBe(true);
    expect(js.slice(0, 600)).toContain('Apache License');
  });

  it('evaluates and reports the pinned version', () => {
    const sandbox: Record<string, unknown> = {};
    sandbox.self = sandbox;
    sandbox.globalThis = sandbox;
    runInNewContext(js, sandbox);
    const echarts = sandbox.echarts as { init: unknown; version: string };
    expect(typeof echarts.init).toBe('function');
    expect(echarts.version).toBe(exports.GAS_CHARTS_ECHARTS_VERSION);
  });
});
