import { useEffect, useId, useRef, type ReactNode } from 'react';
import { TriangleExclamationPoint, X } from 'lucide-react';
import { Button } from '../Button/Button';
import './Dialog.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
  /** Ação extra opcional (ex.: “Exportar backup antes”). */
  secondaryAction?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}

/** Caixa de confirmação acessível (usa o elemento nativo <dialog>: foco preso e Esc para fechar). */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'default',
  secondaryAction,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={`dialog dialog--${tone}`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Clique no fundo escurecido fecha a caixa.
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="dialog__panel">
        <button type="button" className="dialog__close" aria-label="Fechar" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
        {tone === 'danger' && (
          <span className="dialog__icon" aria-hidden="true">
            <TriangleExclamationPoint />
          </span>
        )}
        <h2 className="dialog__title" id={titleId}>
          {title}
        </h2>
        <div className="dialog__body" id={descriptionId}>
          {children}
        </div>
        <div className="dialog__actions">
          {secondaryAction && <div className="dialog__secondary">{secondaryAction}</div>}
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
