import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const routes = ['/', '/pricing', '/study-plan'];
for (const path of routes) {
  test(`a11y: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(/.+/);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a','wcag2aa'])
      .analyze();
    const violations = results.violations.filter(v => ['serious','critical'].includes(v.impact || 'minor'));
    if (violations.length) console.log(JSON.stringify(violations, null, 2));
    expect(violations, `Axe serious/critical violations on ${path}`).toHaveLength(0);
  });
}
