import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/**
 * Apps Script derives a project's OAuth scopes by scanning its code for
 * service names, so one reference here would ask every consumer for an extra
 * scope. The library returns strings and uses no Apps Script service.
 */
const FORBIDDEN = [
  'SpreadsheetApp',
  'DocumentApp',
  'SlidesApp',
  'FormApp',
  'DriveApp',
  'GmailApp',
  'MailApp',
  'CalendarApp',
  'Session',
  'ScriptApp',
  'PropertiesService',
  'UrlFetchApp',
  'CacheService',
  'HtmlService',
  'LockService',
  'ContentService',
  'Utilities',
  'Charts',
  'LanguageApp',
  'XmlService',
  'Jdbc',
  'CardService',
  'ContactsApp',
  'GroupsApp',
  'SitesApp',
  'Maps',
];

/** Every shipped `.ts` source: all of `src/` except `.d.ts`. */
function shippedSources(directory = join(ROOT, 'src')): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return shippedSources(path);
    }
    return path.endsWith('.ts') && !path.endsWith('.d.ts') ? [path] : [];
  });
}

/** Identifier names referenced in `source`; comments and strings are excluded. */
function identifiers(source: string): Set<string> {
  const names = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node)) {
      names.add(node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(
    ts.createSourceFile(
      'source.ts',
      source,
      ts.ScriptTarget.ES2020,
      true,
      ts.ScriptKind.TS,
    ),
  );
  return names;
}

/** Whole-word occurrences of `name` in raw text, comments and strings included. */
function mentions(source: string, name: string): boolean {
  return new RegExp(`\\b${name}\\b`).test(source);
}

describe('OAuth scopes', () => {
  const files = shippedSources();
  const referenced = files.map((file) => ({
    file,
    names: identifiers(readFileSync(file, 'utf8')),
  }));

  it('finds the sources to scan', () => {
    const names = files.map((file) =>
      relative(ROOT, file).split(sep).join('/'),
    );
    expect(names).toContain('src/gas-charts.main.ts');
    expect(names.some((name) => name.endsWith('.d.ts'))).toBe(false);
  });

  it.each(FORBIDDEN)('never references %s in the code that ships', (name) => {
    const offenders = referenced
      .filter(({ names }) => names.has(name))
      .map(({ file }) => relative(ROOT, file));

    expect(offenders).toEqual([]);
  });

  it.each(FORBIDDEN)(
    'never mentions %s anywhere in the shipped source text',
    (name) => {
      const offenders = files
        .filter((file) => mentions(readFileSync(file, 'utf8'), name))
        .map((file) => relative(ROOT, file));

      expect(offenders).toEqual([]);
    },
  );

  it('catches a reference in code but ignores comments', () => {
    expect(
      identifiers('HtmlService.createHtmlOutput();').has('HtmlService'),
    ).toBe(true);
    expect(
      identifiers('// HtmlService.create()\nconst a = 1;').has('HtmlService'),
    ).toBe(false);
  });
});
