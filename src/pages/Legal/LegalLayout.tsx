import type { ReactNode } from 'react';
import './Legal.css';

interface LegalLayoutProps {
  eyebrow: string;
  title: string;
  updated?: string;
  intro?: ReactNode;
  children: ReactNode;
}

/** Layout de páginas de texto (privacidade, termos, sobre). */
export function LegalLayout({ eyebrow, title, updated, intro, children }: LegalLayoutProps) {
  return (
    <div className="page legal">
      <div className="container container--narrow">
        <header className="legal__header">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="page-title">{title}</h1>
          {updated && <p className="legal__updated">Última atualização: {updated}</p>}
          {intro && <div className="legal__intro">{intro}</div>}
        </header>
        <article className="legal__content">{children}</article>
      </div>
    </div>
  );
}
