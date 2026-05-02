import { test, expect } from "@playwright/test";

function seedDemoAndOnboarding() {
  return () => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  };
}

test.describe("Phase 1 detail routes", () => {
  test("competition row navigates to detail", async ({ page }) => {
    await page.addInitScript(seedDemoAndOnboarding());
    await page.goto("/competitions");
    await expect(page.getByTestId("view-status")).toContainText("ready");
    await page.getByRole("link", { name: /Open competition Ancient Major/i }).click();
    await expect(page).toHaveURL(/\/competitions\/cmp_100$/);
    await expect(page.getByTestId("competition-detail-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ancient Major" })).toBeVisible();
  });

  test("unknown competition id shows missing empty state", async ({ page }) => {
    await page.addInitScript(seedDemoAndOnboarding());
    await page.goto("/competitions/does_not_exist");
    await expect(page.getByTestId("empty-state-competition-detail-missing")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Competition not found" })).toBeVisible();
  });

  test("unknown match id shows missing empty state", async ({ page }) => {
    await page.addInitScript(seedDemoAndOnboarding());
    await page.goto("/matches/does_not_exist");
    await expect(page.getByTestId("empty-state-match-detail-missing")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Match not found" })).toBeVisible();
  });

  test("unknown source id shows missing empty state", async ({ page }) => {
    await page.addInitScript(seedDemoAndOnboarding());
    await page.goto("/sources/does_not_exist");
    await expect(page.getByTestId("empty-state-source-detail-missing")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Source not found" })).toBeVisible();
  });

  test("breadcrumb back to list restores URL filters", async ({ page }) => {
    await page.addInitScript(seedDemoAndOnboarding());
    await page.goto("/competitions?game=MOBA");
    await page.getByRole("link", { name: /Open competition Rosh Pit Open/i }).click();
    await expect(page).toHaveURL(/\/competitions\/cmp_102/);
    await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Competitions" }).click();
    await expect(page).toHaveURL(/\/competitions/);
    expect(new URL(page.url()).searchParams.get("game")).toBe("MOBA");
  });

  test("after refresh on detail, breadcrumb still restores list filters", async ({ page }) => {
    await page.addInitScript(seedDemoAndOnboarding());
    await page.goto("/competitions?game=MOBA");
    await page.getByRole("link", { name: /Open competition Rosh Pit Open/i }).click();
    await expect(page).toHaveURL(/\/competitions\/cmp_102/);
    await page.reload();
    await expect(page.getByTestId("competition-detail-page")).toBeVisible();
    await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Competitions" }).click();
    expect(new URL(page.url()).searchParams.get("game")).toBe("MOBA");
  });

  test("match row navigates to detail", async ({ page }) => {
    await page.addInitScript(seedDemoAndOnboarding());
    await page.goto("/matches");
    await expect(page.getByTestId("view-status")).toContainText("ready");
    await page.getByRole("link", { name: /Open match Ancient Major Upper bracket/i }).first().click();
    await expect(page).toHaveURL(/\/matches\/m_1001$/);
    await expect(page.getByTestId("match-detail-page")).toBeVisible();
  });

  test("source row navigates to detail", async ({ page }) => {
    await page.addInitScript(seedDemoAndOnboarding());
    await page.goto("/sources");
    await expect(page.getByTestId("view-status")).toContainText("ready");
    await page.getByRole("link", { name: /Open source Spectator Match Feed/i }).click();
    await expect(page).toHaveURL(/\/sources\/src_ok_01$/);
    await expect(page.getByTestId("source-detail-page")).toBeVisible();
  });
});
