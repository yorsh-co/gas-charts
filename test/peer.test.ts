import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadGasCharts } from './harness';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

describe('peer type declarations', () => {
  const peer = readFileSync(
    join(ROOT, 'peer', 'gas-charts.peer.types.d.ts'),
    'utf8',
  );
  const { version } = JSON.parse(
    readFileSync(join(ROOT, 'package.json'), 'utf8'),
  ) as { version: string };

  it('declares the public surface', () => {
    expect(peer).toContain('interface GasChartsScriptOptions');
    expect(peer).toContain('declare const GasCharts');
  });

  it('declares exactly the members of GasCharts', () => {
    const block = /declare const GasCharts: \{([\s\S]*?)^\};/m.exec(peer);
    expect(block).not.toBeNull();
    const declared = [
      ...(block?.[1] ?? '').matchAll(/^ {2}(?:readonly )?(\w+)\b/gm),
    ].map((match) => match[1]);
    const actual = Object.keys(loadGasCharts().exports.GasCharts);
    expect(declared.sort()).toEqual(actual.sort());
  });

  it('matches the package version', () => {
    expect(peer).toMatch(new RegExp(`^ \\* @version ${version}$`, 'm'));
  });
});
