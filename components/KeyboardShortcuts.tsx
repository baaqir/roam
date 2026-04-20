"use client";

import { useEffect } from "react";

type ShortcutDef = {
  /** Key to match (e.g. "Enter", "s", "p", "Escape"). */
  key: string;
  /** Whether Cmd (Mac) or Ctrl (Win/Linux) must be held. */
  cmdOrCtrl?: boolean;
  /** Handler. Return false to also run default browser behavior. */
  handler: (e: KeyboardEvent) => void;
};

/**
 * Register keyboard shortcuts for a page. Cleans up on unmount.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutDef[]) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      for (const s of shortcuts) {
        if (e.key !== s.key && e.key.toLowerCase() !== s.key.toLowerCase()) continue;
        if (s.cmdOrCtrl && !(e.metaKey || e.ctrlKey)) continue;
        if (!s.cmdOrCtrl && (e.metaKey || e.ctrlKey)) continue;
        e.preventDefault();
        s.handler(e);
        return;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcuts]);
}
