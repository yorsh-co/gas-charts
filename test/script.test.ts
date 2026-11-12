import { describe, expect, it } from 'vitest';
import { loadGasCharts } from './harness';

describe('GasCharts.script / scriptTag', () => {
  const { GasCharts, _GAS_CHARTS_ECHARTS_JS } = loadGasCharts().exports;

  it('exposes the pinned ECharts version', () => {
    expect(GasCharts.ECHARTS_VERSION).toBe('6.1.0');
  });

  it('is frozen', () => {
    expect(Object.isFrozen(GasCharts)).toBe(true);
  });

  it('returns the vendored source from script()', () => {
    expect(GasCharts.script()).toBe(_GAS_CHARTS_ECHARTS_JS);
  });

  it('wraps the source in a bare script tag', () => {
    const tag = GasCharts.scriptTag();
    expect(tag.startsWith('<script>')).toBe(true);
    expect(tag.endsWith('</script>')).toBe(true);
    expect(tag.slice(8, -9)).toBe(GasCharts.script());
  });

  it('never lets the source close its own tag early', () => {
    expect(GasCharts.script().toLowerCase()).not.toContain('</script');
  });

  it('sets a valid nonce', () => {
    expect(GasCharts.scriptTag({ nonce: 'aB3+/_=-x' })).toMatch(
      /^<script nonce="aB3\+\/_=-x">/,
    );
  });

  it.each(['', 'a"b', 'a b', '<x>', "a'b"])('rejects nonce %j', (nonce) => {
    expect(() => GasCharts.scriptTag({ nonce })).toThrow(TypeError);
    expect(() => GasCharts.scriptTag({ nonce })).toThrow(/^\[GasCharts\]/);
  });

  it.each([
    [null, 'object'],
    [5, 'number'],
  ])('rejects non-string nonce %j', (nonce, type) => {
    const call = () =>
      GasCharts.scriptTag({ nonce: nonce as unknown as string });
    expect(call).toThrow(TypeError);
    expect(call).toThrow(/^\[GasCharts\] nonce must be a string, got /);
    expect(call).toThrow(new RegExp(`got ${type}$`));
  });
});
