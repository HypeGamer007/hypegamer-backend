/// <reference types="vite/client" />

interface Window {
  __HG_TELEMETRY__?: Array<{ event: string; payload: unknown; ts: number }>;
}
