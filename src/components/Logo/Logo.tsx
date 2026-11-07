import { useId } from 'react';
import './Logo.css';

interface LogoProps {
  /** 'dark' = texto escuro (fundos claros); 'light' = texto branco (fundos escuros). */
  tone?: 'dark' | 'light';
  size?: number;
  showWordmark?: boolean;
}

/** Marca do CADÊ?: uma lupa procurando para onde o dinheiro vai. */
export function LogoMark({ size = 32 }: { size?: number }) {
  const gradientId = `cade-mark-${useId().replace(/:/g, '')}`;
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4ADE80" />
          <stop offset="1" stopColor="#16A34A" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${gradientId})`} />
      <circle cx="17.5" cy="17.5" r="8" fill="none" stroke="#101827" strokeWidth="3.6" />
      <path d="M23.6 23.6 L30 30" stroke="#101827" strokeWidth="4.2" strokeLinecap="round" />
      <circle cx="17.5" cy="17.5" r="2.6" fill="#101827" />
    </svg>
  );
}

export function Logo({ tone = 'dark', size = 32, showWordmark = true }: LogoProps) {
  return (
    <span className={`logo logo--${tone}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className="logo__wordmark" aria-hidden="true">
          CADÊ<span className="logo__question">?</span>
        </span>
      )}
      <span className="sr-only">CADÊ?</span>
    </span>
  );
}
