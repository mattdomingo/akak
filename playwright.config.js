const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './test/e2e',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    ...devices['Desktop Chrome']
  },
  webServer: {
    command: 'npx serve --listen 4173 .',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI
  }
});
