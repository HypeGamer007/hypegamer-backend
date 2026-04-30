import type { PermissionModel, ViewStatus } from "./states";

export interface EmptyStateModel {
  title: string;
  body: string;
  primaryCta?: { label: string; action: string };
  secondaryCta?: { label: string; action: string };
  icon?: string;
}

export interface EntityTableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: number | string;
  hideWhenRestricted?: boolean;
  cell: (row: T) => unknown;
}

export interface EntityTableProps<T> {
  status: ViewStatus;
  rows: T[];
  columns: Array<EntityTableColumn<T>>;
  emptyState: EmptyStateModel;
  permissions: PermissionModel;
  errorMessage?: string;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  analyticsId: string;
}

export interface ProvenanceBadgeProps {
  tier: "certified" | "publisher_authorized" | "verified_community" | "community";
  sourceDisplayName?: string;
  confidenceScore?: number;
  restrictedReason?: string;
}
