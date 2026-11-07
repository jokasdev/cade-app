import type { ReactNode } from 'react';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { perHundredSold } from '../../services/calculations/financial';
import type { CoreIndicators } from '../../types/finance';
import { formatBRL, formatPercent } from '../../utils/format';
import type { GlossaryKey } from '../../utils/glossary';
import { Term } from '../Tooltip/Term';
import './Kpi.css';

interface KpiCardProps {
  label: string;
  value: number;
  term?: GlossaryKey;
  icon?: ReactNode;
  /** Linha complementar (ex.: “37,5% do faturamento”). */
  meta?: ReactNode;
  tone?: 'default' | 'positive' | 'negative';
  index?: number;
}

/** Cartão de indicador: rótulo, valor em reais e uma linha de contexto. */
export function KpiCard({ label, value, term, icon, meta, tone = 'default', index = 0 }: KpiCardProps) {
  return (
    <article className={`kpi kpi--${tone} reveal`} style={{ ['--i' as string]: index }}>
      <div className="kpi__top">
        {icon && (
          <span className="kpi__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <h3 className="kpi__label">{label}</h3>
        {term && <Term id={term} />}
      </div>
      <p className="kpi__value">{formatBRL(value)}</p>
      {meta && <p className="kpi__meta">{meta}</p>}
    </article>
  );
}

/** Cartão em destaque do resultado operacional estimado. */
export function OperatingResultCard({
  indicators,
  index = 0,
  animate = true,
}: {
  indicators: CoreIndicators;
  index?: number;
  animate?: boolean;
}) {
  const { operatingResult, operatingResultPct, revenue } = indicators;
  const animated = useAnimatedNumber(operatingResult);
  const shown = animate ? animated : operatingResult;
  const positive = operatingResult > 0;
  const negative = operatingResult < 0;
  const per100 = perHundredSold(Math.abs(operatingResult), revenue);

  let explanation: string;
  if (positive) {
    explanation = `De cada R$ 100 vendidos, sobram ${per100 === null ? '—' : formatBRL(per100)} depois de pagar custos variáveis e despesas fixas — antes da sua retirada.`;
  } else if (negative) {
    explanation = `De cada R$ 100 vendidos, faltam ${per100 === null ? '—' : formatBRL(per100)} para pagar custos variáveis e despesas fixas.`;
  } else {
    explanation = 'O faturamento cobre exatamente os custos variáveis e as despesas fixas, sem sobra.';
  }

  return (
    <article
      className={`kpi kpi--highlight ${negative ? 'kpi--highlight-negative' : 'kpi--highlight-positive'} reveal`}
      style={{ ['--i' as string]: index }}
    >
      <div className="kpi__top">
        <h3 className="kpi__label">Resultado operacional estimado</h3>
        <Term id="operatingResult" tone="light" />
      </div>
      <p className="kpi__value kpi__value--hero" aria-live="off">
        {formatBRL(shown)}
      </p>
      <div className="kpi__chips">
        <span className={`kpi__chip ${negative ? 'kpi__chip--negative' : 'kpi__chip--positive'}`}>
          {formatPercent(operatingResultPct)} do faturamento
        </span>
        <span className="kpi__chip kpi__chip--muted">Estimativa · não é lucro líquido</span>
      </div>
      <p className="kpi__explanation">{explanation}</p>
    </article>
  );
}
