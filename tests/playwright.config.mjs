import { defineConfig, devices } from '@playwright/test';

// アプリ本体 (リポジトリ直下の index.html) を http で配信してテストする。
// chromium は webm、webkit (iPhone の Safari と同じエンジン) は mp4 の動画を使う。
export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.mjs',
  timeout: 120_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://127.0.0.1:8790/', viewport: { width: 390, height: 844 }, acceptDownloads: true },
  webServer: {
    command: 'python3 -m http.server 8790 --bind 127.0.0.1',
    cwd: '..',
    url: 'http://127.0.0.1:8790/index.html',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'webkit', use: { ...devices['iPhone 13'], browserName: 'webkit', viewport: { width: 390, height: 844 } } },
  ],
});
