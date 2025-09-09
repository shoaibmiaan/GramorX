import fs from "fs";

const file = "components/design-system/UserMenu.tsx";
if (!fs.existsSync(file)) {
  console.log("skip (missing):", file);
  process.exit(0);
}

let src = fs.readFileSync(file, "utf8");
const before = src;

// ensure import
if (!/from ['"]next\/image['"]/.test(src)) {
  src = src.replace(/(import .*\n)(?!.*next\/image)/s, (m) => m + "import Image from 'next/image';\n");
}

// replace <img ...> with <Image ... width={40} height={40} />
src = src.replace(/<img\s+([^>]*?)\/?>/g, (m, attrs) => {
  let a = attrs;

  // ensure alt present
  if (!/\balt=/.test(a)) a += ' alt="User avatar"';

  // ensure className keeps its original value (no change)
  // inject width/height if not present (next/image requires)
  if (!/\bwidth=/.test(a)) a += " width={40}";
  if (!/\bheight=/.test(a)) a += " height={40}";

  return `<Image ${a} />`;
});

if (src !== before) {
  fs.writeFileSync(file, src, "utf8");
  console.log("updated:", file);
} else {
  console.log("no-op:", file);
}
