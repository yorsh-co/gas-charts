/**
 * Fixture app for the manual checks in manual/README.md.
 *
 * Pushed by `npm run manual:build` after the compiled library, as a
 * global-scope Apps Script file. It is consumer code: it serves a page that
 * renders two charts from the inlined ECharts build, with no network request.
 */

const PAGE = `<!DOCTYPE html>
<html>
  <head>
    <base target="_top" />
    <meta charset="utf-8" />
    <title>gas-charts manual check</title>
    <!-- gas-charts -->
    <style>
      body { font-family: sans-serif; margin: 24px; }
      .chart { width: 480px; height: 320px; display: inline-block; }
    </style>
  </head>
  <body>
    <h1>gas-charts manual check</h1>
    <p>ECharts version: <strong id="version"></strong></p>
    <div id="bar" class="chart"></div>
    <div id="pie" class="chart"></div>
    <script>
      document.getElementById('version').textContent = echarts.version;
      window.GasCharts.render('#bar', {
        title: { text: 'Bar' },
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: [12, 20, 15, 8, 18] }],
      });
      window.GasCharts.render('#pie', {
        title: { text: 'Pie' },
        series: [
          {
            type: 'pie',
            radius: '60%',
            data: [
              { name: 'A', value: 40 },
              { name: 'B', value: 25 },
              { name: 'C', value: 35 },
            ],
          },
        ],
      });
    </script>
  </body>
</html>`;

/** Serves the page with ECharts and the browser helper inlined. */
function doGet() {
  return HtmlService.createHtmlOutput(GasCharts.inject(PAGE)).setTitle(
    'gas-charts manual check',
  );
}
