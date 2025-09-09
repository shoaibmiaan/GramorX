import fs from "fs";
import path from "path";

const ROOT = process.cwd();
// Tweak directories if needed (we avoid emails/DS here).
const DIRS = ["pages", "components", "layouts", "premium-ui", "common"];
const EXT_OK = new Set([".tsx", ".ts", ".jsx", ".js"]);

const SKIP_DIRS = new Set([
  "node_modules",".next",".storybook","public","docs","emails","design-system"
]);

const files = [];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (EXT_OK.has(path.extname(p))) files.push(p);
  }
}

// collect files
for (const d of DIRS) if (fs.existsSync(d)) walk(path.join(ROOT, d));

let changed = 0;
for (const f of files) {
  let src = fs.readFileSync(f, "utf8");
  const before = src;

  // 1) focus:ring-*  → focus-visible:ring-*
  //    also catches dark:focus:ring-* → dark:focus-visible:ring-*
  src = src.replace(/(\b)focus:ring-/g, "$1focus-visible:ring-");

  // 2) focus:outline-none → focus-visible:outline-none
  src = src.replace(/(\b)focus:outline-none/g, "$1focus-visible:outline-none");

  // 3) Ensure ring offset is present on lines that now have a ring width
  //    We only add offsets when there is a ring width (e.g., ring-2 or ring-[2px])
  src = src
    .split("\n")
    .map((line) => {
      if (
        line.includes("focus-visible:ring-") &&
        !line.includes("ring-offset-") &&
        /focus-visible:ring-(?:\d|\[)/.test(line) // numeric or arbitrary width
      ) {
        return (
          line +
          " focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        );
      }
      return line;
    })
    .join("\n");

  if (src !== before) {
    fs.writeFileSync(f, src, "utf8");
    changed++;
    console.log("updated", f);
  }
}

console.log("files changed:", changed);
