import { useEffect } from "react";

const IGNORED_TAGS = new Set(["INPUT", "TEXTAREA"]);

export function useKeyboardShortcuts(shortcuts = {}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.defaultPrevented) return;
      const tag = event.target?.tagName;
      if (IGNORED_TAGS.has(tag)) return;
      const key = event.key;
      const handler = shortcuts[key];
      if (typeof handler === "function") {
        event.preventDefault();
        handler(event);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
