/**
 * Serves Apache ECharts inline so an Apps Script web app can use it with no
 * CDN request.
 *
 * Server usage: `GasCharts.inject(html)` on an HTML string, or
 * `<?!= GasCharts.scriptTag() ?>` in a template (use `<?!= ?>`, never `<?= ?>`,
 * which would escape the script).
 */
declare const GasCharts: Readonly<{
  /** Version of the vendored ECharts build. */
  ECHARTS_VERSION: string;
  /**
   * Returns the ECharts source followed by the browser helper, safe to place
   * inside an inline `<script>`.
   * @param options Optional settings; `client: false` omits the helper.
   * @throws {TypeError} If `options.client` is not a boolean.
   * @returns JavaScript source that defines the global `echarts` and, unless
   *   disabled, `window.GasCharts`.
   */
  script(options?: GasChartsScriptOptions): string;
  /**
   * Returns a complete `<script>` element carrying ECharts and the helper.
   * @param options Optional tag settings.
   * @returns The `<script>...</script>` markup.
   * @throws {TypeError} If `options.nonce` is not a string or contains invalid
   *   characters, or `options.client` is not a boolean.
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
   * @throws {TypeError} If `html` is not a string or `options.nonce` or
   *   `options.client` is invalid.
   */
  inject(html: string, options?: GasChartsScriptOptions): string;
}>;
/**
 * Builds the `<script>` element, validating the optional nonce.
 * @param options Optional tag settings.
 * @returns The `<script>...</script>` markup.
 */
declare function _gasChartsScriptTag(options?: GasChartsScriptOptions): string;
/**
 * Concatenates ECharts and, unless disabled, the browser helper.
 * @param options Optional settings.
 * @returns The JavaScript source.
 */
declare function _gasChartsScript(options?: GasChartsScriptOptions): string;
