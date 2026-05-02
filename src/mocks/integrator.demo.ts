import raw from "../../specs/mocks/integrator-demo.json";

export type PipelineLevel = "info" | "warn" | "error";

export type IntegratorPipelineEvent = {
  id: string;
  at: string;
  level: PipelineLevel;
  channel: string;
  message: string;
  requestId?: string;
};

export type MappingStatus = "present" | "partial" | "missing";

export type IntegratorMappingRow = {
  id: string;
  label: string;
  category: string;
  status: MappingStatus;
  provenanceNote: string;
};

export type ReadinessRag = "green" | "amber" | "red";

export type IntegratorPluginKind = "widget" | "export" | "tournament_tool" | "broadcast_partner";

export type IntegratorPluginRow = {
  id: string;
  name: string;
  kind: IntegratorPluginKind;
  partnerName: string | null;
  readiness: ReadinessRag;
  missingForGreen: string[];
  upliftLowUsd: number;
  upliftHighUsd: number;
};

export type IntegratorDemoModel = {
  version: string;
  demoDisclaimer: string;
  pipelineEvents: IntegratorPipelineEvent[];
  mappingRequirements: IntegratorMappingRow[];
  readinessSummary: {
    green: number;
    amber: number;
    red: number;
    headline: string;
  };
  plugins: IntegratorPluginRow[];
  roiNarrative: {
    title: string;
    body: string;
    methodology: string;
  };
};

export const INTEGRATOR_DEMO = raw as IntegratorDemoModel;

/** Deterministic redacted JSON for pipeline row expansion (demo only). */
export function buildPipelinePayloadPreview(row: IntegratorPipelineEvent): string {
  return JSON.stringify(
    {
      eventId: row.id,
      channel: row.channel,
      level: row.level,
      requestId: row.requestId ?? null,
      messageExcerpt: row.message.length > 96 ? `${row.message.slice(0, 96)}…` : row.message,
      signingKeyFingerprint: "[REDACTED]",
      partnerCredential: "[REDACTED]",
    },
    null,
    2,
  );
}

export function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
