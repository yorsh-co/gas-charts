import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SCRIPT = join(ROOT, 'scripts/build-manual-charts.js');
const TSC = join(ROOT, 'node_modules/typescript/bin/tsc');

describe('manual fixture build', () => {
  let tmp: string;
  let out: string;
  let pushOrder: string[];

  const build = (env: NodeJS.ProcessEnv) =>
    execFileSync(process.execPath, [SCRIPT, out, join(tmp, 'dist')], {
      cwd: ROOT,
      env,
      stdio: 'pipe',
    });

  beforeAll(() => {
    tmp = mkdtempSync(join(tmpdir(), 'manual-charts-'));
    out = join(tmp, 'out');
    // Compile into the temp dir: dist/ and src/generated/ stay untouched.
    execFileSync(
      process.execPath,
      [TSC, '-p', join(ROOT, 'tsconfig.json'), '--outDir', join(tmp, 'dist')],
      { cwd: ROOT, stdio: 'pipe' },
    );
    build({ ...process.env, MANUAL_CHARTS_SCRIPT_ID: 'test-script-id' });
    const clasp = JSON.parse(readFileSync(join(out, '.clasp.json'), 'utf8'));
    pushOrder = clasp.filePushOrder;
  }, 120_000);

  afterAll(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  const concatenated = () =>
    pushOrder.map((file) => readFileSync(join(out, file), 'utf8')).join('\n');

  it('pushes the library in load order, then the app', () => {
    expect(pushOrder).toEqual([
      'lib/gas-charts/gas-charts.constants.js',
      'lib/gas-charts/generated/gas-charts.echarts.js',
      'lib/gas-charts/generated/gas-charts.client.js',
      'lib/gas-charts/gas-charts.main.js',
      'app.js',
    ]);
  });

  it('writes the script ID to .clasp.json', () => {
    const clasp = JSON.parse(readFileSync(join(out, '.clasp.json'), 'utf8'));
    expect(clasp.scriptId).toBe('test-script-id');
  });

  it('produces output that parses as one script', () => {
    expect(() =>
      execFileSync(process.execPath, ['--check', '-'], {
        input: concatenated(),
        stdio: ['pipe', 'pipe', 'pipe'],
      }),
    ).not.toThrow();
  });

  it('serves a page with ECharts inlined once, before </head>', () => {
    const html = vm.runInNewContext(
      `${concatenated()}\ndoGet().getContent();`,
      {
        HtmlService: {
          createHtmlOutput: (content: string) => ({
            getContent: () => content,
            setTitle() {
              return this;
            },
          }),
        },
      },
    ) as string;

    expect(html).not.toContain('<!-- gas-charts -->');
    expect(html.split('<script>')).toHaveLength(3);
    expect(html.indexOf('<script>')).toBeLessThan(html.indexOf('</head>'));
    expect(html.lastIndexOf('<script>')).toBeGreaterThan(
      html.indexOf('</head>'),
    );
    expect(html.indexOf('echarts.version')).toBeGreaterThan(
      html.indexOf('</head>'),
    );
    expect(html).toContain("GasCharts.render('#bar'");
    expect(html).toContain("GasCharts.render('#pie'");
  });

  it('fails without a script ID', () => {
    const env = { ...process.env };
    delete env.MANUAL_CHARTS_SCRIPT_ID;
    expect(() => build(env)).toThrow();
  });
});
