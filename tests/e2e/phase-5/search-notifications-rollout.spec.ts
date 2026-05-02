import { test, expect } from "@playwright/test";

function seedWorkspace() {
  return () => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  };
}

test("home loading fixture shows skeleton state", async ({ page }) => {
  await page.goto("/home?fixture=loading");
  await expect(page.getByTestId("view-status")).toContainText("loading");
});

test("search mock returns results for ancient query", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/search?q=ancient");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await expect(page.getByTestId("search-results")).toBeVisible();
  await expect(page.getByRole("link", { name: "Ancient Major" })).toBeVisible();
});

test("notifications menu opens with demo items", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/home");
  await expect(page.getByTestId("home-workspace-story")).toBeVisible();
  await page.getByTestId("notifications-menu-trigger").click();
  await expect(page.getByTestId("notifications-menu-panel")).toBeVisible();
  await expect(page.getByRole("link", { name: /Trust: net worth swing triaged/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Widgets: live GPM ribbon still blocked/ })).toBeVisible();
});
