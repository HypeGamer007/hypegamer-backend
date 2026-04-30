import { track } from "@/lib/telemetry";

export type LinkedProvider = "steam" | "riot" | "twitch" | "epic";

export interface LinkedAccount {
  provider: LinkedProvider;
  handle: string;
  status: "linked" | "pending" | "error";
  linkedAt: string;
}

export interface ConsentGrant {
  id: string;
  consentType: "profile_share" | "stats_share" | "marketing";
  status: "granted" | "revoked";
  updatedAt: string;
}

const KEY_LINKED = "hypegamer_identity_linked_v1";
const KEY_CONSENT = "hypegamer_identity_consent_v1";

export function readLinkedAccounts(): LinkedAccount[] {
  try {
    const raw = localStorage.getItem(KEY_LINKED);
    if (!raw) return [];
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? (v as LinkedAccount[]) : [];
  } catch {
    return [];
  }
}

export function writeLinkedAccounts(next: LinkedAccount[]) {
  try {
    localStorage.setItem(KEY_LINKED, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function linkDemoAccount(provider: LinkedProvider, handle: string) {
  const now = new Date().toISOString();
  const next = [
    ...readLinkedAccounts().filter((a) => a.provider !== provider),
    { provider, handle, status: "linked" as const, linkedAt: now },
  ];
  writeLinkedAccounts(next);
  track("identity_link_completed", {
    playerId: "demo_player",
    provider,
    verificationState: "linked",
  });
}

export function readConsentGrants(): ConsentGrant[] {
  try {
    const raw = localStorage.getItem(KEY_CONSENT);
    if (!raw) return [];
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? (v as ConsentGrant[]) : [];
  } catch {
    return [];
  }
}

export function ensureDefaultConsent() {
  const existing = readConsentGrants();
  if (existing.length) return;
  const now = new Date().toISOString();
  const next: ConsentGrant[] = [
    { id: "c_profile", consentType: "profile_share", status: "granted", updatedAt: now },
    { id: "c_stats", consentType: "stats_share", status: "granted", updatedAt: now },
    { id: "c_marketing", consentType: "marketing", status: "revoked", updatedAt: now },
  ];
  try {
    localStorage.setItem(KEY_CONSENT, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function revokeConsent(consentId: string) {
  const now = new Date().toISOString();
  const next = readConsentGrants().map((c) =>
    c.id === consentId ? { ...c, status: "revoked" as const, updatedAt: now } : c,
  );
  try {
    localStorage.setItem(KEY_CONSENT, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  track("consent_revoked", {
    playerId: "demo_player",
    consentType: consentId,
  });
}

