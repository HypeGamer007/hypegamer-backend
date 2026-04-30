import { test, expect } from "@playwright/test";

test("onboarding connect step shows numbered substeps", async ({ page }) => {
  await page.goto("/onboarding");
  await page.locator('[data-onboarding-step="connect_source"]').click();
  await expect(page.getByText("Choose a source type")).toBeVisible();
  await expect(page.getByText("Authorize access")).toBeVisible();
});

test("entities directory loads with demo seeded", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  });
  await page.goto("/entities");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await expect(page.getByTestId("entities-page")).toBeVisible();
  await page.getByRole("link", { name: /Open entity Rocket City Crew/i }).click();
  await expect(page).toHaveURL(/\/entities\/team_100$/);
  await expect(page.getByTestId("entity-detail-page")).toBeVisible();
});

test("identity page links account and revokes consent", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
    localStorage.removeItem("hypegamer_identity_linked_v1");
    localStorage.removeItem("hypegamer_identity_consent_v1");
  });
  await page.goto("/identity");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await expect(page.getByTestId("identity-page")).toBeVisible();

  await page.getByRole("button", { name: "Link Steam (demo)" }).click();
  await expect(page.getByText("STEAM", { exact: true })).toBeVisible();

  const firstRow = page.locator("tbody tr").first();
  await firstRow.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByTestId("revoke-consent-dialog")).toBeVisible();
  await page.getByTestId("revoke-consent-dialog").getByRole("button", { name: "Revoke consent" }).click();
  await expect(firstRow.getByRole("cell").nth(1)).toHaveText("revoked");
});
