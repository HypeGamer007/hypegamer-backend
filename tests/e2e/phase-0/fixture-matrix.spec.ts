import { test, expect } from "@playwright/test";

test.describe("phase 0 fixture matrix", () => {
  test("home denied fixture renders denied empty state", async ({ page }) => {
    await page.goto("/home?fixture=denied");
    await expect(page.getByTestId("view-status")).toContainText("denied");
    await expect(page.getByTestId("empty-state-home-denied")).toBeVisible();
  });

  test("onboarding denied fixture renders denied empty state", async ({ page }) => {
    await page.goto("/onboarding?fixture=denied");
    await expect(page.getByTestId("view-status")).toContainText("denied");
    await expect(page.getByTestId("empty-state-onboarding-denied")).toBeVisible();
  });
});

