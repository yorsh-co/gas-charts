# gas-charts

## Peer types

`peer/gas-charts.peer.types.d.ts` is the canonical ambient declaration of the public surface, copied into consuming packages.

- Its `@version` header tracks `package.json` `version`. Every version bump (release or hotfix) updates both in the same commit.
- Any change to the public surface in `src/` (`GasChartsScriptOptions` or `GasCharts`'s public members) is mirrored in the peer file, JSDoc included. Internal helpers stay out.
