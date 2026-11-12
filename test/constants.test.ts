import { describe, expect, it } from 'vitest';
import { loadGasCharts } from './harness';

describe('constants', () => {
  const { exports } = loadGasCharts();

  it('prefixes errors with [GasCharts]', () => {
    expect(exports.GAS_CHARTS_ERROR_PREFIX).toBe('[GasCharts]');
  });

  it('uses an HTML comment as the injection marker', () => {
    expect(exports.GAS_CHARTS_MARKER).toBe('<!-- gas-charts -->');
  });
});
