import { defineConfig } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  retries: 0,
  use: { baseURL: BASE, headless: true },
  webServer: process.env.BASE_URL ? undefined : {
    command: 'npm run start',
    url: 'http://localhost:3000',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
