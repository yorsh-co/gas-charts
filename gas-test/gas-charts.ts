test('the library is bundled with a vendored ECharts', () => {
  assert(
    GasCharts.scriptTag().length > 500000,
    'scriptTag() should carry the full ECharts build',
  );
});

test('ECHARTS_VERSION is a semantic version', () => {
  assert(
    /^\d+\.\d+\.\d+$/.test(GasCharts.ECHARTS_VERSION),
    `unexpected version: ${GasCharts.ECHARTS_VERSION}`,
  );
});

test('HtmlService serves the injected page', () => {
  const content = HtmlService.createHtmlOutput(
    GasCharts.inject('<html><head></head><body></body></html>'),
  ).getContent();
  assert(content.includes('echarts'), 'the served page should contain echarts');
});
