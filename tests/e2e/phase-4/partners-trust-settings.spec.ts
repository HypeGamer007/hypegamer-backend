import { test, expect } from "@playwright/test";

function seedWorkspace() {
  return () => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  };
}

test("setup nav is available from shell", async ({ page }) => {
  await page.goto("/home");
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Setup", exact: true })
    .click();
  await expect(page).toHaveURL(/\/onboarding/);
});

test("home governance snapshot links when sandbox is loaded", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/home");
  await expect(page.getByTestId("home-governance-card")).toBeVisible();
  await expect(page.getByTestId("home-governance-card")).toContainText("Pending partner grants");
  await page.getByTestId("home-governance-card").getByRole("link", { name: "1" }).click();
  await expect(page).toHaveURL(/\/partners/);
  await expect(page).toHaveURL(/status=pending/);
});

test("partners directory loads with demo data and filter", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/partners");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await expect(page.getByTestId("partners-page")).toBeVisible();
  await expect(page.getByRole("cell", { name: "Radiant Forge" })).toBeVisible();
  await page.getByLabel("Status").selectOption("active");
  await expect(page).toHaveURL(/status=active/);
});

test("partners approve pending shows impact preview", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/partners");
  await page.getByRole("row", { name: /Dire Circuit Events/ }).getByRole("button", { name: "Approve grant…" }).click();
  await expect(page.getByTestId("partners-approve-grant-dialog")).toContainText("Impact preview");
  await expect(page.getByTestId("partners-approve-grant-dialog")).toContainText("API keys unlock");
  await page.getByTestId("partners-approve-grant-dialog").getByRole("button", { name: "Cancel" }).click();
});

test("partners revoke dialog mentions downstream widget impact", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/partners");
  await page.getByRole("row", { name: /Radiant Forge/ }).getByRole("button", { name: "Revoke…" }).click();
  await expect(page.getByTestId("partners-revoke-dialog")).toContainText("widgets");
  await page.getByTestId("partners-revoke-dialog").getByRole("button", { name: "Cancel" }).click();
});

test("trust queue shows redacted evidence preview", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/trust");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await expect(page.getByTestId("trust-evidence-sig_odds_spike")).toContainText("[REDACTED");
});

test("settings retention save enabled for default admin-like role", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/settings");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await expect(page.getByTestId("settings-save-retention")).toBeEnabled();
  await page.getByTestId("settings-save-retention").click();
});

test("settings shows members and roles tables", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Members" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Alex Chen" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Roles & access" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Organization admin" })).toBeVisible();
});

test("settings audit table filters and export stays disabled", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Recent audit activity" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "partner_access_revoked" })).toBeVisible();
  await page.getByTestId("settings-audit-filter").fill("nosuchverb_xyz");
  await expect(page.getByTestId("settings-audit-empty")).toBeVisible();
  await page.getByTestId("settings-audit-filter").fill("trust_signal");
  await expect(page.getByTestId("settings-audit-table-wrap")).toBeVisible();
  await expect(page.getByTestId("settings-audit-export")).toBeDisabled();
});

test("settings read-only hint for viewer role", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/settings?role=viewer");
  await expect(page.getByTestId("settings-save-retention")).toBeDisabled();
  await expect(page.getByTestId("settings-readonly-hint")).toContainText("Read-only");
});
