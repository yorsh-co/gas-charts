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
  /**
   * Value of the `nonce` attribute set on the `<script>` tag, for pages that
   * enforce a Content Security Policy. Limited to base64 and base64url
   * characters.
   */
  nonce?: string;
}

/**
 * Serves Apache ECharts inline so an Apps Script web app can use it with no
 * CDN request.
 *
 * Server usage: `GasCharts.inject(html)` on an HTML string, or
 * `<?!= GasCharts.scriptTag() ?>` in a template (use `<?!= ?>`, never `<?= ?>`,
 * which would escape the script).
 */
declare const GasCharts: {
  /** Version of the vendored ECharts build. */
  readonly ECHARTS_VERSION: string;

  /**
   * Returns the ECharts source, safe to place inside an inline `<script>`.
   * @returns JavaScript source that defines the global `echarts`.
   */
  script(): string;

  /**
   * Returns a complete `<script>` element carrying ECharts.
   * @param options Optional tag settings.
   * @returns The `<script>...</script>` markup.
   * @throws {TypeError} If `options.nonce` is not a string or contains invalid
   *   characters.
   */
  scriptTag(options?: GasChartsScriptOptions): string;

  /**
   * Inserts the ECharts script tag into an HTML page. The tag replaces the
   * first `<!-- gas-charts -->` marker; without a marker it goes immediately
   * before the first `</head>` (case-insensitive); failing that it goes
   * right after a leading `<!doctype ...>` declaration (case-insensitive,
   * optional leading whitespace or BOM); otherwise it is prepended. The
   * search is raw text, not parsed HTML: the first textual occurrence wins,
   * even inside an earlier comment or inline script string.
   * @param html The page to inject into.
   * @param options Optional tag settings.
   * @returns The page with ECharts inlined.
   * @throws {TypeError} If `html` is not a string or `options.nonce` is invalid.
   */
  inject(html: string, options?: GasChartsScriptOptions): string;
};
