// scripts/l10n_extract.ts
// Usage: npx tsx scripts/l10n_extract.ts
import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['pages', 'components'];
const LOCALES = ['en', 'ur'];

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, files);
    else if (/\.(tsx?|mdx?)$/.test(entry.name)) files.push(p);
  }
  return files;
}

function findKeys(filePath: string): string[] {
  const src = fs.readFileSync(filePath, 'utf8');
  const regex = /\bt\(\s*["'`](.+?)["'`]\s*\)/g; // naive but effective
  const keys: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(src))) keys.push(m[1]);
  return keys;
}

function loadLocale(locale: string): Record<string, string> {
  const p = path.join('locales', locale, 'common.json');
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function main() {
  const files = ROOTS.flatMap((r) => (fs.existsSync(r) ? walk(r) : []));
  const keys = new Set<string>();
  files.forEach((f) => findKeys(f).forEach((k) => keys.add(k)));

  console.log(`Scanned ${files.length} files; found ${keys.size} t("…") keys.`);

  for (const locale of LOCALES) {
    const dict = loadLocale(locale);
    const missing = [...keys].filter((k) => !(k in dict));
    console.log(`\n[${locale}] missing keys (${missing.length}):`);
    missing.forEach((k) => console.log(`  - ${k}`));
  }
}

main();
