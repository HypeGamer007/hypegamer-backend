import { test, expect } from "@playwright/test";

function seedWorkspace() {
  return () => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
  };
}

function seedWorkspaceWithoutWebhooks() {
  return () => {
    localStorage.setItem("hypegamer_demo_seeded", "1");
    localStorage.setItem("hypegamer_onboarding_complete", "1");
    localStorage.removeItem("hypegamer_webhook_endpoints_v1");
    localStorage.removeItem("hypegamer_webhook_delivery_log_v1");
  };
}

test("data products page loads with demo data", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/data-products");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await expect(page.getByTestId("data-products-page")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Product" })).toBeVisible();
});

test("data products shows policy matrix and community draft conflict banner", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/data-products");
  await expect(page.getByTestId("data-products-policy-matrix")).toBeVisible();
  await expect(page.getByTestId("data-products-policy-conflicts")).toBeVisible();
  await expect(page.getByTestId("data-products-policy-conflicts")).toContainText("Lane GPM snapshot");
});

test("widgets page supports preview toggle and publish flow", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/widgets");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await expect(page.getByTestId("widget-preview-toggle")).toBeVisible();
  await page.getByRole("button", { name: "Sandbox fixtures" }).click();
  await expect(page).not.toHaveURL(/preview=live/);
  await expect(page.getByTestId("widget-embed-preview-frame")).toBeVisible();
  await page.getByRole("row", { name: /Draft-phase ticker/ }).getByRole("button", { name: "Publish…" }).click();
  await expect(page.getByTestId("publish-widget-dialog")).toBeVisible();
  await page.getByTestId("publish-widget-dialog").getByRole("button", { name: "Publish widget" }).click();
  await expect(page.getByTestId("publish-widget-dialog")).not.toBeVisible();
});

test("widgets live publish blocked for community-backed product", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/widgets");
  await page.getByRole("button", { name: "Live parity" }).click();
  await expect(page).toHaveURL(/preview=live/);
  await page.getByRole("row", { name: /Live GPM ribbon/ }).getByRole("button", { name: "Publish…" }).click();
  await expect(page.getByTestId("widget-policy-block-dialog")).toBeVisible();
  await expect(page.getByTestId("widget-policy-block-dialog")).toContainText("community-tier");
  await page.getByTestId("widget-policy-block-dialog").getByRole("button", { name: "Dismiss" }).click();
  await expect(page.getByTestId("widget-policy-block-dialog")).not.toBeVisible();
});

test("widgets restricted fixture withholds embed marker string", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/widgets?fixture=restricted");
  await expect(page.getByTestId("widget-embed-restricted")).toBeVisible();
  await expect(page.getByTestId("widgets-page")).not.toContainText("DEMO_EMBED_MARKER");
});

test("widgets unpublish clears published demo state", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/widgets");
  await page.getByRole("button", { name: "Sandbox fixtures" }).click();
  await page.getByRole("row", { name: /Ancient lane scoreboard/ }).getByRole("button", { name: "Unpublish…" }).click();
  await expect(page.getByTestId("unpublish-widget-dialog")).toBeVisible();
  await page.getByTestId("unpublish-widget-dialog").getByRole("button", { name: "Unpublish" }).click();
  await expect(page.getByTestId("unpublish-widget-dialog")).not.toBeVisible();
  await page.getByRole("row", { name: /Ancient lane scoreboard/ }).getByRole("button", { name: "Publish…" }).click();
});

test("developers page defaults to Integrations tab", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/developers");
  await expect(page).toHaveURL(/tab=integrations/);
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await expect(page.getByRole("tab", { name: "Integrations" })).toHaveAttribute("aria-selected", "true");
});

test("developers Integrations: OAuth stub visible", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/developers?tab=integrations");
  await expect(page.getByTestId("empty-state-oauth-clients-stub")).toBeVisible();
  await expect(page.locator("#oauth-h")).toHaveText("OAuth clients");
});

test("developers Integrations: empty webhook endpoints CTA", async ({ page }) => {
  await page.addInitScript(seedWorkspaceWithoutWebhooks());
  await page.goto("/developers?tab=integrations");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await expect(page.getByTestId("empty-state-webhook-endpoints-empty")).toBeVisible();
  await page.getByTestId("empty-state-webhook-endpoints-empty").getByRole("button", { name: "Add webhook endpoint" }).click();
  await expect(page.getByTestId("create-webhook-endpoint-dialog")).toBeVisible();
});

test("developers Integrations: webhook endpoint, test delivery, retry to delivered", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/developers?tab=integrations");
  await expect(page.getByTestId("view-status")).toContainText("ready");

  await page.getByTestId("developers-header-add-webhook").click();
  await expect(page.getByTestId("create-webhook-endpoint-dialog")).toBeVisible();
  await page.getByLabel("Endpoint URL").fill("https://example.com/webhooks/hypegamer-demo");
  await page.getByTestId("webhook-endpoint-event-data_product_created").check();
  await page.getByRole("button", { name: "Create endpoint" }).click();
  await expect(page.getByTestId("webhook-signing-secret-reveal-dialog")).toBeVisible();
  await expect(page.getByTestId("webhook-signing-secret-value")).toContainText("hg_whsec_");
  await page.getByRole("button", { name: "I have stored this signing secret" }).click();
  await expect(page.getByTestId("webhook-signing-secret-reveal-dialog")).not.toBeVisible();
  await expect(page.getByRole("cell", { name: "https://example.com/webhooks/hypegamer-demo" })).toBeVisible();

  await expect(page.getByTestId("webhook-payload-preview")).toContainText("[REDACTED]");
  await page.getByRole("button", { name: "Send test delivery" }).click();
  await expect(page.getByTestId("logs-tab-attention-badge")).toBeVisible();
  await expect(page.getByTestId("delivery-hint-open-logs")).toBeVisible();

  await page.getByRole("tab", { name: /Logs/ }).click();
  await expect(page).toHaveURL(/tab=logs/);
  await expect(page.getByTestId("logs-tab-attention-badge")).not.toBeVisible();
  await expect(page.getByRole("cell", { name: "failed" }).first()).toBeVisible();
  const retry = page.locator('[data-testid^="delivery-retry-"]').first();
  await retry.click();
  await expect(page.getByRole("cell", { name: "delivered" }).first()).toBeVisible();

  await page.getByRole("tab", { name: "Integrations" }).click();
  await page.getByRole("button", { name: "Reveal secret…" }).click();
  await page.getByTestId("reveal-webhook-signing-secret-confirm").getByRole("button", { name: "Reveal" }).click();
  await expect(page.getByTestId("webhook-signing-secret-rereveal-dialog")).toBeVisible();
  await expect(page.getByTestId("webhook-signing-secret-rereveal-value")).toContainText("hg_whsec_");
  await page.getByTestId("webhook-signing-secret-rereveal-dialog").getByRole("button", { name: "Close" }).click();
});

test("developers Logs: filters update URL; copy link", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(seedWorkspace());
  await page.goto("/developers?tab=integrations");
  await expect(page.getByTestId("view-status")).toContainText("ready");

  await page.getByTestId("developers-header-add-webhook").click();
  await page.getByLabel("Endpoint URL").fill("https://example.com/webhooks/filter-demo");
  await page.getByTestId("webhook-endpoint-event-data_product_created").check();
  await page.getByRole("button", { name: "Create endpoint" }).click();
  await page.getByRole("button", { name: "I have stored this signing secret" }).click();

  await page.getByRole("button", { name: "Send test delivery" }).click();
  await page.getByRole("tab", { name: /Logs/ }).click();
  await expect(page.getByRole("cell", { name: "failed" }).first()).toBeVisible();

  await page.getByLabel("Status").selectOption("delivered");
  await expect(page).toHaveURL(/deliveryStatus=delivered/);
  await expect(page.getByTestId("empty-state-developers-delivery-filter-empty")).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).first().click();
  await expect(page).not.toHaveURL(/deliveryStatus=delivered/);
  await expect(page.getByRole("cell", { name: "failed" }).first()).toBeVisible();

  await page.getByTestId("developers-copy-logs-filter-url").click();
  await expect(page.getByTestId("developers-copy-logs-hint")).toContainText("Link copied");

  await page.goto("/developers?tab=logs&deliveryStatus=failed");
  await expect(page).toHaveURL(/deliveryStatus=failed/);
  await expect(page.getByRole("cell", { name: "failed" }).first()).toBeVisible();
});

test("developers page reveal-once API key flow", async ({ page }) => {
  await page.addInitScript(seedWorkspace());
  await page.goto("/developers?tab=keys");
  await expect(page.getByTestId("view-status")).toContainText("ready");
  await page.getByRole("button", { name: "Create API key" }).click();
  await expect(page.getByTestId("create-api-key-dialog")).toBeVisible();
  await page.getByTestId("create-api-key-dialog").getByLabel("Label").fill("Playwright key");
  await page.getByRole("button", { name: "Generate key" }).click();
  await expect(page.getByTestId("api-key-reveal-dialog")).toBeVisible();
  await expect(page.getByTestId("api-key-secret-value")).toContainText("hg_demo_");
  await page.getByRole("button", { name: "I have stored this key" }).click();
  await expect(page.getByTestId("api-key-reveal-dialog")).not.toBeVisible();
  await expect(page.getByRole("cell", { name: /Playwright key/ })).toBeVisible();
});

test("sources empty state offers setup path", async ({ page }) => {
  await page.goto("/sources");
  await expect(page.getByTestId("empty-state-sources-empty")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open setup checklist" })).toBeVisible();
});
