import { useEffect } from "react";

/** Bloquea el desplazamiento de la página mientras `locked` sea verdadero. */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previous;
    };
  }, [locked]);
}
