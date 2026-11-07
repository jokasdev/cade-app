import { CircleCheck, CircleExclamationPoint, Info, TriangleExclamationPoint } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Insight, InsightSeverity } from '../../services/diagnostics/insights';
import './Insights.css';

const SEVERITY: Record<InsightSeverity, { label: string; icon: ReactNode }> = {
  critical: { label: 'Alerta', icon: <CircleExclamationPoint /> },
  warning: { label: 'Atenção', icon: <TriangleExclamationPoint /> },
  positive: { label: 'Ponto positivo', icon: <CircleCheck /> },
  info: { label: 'Para saber', icon: <Info /> },
};

/** Lista “O que merece sua atenção?” — cada item com ícone, rótulo e texto (nunca só cor). */
export function InsightList({ insights, limit }: { insights: readonly Insight[]; limit?: number }) {
  const visible = limit ? insights.slice(0, limit) : insights;
  return (
    <ul className="insights" role="list">
      {visible.map((insight, index) => {
        const severity = SEVERITY[insight.severity];
        return (
          <li
            key={insight.id}
            className={`insight insight--${insight.severity} reveal`}
            style={{ ['--i' as string]: index }}
          >
            <span className="insight__icon" aria-hidden="true">
              {severity.icon}
            </span>
            <div className="insight__body">
              <p className="insight__tag">{severity.label}</p>
              <h3 className="insight__title">{insight.title}</h3>
              <p className="insight__message">{insight.message}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
