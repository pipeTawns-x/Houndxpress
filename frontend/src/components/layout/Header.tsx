import { useRef } from "react";
import { Link, NavLink } from "react-router";
import { Menu, X } from "lucide-react";
import { useModalBehavior } from "../../hooks/useModalBehavior.ts";
import { NAV_ITEMS } from "../../content/site.ts";
import { bem } from "../../lib/bem.ts";
import { ButtonLink } from "../ui/ButtonLink.tsx";
import { Container } from "../ui/Section.tsx";
export interface HeaderProps {
  menuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
}
const navLinkClass = ({ isActive }: { isActive: boolean }) => bem("site-header__link", { active: isActive });
export function Header({ menuOpen, onMenuToggle, onMenuClose }: HeaderProps) {
  return (
    <header className="site-header">
      <div aria-hidden="true" className="site-header__backdrop" />
      <Container className="site-header__bar">
        <Link to="/" aria-label="Hound Express, ir al inicio" className="site-header__logo">
          <img
            src="/brand/logo-hound-express.svg"
            alt=""
            width={104}
            height={36}
            className="site-header__logo-img"
          />
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
            type="button"
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            onClick={onMenuToggle}
            className="site-header__toggle"
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            <span className="visually-hidden">{menuOpen ? "Cerrar menú" : "Abrir menú"}</span>
          </button>
        </div>
      </Container>
      {menuOpen ? <MobileMenu onMenuClose={onMenuClose} /> : null}
    </header>
  );
}
function MobileMenu({ onMenuClose }: { onMenuClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useModalBehavior(ref, onMenuClose);
  return (
    <div
      ref={ref}
      id="menu-movil"
      className="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Navegación"
      tabIndex={-1}
    >
      <button className="mobile-menu__close" type="button" onClick={onMenuClose}>
        Cerrar menú <X size={20} aria-hidden="true" />
      </button>
      <nav aria-label="Menú móvil" className="mobile-menu__nav">
        <ul className="mobile-menu__list">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => bem("mobile-menu__link", { active: isActive })}
                onClick={onMenuClose}
              >
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
  );
}
