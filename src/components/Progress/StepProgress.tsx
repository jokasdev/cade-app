import { Check } from 'lucide-react';
import type { FormStep } from '../../types/app';
import './Progress.css';

export interface StepDefinition {
  step: FormStep;
  title: string;
}

interface StepProgressProps {
  steps: readonly StepDefinition[];
  current: FormStep;
  isReachable: (step: FormStep) => boolean;
  isComplete: (step: FormStep) => boolean;
  onSelect: (step: FormStep) => void;
}

/** Indicador de progresso do formulário. Etapas já liberadas podem ser abertas com clique ou teclado. */
export function StepProgress({ steps, current, isReachable, isComplete, onSelect }: StepProgressProps) {
  const currentIndex = steps.findIndex((item) => item.step === current);
  const currentTitle = steps[currentIndex]?.title ?? '';
  const percent = Math.round(((currentIndex + 1) / steps.length) * 100);

  return (
    <nav className="step-progress" aria-label="Etapas do diagnóstico">
      <div className="step-progress__compact" aria-hidden="true">
        <span className="step-progress__count">
          Etapa {currentIndex + 1} de {steps.length}
        </span>
        <span className="step-progress__current">{currentTitle}</span>
      </div>
      <div className="step-progress__bar" aria-hidden="true">
        <span className="step-progress__fill" style={{ width: `${percent}%` }} />
      </div>

      <ol className="step-progress__list" role="list">
        {steps.map((item, index) => {
          const isCurrent = item.step === current;
          const complete = !isCurrent && isComplete(item.step);
          const reachable = isReachable(item.step);
          const state = isCurrent ? 'current' : complete ? 'complete' : 'upcoming';
          const stateLabel = isCurrent ? 'etapa atual' : complete ? 'concluída' : reachable ? 'disponível' : 'bloqueada';
          return (
            <li key={item.step} className={`step-progress__item step-progress__item--${state}`}>
              <button
                type="button"
                className="step-progress__button"
                onClick={() => onSelect(item.step)}
                disabled={!reachable && !isCurrent}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className="step-progress__marker" aria-hidden="true">
                  {complete ? <Check strokeWidth={3} /> : index + 1}
                </span>
                <span className="step-progress__label">
                  {item.title}
                  <span className="sr-only">, {stateLabel}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
