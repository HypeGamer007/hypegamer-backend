import { test, expect } from "@playwright/test";

test("home loading fixture shows skeleton state", async ({ page }) => {
  await page.goto("/home?fixture=loading");
  await expect(page.getByTestId("view-status")).toContainText("loading");
});
