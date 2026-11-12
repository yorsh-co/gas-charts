import { fileURLToPath } from 'node:url';
import { createGasLoader, loadOrderFiles } from 'gasdev/test';

/** Constants and values exported by the loaded sources. */
export interface GasChartsExports {
  GAS_CHARTS_ERROR_PREFIX: string;
  GAS_CHARTS_MARKER: string;
  _GAS_CHARTS_ECHARTS_JS: string;
  GAS_CHARTS_ECHARTS_VERSION: string;
  GasCharts: {
    ECHARTS_VERSION: string;
    script(): string;
    scriptTag(options?: { nonce?: string }): string;
    inject(html: string, options?: { nonce?: string }): string;
  };
}

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const load = createGasLoader<GasChartsExports>({
  files: loadOrderFiles(ROOT),
  exports: [
    'GAS_CHARTS_ERROR_PREFIX',
    'GAS_CHARTS_MARKER',
    '_GAS_CHARTS_ECHARTS_JS',
    'GAS_CHARTS_ECHARTS_VERSION',
    'GasCharts',
  ],
  root: ROOT,
});

/**
 * Evaluates the sources in a fresh context so each call is isolated from every
 * other. `Error` and `TypeError` are shared with the host so `instanceof`
 * holds across the context boundary.
 */
export function loadGasCharts(): { exports: GasChartsExports } {
  return { exports: load({ Error, TypeError }) };
}
