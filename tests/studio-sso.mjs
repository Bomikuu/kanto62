// Run against the separately provisioned, loopback-only SSO pilot.
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const context = await browser.newContext();
const page = await context.newPage();
page.setDefaultTimeout(12000);
const hub = process.env.KANTO62_WEB_ORIGIN || "http://localhost:3063";
try {
  await page.goto(hub + "/merchant");
  await page.getByRole("button", { name: "Sign in to the pilot" }).click();
  await page.locator("#username").fill("pilot-owner");
  await page.locator("#password").fill("local-studio-demo");
  await page.locator("#kc-login").click();
  await page.waitForURL(hub + "/merchant**");
  if (
    await page
      .getByRole("button", { name: "Link my merchant account" })
      .isVisible()
  ) {
    await page
      .getByLabel("Existing merchant username")
      .fill("studio-demo-merchant");
    await page.getByLabel("Merchant password").fill("local-workspace-demo");
    await page
      .getByRole("button", { name: "Link my merchant account" })
      .click();
  }
  await page
    .getByRole("heading", { name: "Apps for Studio Demo Eatery" })
    .waitFor();
  const productPages = [];
  for (const [app, origin] of [
    ["PixelCore", "http://pixelcore.localhost:8463"],
    ["Website Builder", "http://builder.localhost:8464"],
  ]) {
    await page
      .getByRole("button", { name: "Open " + app, exact: true })
      .click();
    await page.waitForURL(origin + "/workspace/");
    const tab = await context.newPage();
    await tab.goto(origin + "/workspace/");
    productPages.push(tab);
    if (app === "PixelCore")
      await tab
        .getByRole("heading", { name: "Studio Demo Eatery bookings" })
        .waitFor();
    else {
      const id = await tab.locator("#editor").getAttribute("data-site");
      const reply = await tab.request.get(
        origin + "/api/website-builder/sites/" + id + "/",
      );
      assert.equal(reply.status(), 200);
      await tab.getByLabel("Website canvas", { exact: true }).waitFor();
    }
    await page.goto(hub + "/merchant");
  }
  await page.getByLabel(/^Merchant account menu/).click();
  await page
    .getByRole("button", { name: "Sign out of all studio apps" })
    .click();
  await page.waitForURL(hub + "/merchant");
  await page.getByRole("button", { name: "Sign in to the pilot" }).waitFor();
  for (const tab of productPages)
    assert.equal((await tab.reload()).status(), 403);
  console.log(
    "Verified one broker sign-in, two distinct product sessions, native workspace reads, and global logout.",
  );
} catch (e) {
  // Only page titles and headings are reported. Callback URLs and tokens stay private.
  console.error(
    "Screen:",
    await page.title().catch(() => ""),
    new URL(page.url()).pathname,
    await page
      .locator("h1")
      .allTextContents()
      .catch(() => []),
  );
  throw e;
} finally {
  await browser.close();
}
