import { test, expect } from "@playwright/test";

function seedWorkspace() {
  return () => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  };
}

test("data products page loads with demo data", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/data-products");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await expect(page.getByTestId("data-products-page")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Product" })).toBeVisible();
});

test("widgets page supports preview toggle and publish flow", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/widgets");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await expect(page.getByTestId("widget-preview-toggle")).toBeVisible();
  await page.getByRole("button", { name: "Live parity" }).click();
  await expect(page).toHaveURL(/preview=live/);
  await page.getByRole("button", { name: "Publish…" }).first().click();
  await expect(page.getByTestId("publish-widget-dialog")).toBeVisible();
  await page.getByTestId("publish-widget-dialog").getByRole("button", { name: "Publish widget" }).click();
  await expect(page.getByTestId("publish-widget-dialog")).not.toBeVisible();
});

test("developers page reveal-once API key flow", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/developers");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await page.getByRole("button", { name: "Create API key" }).click();
  await expect(page.getByTestId("create-api-key-dialog")).toBeVisible();
  await page.getByTestId("create-api-key-dialog").getByLabel("Label").fill("Playwright key");
  await page.getByRole("button", { name: "Generate key" }).click();
  await expect(page.getByTestId("api-key-reveal-dialog")).toBeVisible();
  await expect(page.getByTestId("api-key-secret-value")).toContainText("hg_demo_");
  await page.getByRole("button", { name: "I have stored this key" }).click();
  await expect(page.getByTestId("api-key-reveal-dialog")).not.toBeVisible();
  await expect(page.getByRole("cell", { name: /Playwright key/ })).toBeVisible();
});

test("sources empty state offers setup path", async ({ page }) => {
  await page.goto("/sources");
  await expect(page.getByTestId("empty-state-sources-empty")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open setup checklist" })).toBeVisible();
});
