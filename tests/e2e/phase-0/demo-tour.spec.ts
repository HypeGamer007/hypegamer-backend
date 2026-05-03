import { test, expect } from "@playwright/test";

test("full MOBA demo tour seeds sandbox, checklist flags, and webhook sample", async ({ page }) => {
  await page.goto("/home");
  await page.getByTestId("setup-run-full-demo-tour").click();
  await expect(page).toHaveURL(/\/home#workspace-story$/);
  await expect(page.locator("#workspace-story")).toBeFocused({ timeout: 10_000 });
  const seeded = await page.evaluate(() => localStorage.getItem("hypegamer_demo_seeded"));
  expect(seeded).toBe("1");
  const onboarding = await page.evaluate(() => localStorage.getItem("hypegamer_onboarding_complete"));
  expect(onboarding).toBe("1");
  const endpoints = await page.evaluate(() => localStorage.getItem("hypegamer_webhook_endpoints_v1"));
  expect(endpoints).toContain("wh_ep_moba_full_tour");
  const logs = await page.evaluate(() => localStorage.getItem("hypegamer_webhook_delivery_log_v1"));
  expect(logs).toContain("widget_published");
  await expect(page.getByTestId("home-page")).toBeVisible();
});
