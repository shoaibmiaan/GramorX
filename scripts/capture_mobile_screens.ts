import { chromium, devices } from "playwright";
const BASE = process.env.BASE || "http://localhost:3000";
const routes = ["/", "/pricing", "/listening", "/reading"];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ...devices["Pixel 5"] });
  const page = await context.newPage();

  for (const r of routes) {
    const url = `${BASE}${r}`;
    const slug = r === "/" ? "home" : r.replace(/^\//, "").replace(/[\/\[\]]/g, "-");
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `docs/audit/screens/${slug}-mobile.png`, fullPage: true });
    console.log(`Saved docs/audit/screens/${slug}-mobile.png`);
  }

  await browser.close();
})();
