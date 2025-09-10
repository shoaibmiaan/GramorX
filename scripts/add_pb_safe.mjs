import fs from "fs";

function addPbSafe(file){
  if(!fs.existsSync(file)) { console.log("skip (missing):", file); return; }
  let s = fs.readFileSync(file,"utf8"), b=s;
  if(/\bpb-safe\b/.test(s)) { console.log("no-op (already has pb-safe):", file); return; }

  // Prefer <main className="...">
  s = s.replace(/<main([^>]*?)className="([^"]*)"/, (m,a,cls)=>`<main${a}className="pb-safe ${cls}"`);

  // If no <main>, target first className that already has min-h-screen
  if(s===b){
    s = s.replace(/className="([^"]*min-h-screen[^"]*)"/, (m,cls)=>`className="pb-safe ${cls}"`);
  }
  // Fallback: first string className
  if(s===b){
    s = s.replace(/className="([^"]*)"/, (m,cls)=>`className="pb-safe ${cls}"`);
  }

  if(s!==b){ fs.writeFileSync(file,s); console.log("updated:", file); }
  else { console.log("no-op (pattern not found):", file); }
}

process.argv.slice(2).forEach(addPbSafe);
