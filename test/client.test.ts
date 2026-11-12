import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import { loadClient } from './client-harness';
import { loadGasCharts } from './harness';

describe('window.GasCharts client', () => {
  it('preserves an existing window.GasCharts', () => {
    const existing = { marker: true };
    expect(loadClient(existing).window.GasCharts).toBe(existing);
  });

  it('exposes render and dispose', () => {
    const { window } = loadClient();
    expect(typeof window.GasCharts.render).toBe('function');
    expect(typeof window.GasCharts.dispose).toBe('function');
  });

  it('evaluates the full script() output with real ECharts', () => {
    const window: Record<string, unknown> = {};
    const context: Record<string, unknown> = {
      window,
      document: {
        documentElement: { style: {} },
        createElement: () => ({ style: {}, getContext: () => null }),
      },
      navigator: { userAgent: 'node' },
    };
    context['self'] = window;
    vm.runInNewContext(loadGasCharts().exports.GasCharts.script(), context);
    const echarts: unknown = vm.runInNewContext('echarts', context);
    expect(typeof echarts).toBe('object');
    expect(typeof (window['GasCharts'] as { render: unknown }).render).toBe(
      'function',
    );
  });

  describe('render', () => {
    it('inits a chart from a selector and sets the option', () => {
      const sandbox = loadClient();
      const option = { series: [] };
      const chart = sandbox.window.GasCharts.render('#chart', option, {
        theme: 'dark',
        renderer: 'svg',
        notMerge: true,
      });
      expect(sandbox.inits).toEqual([
        [sandbox.elements['#chart'], 'dark', { renderer: 'svg' }],
      ]);
      expect(chart.setOption.calls).toEqual([[option, true]]);
    });

    it('accepts an element directly', () => {
      const sandbox = loadClient();
      const element = {};
      sandbox.window.GasCharts.render(element, {});
      expect(sandbox.inits).toHaveLength(1);
      expect(sandbox.inits[0]![0]).toBe(element);
    });

    it('reuses an existing instance', () => {
      const sandbox = loadClient();
      const first = sandbox.window.GasCharts.render('#chart', { a: 1 });
      const second = sandbox.window.GasCharts.render('#chart', { a: 2 });
      expect(second).toBe(first);
      expect(sandbox.inits).toHaveLength(1);
      expect(first.setOption.calls).toHaveLength(2);
    });

    it('throws when the selector matches nothing', () => {
      const { window } = loadClient();
      expect(() => window.GasCharts.render('#missing', {})).toThrow(
        /^\[GasCharts\] target not found/,
      );
    });

    it('throws when echarts is not loaded', () => {
      const sandbox = loadClient();
      sandbox.removeEcharts();
      expect(() => sandbox.window.GasCharts.render('#chart', {})).toThrow(
        /^\[GasCharts\] echarts is not loaded/,
      );
    });

    it('auto-resizes with one observer per element', () => {
      const sandbox = loadClient();
      const chart = sandbox.window.GasCharts.render('#chart', {});
      sandbox.window.GasCharts.render('#chart', {});
      expect(sandbox.observers).toHaveLength(1);
      expect(sandbox.observers[0]!.element).toBe(sandbox.elements['#chart']);
      sandbox.observers[0]!.callback();
      expect(chart.resize.calls).toHaveLength(1);
    });

    it('resizes the new instance after an external dispose and re-render', () => {
      const sandbox = loadClient();
      const el = sandbox.elements['#chart']!;
      sandbox.window.GasCharts.render('#chart', {});
      sandbox.charts.delete(el);
      const next = sandbox.window.GasCharts.render('#chart', {});
      sandbox.observers[0]!.callback();
      expect(next.resize.calls).toHaveLength(1);
    });

    it('disconnects when re-rendered with autoResize false', () => {
      const sandbox = loadClient();
      sandbox.window.GasCharts.render('#chart', {});
      sandbox.window.GasCharts.render('#chart', {}, { autoResize: false });
      expect(sandbox.observers[0]!.disconnected).toBe(true);
    });

    it('does not observe when autoResize is false', () => {
      const sandbox = loadClient();
      sandbox.window.GasCharts.render('#chart', {}, { autoResize: false });
      expect(sandbox.observers).toHaveLength(0);
    });
  });

  describe('dispose', () => {
    it('disconnects the observer and disposes the chart', () => {
      const sandbox = loadClient();
      const chart = sandbox.window.GasCharts.render('#chart', {});
      sandbox.window.GasCharts.dispose('#chart');
      expect(sandbox.observers[0]!.disconnected).toBe(true);
      expect(chart.dispose.calls).toHaveLength(1);
    });

    it('disconnects even when echarts is missing', () => {
      const sandbox = loadClient();
      sandbox.window.GasCharts.render('#chart', {});
      sandbox.removeEcharts();
      expect(() => sandbox.window.GasCharts.dispose('#chart')).not.toThrow();
      expect(sandbox.observers[0]!.disconnected).toBe(true);
    });

    it('does not throw for a missing selector', () => {
      const { window } = loadClient();
      expect(() => window.GasCharts.dispose('#missing')).not.toThrow();
    });

    it('is a no-op when there is no chart, and idempotent', () => {
      const sandbox = loadClient();
      expect(() => sandbox.window.GasCharts.dispose('#chart')).not.toThrow();
      const chart = sandbox.window.GasCharts.render('#chart', {});
      sandbox.window.GasCharts.dispose('#chart');
      sandbox.charts.delete(sandbox.elements['#chart']!);
      expect(() => sandbox.window.GasCharts.dispose('#chart')).not.toThrow();
      expect(chart.dispose.calls).toHaveLength(1);
    });
  });
});
