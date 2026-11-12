# gas-charts

[![Built with Google Apps Script](https://img.shields.io/badge/Built%20with-Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://developers.google.com/apps-script)

## Apache ECharts for Google Apps Script web apps, served inline with no CDN.

> [!NOTE]
> `gas-charts` is not affiliated with, endorsed by, or sponsored by Google or the Apache Software Foundation. Apache ECharts is a trademark of the Apache Software Foundation.

## Features

- Serves the full Apache ECharts build from inside your Apps Script project: no CDN, no external request.
- `GasCharts.inject(html)` for `createHtmlOutput`, `GasCharts.scriptTag()` for templates.
- Browser helper `window.GasCharts.render(el, option)` with auto-resize and `dispose`.
- Optional CSP `nonce` on the script tag.
- Zero OAuth scopes: the library only returns strings.

## Example Usage

Inject into an HTML string:

```js
function doGet() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  return HtmlService.createHtmlOutput(GasCharts.inject(html));
}
```

In a template, use the printing scriptlet (`<?!= ?>`, never `<?= ?>`, which escapes the script):

```html
<head>
  <?!= GasCharts.scriptTag() ?>
</head>
```

In a page with a marker, the first `<!-- gas-charts -->` is replaced by the script tag:

```html
<head>
  <!-- gas-charts -->
</head>
```

## Browser helper

Unless you pass `client: false`, the injected script also defines `window.GasCharts` after ECharts:

```js
const chart = GasCharts.render('#chart', {
  xAxis: { type: 'category', data: ['A', 'B'] },
  yAxis: {},
  series: [{ type: 'bar', data: [1, 2] }],
});

GasCharts.dispose('#chart');
```

- `GasCharts.render(target, option, options?)`: `target` is an element or a selector. Reuses the chart already attached to the element, otherwise creates one, then applies `option`. Returns the ECharts instance. Throws `Error` if the target is not found or `echarts` is not loaded.
- `GasCharts.dispose(target)`: stops resizing and disposes the chart. No-op when there is no chart or the selector matches nothing.

| Option       | Default  | Description                                                   |
| ------------ | -------- | ------------------------------------------------------------- |
| `theme`      | none     | ECharts theme name or object, used when the chart is created. |
| `renderer`   | `canvas` | `canvas` or `svg`, used when the chart is created.            |
| `notMerge`   | `false`  | Replace the previous option instead of merging.               |
| `autoResize` | `true`   | Resize the chart with its container via `ResizeObserver`.     |

To ship ECharts alone, pass `{ client: false }` to `script`, `scriptTag` or `inject`.

## Requirements

- No OAuth scopes.
- No peer libraries.

## Quick Start

Add the library to your project's `package.json` and bundle it with `gasdev bundle`:

```json
{
  "gasdev": {
    "bundle": {
      "libraries": ["gas-charts"]
    }
  }
}
```

## API

| Member                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ECHARTS_VERSION`        | Version of the vendored ECharts build.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `script(options?)`       | ECharts source plus the browser helper (unless `options.client` is `false`), safe inside an inline `<script>`.                                                                                                                                                                                                                                                                                                                                                               |
| `scriptTag(options?)`    | A complete `<script>` element. `options.nonce` sets the `nonce` attribute (`[A-Za-z0-9+/_=-]+`); otherwise throws `TypeError`. `options.client: false` omits the browser helper.                                                                                                                                                                                                                                                                                             |
| `inject(html, options?)` | Inserts the tag at the first `<!-- gas-charts -->` marker, else before the first `</head>` (case-insensitive), else right after a leading `<!doctype ...>` (case-insensitive), else at the start. First textual occurrence wins (raw text search, not parsed; a match inside an earlier comment or inline script string counts). `options` are as for `scriptTag`. Throws `TypeError` if `html` is not a string or `options` are invalid (including a non-boolean `client`). |

## Platform notes

- Page weight grows by about the size of the ECharts constant (roughly 1 MB).
- Serve the page with `createHtmlOutput` or `<?!= ?>`, not `<?= ?>`.

## Development

- `npm run generate` regenerates `src/generated/` from `node_modules/echarts`.
- To upgrade ECharts, bump the pinned `echarts` devDependency, run `npm install` and `npm run generate`, then commit the result. `generate:check` fails until you do.
- `npm run check` runs formatting, lint, type checks, tests and `gasdev check`.

## Peer Type Declarations

`peer/gas-charts.peer.types.d.ts` declares the public surface for consumers. List `gas-charts` in `gasdev.peers` and run `gasdev peers sync`.

## Third-party notices

This library bundles Apache ECharts, licensed under the Apache License 2.0.

```
Apache ECharts
Copyright 2017-2026 The Apache Software Foundation

This product includes software developed at
The Apache Software Foundation (https://www.apache.org/).
```

The license banner is preserved at the top of the vendored source.

## License

MIT. See [LICENSE.md](LICENSE.md).
