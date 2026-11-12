import { describe, expect, it } from 'vitest';
import { loadGasCharts } from './harness';

describe('GasCharts.inject', () => {
  const { GasCharts, GAS_CHARTS_MARKER } = loadGasCharts().exports;
  const tag = GasCharts.scriptTag();
  const count = (text: string, needle: string): number =>
    text.split(needle).length - 1;

  it('replaces the marker', () => {
    const html = `<head>${GAS_CHARTS_MARKER}</head>`;
    expect(GasCharts.inject(html)).toBe(`<head>${tag}</head>`);
  });

  it('replaces only the first marker', () => {
    const html = `${GAS_CHARTS_MARKER}|${GAS_CHARTS_MARKER}`;
    expect(GasCharts.inject(html)).toBe(`${tag}|${GAS_CHARTS_MARKER}`);
  });

  it('prefers the marker over </head>', () => {
    const html = `<head></head><body>${GAS_CHARTS_MARKER}</body>`;
    expect(GasCharts.inject(html)).toBe(`<head></head><body>${tag}</body>`);
  });

  it('inserts before </head> case-insensitively', () => {
    expect(GasCharts.inject('<HEAD><title>t</title></HEAD><body>')).toBe(
      `<HEAD><title>t</title>${tag}</HEAD><body>`,
    );
  });

  it('puts the tag before </head> after a doctype', () => {
    expect(GasCharts.inject('<!doctype html><head></head>')).toBe(
      `<!doctype html><head>${tag}</head>`,
    );
  });

  it('replaces the marker after a doctype', () => {
    expect(GasCharts.inject(`<!doctype html>${GAS_CHARTS_MARKER}`)).toBe(
      `<!doctype html>${tag}`,
    );
  });

  it.each(['<!DOCTYPE html>', '<!doctype html>', '\uFEFF \n<!DocType html>'])(
    'inserts after the doctype %j when there is no marker or head',
    (doctype) => {
      expect(GasCharts.inject(`${doctype}<body></body>`)).toBe(
        `${doctype}${tag}<body></body>`,
      );
    },
  );

  it('prepends when there is no marker or head', () => {
    expect(GasCharts.inject('<div></div>')).toBe(`${tag}<div></div>`);
  });

  it('keeps $ sequences in the page and the source intact', () => {
    const html = `<head></head><p>$& $1 $$ $\`</p>`;
    const out = GasCharts.inject(html);
    expect(out).toBe(`<head>${tag}</head><p>$& $1 $$ $\`</p>`);
  });

  it('passes the nonce through', () => {
    expect(GasCharts.inject('<p>', { nonce: 'abc' })).toMatch(
      /^<script nonce="abc">/,
    );
  });

  it('adds exactly one closing script tag', () => {
    const html = '<head><script>1</script></head>';
    expect(count(GasCharts.inject(html), '</script>')).toBe(
      count(html, '</script>') + 1,
    );
  });

  it.each([undefined, null, 5, {}])('throws on non-string %j', (value) => {
    const call = () => GasCharts.inject(value as unknown as string);
    expect(call).toThrow(TypeError);
    expect(call).toThrow(/^\[GasCharts\] html must be a string/);
  });
});
