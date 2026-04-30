export const SETUP_CHANGED_EVENT = "hypegamer:setup-changed";

export function emitSetupChanged(): void {
  window.dispatchEvent(new Event(SETUP_CHANGED_EVENT));
}

export function subscribeSetupChanged(handler: () => void): () => void {
  window.addEventListener(SETUP_CHANGED_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(SETUP_CHANGED_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
