import { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "../../content/site.ts";
import { ButtonLink } from "../ui/ButtonLink.tsx";
import { Container } from "../ui/Section.tsx";

const navLinkClasses =
  "rounded-lg px-3 py-2 text-label font-semibold text-navy-800 transition-colors duration-200 " +
  "hover:bg-navy-800/5 aria-[current=page]:bg-aqua-100 aria-[current=page]:text-navy-800";

const drawerLinkClasses =
  "flex items-center justify-between rounded-xl px-4 py-3.5 font-display text-xl font-bold text-navy-800 " +
  "transition-colors duration-200 hover:bg-navy-800/5 aria-[current=page]:bg-aqua-100";

export interface HeaderProps {
  menuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
}

/** Encabezado fijo con navegación. En pantallas pequeñas la navegación vive en un cajón a pantalla completa. */
export function Header({ menuOpen, onMenuToggle, onMenuClose }: HeaderProps) {
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Esc cierra el menú y devuelve el foco al botón que lo abrió.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onMenuClose();
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, onMenuClose]);

  return (
    <header className="sticky top-0 z-40 isolate">
      {/* El desenfoque va en una capa aparte: un ancestro con backdrop-filter rompería el cajón `fixed`. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 border-b border-line bg-white/85 backdrop-blur-md" />
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="Hound Express, ir al inicio" className="flex shrink-0 items-center rounded-lg">
          <img src="/brand/logo-hound-express.svg" alt="" width="104" height="36" className="h-9 w-auto" />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClasses}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <ButtonLink to="/rastreo">Rastrear</ButtonLink>
            <ButtonLink to="/panel" variant="secondary">
              Panel
            </ButtonLink>
          </div>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            onClick={onMenuToggle}
            className="inline-flex size-11 items-center justify-center rounded-xl text-navy-800 transition-colors duration-200 hover:bg-navy-800/5 lg:hidden"
          >
            {menuOpen ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
            <span className="sr-only">{menuOpen ? "Cerrar menú" : "Abrir menú"}</span>
          </button>
        </div>
      </Container>

      {menuOpen ? (
        <div id="menu-movil" className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto bg-white lg:hidden">
          <nav aria-label="Menú móvil" className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-6 sm:px-6">
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={drawerLinkClasses} onClick={onMenuClose}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              <ButtonLink to="/rastreo" size="lg" fullWidth onClick={onMenuClose}>
                Rastrear
              </ButtonLink>
              <ButtonLink to="/panel" size="lg" variant="secondary" fullWidth onClick={onMenuClose}>
                Panel de operaciones
              </ButtonLink>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
