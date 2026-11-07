import { CircleCheck, CircleExclamationPoint, Info, TriangleExclamationPoint, X } from 'lucide-react';
import type { ReactNode } from 'react';
import './Notice.css';

export type NoticeTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

interface NoticeProps {
  tone?: NoticeTone;
  title?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const DEFAULT_ICONS: Record<NoticeTone, ReactNode> = {
  info: <Info />,
  success: <CircleCheck />,
  warning: <TriangleExclamationPoint />,
  danger: <CircleExclamationPoint />,
  neutral: <Info />,
};

/** Caixa de aviso em linha (informação, sucesso, atenção ou erro), sempre com ícone e texto. */
export function Notice({ tone = 'info', title, children, icon, action, onDismiss, className }: NoticeProps) {
  return (
    <div className={['notice', `notice--${tone}`, className].filter(Boolean).join(' ')}>
      <span className="notice__icon" aria-hidden="true">
        {icon ?? DEFAULT_ICONS[tone]}
      </span>
      <div className="notice__body">
        {title && <strong className="notice__title">{title}</strong>}
        {children && <div className="notice__text">{children}</div>}
        {action && <div className="notice__action">{action}</div>}
      </div>
      {onDismiss && (
        <button type="button" className="notice__dismiss" aria-label="Fechar aviso" onClick={onDismiss}>
          <X aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
