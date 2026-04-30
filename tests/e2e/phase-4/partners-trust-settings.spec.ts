import { test, expect } from "@playwright/test";

test("setup nav is available from shell", async ({ page }) => {
  await page.goto("/home");
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Setup", exact: true })
    .click();
  await expect(page).toHaveURL(/\/onboarding/);
});
