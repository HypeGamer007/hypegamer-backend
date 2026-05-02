import { type RefObject, useLayoutEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function listFocusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !el.hasAttribute("data-focus-guard") && el.tabIndex !== -1,
  );
}

/**
 * Focus first tabbable when opened, trap Tab within `rootRef`, optional Escape,
 * restore focus to the element that was focused before open (or `returnFocusRef` when provided).
 */
export function useDialogFocusTrap(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  options?: {
    onEscape?: () => void;
    /** When set, focus returns here on close instead of the pre-open active element */
    returnFocusRef?: RefObject<HTMLElement | null>;
  },
) {
  const onEscapeRef = useRef(options?.onEscape);
  onEscapeRef.current = options?.onEscape;
  const returnFocusRefOpt = options?.returnFocusRef;

  useLayoutEffect(() => {
    if (!open) return undefined;

    const previous = document.activeElement as HTMLElement | null;
    const root = rootRef.current;
    if (!root) return undefined;

    const focusFirst = () => {
      const els = listFocusables(root);
      (els[0] ?? root).focus();
    };
    focusFirst();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscapeRef.current?.();
        return;
      }
      if (e.key !== "Tab" || !root) return;

      const els = listFocusables(root);
      if (els.length === 0) return;

      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !root.contains(active)) {
        e.preventDefault();
        first.focus();
        return;
      }

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      const explicit = returnFocusRefOpt?.current;
      if (explicit && typeof explicit.focus === "function") {
        explicit.focus();
      } else if (previous && typeof previous.focus === "function") {
        previous.focus();
      }
    };
  }, [open, rootRef]);
}
