/** Slice of an ECharts instance used by the browser helper. */
interface GasChartsEchartsInstance {
  setOption(option: object, notMerge?: boolean): void;
  resize(): void;
  dispose(): void;
}

/** Slice of the global `echarts` namespace used by the browser helper. */
interface GasChartsEcharts {
  init(
    dom: HTMLElement,
    theme?: string | object | null,
    opts?: { renderer?: 'canvas' | 'svg' | undefined },
  ): GasChartsEchartsInstance;
  getInstanceByDom(dom: HTMLElement): GasChartsEchartsInstance | undefined;
}

/** Options for `window.GasCharts.render`. */
interface GasChartsRenderOptions {
  /** ECharts theme name or object, applied when the chart is first created. */
  theme?: string | object;
  /** Renderer used when the chart is first created. Defaults to `canvas`. */
  renderer?: 'canvas' | 'svg';
  /** Replaces the previous option instead of merging with it. */
  notMerge?: boolean;
  /** Resizes the chart with its container. Defaults to `true`. */
  autoResize?: boolean;
}

/** Browser-side API exposed as `window.GasCharts`. */
interface GasChartsClient {
  render(
    target: HTMLElement | string,
    option: object,
    options?: GasChartsRenderOptions,
  ): GasChartsEchartsInstance;
  dispose(target: HTMLElement | string): void;
}

declare const echarts: GasChartsEcharts | undefined;

interface Window {
  GasCharts?: GasChartsClient;
}
