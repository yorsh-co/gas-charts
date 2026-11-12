# Manual checks

The unit tests cannot prove that a real Apps Script project accepts the roughly 1 MB ECharts script file and serves the inlined page. This folder holds a small web app that does, and the checklist to run against it.

The fixture is `app.js` and `appsscript.json`. `npm run manual:build` assembles it with the compiled library into `.manual-charts/`, which `clasp` pushes. `appsscript.json` declares no `oauthScopes`; the library uses no Apps Script service.

> **Warning:**
> The web app deploys with **Execute as: Me** and **access: Only myself**. Use a throwaway project and archive the deployment when the checks are done.

## Setup

1. Create a standalone Apps Script project and copy its script ID (Project Settings).
2. Log in to clasp and enable the Apps Script API, once: `npx clasp login`.
3. Build and push. The script ID stays in your environment and is never written to the repository:

   ```bash
   export MANUAL_CHARTS_SCRIPT_ID=<script id>
   npm run manual:build
   cd .manual-charts
   npx clasp push --force
   ```

4. In the editor, Deploy, Test deployments, and open the `/dev` web app URL.

## What to look for

1. The push succeeds, which shows Apps Script accepts the large generated file.
2. The page shows the ECharts version and two charts: a bar chart and a pie chart.
3. Resize the window: both charts follow it.
4. DevTools, Network: no request goes outside `*.google.com` and `*.googleusercontent.com`. In particular there is no request to a CDN.

## Live test

`npm run test:gas` runs `gas-test/gas-charts.ts` in a real project through `clasp run`. It needs credentials, so it is not part of `npm run check`:

```bash
GAS_TEST_SCRIPT_ID=<script id> npm run test:gas
```
