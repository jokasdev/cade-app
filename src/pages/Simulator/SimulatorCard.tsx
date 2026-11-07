import { RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../../components/Button/Button';

interface SimulatorCardProps {
  id: string;
  number: number | string;
  icon: ReactNode;
  question: string;
  description: string;
  controls: ReactNode;
  assumptions: readonly ReactNode[];
  results: ReactNode;
  onClear?: () => void;
}

/** Estrutura comum dos simuladores: pergunta, controles, premissas e resultados. */
export function SimulatorCard({
  id,
  number,
  icon,
  question,
  description,
  controls,
  assumptions,
  results,
  onClear,
}: SimulatorCardProps) {
  return (
    <section className="sim-card reveal" aria-labelledby={`${id}-title`}>
      <header className="sim-card__header">
        <span className="sim-card__icon" aria-hidden="true">
          {icon}
        </span>
        <div className="sim-card__heading">
          <p className="sim-card__number">Simulação {number}</p>
          <h2 id={`${id}-title`} className="sim-card__question">
            {question}
          </h2>
          <p className="sim-card__description">{description}</p>
        </div>
        {onClear && (
          <Button variant="ghost" size="sm" icon={<RotateCcw />} onClick={onClear} className="sim-card__clear">
            Limpar
          </Button>
        )}
      </header>

      <div className="sim-card__body">
        <div className="sim-card__controls">
          {controls}
          <div className="assumptions">
            <h3 className="assumptions__title">Premissas desta simulação</h3>
            <ul className="assumptions__list">
              {assumptions.map((assumption, index) => (
                <li key={index}>{assumption}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="sim-card__results">{results}</div>
      </div>
    </section>
  );
}

export function ResultsPlaceholder({ children }: { children: ReactNode }) {
  return <div className="results-placeholder">{children}</div>;
}
