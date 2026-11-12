/**
 * Ambient declarations for gas-charts, consumed as a peer package.
 *
 * gas-charts is expected as a runtime global (Apps Script has no module
 * system); this file declares its public surface so a consuming package can
 * typecheck standalone via `tsc --noEmit` without vendoring the source.
 *
 * Canonical copy: gas-charts/peer/gas-charts.peer.types.d.ts. Do not edit
 * downstream copies; update the canonical file and re-copy.
 *
 * Usage: list `gas-charts` in `gasdev.peers` and run `gasdev peers sync`.
 *
 * @see https://github.com/yorsh-co/gas-charts
 * @version 0.0.0
 */

/** Options for `GasCharts.scriptTag` and `GasCharts.inject`. */
interface GasChartsScriptOptions {
  /** Value of the `nonce` attribute set on the `<script>` tag. */
  nonce?: string;
}

/** Serves Apache ECharts inline so a web app needs no CDN. */
declare const GasCharts: {
  /** Version of the vendored ECharts build. */
  readonly ECHARTS_VERSION: string;
  /** Returns the ECharts source, safe to place inside an inline `<script>`. */
  script(): string;
  /** Returns a complete `<script>` element carrying ECharts. */
  scriptTag(options?: GasChartsScriptOptions): string;
  /** Inserts the script tag at the marker, before `</head>`, or at the start. */
  inject(html: string, options?: GasChartsScriptOptions): string;
};
