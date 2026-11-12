/** Options for `GasCharts.scriptTag` and `GasCharts.inject`. */
interface GasChartsScriptOptions {
  /**
   * Value of the `nonce` attribute set on the `<script>` tag, for pages that
   * enforce a Content Security Policy. Limited to base64 and base64url
   * characters.
   */
  nonce?: string;
}
