import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark' | 'outline-light';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Ícone antes do texto. */
  icon?: ReactNode;
  /** Ícone depois do texto. */
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

function buttonClass(variant: ButtonVariant, size: ButtonSize, fullWidth: boolean, extra?: string): string {
  return ['btn', `btn--${variant}`, `btn--${size}`, fullWidth ? 'btn--full' : '', extra ?? ''].filter(Boolean).join(' ');
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Mostra um indicador de carregamento e bloqueia novos cliques. */
    loading?: boolean;
  };

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, size, fullWidth, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : icon}
      {children && <span className="btn__label">{children}</span>}
      {!loading && iconRight}
    </button>
  );
}

type ButtonLinkProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Link com aparência de botão (navegação). */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <a className={buttonClass(variant, size, fullWidth, className)} {...rest}>
      {icon}
      {children && <span className="btn__label">{children}</span>}
      {iconRight}
    </a>
  );
}
