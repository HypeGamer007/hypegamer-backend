import { test, expect } from "@playwright/test";

test("onboarding completes and lands on home", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });

  await page.goto("/");
  await expect(page).toHaveURL(/\/onboarding/);
  await expect(page.getByTestId("onboarding-wizard")).toBeVisible();

  // Move through the wizard using the primary CTA.
  await page.getByRole("button", { name: "Continue" }).click(); // welcome -> workspace
  await expect(page.getByRole("heading", { name: "Confirm your workspace" })).toBeVisible();

  await page.getByRole("button", { name: "Continue" }).click(); // workspace -> environment
  await expect(page.getByRole("heading", { name: "Choose where you are working" })).toBeVisible();
  await page.getByRole("button", { name: "Sandbox" }).click();

  await page.getByRole("button", { name: "Continue" }).click(); // environment -> connect
  await expect(page.getByRole("heading", { name: "Connect a data source" })).toBeVisible();
  await expect(page.getByText("Choose a source type")).toBeVisible();
  await expect(page.getByText("Authorize access")).toBeVisible();
  await expect(page.getByText("Test the connection")).toBeVisible();

  await page.getByRole("button", { name: "Continue" }).click(); // connect -> verify data
  await expect(page.getByRole("heading", { name: "Load data or continue empty" })).toBeVisible();
  await page.getByRole("button", { name: "Continue without demo data" }).click();

  await page.getByRole("button", { name: "Continue", exact: true }).click(); // verify -> complete
  await expect(page.getByRole("heading", { name: "You are ready" })).toBeVisible();

  await page.getByRole("button", { name: "Finish and open command center" }).click();
  await expect(page).toHaveURL(/\/home/);
  await expect(page.getByTestId("app-shell")).toBeVisible();
  await expect(page.getByTestId("view-status")).toContainText("ready");

  // Value-preserving empty states should show if demo not seeded.
  await expect(page.getByTestId("empty-state-home-sources")).toBeVisible();
  await expect(page.getByTestId("empty-state-home-competitions")).toBeVisible();
});

