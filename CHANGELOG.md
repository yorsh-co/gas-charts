# Changelog

---

## [Unreleased]

### Added

- Vendored Apache ECharts 6.1.0 build as an inline-safe generated constant.
- `generate` and `generate:check` scripts to regenerate and verify the vendored constant.
- `GasCharts` server API: `ECHARTS_VERSION`, `script`, `scriptTag` and `inject` (marker, `</head>`, doctype or prepend), with optional CSP `nonce`.
- Peer type declarations and usage docs.
