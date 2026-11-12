/**
 * Browser helper shipped after ECharts. Exposes `window.GasCharts` with
 * `render` and `dispose`. An existing `window.GasCharts` is preserved.
 */
window.GasCharts =
  window.GasCharts ||
  (function (): GasChartsClient {
    const prefix = '[GasCharts]';
    const observers = new WeakMap<HTMLElement, ResizeObserver>();

    function find(target: HTMLElement | string): HTMLElement | null {
      const element =
        typeof target === 'string' ? document.querySelector(target) : target;
      return (element as HTMLElement | null) || null;
    }

    function resolve(target: HTMLElement | string): HTMLElement {
      const element = find(target);
      if (!element) {
        throw new Error(prefix + ' target not found: ' + String(target));
      }
      return element;
    }

    function stopObserving(element: HTMLElement): void {
      const observer = observers.get(element);
      if (observer) {
        observer.disconnect();
        observers.delete(element);
      }
    }

    return {
      render(target, option, options) {
        if (typeof echarts === 'undefined') {
          throw new Error(prefix + ' echarts is not loaded');
        }
        const element = resolve(target);
        const settings = options || {};
        const chart =
          echarts.getInstanceByDom(element) ||
          echarts.init(element, settings.theme, {
            renderer: settings.renderer,
          });
        chart.setOption(option, settings.notMerge);
        if (settings.autoResize === false) {
          stopObserving(element);
        } else if (!observers.has(element)) {
          const observer = new ResizeObserver(function () {
            const current = echarts && echarts.getInstanceByDom(element);
            if (current) current.resize();
          });
          observer.observe(element);
          observers.set(element, observer);
        }
        return chart;
      },

      dispose(target) {
        const element = find(target);
        if (!element) return;
        stopObserving(element);
        if (typeof echarts === 'undefined') return;
        const chart = echarts.getInstanceByDom(element);
        if (chart) chart.dispose();
      },
    };
  })();
