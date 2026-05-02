import {
  STORAGE_EXTRA_API_KEYS,
  STORAGE_EXTRA_DATA_PRODUCTS,
  STORAGE_WIDGET_PUBLISHED_IDS,
  STORAGE_WIDGET_UNPUBLISHED_IDS,
} from "@/lib/storageKeys";
import type { ApiKeyRow, DataProductRow } from "@/mocks/productization.demo";

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readExtraDataProducts(): DataProductRow[] {
  return parseJson<DataProductRow[]>(localStorage.getItem(STORAGE_EXTRA_DATA_PRODUCTS), []);
}

export function writeExtraDataProducts(rows: DataProductRow[]) {
  localStorage.setItem(STORAGE_EXTRA_DATA_PRODUCTS, JSON.stringify(rows));
}

export function readWidgetPublishedIds(): Set<string> {
  const ids = parseJson<string[]>(localStorage.getItem(STORAGE_WIDGET_PUBLISHED_IDS), []);
  return new Set(ids);
}

export function readWidgetUnpublishedIds(): Set<string> {
  const ids = parseJson<string[]>(localStorage.getItem(STORAGE_WIDGET_UNPUBLISHED_IDS), []);
  return new Set(ids);
}

export function addWidgetPublishedId(widgetId: string) {
  removeWidgetUnpublishedId(widgetId);
  const next = [...readWidgetPublishedIds(), widgetId];
  localStorage.setItem(STORAGE_WIDGET_PUBLISHED_IDS, JSON.stringify(next));
}

export function removeWidgetPublishedId(widgetId: string) {
  const next = [...readWidgetPublishedIds()].filter((id) => id !== widgetId);
  localStorage.setItem(STORAGE_WIDGET_PUBLISHED_IDS, JSON.stringify(next));
}

export function addWidgetUnpublishedId(widgetId: string) {
  const next = [...readWidgetUnpublishedIds(), widgetId];
  localStorage.setItem(STORAGE_WIDGET_UNPUBLISHED_IDS, JSON.stringify([...new Set(next)]));
}

export function removeWidgetUnpublishedId(widgetId: string) {
  const next = [...readWidgetUnpublishedIds()].filter((id) => id !== widgetId);
  localStorage.setItem(STORAGE_WIDGET_UNPUBLISHED_IDS, JSON.stringify(next));
}

export function readExtraApiKeys(): ApiKeyRow[] {
  return parseJson<ApiKeyRow[]>(localStorage.getItem(STORAGE_EXTRA_API_KEYS), []);
}

export function writeExtraApiKeys(rows: ApiKeyRow[]) {
  localStorage.setItem(STORAGE_EXTRA_API_KEYS, JSON.stringify(rows));
}
