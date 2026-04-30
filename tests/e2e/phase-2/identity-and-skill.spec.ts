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
    localStorage.removeItem("hypegamer_identity_audit_v1");
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
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const raw = localStorage.getItem("hypegamer_identity_audit_v1");
        if (!raw) return 0;
        try {
          return (JSON.parse(raw) as unknown[]).length;
        } catch {
          return 0;
        }
      }),
    )
    .toBe(1);
  await expect(page.getByTestId("identity-audit-log").locator("tbody tr")).toHaveCount(1);
  await expect(page.getByTestId("identity-audit-log")).toContainText("Consent");
});

test("entity merge is reviewer-only and writes audit banner on target", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  });
  await page.goto("/entities/player_201?role=integrity_reviewer");
  await page.evaluate(() => localStorage.removeItem("hypegamer_entity_merge_audit_v1"));
  await expect(page.getByTestId("entity-merge-confirm-open")).toBeVisible();
  await page.getByTestId("entity-merge-confirm-open").click();
  await page.getByTestId("entity-merge-confirm-dialog").getByRole("button", { name: "Apply merge" }).click();
  await expect(page).toHaveURL(/\/entities\/player_200$/);
  await page.waitForFunction(() => {
    try {
      const raw = localStorage.getItem("hypegamer_entity_merge_audit_v1");
      return Boolean(raw && (JSON.parse(raw) as unknown[]).length > 0);
    } catch {
      return false;
    }
  });
  await page.goto("/entities/player_201?role=integrity_reviewer");
  await expect(page.getByTestId("entity-merge-resolved-banner")).toContainText("Merge applied");
});

test("entity merge controls are read-only for player_user role", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  });
  await page.goto("/entities/player_201?role=player_user");
  await page.evaluate(() => localStorage.removeItem("hypegamer_entity_merge_audit_v1"));
  await expect(page.getByTestId("entity-merge-readonly")).toBeVisible();
  await expect(page.getByTestId("entity-merge-confirm-open")).toHaveCount(0);
});

test("player profile shows skill coverage and duplicate alias cues", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  });
  await page.goto("/entities/player_200");
  await expect(page.getByText(/Coverage reads as high/i)).toBeVisible();
  await page.goto("/entities/player_202");
  await expect(page.getByText("Duplicate source")).toHaveCount(2);
  await expect(page.getByText(/Coverage reads as low/i)).toBeVisible();
});
