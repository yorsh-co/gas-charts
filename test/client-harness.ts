import vm from 'node:vm';
import { loadGasCharts } from './harness';

/** Fake chart instance recording calls. */
export interface FakeChart {
  setOption: ReturnType<typeof recorder>;
  resize: ReturnType<typeof recorder>;
  dispose: ReturnType<typeof recorder>;
}

/** Fake `ResizeObserver` recording its lifecycle. */
export interface FakeObserver {
  element: unknown;
  callback: () => void;
  disconnected: boolean;
}

function recorder() {
  const calls: unknown[][] = [];
  const fn = (...args: unknown[]) => {
    calls.push(args);
  };
  return Object.assign(fn, { calls });
}

/** Public surface of `window.GasCharts` as seen by the tests. */
export interface ClientApi {
  render(
    target: object | string,
    option: object,
    options?: Record<string, unknown>,
  ): FakeChart;
  dispose(target: object | string): void;
}

/** Browser-like sandbox running the transpiled client helper. */
export interface ClientSandbox {
  window: { GasCharts: ClientApi };
  elements: Record<string, object>;
  charts: Map<object, FakeChart>;
  inits: unknown[][];
  observers: FakeObserver[];
  removeEcharts(): void;
}

/**
 * Runs the generated client in a fresh `node:vm` context with a fake `echarts`,
 * `document` and `ResizeObserver`.
 * @param preset Optional existing `window.GasCharts` value.
 */
export function loadClient(preset?: unknown): ClientSandbox {
  const source = loadGasCharts().exports._GAS_CHARTS_CLIENT_JS;
  const elements: Record<string, object> = { '#chart': {} };
  const charts = new Map<object, FakeChart>();
  const inits: unknown[][] = [];
  const observers: FakeObserver[] = [];
  const window: { GasCharts?: unknown } = {};
  if (preset !== undefined) window.GasCharts = preset;

  class ResizeObserver {
    private readonly entry: FakeObserver;
    constructor(callback: () => void) {
      this.entry = { element: undefined, callback, disconnected: false };
      observers.push(this.entry);
    }
    observe(element: unknown) {
      this.entry.element = element;
    }
    disconnect() {
      this.entry.disconnected = true;
    }
  }

  const context: Record<string, unknown> = {
    window,
    Error,
    WeakMap,
    ResizeObserver,
    document: {
      querySelector: (selector: string) => elements[selector] ?? null,
    },
    echarts: {
      init(element: object, ...rest: unknown[]) {
        inits.push([element, ...rest]);
        const chart = {
          setOption: recorder(),
          resize: recorder(),
          dispose: recorder(),
        };
        charts.set(element, chart);
        return chart;
      },
      getInstanceByDom: (element: object) => charts.get(element),
    },
  };
  vm.runInNewContext(source, context);
  return {
    window: window as ClientSandbox['window'],
    elements,
    charts,
    inits,
    observers,
    removeEcharts() {
      delete context['echarts'];
    },
  };
}
