import { ClipboardList, Database, FileText, LayoutDashboard, Menu, SlidersHorizontal, X, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAppData } from '../../context/appDataContext';
import { ROUTES, href, type RoutePath } from '../../routes';
import { ButtonLink } from '../Button/Button';
import { Logo } from '../Logo/Logo';
import './Header.css';

interface NavItem {
  path: RoutePath;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: readonly NavItem[] = [
  { path: ROUTES.diagnosis, label: 'Diagnóstico', icon: ClipboardList },
  { path: ROUTES.dashboard, label: 'Painel', icon: LayoutDashboard },
  { path: ROUTES.simulator, label: 'Simulador', icon: SlidersHorizontal },
  { path: ROUTES.report, label: 'Relatório', icon: FileText },
  { path: ROUTES.data, label: 'Meus dados', icon: Database },
];

interface HeaderProps {
  currentPath: string;
  /** 'dark' na página inicial (sobre o fundo azul-marinho). */
  variant: 'light' | 'dark';
}

export function Header({ currentPath, variant }: HeaderProps) {
  const { diagnosis } = useAppData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fecha o menu ao trocar de página.
  useEffect(() => {
    setMenuOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || menuButtonRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  const cta = diagnosis
    ? { path: ROUTES.dashboard, label: 'Ver meu painel' }
    : { path: ROUTES.diagnosis, label: 'Fazer meu diagnóstico' };
  const showCta = currentPath === ROUTES.home;

  return (
    <header className={`site-header site-header--${variant}${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container site-header__inner">
        <a className="site-header__brand" href={href(ROUTES.home)} aria-label="CADÊ? — página inicial">
          <Logo tone={variant === 'dark' ? 'light' : 'dark'} />
        </a>

        <nav className="site-header__nav" aria-label="Principal">
          <ul role="list" className="site-header__links">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <a
                  className="site-header__link"
                  href={href(item.path)}
                  aria-current={currentPath === item.path ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__end">
          {showCta && (
            <ButtonLink href={href(cta.path)} size="sm" className="site-header__cta">
              {cta.label}
            </ButtonLink>
          )}
          <button
            ref={menuButtonRef}
            type="button"
            className="site-header__menu-button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        ref={panelRef}
        id="mobile-menu"
        className={`site-header__panel${menuOpen ? ' is-open' : ''}`}
        hidden={!menuOpen}
      >
        <nav className="container" aria-label="Menu">
          <ul role="list" className="site-header__panel-links">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <a
                    className="site-header__panel-link"
                    href={href(item.path)}
                    aria-current={currentPath === item.path ? 'page' : undefined}
                  >
                    <Icon aria-hidden="true" />
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <ButtonLink href={href(cta.path)} fullWidth>
            {cta.label}
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
