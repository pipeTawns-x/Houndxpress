import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { authClient } from "../services/auth.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { Button } from "../components/ui/Button.tsx";
import { TextField } from "../components/ui/fields.tsx";

export default function Access() {
  useDocumentTitle("Acceso de personal");
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const rawUsername = data.get("username");
    const username = typeof rawUsername === "string" ? rawUsername.trim() : "";
    const rawPassword = data.get("password");
    const password = typeof rawPassword === "string" ? rawPassword : "";
    if (!username || !password) {
      setError("Escribe tu usuario y contraseña.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await authClient.login(username, password);
      form.reset();
      const state: unknown = location.state;
      const from = typeof state === "object" && state !== null && "from" in state ? state.from : null;
      await navigate(typeof from === "string" && /^\/panel(?:\/|$)/.test(from) ? from : "/panel", {
        replace: true,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar sesión.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="access-page container">
      <div className="access-page__intro">
        <p className="eyebrow">Hound Express · Operaciones</p>
        <h1>
          Todo el recorrido.
          <br />
          Un solo control.
        </h1>
        <p>Acceso exclusivo para el personal autorizado. Cada guía, cada etapa y cada avance, en su lugar.</p>
      </div>
      <form
        className="access-page__form"
        onSubmit={(event) => {
          void submit(event);
        }}
        aria-label="Acceso de personal"
      >
        <h2>Inicia sesión</h2>
        <TextField label="Usuario" name="username" autoComplete="username" required />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <Button type="submit" loading={busy}>
          Entrar al panel
        </Button>
        {error ? (
          <p role="alert" className="notice notice--danger">
            {error}
          </p>
        ) : null}
        <p>La sesión se verifica en el servidor. No compartas tus credenciales.</p>
      </form>
    </section>
  );
}
