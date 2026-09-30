import { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "../../content/site.ts";
import { bem } from "../../lib/bem.ts";
import { ButtonLink } from "../ui/ButtonLink.tsx";
import { Container } from "../ui/Section.tsx";

/** El enlace de la página actual lleva el modificador `--active` (react-router además pone `aria-current="page"`). */
const navLinkClass = ({ isActive }: { isActive: boolean }) => bem("site-header__link", { active: isActive });
const drawerLinkClass = ({ isActive }: { isActive: boolean }) => bem("mobile-menu__link", { active: isActive });

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
    <header className="site-header">
      {/* El desenfoque va en una capa aparte: un ancestro con backdrop-filter rompería el cajón `fixed`. */}
      <div aria-hidden="true" className="site-header__backdrop" />
      <Container className="site-header__bar">
        <Link to="/" aria-label="Hound Express, ir al inicio" className="site-header__logo">
          <img src="/brand/logo-hound-express.svg" alt="" width="104" height="36" className="site-header__logo-img" />
        </Link>

        <nav aria-label="Principal" className="site-header__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <div className="site-header__cta">
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
            className="site-header__toggle"
          >
            {menuOpen ? (
              <X className="site-header__toggle-icon" aria-hidden="true" />
            ) : (
              <Menu className="site-header__toggle-icon" aria-hidden="true" />
            )}
            <span className="visually-hidden">{menuOpen ? "Cerrar menú" : "Abrir menú"}</span>
          </button>
        </div>
      </Container>

      {menuOpen ? (
        <div id="menu-movil" className="mobile-menu">
          <nav aria-label="Menú móvil" className="mobile-menu__nav">
            <ul className="mobile-menu__list">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={drawerLinkClass} onClick={onMenuClose}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="mobile-menu__actions">
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
