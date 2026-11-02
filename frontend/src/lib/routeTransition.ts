import { flushSync } from "react-dom";

/** Native transitions are optional; navigation is the complete fallback. */
export function transitionRoute(navigate: () => void): void {
  const disabled = document.documentElement.dataset.motion === "off";
  const reduced =
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (disabled || reduced || typeof document.startViewTransition !== "function") {
    navigate();
    return;
  }
  let committed = false;
  const once = () => {
    if (!committed) {
      committed = true;
      navigate();
    }
  };
  try {
    const transition = document.startViewTransition(() => {
      flushSync(once);
    });
    void transition.finished.catch(() => undefined);
  } catch {
    once();
  }
}
