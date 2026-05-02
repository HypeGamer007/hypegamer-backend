import { test, expect } from "@playwright/test";

function seedWorkspace() {
  return () => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
    localStorage.removeItem("hypegamer_source_overrides_v1");
  };
}

test("notifications panel closes on Escape and restores focus to trigger", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/home");
  const trigger = page.getByTestId("notifications-menu-trigger");
  await trigger.click();
  await expect(page.getByTestId("notifications-menu-panel")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("notifications-menu-panel")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("pause source dialog closes on Escape", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/sources");
  await page.getByRole("button", { name: /Pause source Spectator Match Feed/i }).click();
  await expect(page.getByTestId("pause-source-dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("pause-source-dialog")).toHaveCount(0);
});

test("trust disposition dialog traps Tab within dialog", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/trust");
  await page.getByRole("row", { name: /Net worth swing/ }).getByRole("button", { name: "Disposition…" }).click();
  const dialog = page.getByTestId("trust-disposition-dialog");
  await expect(dialog).toBeVisible();
  const markBtn = dialog.getByRole("button", { name: "Mark triaged" });
  const cancelBtn = dialog.getByRole("button", { name: "Cancel" });
  await cancelBtn.focus();
  await page.keyboard.press("Tab");
  await expect(markBtn).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(cancelBtn).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});
