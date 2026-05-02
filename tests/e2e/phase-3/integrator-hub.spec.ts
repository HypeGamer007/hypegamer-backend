import { test, expect } from "@playwright/test";

function seedWorkspace() {
  return () => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  };
}

test("integrator hub defaults to Connect tab", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/integrator");
  await expect(page).toHaveURL(/tab=connect/);
  await expect(page.getByTestId("integrator-page")).toBeVisible();
  await expect(page.getByTestId("integrator-mock-banner")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Connect" })).toHaveAttribute("aria-selected", "true");
});

test("integrator hub pipeline log and level filter sync URL", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/integrator?tab=pipeline");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await expect(page.getByTestId("integrator-pipeline-table")).toBeVisible();
  await expect(page.getByRole("cell", { name: "sdk.ingest" })).toBeVisible();
  const payload = page.getByTestId("integrator-pipeline-payload-pe_001");
  await payload.locator("summary").click();
  await expect(payload.locator("pre")).toContainText("[REDACTED]");
  await expect(payload.locator("pre")).toContainText("signingKeyFingerprint");

  await page.getByLabel("Level").selectOption("warn");
  await expect(page).toHaveURL(/logLevel=warn/);
  await expect(page.getByRole("cell", { name: "consent.player_media" })).toBeVisible();

  await page.getByLabel("Level").selectOption("error");
  await expect(page).toHaveURL(/logLevel=error/);
  await expect(page.getByRole("cell", { name: "export.third_party" })).toBeVisible();
});

test("integrator hub plugins readiness and ROI", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/integrator?tab=plugins");
  await expect(page.getByTestId("integrator-plugin-rag-pl_embed_basic")).toContainText("green");
  await expect(page.getByTestId("integrator-plugin-rag-pl_tourn_alpha")).toContainText("red");

  await page.getByRole("tab", { name: "ROI" }).click();
  await expect(page).toHaveURL(/tab=roi/);
  await expect(page.getByTestId("integrator-roi-panel")).toBeVisible();
  await expect(page.getByTestId("integrator-roi-conservative")).toContainText("$");
  await expect(page.getByTestId("integrator-roi-upside")).toContainText("$");
});

test("developers Integrations links to integrator hub", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/developers?tab=integrations");
  await page.getByTestId("developers-link-integrator-hub").click();
  await expect(page).toHaveURL(/\/integrator\?tab=pipeline/);
});
