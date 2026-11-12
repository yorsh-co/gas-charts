# 0001. Embed the full ECharts build as a server-side constant

## Status

Accepted

## Context

Apps Script web apps are served as a single inlined page through `HtmlService`, so a charting library normally means a `<script src>` pointing at a CDN. We want charts with no network request to a third party.

## Decision

- ECharts is embedded as a string constant in a `loadOrder` file, so `gasdev bundle` carries it with no extra sync step. The bytes end up in the server script either way, because an inlined page is also a server constant.
- We ship the full, unmodified official build (`node_modules/echarts/dist/echarts.min.js`), pinned to an exact version as a devDependency. There is no bundler. Dependabot bumps the version and `generate:check` fails until the constant is regenerated.

## Consequences

- Page weight is roughly the size of the constant.
- No tree-shaking: consumers get every chart type.
- Upgrading ECharts is a dependency bump plus `npm run generate`.
- The Apache-2.0 license banner stays in the constant and the README carries the NOTICE text.
