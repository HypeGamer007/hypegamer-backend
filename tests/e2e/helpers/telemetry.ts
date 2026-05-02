import type { Page } from "@playwright/test";

export type TelemetryEntry = { event: string; payload: unknown; ts: number };

/** Clears the in-browser telemetry ring buffer after the app has loaded. */
export async function resetTelemetry(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as unknown as { __HG_TELEMETRY__?: TelemetryEntry[] }).__HG_TELEMETRY__ = [];
  });
}

export async function getTelemetryEvents(page: Page): Promise<TelemetryEntry[]> {
  return page.evaluate(() => (window as unknown as { __HG_TELEMETRY__?: TelemetryEntry[] }).__HG_TELEMETRY__ ?? []);
}

export async function expectTelemetryHasEvent(
  page: Page,
  event: string,
  opts?: { minCount?: number },
): Promise<void> {
  const { minCount = 1 } = opts ?? {};
  const entries = await getTelemetryEvents(page);
  const count = entries.filter((e) => e.event === event).length;
  if (count < minCount) {
    const names = entries.map((e) => e.event).join(", ");
    throw new Error(`Expected at least ${minCount} "${event}" telemetry event(s); saw ${count}. Recent: ${names}`);
  }
}
