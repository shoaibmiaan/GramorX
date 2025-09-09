import fs from "fs";

const file = "pages/pricing/index.tsx";
if (!fs.existsSync(file)) {
  console.log("missing:", file);
  process.exit(0);
}

let s = fs.readFileSync(file, "utf8");
const before = s;

// Replace Tailwind arbitrary gradient token with our class
// Matches: bg-[ ... linear-gradient(to_bottom,#ffffff,#f8fafc) ]
s = s.replace(/bg-\[[^\]]*linear-gradient\(to_bottom,#ffffff,#f8fafc\)\]/g, "bg-marketing-aurora");

if (s !== before) {
  fs.writeFileSync(file, s, "utf8");
  console.log("updated:", file);
} else {
  console.log("no-op (pattern not found):", file);
}
