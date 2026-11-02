import type { UseGuides } from "../../hooks/useGuides.ts";
import { Button } from "../ui/Button.tsx";
export function GuideLoadState({
  status,
  error,
  reload,
}: Pick<UseGuides, "status" | "error" | "reload">) {
  return status === "loading" ? (
    <p role="status">Cargando guías…</p>
  ) : status === "error" ? (
    <div role="alert">
      <p>{error}</p>
      <Button onClick={reload}>Intentar de nuevo</Button>
    </div>
  ) : null;
}
