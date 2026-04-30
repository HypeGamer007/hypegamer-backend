import { test, expect } from "@playwright/test";

test.describe("phase 1 source actions", () => {
  test("pause source opens dialog and does not navigate row", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("hypegamer_demo_seeded", "1");
      localStorage.setItem("hypegamer_onboarding_complete", "1");
      localStorage.removeItem("hypegamer_source_overrides_v1");
    });

    await page.goto("/sources");
    await expect(page.getByTestId("view-status")).toContainText("ready");

    await page.getByRole("button", { name: /Pause source Official Event Feed/i }).click();
    await expect(page.getByTestId("pause-source-dialog")).toBeVisible();

    // Confirm pause and ensure we remain on list (button should stop row navigation).
    await page.getByTestId("pause-source-dialog").getByRole("button", { name: "Pause source" }).click();
    await expect(page).toHaveURL(/\/sources$/);

    // Row now shows paused status.
    const row = page.getByRole("link", { name: /Open source Official Event Feed/i });
    await expect(row.getByRole("cell").nth(1)).toHaveText("paused");
  });
});

