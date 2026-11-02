import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { authClient } from "../../services/auth.ts";
import { RepositoryError } from "../../services/guideRepository.ts";
import { Button } from "../ui/Button.tsx";

export function RequireStaff({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [check, setCheck] = useState<{ path: string; result: "allowed" | "denied" | "error" } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const path = `${location.pathname}#${attempt}`;
  useEffect(() => {
    let active = true;
    void authClient.me().then(
      () => {
        if (active) setCheck({ path, result: "allowed" });
      },
      (error: unknown) => {
        if (active)
          setCheck({
            path,
            result: error instanceof RepositoryError && error.status === 403 ? "denied" : "error",
          });
      },
    );
    return () => {
      active = false;
    };
  }, [path]);
  if (check?.path !== path)
    return (
      <p role="status" className="loading-state">
        Verificando acceso…
      </p>
    );
  if (check.result === "denied") return <Navigate to="/acceso" replace state={{ from: location.pathname }} />;
  if (check.result === "error")
    return (
      <div className="error-panel" role="alert">
        <p>No pudimos verificar tu sesión. El panel permanece protegido.</p>
        <Button onClick={() => setAttempt((value) => value + 1)}>Intentar de nuevo</Button>
      </div>
    );
  return children;
}
