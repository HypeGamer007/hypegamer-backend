import { describe, expect, it } from "vitest";
import { WEBHOOK_TEST_EVENT_VALUES, buildWebhookPayloadPreview } from "@/mocks/webhookDemo";

describe("buildWebhookPayloadPreview", () => {
  it("includes an explicit redaction marker for every supported event", () => {
    for (const ev of WEBHOOK_TEST_EVENT_VALUES) {
      const json = buildWebhookPayloadPreview(ev);
      expect(json).toContain("[REDACTED]");
    }
  });

  it("never embeds raw restrictedField values beyond the redaction token", () => {
    const json = buildWebhookPayloadPreview("data_product_created");
    const parsed = JSON.parse(json) as { restrictedField: string };
    expect(parsed.restrictedField).toBe("[REDACTED]");
  });
});
