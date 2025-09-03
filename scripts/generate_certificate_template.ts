// scripts/generate_certificate_template.ts
// Usage: npx tsx scripts/generate_certificate_template.ts
import fs from 'node:fs';
import path from 'node:path';

type TemplateMeta = {
  name: string;
  width: number;
  height: number;
  fields: Array<'fullName' | 'band' | 'cohort' | 'issuedAt' | 'certificateId'>;
};

async function main() {
  // For simplicity, we just emit a JSON spec your frontend canvas uses.
  const spec: TemplateMeta = {
    name: 'GramorX-Default',
    width: 1200,
    height: 800,
    fields: ['fullName', 'band', 'cohort', 'issuedAt', 'certificateId'],
  };

  const outDir = path.resolve(process.cwd(), 'cert_templates');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'default.json'), JSON.stringify(spec, null, 2));
  console.log('Wrote cert_templates/default.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
