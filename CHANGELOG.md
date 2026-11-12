# Changelog

---

## [Unreleased]

---

## [0.1.0] - 2026-11-12

### Added

- Vendored Apache ECharts 6.1.0 build as an inline-safe generated constant.
- `generate` and `generate:check` scripts to regenerate and verify the vendored constant.
- `GasCharts` server API: `ECHARTS_VERSION`, `script`, `scriptTag` and `inject` (marker, `</head>`, doctype or prepend), with optional CSP `nonce`.
- Peer type declarations and usage docs.
- Browser helper `window.GasCharts` (`render`, `dispose`, auto-resize) shipped after ECharts, with a `client: false` opt-out.
- Manual demo web app, built with `npm run manual:build`.
- Live Apps Script test suite (`npm run test:gas:build`, `npm run test:gas`).
