export type ViewStatus =
  | "loading"
  | "ready"
  | "empty"
  | "partial"
  | "error"
  | "restricted"
  | "denied";

export interface PermissionModel {
  canView: boolean;
  canEdit: boolean;
  canAdmin?: boolean;
  reason?: string;
}

export interface ErrorEnvelope {
  code: string;
  message: string;
  retryable: boolean;
}

export interface ViewStateEnvelope {
  status: ViewStatus;
  permissions: PermissionModel;
  requestId?: string;
  error?: ErrorEnvelope;
}
