import { Info } from 'lucide-react';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

interface InfoTipProps {
  /** Nome do conceito (usado no rótulo acessível: “O que é …?”). */
  term: string;
  children: ReactNode;
  tone?: 'default' | 'light';
}

interface Position {
  top: number;
  left: number;
  arrowLeft: number;
  placement: 'top' | 'bottom';
}

const MARGIN = 10;

/**
 * Explicação curta de um conceito financeiro.
 * Abre ao passar o mouse, ao focar com o teclado ou ao tocar; fecha com Esc.
 */
export function InfoTip({ term, children, tone = 'default' }: InfoTipProps) {
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setPinned(false);
  }, []);

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    const bubble = bubbleRef.current;
    if (!button || !bubble) return;
    const anchor = button.getBoundingClientRect();
    const width = bubble.offsetWidth;
    const height = bubble.offsetHeight;
    const viewportWidth = document.documentElement.clientWidth;

    let placement: Position['placement'] = 'top';
    let top = anchor.top - height - MARGIN;
    if (top < 8) {
      placement = 'bottom';
      top = anchor.bottom + MARGIN;
    }
    const centered = anchor.left + anchor.width / 2 - width / 2;
    const left = Math.max(8, Math.min(centered, viewportWidth - width - 8));
    const arrowLeft = Math.max(12, Math.min(anchor.left + anchor.width / 2 - left, width - 12));
    setPosition({ top, left, arrowLeft, placement });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || bubbleRef.current?.contains(target)) return;
      close();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, close, updatePosition]);

  return (
    <span className={`infotip infotip--${tone}`}>
      <button
        ref={buttonRef}
        type="button"
        className="infotip__button"
        aria-label={`O que é ${term}?`}
        aria-describedby={id}
        aria-expanded={open}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') setOpen(true);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse' && !pinned) setOpen(false);
        }}
        onFocus={() => setOpen(true)}
        onBlur={close}
        onClick={() => {
          if (pinned) {
            close();
          } else {
            setPinned(true);
            setOpen(true);
          }
        }}
      >
        <Info aria-hidden="true" />
      </button>
      {createPortal(
        <div
          ref={bubbleRef}
          id={id}
          role="tooltip"
          className={`infotip__bubble infotip__bubble--${position?.placement ?? 'top'}`}
          hidden={!open}
          style={{
            top: position?.top ?? 0,
            left: position?.left ?? 0,
            visibility: position ? 'visible' : 'hidden',
            ['--arrow-left' as string]: `${position?.arrowLeft ?? 0}px`,
          }}
        >
          <strong className="infotip__term">{term}</strong>
          <span>{children}</span>
        </div>,
        document.body,
      )}
    </span>
  );
}
