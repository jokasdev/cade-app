import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'article' | 'div' | 'aside';
  padding?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'muted' | 'inverse';
  children: ReactNode;
}

export function Card({ as: Tag = 'section', padding = 'md', tone = 'default', className, children, ...rest }: CardProps) {
  const classes = ['card', `card--pad-${padding}`, `card--${tone}`, className].filter(Boolean).join(' ');
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  titleId?: string;
  level?: 2 | 3;
}

export function CardHeader({ title, subtitle, icon, action, titleId, level = 3 }: CardHeaderProps) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <header className="card__header">
      {icon && (
        <span className="card__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="card__heading">
        <Heading className="card__title" id={titleId}>
          {title}
        </Heading>
        {subtitle && <p className="card__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="card__action">{action}</div>}
    </header>
  );
}
