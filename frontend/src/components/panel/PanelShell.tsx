import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import {
  Archive,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Plus,
  X,
} from "lucide-react";
import { authClient } from "../../services/auth.ts";
import { onSessionLost } from "../../services/sessionEvents.ts";
import { clearGuides } from "../../store/guidesSlice.ts";
import { useAppDispatch } from "../../store/hooks.ts";
import { Button } from "../ui/Button.tsx";

const navigation = [
  { to: "/panel", label: "Resumen", icon: LayoutDashboard },
  { to: "/panel/registro", label: "Registro de guías", icon: ClipboardList },
  { to: "/panel/alta", label: "Alta de guía", icon: Plus },
  { to: "/panel/archivo", label: "Archivo", icon: Archive },
];
export function PanelShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dispatch = useAppDispatch();
  useEffect(
    () =>
      onSessionLost(() => {
        dispatch(clearGuides());
      }),
    [dispatch],
  );
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    void authClient.me().then(
      (user) => {
        if (active) setUsername(user.username);
      },
      () => {
        if (active) setUsername("");
      },
    );
    return () => {
      active = false;
    };
  }, []);
  async function logout() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await authClient.logout();
      dispatch(clearGuides());
      await navigate("/acceso", { replace: true });
    } catch {
      setError("No se pudo cerrar la sesión. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="panel-app">
      <aside className="panel-app__sidebar" aria-label="Panel de operaciones">
        <Link className="panel-app__brand" to="/panel">
          <img src="/brand/logo-hound-express-blanco.svg" alt="Hound Express" width="124" height="43" />
          <span>Operaciones</span>
        </Link>
        <nav aria-label="Operaciones">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink end={to === "/panel"} key={to} to={to}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <Link className="panel-app__public-link" to="/">
          Volver al sitio público
        </Link>
      </aside>
      <div className="panel-app__workspace">
        <header className="panel-app__topbar">
          <button
            className="panel-app__menu-button"
            aria-expanded={open}
            aria-controls="panel-mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            <span>Menú de operaciones</span>
          </button>
          <span className="panel-app__context">Panel de operaciones</span>
          <div className="panel-app__session">
            <span>{username || "Verificando sesión…"}</span>
            <Button
              variant="secondary"
              loading={busy}
              onClick={() => {
                void logout();
              }}
            >
              Cerrar sesión
            </Button>
          </div>
        </header>
        {open ? (
          <nav
            id="panel-mobile-menu"
            className="panel-app__mobile-menu"
            aria-label="Operaciones móvil"
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }}
          >
            {navigation.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/panel"}
                onClick={() => setOpen(false)}
              >
                {label}
              </NavLink>
            ))}
            <Link to="/">Volver al sitio público</Link>
          </nav>
        ) : null}
        <main id="contenido" tabIndex={-1} className="panel-app__content">
          <h1>{title}</h1>
          {error ? <p role="alert">{error}</p> : null}
          {children}
        </main>
      </div>
    </div>
  );
}
