import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

for (const sample of [
  {
    slug: "tindahan-ni-nena",
    code: "NENA-DEMO",
    cta: "Ask about stock",
    submit: "Send stock inquiry",
    confirmed: "Stock inquiry received",
  },
  {
    slug: "circuito-repair-lab",
    code: "CIRCUITO-DEMO",
    cta: "Book a diagnostic",
    submit: "Confirm booking",
    confirmed: "Booking confirmed",
  },
]) {
  test(sample.slug + " supports its category action", async ({ page }) => {
    const route = "/businesses/" + sample.slug;
    await page.goto(route);
    await page.getByRole("link", { name: "Claim this business" }).click();
    await page.getByLabel("Merchant username").fill("kanto-merchant");
    await page.getByLabel("Password").fill("local-kanto62-demo");
    await page.getByLabel("Ownership verification code").fill(sample.code);
    await page.getByRole("button", { name: "Verify and claim" }).click();
    await page.getByRole("button", { name: "Publish storefront" }).click();
    await expect(page.getByText("Storefront published.")).toBeVisible();
    await page.getByRole("link", { name: /View public storefront/ }).click();
    await page.getByRole("link", { name: sample.cta }).click();
    if (sample.slug === "tindahan-ni-nena") {
      await page
        .getByRole("combobox", { name: "Item", exact: true })
        .selectOption({ index: 1 });
    } else {
      // Repair appointments are closed on Sundays. Pick the next Wednesday in Manila.
      const local = new Date(Date.now() + 8 * 3600000);
      local.setUTCDate(
        local.getUTCDate() + ((3 - local.getUTCDay() + 6) % 7) + 1,
      );
      await page
        .getByLabel("Visit date")
        .fill(local.toISOString().slice(0, 10));
      await page.getByRole("button", { name: "Find times" }).click();
      await page.getByLabel("Available time").selectOption({ index: 1 });
    }
    await page.getByLabel("Your name").fill("Sample Resident");
    await page.getByLabel("Email address").fill("resident@example.test");
    await page.getByRole("button", { name: sample.submit }).click();
    await expect(
      page.getByRole("heading", { name: sample.confirmed }),
    ).toBeVisible();
  });
}
test("browse, verify ownership, publish a draft, and book as a guest", async ({
  page,
  browser,
}, info) => {
  const capture = async (name: string) => {
    const dir = process.env.KANTO62_SCREENSHOTS || info.outputDir;
    await mkdir(dir, { recursive: true });
    await page.screenshot({ path: join(dir, name + ".png"), fullPage: true });
  };
  await page.goto("/directory");
  await expect(
    page.getByRole("heading", { name: "Neighborhood directory" }),
  ).toBeVisible();
  await capture("directory-desktop");
  await page.setViewportSize({ width: 360, height: 800 });
  await expect(
    page.getByRole("button", { name: "Search", exact: true }),
  ).toBeInViewport();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(360);
  await capture("directory-phone");
  await page.getByRole("link", { name: "Food & dining" }).click();
  await page.getByRole("link", { name: /Salo.Salo Inasal/i }).click();
  await page.getByRole("link", { name: "Claim this business" }).click();
  await page.getByLabel("Merchant username").fill("kanto-merchant");
  await page.getByLabel("Password").fill("local-kanto62-demo");
  await page.getByLabel("Ownership verification code").fill("SALO-DEMO");
  await page.getByRole("button", { name: "Verify and claim" }).click();
  await expect(
    page.getByRole("heading", { name: "Edit storefront" }),
  ).toBeVisible();
  const copy =
    "Charcoal-grilled inasal with calamansi rice, served at our Davao counter.";
  await page.getByLabel("Business description").fill(copy);
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText("Draft saved.")).toBeVisible();
  const guest = await browser.newContext({ javaScriptEnabled: false });
  try {
    const listing = await guest.newPage();
    await listing.goto("http://127.0.0.1:3162/businesses/salo-salo-inasal");
    await expect(listing.getByText(copy)).toHaveCount(0);
    await page.getByRole("button", { name: "Publish storefront" }).click();
    await expect(page.getByText("Storefront published.")).toBeVisible();
    await listing.reload();
    await expect(listing.getByText(copy)).toBeVisible();
    await expect(
      listing.getByRole("link", { name: "Reserve a table" }),
    ).toBeVisible();
  } finally {
    await guest.close();
  }
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Merchant breadcrumb" })
    .getByRole("link", { name: "Salo-Salo Inasal", exact: true })
    .click();
  await capture("published-storefront-phone");
  await page.getByRole("link", { name: "Reserve a table" }).click();
  await page.getByLabel("Party size").fill("2");
  await page.getByRole("button", { name: "Find times" }).click();
  await page.getByLabel("Available time").selectOption({ index: 1 });
  await page.getByLabel("Your name").fill("Sample Guest");
  await page.getByLabel("Email address").fill("guest@example.test");
  await page.getByRole("button", { name: "Confirm booking" }).click();
  await expect(
    page.getByRole("heading", { name: "Booking confirmed" }),
  ).toBeVisible();
  await capture("guest-confirmation-phone");
});
