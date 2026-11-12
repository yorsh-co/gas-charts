/**
 * Serves Apache ECharts inline so an Apps Script web app can use it with no
 * CDN request.
 *
 * Server usage: `GasCharts.inject(html)` on an HTML string, or
 * `<?!= GasCharts.scriptTag() ?>` in a template (use `<?!= ?>`, never `<?= ?>`,
 * which would escape the script).
 */
const GasCharts = Object.freeze({
  /** Version of the vendored ECharts build. */
  ECHARTS_VERSION: GAS_CHARTS_ECHARTS_VERSION,

  /**
   * Returns the ECharts source followed by the browser helper, safe to place
   * inside an inline `<script>`.
   * @param options Optional settings; `client: false` omits the helper.
   * @throws {TypeError} If `options.client` is not a boolean.
   * @returns JavaScript source that defines the global `echarts` and, unless
   *   disabled, `window.GasCharts`.
   */
  script(options?: GasChartsScriptOptions): string {
    return _gasChartsScript(options);
  },

  /**
   * Returns a complete `<script>` element carrying ECharts and the helper.
   * @param options Optional tag settings.
   * @returns The `<script>...</script>` markup.
   * @throws {TypeError} If `options.nonce` is not a string or contains invalid
   *   characters, or `options.client` is not a boolean.
   */
  scriptTag(options?: GasChartsScriptOptions): string {
    return _gasChartsScriptTag(options);
  },

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
  inject(html: string, options?: GasChartsScriptOptions): string {
    if (typeof html !== 'string') {
      throw new TypeError(
        GAS_CHARTS_ERROR_PREFIX + ' html must be a string, got ' + typeof html,
      );
    }
    const tag = _gasChartsScriptTag(options);
    const markerAt = html.indexOf(GAS_CHARTS_MARKER);
    if (markerAt !== -1) {
      return (
        html.slice(0, markerAt) +
        tag +
        html.slice(markerAt + GAS_CHARTS_MARKER.length)
      );
    }
    const headAt = html.search(/<\/head>/i);
    if (headAt !== -1) {
      return html.slice(0, headAt) + tag + html.slice(headAt);
    }
    const doctype = /^[\s\uFEFF]*<!doctype[^>]*>/i.exec(html);
    if (doctype) {
      const end = doctype[0].length;
      return html.slice(0, end) + tag + html.slice(end);
    }
    return tag + html;
  },
});

/**
 * Builds the `<script>` element, validating the optional nonce.
 * @param options Optional tag settings.
 * @returns The `<script>...</script>` markup.
 */
function _gasChartsScriptTag(options?: GasChartsScriptOptions): string {
  const nonce = options && options.nonce;
  let attributes = '';
  if (nonce !== undefined) {
    if (typeof nonce !== 'string') {
      throw new TypeError(
        GAS_CHARTS_ERROR_PREFIX +
          ' nonce must be a string, got ' +
          typeof nonce,
      );
    }
    if (!/^[A-Za-z0-9+/_=-]+$/.test(nonce)) {
      throw new TypeError(
        GAS_CHARTS_ERROR_PREFIX + ' nonce must match /^[A-Za-z0-9+/_=-]+$/',
      );
    }
    attributes = ' nonce="' + nonce + '"';
  }
  return '<script' + attributes + '>' + _gasChartsScript(options) + '</script>';
}

/**
 * Concatenates ECharts and, unless disabled, the browser helper.
 * @param options Optional settings.
 * @returns The JavaScript source.
 */
function _gasChartsScript(options?: GasChartsScriptOptions): string {
  const client = options && options.client;
  if (client !== undefined && typeof client !== 'boolean') {
    throw new TypeError(
      GAS_CHARTS_ERROR_PREFIX + ' options.client must be a boolean',
    );
  }
  if (client === false) return _GAS_CHARTS_ECHARTS_JS;
  return _GAS_CHARTS_ECHARTS_JS + '\n;' + _GAS_CHARTS_CLIENT_JS;
}
