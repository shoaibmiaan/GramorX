import fs from "fs";
import path from "path";

function ensureImport(content, what = "Image", from = "next/image") {
  if (content.includes(`from '${from}'`) || content.includes(`from "${from}"`)) return content;
  // place after first import block
  const lines = content.split("\n");
  let lastImportIdx = -1;
  for (let i = 0; i < lines.length; i++) if (lines[i].startsWith("import ")) lastImportIdx = i;
  if (lastImportIdx >= 0) {
    lines.splice(lastImportIdx + 1, 0, `import ${what} from '${from}';`);
    return lines.join("\n");
  }
  return `import ${what} from '${from}';\n` + content;
}

function patch(file, replacer) {
  if (!fs.existsSync(file)) { console.log("skip (missing):", file); return; }
  let src = fs.readFileSync(file, "utf8");
  const before = src;
  src = ensureImport(src);

  src = replacer(src);

  if (src !== before) {
    fs.writeFileSync(file, src, "utf8");
    console.log("updated:", file);
  } else {
    console.log("no-op (pattern not found):", file);
  }
}

/* A) pages/placement/run.tsx */
patch("pages/placement/run.tsx", (s) => {
  // tighten class tokens while replacing
  s = s.replace(
    /<img\s+src=\{chartImg\}[\s\S]*?alt="Task 1 chart"[\s\S]*?\/>/,
`<Image
  src={chartImg}
  alt="Task 1 chart"
  width={800}
  height={400}
  className="mt-3 rounded-ds border border-border"
  priority
/>`
  );
  return s;
});

/* B) pages/profile/index.tsx */
patch("pages/profile/index.tsx", (s) => {
  s = s.replace(
    /<img\s+src=\{profile\.avatar_url\}[\s\S]*?alt="Avatar"[\s\S]*?\/>/,
`<Image
  src={profile.avatar_url || '/brand/logo.png'}
  alt="Avatar"
  width={80}
  height={80}
  className="h-20 w-20 rounded-full object-cover"
/>`
  );
  return s;
});

/* C) pages/profile/setup.tsx */
patch("pages/profile/setup.tsx", (s) => {
  s = s.replace(
    /<img\s+src=\{avatarUrl\}[\s\S]*?alt="Avatar preview"[\s\S]*?\/>/,
`<Image
  src={avatarUrl || '/brand/logo.png'}
  alt="Avatar preview"
  width={80}
  height={80}
  className="mb-3 h-20 w-20 rounded-full object-cover ring-2 ring-primary/40"
/>`
  );
  return s;
});

/* D) pages/blog/[slug].tsx */
patch("pages/blog/[slug].tsx", (s) => {
  s = s.replace(
    /\{post\.hero_image_url\s*\?\s*<img[\s\S]*?post\.hero_image_url[\s\S]*?>\s*:\s*null\s*\}/,
`{post.hero_image_url ? (
  <div className="relative w-full h-64 sm:h-80 lg:h-[28rem]">
    <Image
      src={post.hero_image_url}
      alt={post.title || 'Blog hero'}
      fill
      sizes="(min-width: 1024px) 1024px, 100vw"
      className="object-cover"
      priority
    />
  </div>
) : null}`
  );
  return s;
});

/* E) pages/learning/[slug].tsx */
patch("pages/learning/[slug].tsx", (s) => {
  s = s.replace(
    /<img\s+src=\{course\.thumbnail_url\}[\s\S]*?alt=""[\s\S]*?\/>/,
`<div className="relative h-64 w-full">
  <Image
    src={course.thumbnail_url}
    alt={course.title || 'Course thumbnail'}
    fill
    sizes="(min-width: 1024px) 1024px, 100vw"
    className="object-cover"
  />
</div>`
  );
  return s;
});

/* next.config.mjs — ensure images.remotePatterns exists */
const cfg = "next.config.mjs";
if (fs.existsSync(cfg)) {
  let txt = fs.readFileSync(cfg, "utf8");
  if (!/images:\s*\{[\s\S]*remotePatterns/.test(txt)) {
    txt = txt.replace(
      /const\s+nextConfig\s*=\s*\{\s*/m,
      `const nextConfig = {\n  images: {\n    remotePatterns: [\n      { protocol: 'https', hostname: '**.supabase.co' },\n      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },\n      { protocol: 'https', hostname: 'res.cloudinary.com' },\n      { protocol: 'https', hostname: 'images.unsplash.com' },\n    ],\n  },\n`
    );
    fs.writeFileSync(cfg, txt, "utf8");
    console.log("updated:", cfg, "(added images.remotePatterns)");
  } else {
    console.log("no-op (images.remotePatterns present):", cfg);
  }
} else {
  console.log("skip (missing):", cfg);
}
