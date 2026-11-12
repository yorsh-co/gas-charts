# gas-charts

[![Built with Google Apps Script](https://img.shields.io/badge/Built%20with-Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://developers.google.com/apps-script)

## Apache ECharts for Google Apps Script web apps, served inline with no CDN.

> [!NOTE]
> The goal of this project is to make charts in `HtmlService` pages work with no CDN and no external request.

`gas-charts` returns the full Apache ECharts build as a string and inserts it into your page as an inline `<script>`. An optional browser helper, `window.GasCharts`, renders and disposes charts with auto-resize.

> **Disclaimer:**
> This project and [Yorsh](https://github.com/yorsh-co) are independent and are not affiliated with, endorsed by, or associated with Google LLC. It is also not affiliated with, endorsed by, or sponsored by the Apache Software Foundation. Apache ECharts is a trademark of the Apache Software Foundation.

### Features

- Serves the full Apache ECharts build from inside your Apps Script project: no CDN, no external request
- `GasCharts.inject(html)` for `createHtmlOutput`, `GasCharts.scriptTag()` for templates
- Browser helper `window.GasCharts.render(el, option)` with auto-resize and `dispose`
- Optional CSP `nonce` on the script tag
- Zero OAuth scopes: the library only returns strings
- Singleton namespace, not a class
- Written in TypeScript with generated JavaScript distribution
- No external dependencies beyond built-in Apps Script services

### Example Usage

```js
function doGet() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  return HtmlService.createHtmlOutput(GasCharts.inject(html));
}
```

In the page:

```js
const chart = GasCharts.render('#chart', {
  xAxis: { type: 'category', data: ['A', 'B'] },
  yAxis: {},
  series: [{ type: 'bar', data: [1, 2] }],
});
```

## Requirements

### Scopes

`gas-charts` uses no Apps Script service and only returns strings, so it requires no `oauthScopes` entry in the parent project's `appsscript.json`.

### Deployment

The output is served through `HtmlService`, e.g. from a web app `doGet`. Serve the page with `createHtmlOutput` or the printing scriptlet `<?!= ?>`, never `<?= ?>`, which escapes the script.

### Peer Dependencies

None.

## Quick Start

> [!TIP]
> Use `gas-charts` together with [Google's `clasp` CLI](https://github.com/google/clasp) for local Apps Script development and git-based workflows. See [Setup instructions with `clasp`](#setup-instructions-with-clasp) for more information.

<a id="add-the-library"></a>

#### 1. Add the library to your Apps Script project

##### Several gas-\* libraries: gasdev bundle

[gasdev bundle](https://github.com/yorsh-co/gasdev#bundle) resolves version ranges against the libraries' release tags and writes them into one script, in dependency order.

```bash
npm install -D github:yorsh-co/gasdev#semver:^3.0.0
```

List the libraries in your `package.json`:

```json
{
  "gasdev": {
    "bundle": {
      "outFile": "src/lib/gas-libraries.js",
      "libraries": {
        "gas-charts": "^0.1.0"
      }
    }
  }
}
```

```bash
npx gasdev bundle
```

- Commit the generated file. Its header records each library's version and commit SHA.
- Re-run the command after changing a range to upgrade.

See the [gasdev bundle documentation](https://github.com/yorsh-co/gasdev#bundle) for configuration details.

##### This library only: git subtree

This repository is intended to be added directly into Apps Script projects using git subtree.

```bash
git subtree add \
  --prefix=src/lib/gas-charts \
  https://github.com/yorsh-co/gas-charts.git \
  dist \
  --squash
```

This creates:

```txt
src/lib/gas-charts/
```

#### 2. If needed, move `gas-charts` files to the start of the execution order.

This is required only when `GasCharts` is called at the top level, as a global variable or inside an IIFE.

See the [Configure the file push order](#file-push-order) section for details.

With gasdev bundle, the single entry is the bundle file, e.g. `src/lib/gas-libraries.js` (adjusted for `rootDir`).

#### 3. Inject ECharts into your page

```js
function doGet() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  return HtmlService.createHtmlOutput(GasCharts.inject(html));
}
```

## Setup instructions with `clasp`

`gas-charts` works best with [Google's `clasp` CLI](https://github.com/google/clasp) for local Apps Script development and git-based workflows.

#### 1. Install clasp

```bash
npm install -g @google/clasp
```

#### 2. Enable the [Apps Script API](https://script.google.com/home/usersettings)

#### 3. Login to Google Apps Script

```bash
clasp login
```

#### 4. Clone or create your Apps Script project

Clone an existing project:

```bash
clasp clone <script-id>
```

or create a new project:

```bash
clasp create --type standalone
```

<a id="file-push-order"></a>

#### 5. Configure the file push order

Apps Script executes files by the order in the Apps Script editor, from top to bottom. By default, `clasp push` orders the files alphabetically, by file name. If `GasCharts` is called at runtime (as a global variable or in an IIFE) in a file ordered before `gas-charts`'s own files, `clasp push` will succeed but running the project will throw:

```txt
ReferenceError: GasCharts is not defined
```

To avoid this, add a [`filePushOrder`](https://github.com/google/clasp#filepushorder-optional) entry to your project's `.clasp.json` that pushes `gas-charts`'s module files ahead of any file that references them:

```json
{
  "filePushOrder": [
    "src/lib/gas-charts/gas-charts.constants.js",
    "src/lib/gas-charts/generated/gas-charts.echarts.js",
    "src/lib/gas-charts/generated/gas-charts.client.js",
    "src/lib/gas-charts/gas-charts.main.js"
  ]
}
```

Use the path where the files land in your pushed project, e.g. `src/lib/gas-charts/...` when pushing the subtree as-is.

Alternatively, you can manually move these files to the top of the file list in the Apps Script editor.

With gasdev bundle, the single entry is the bundle file, e.g. `src/lib/gas-libraries.js` (adjusted for `rootDir`).

> **Note:**
> Any file in your own project that calls `GasCharts` at the top level (e.g. outside a function) must be pushed _after_ the entries above. Calls made from inside functions or methods are unaffected, since those only run after every file has already loaded.

#### 6. Import `gas-charts`

To install several gas-\* libraries together, use the [gasdev bundle method](#add-the-library) from the Quick Start; otherwise, add this library with git subtree:

```bash
git subtree add \
  --prefix=src/lib/gas-charts \
  https://github.com/yorsh-co/gas-charts.git \
  dist \
  --squash
```

This creates:

```txt
src/lib/gas-charts/
```

#### 7. Push local files to Apps Script

```bash
clasp push
```

#### 8. Inject ECharts into your page

```js
function doGet() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  return HtmlService.createHtmlOutput(GasCharts.inject(html));
}
```

## Basic Usage

### Inject into an HTML string

```js
function doGet() {
  const html = HtmlService.createHtmlOutputFromFile('index').getContent();
  return HtmlService.createHtmlOutput(GasCharts.inject(html));
}
```

### Use a template

In a template, use the printing scriptlet (`<?!= ?>`, never `<?= ?>`, which escapes the script):

```html
<head>
  <?!= GasCharts.scriptTag() ?>
</head>
```

### Use a marker

In a page with a marker, the first `<!-- gas-charts -->` is replaced by the script tag:

```html
<head>
  <!-- gas-charts -->
</head>
```

### Set a CSP nonce

```js
GasCharts.scriptTag({ nonce });
```

`nonce` must match `[A-Za-z0-9+/_=-]+`; otherwise a `TypeError` is thrown.

### Render a chart in the browser

Unless you pass `client: false`, the injected script also defines `window.GasCharts` after ECharts:

```js
const chart = GasCharts.render('#chart', {
  xAxis: { type: 'category', data: ['A', 'B'] },
  yAxis: {},
  series: [{ type: 'bar', data: [1, 2] }],
});

GasCharts.dispose('#chart');
```

### Ship ECharts without the browser helper

To ship ECharts alone, pass `{ client: false }` to `script`, `scriptTag` or `inject`.

```js
GasCharts.inject(html, { client: false });
```

## Project Details

### Injection rules

`inject(html, options?)` inserts the tag at the first `<!-- gas-charts -->` marker, else before the first `</head>` (case-insensitive), else right after a leading `<!doctype ...>` (case-insensitive), else at the start. First textual occurrence wins: the search is on raw text, not parsed, so a match inside an earlier comment or inline script string counts. `options` are as for `scriptTag`.

### Browser helper

- `GasCharts.render(target, option, options?)`: `target` is an element or a selector. Reuses the chart already attached to the element, otherwise creates one, then applies `option`. Returns the ECharts instance.
- `GasCharts.dispose(target)`: stops resizing and disposes the chart. No-op when there is no chart or a valid selector matches nothing.

| Option       | Default  | Description                                                   |
| ------------ | -------- | ------------------------------------------------------------- |
| `theme`      | none     | ECharts theme name or object, used when the chart is created. |
| `renderer`   | `canvas` | `canvas` or `svg`, used when the chart is created.            |
| `notMerge`   | `false`  | Replace the previous option instead of merging.               |
| `autoResize` | `true`   | Resize the chart with its container via `ResizeObserver`.     |

### Errors

- `scriptTag` and `inject` throw `TypeError` for an invalid `nonce`, a non-string `html` or a non-boolean `client`.
- `render` throws `Error` if the target is not found or `echarts` is not loaded.
- `render` and `dispose` throw the browser's `SyntaxError` from `querySelector` if a string target is an invalid CSS selector.

### Limitations

- Page weight grows by about the size of the ECharts constant (roughly 1 MB).
- Serve the page with `createHtmlOutput` or `<?!= ?>`, not `<?= ?>`, which escapes the script.
- Auto-resize is skipped when `ResizeObserver` is unavailable.

### Entry Point

#### GasCharts

Main entry point for the library. Singleton namespace, not a class — there is no constructor.

##### Members

```js
GasCharts.ECHARTS_VERSION; // vendored ECharts version
GasCharts.script(options); // options is optional; { nonce?, client? } → ECharts source (plus browser helper), safe inside an inline <script>
GasCharts.scriptTag(options); // options is optional; { nonce?, client? } → a complete <script> element
GasCharts.inject(html, options); // options is optional; { nonce?, client? } → html with the tag inserted
```

#### `window.GasCharts` (browser)

```js
GasCharts.render(target, option, options); // options is optional; { theme?, renderer?, notMerge?, autoResize? } → ECharts instance
GasCharts.dispose(target);
```

### Example Workflow

```js
function doGet() {
  const template = HtmlService.createTemplateFromFile('index');
  template.data = [12, 7, 19];
  return template.evaluate();
}
```

```html
<!-- index.html -->
<head>
  <?!= GasCharts.scriptTag() ?>
</head>
<body>
  <div id="chart" style="width: 600px; height: 400px"></div>
  <script>
    const data = <?!= JSON.stringify(data) ?>;

    GasCharts.render('#chart', {
      xAxis: { type: 'category', data: data.map((_, i) => `Item ${i + 1}`) },
      yAxis: {},
      series: [{ type: 'bar', data }],
    });
  </script>
</body>
```

### Peer Type Declarations

Consuming gas-\* libraries can type-check against `GasCharts` without vendoring its source. The canonical declarations live in `peer/gas-charts.peer.types.d.ts` at every `vX.Y.Z` tag. A consuming package lists `gas-charts` under `gasdev.peers` in its `package.json` and runs `gasdev peers sync`. It writes `src/internal/gas-charts.peer.types.d.ts` from the highest tag that satisfies the range, and `gasdev peers sync --check` reports a stale copy. Do not edit the copy.

## Third-party notices

This library bundles Apache ECharts, licensed under the Apache License 2.0.

```
Apache ECharts
Copyright 2017-2026 The Apache Software Foundation

This product includes software developed at
The Apache Software Foundation (https://www.apache.org/).
```

The license banner is preserved at the top of the vendored source.

## Development

The source code is written in TypeScript.

Release builds are compiled to JavaScript before publishing so the distributed library remains compatible with Google Apps Script.

```sh
npm run check # format, lint, types, tests, gasdev check
```

### Generated ECharts source

- `npm run generate` regenerates `src/generated/` from `node_modules/echarts`.
- To upgrade ECharts, bump the pinned `echarts` devDependency, run `npm install` and `npm run generate`, then commit the result. `generate:check` fails until you do.

### Apps Script tests

The Vitest suite runs against fakes. `gas-test/gas-charts.ts` checks in a real Apps Script execution that the vendored ECharts is bundled, that `ECHARTS_VERSION` is semver, and that `HtmlService` serves the injected page. They are built and run with [gasdev](https://github.com/yorsh-co/gasdev#apps-script-tests)'s `gas-test`; see its README for the one-off setup.

- `npm run test:gas:build` writes a single script; paste it into the Apps Script editor and run `runGasTests`.
- `npm run test:gas` pushes it to a dedicated test project with clasp and prints the results. It needs `npx clasp login --extra-scopes https://www.googleapis.com/auth/script.storage` and `GAS_TEST_SCRIPT_ID`; the project's contents are replaced.

### Manual verification

`npm run manual:build` assembles a fixture web app for the live checks in [`manual/README.md`](manual/README.md). Set `MANUAL_CHARTS_SCRIPT_ID` first.

### Release

1. `git config gitflow.prefix.versiontag v`
2. `git flow release start 0.2.0`, then bump `version` in `package.json` and `@version` in the peer types together.
3. `npm run check` and `npm run test:gas`
4. `git flow release finish`
5. `git push origin v0.2.0`
6. `npm run build:release`

### Architecture decisions

- [Embed the full ECharts build](./docs/adr/0001-embed-full-echarts-build.md)
- [Own generator for inline scripts](./docs/adr/0002-own-generator-for-inline-scripts.md)

## License

MIT

See the [`LICENSE.md`](./LICENSE.md) file for details.

## Support

Issues and feature requests are welcome via [GitHub Issues](https://github.com/yorsh-co/gas-charts/issues).

Maintained by [yorsh-co](https://github.com/yorsh-co).

---

> [!TIP]
> Found `gas-charts` useful?
> Find more Google Apps Script libraries at [github.com/yorsh-co](https://github.com/yorsh-co).
