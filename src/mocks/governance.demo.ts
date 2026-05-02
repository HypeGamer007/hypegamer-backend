import raw from "../../specs/mocks/governance-demo.json";

export type PartnerAccessStatus = "active" | "pending" | "revoked";

export type PartnerAccessRow = {
  id: string;
  orgName: string;
  partnerType: string;
  scopeSummary: string;
  status: PartnerAccessStatus;
  expiresAt: string | null;
  lastReviewedAt: string;
};

export type TrustSignalSeverity = "low" | "medium" | "high" | "critical";
export type TrustSignalState = "open" | "triaged" | "closed";

export type TrustSignalRow = {
  id: string;
  title: string;
  severity: TrustSignalSeverity;
  state: TrustSignalState;
  signalKind: string;
  updatedAt: string;
  evidencePreview: string;
};

export type AuditActivityRow = {
  id: string;
  occurredAt: string;
  actorLabel: string;
  verb: string;
  objectLabel: string;
  beforeSummary: string | null;
  afterSummary: string | null;
};

export type WorkspaceMemberStatus = "active" | "invited";

export type WorkspaceMemberRow = {
  id: string;
  displayName: string;
  roleKey: string;
  status: WorkspaceMemberStatus;
};

export type RoleSummaryRow = {
  id: string;
  roleKey: string;
  label: string;
  capabilities: string;
};

export type GovernanceDemoModel = {
  version: string;
  partners: PartnerAccessRow[];
  trustSignals: TrustSignalRow[];
  settingsCopy: {
    workspaceLabel: string;
    retentionDaysDefault: number;
    notificationsDefault: string;
  };
  auditActivity: AuditActivityRow[];
  workspaceMembers: WorkspaceMemberRow[];
  roleSummaries: RoleSummaryRow[];
};

export const GOVERNANCE_DEMO = raw as GovernanceDemoModel;
