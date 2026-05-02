import { test, expect } from "@playwright/test";
import { expectTelemetryHasEvent, resetTelemetry } from "../helpers/telemetry";

function seedWorkspace() {
  return () => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
    (window as unknown as { __HG_TELEMETRY__?: unknown[] }).__HG_TELEMETRY__ = [];
  };
}

test("governance routes emit documented telemetry events", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/settings");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await resetTelemetry(page);
  await page.getByTestId("settings-save-retention").click();
  await expectTelemetryHasEvent(page, "settings_retention_saved");

  await page.goto("/trust");
  await resetTelemetry(page);
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await page.getByRole("row", { name: /Net worth swing/ }).getByRole("button", { name: "Disposition…" }).click();
  await page.getByTestId("trust-disposition-dialog").getByRole("button", { name: "Mark triaged" }).click();
  await expectTelemetryHasEvent(page, "trust_signal_reviewed");
});

test("widget publish emits widget_published when policy allows", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/widgets");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await page.getByRole("button", { name: "Sandbox fixtures" }).click();
  await expect(page).not.toHaveURL(/preview=live/);
  await resetTelemetry(page);
  await page.getByRole("row", { name: /Draft-phase ticker/ }).getByRole("button", { name: "Publish…" }).click();
  await page.getByTestId("publish-widget-dialog").getByRole("button", { name: "Publish widget" }).click();
  await expectTelemetryHasEvent(page, "widget_published");
});

test("source pause emits source_paused", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
    localStorage.removeItem("hypegamer_source_overrides_v1");
    (window as unknown as { __HG_TELEMETRY__?: unknown[] }).__HG_TELEMETRY__ = [];
  });
  await page.goto("/sources");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await resetTelemetry(page);
  await page.getByRole("button", { name: /Pause source Spectator Match Feed/i }).click();
  await expect(page.getByTestId("pause-source-dialog")).toBeVisible();
  await page.getByTestId("pause-source-dialog").getByRole("button", { name: "Pause source" }).click();
  await expectTelemetryHasEvent(page, "source_paused");
});

test("competitions filter change emits filter_applied", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/competitions");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await resetTelemetry(page);
  await page.getByLabel("Game").selectOption({ index: 1 });
  await expectTelemetryHasEvent(page, "filter_applied");
});

test("developers API key flow emits api_key_created", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/developers?tab=keys");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await resetTelemetry(page);
  await page.getByRole("button", { name: "Create API key" }).click();
  await expect(page.getByTestId("create-api-key-dialog")).toBeVisible();
  await page.getByTestId("create-api-key-dialog").getByLabel("Label").fill("Telemetry contract key");
  await page.getByRole("button", { name: "Generate key" }).click();
  await expect(page.getByTestId("api-key-reveal-dialog")).toBeVisible();
  await expectTelemetryHasEvent(page, "api_key_created");
});

test("onboarding skip emits setup_cta_clicked", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __HG_TELEMETRY__?: unknown[] }).__HG_TELEMETRY__ = [];
  });
  await page.goto("/onboarding");
  await expect(page.getByTestId("onboarding-wizard")).toBeVisible();
  await resetTelemetry(page);
  await page.getByRole("button", { name: "Skip setup and go to app" }).click();
  await expect(page).toHaveURL(/\/home/);
  await expectTelemetryHasEvent(page, "setup_cta_clicked");
});

test("search with query emits search_run", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/search");
  await resetTelemetry(page);
  await page.goto("/search?q=ancient");
  await expect(page.getByTestId("search-results")).toBeVisible();
  await expectTelemetryHasEvent(page, "search_run");
});

test("integrator tab change emits integrator_hub_viewed", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/integrator?tab=connect");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await resetTelemetry(page);
  await page.getByRole("tab", { name: "ROI" }).click();
  await expect(page).toHaveURL(/tab=roi/);
  await expectTelemetryHasEvent(page, "integrator_hub_viewed");
});

test("notification deep link emits notification_opened", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/home");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await page.getByTestId("notifications-menu-trigger").click();
  await expect(page.getByTestId("notifications-menu-panel")).toBeVisible();
  await resetTelemetry(page);
  await page.getByRole("link", { name: /Trust: net worth swing triaged/ }).click();
  await expectTelemetryHasEvent(page, "notification_opened");
  await expect(page).toHaveURL(/\/trust/);
});

test("home integrator CTA navigates to hub", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/home");
  await expect(page.getByTestId("home-integrator-cta")).toBeVisible();
  await page.getByTestId("home-integrator-cta").getByRole("link", { name: "Open Integrator hub" }).click();
  await expect(page).toHaveURL(/\/integrator\?tab=connect/);
  await expect(page.getByTestId("view-status")).toContainText("ready");
});
