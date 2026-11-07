import type { ReactNode } from 'react';
import './Input.css';

interface FieldShellProps {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  /** Elemento exibido ao lado do rótulo (ex.: tooltip). */
  labelAction?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Ids de descrição (dica e erro) para aria-describedby. */
export function describedBy(id: string, hint?: ReactNode, error?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

/** Estrutura comum dos campos: rótulo, controle, dica e mensagem de erro. */
export function FieldShell({ id, label, hint, error, optional, labelAction, className, children }: FieldShellProps) {
  return (
    <div className={['field', error ? 'field--error' : '', className].filter(Boolean).join(' ')}>
      <div className="field__label-row">
        <label className="field__label" htmlFor={id}>
          {label}
          {optional && <span className="field__optional"> (opcional)</span>}
        </label>
        {labelAction}
      </div>
      {children}
      {hint && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

/** Mensagem de erro de campo, com ícone (a informação nunca depende só da cor). */
export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p className="field__error" id={id}>
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
        <circle cx="8" cy="8" r="7" fill="currentColor" />
        <path d="M8 4.2v4.6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="8" cy="11.3" r="1" fill="#fff" />
      </svg>
      <span>{children}</span>
    </p>
  );
}
