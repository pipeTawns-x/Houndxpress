import { useEffect } from "react";

export const SITE_NAME = "Hound Express";

/** Fija el título de la pestaña como "Título · Hound Express". */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · ${SITE_NAME}`;
  }, [title]);
}
