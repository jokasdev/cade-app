import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Anima um número até o valor final (efeito discreto de contagem).
 * O valor final exibido é sempre exatamente o valor recebido.
 */
export function useAnimatedNumber(target: number, durationMs = 700): number {
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(() => (reducedMotion ? target : 0));
  const displayRef = useRef(display);

  useEffect(() => {
    const show = (value: number) => {
      displayRef.current = value;
      setDisplay(value);
    };

    if (reducedMotion) {
      show(target);
      return;
    }

    const from = displayRef.current;
    if (from === target) return;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      if (progress >= 1) {
        show(target);
        return;
      }
      const eased = 1 - (1 - progress) ** 3;
      show(Math.round(from + (target - from) * eased));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, reducedMotion]);

  return display;
}
