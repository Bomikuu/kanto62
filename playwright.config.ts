import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://127.0.0.1:3162",
    viewport: { width: 1365, height: 900 },
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    },
  },
  webServer: [
    {
      command: "bash tests/pilot-api.sh",
      url: "http://127.0.0.1:8162/api/v1/businesses/",
      reuseExistingServer: false,
    },
    {
      command: "npm run start -- --hostname 127.0.0.1 --port 3162",
      url: "http://127.0.0.1:3162/directory",
      env: { KANTO62_API_URL: "http://127.0.0.1:8162/api/v1" },
      reuseExistingServer: false,
    },
  ],
});
