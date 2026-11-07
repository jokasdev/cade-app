import { Scale, TriangleExclamationPoint } from 'lucide-react';
import { computeFinancials } from '../../services/calculations/financial';
import { formatBRL, formatPercent, formatPeriod } from '../../utils/format';
import { SAMPLE_DIAGNOSIS } from '../../utils/sampleData';

const sample = computeFinancials(SAMPLE_DIAGNOSIS.financials);

/** Composição visual do hero, montada com o exemplo fictício (sempre identificado como tal). */
export function HeroPreview() {
  const { revenue, variableCostsTotal, fixedExpensesTotal, operatingResult, operatingResultPct, contributionMarginPct } = sample;
  const bars = [
    { label: 'Faturamento', value: revenue, color: 'var(--chart-revenue)' },
    { label: 'Custos variáveis', value: variableCostsTotal, color: 'var(--chart-variable)' },
    { label: 'Despesas fixas', value: fixedExpensesTotal, color: 'var(--chart-fixed)' },
  ];
  const breakEven = sample.breakEven.status === 'finite' ? sample.breakEven.value : 0;

  return (
    <div
      className="hero-preview"
      role="img"
      aria-label="Exemplo ilustrativo do painel do CADÊ?, com valores fictícios de uma doceria."
    >
      <div className="hero-preview__card hero-preview__main">
        <div className="hero-preview__header">
          <span className="sample-badge">Exemplo ilustrativo</span>
          <span className="hero-preview__business">
            {SAMPLE_DIAGNOSIS.business.name} · {formatPeriod(SAMPLE_DIAGNOSIS.business.referenceMonth, SAMPLE_DIAGNOSIS.business.referenceYear)}
          </span>
        </div>
        <p className="hero-preview__label">Resultado operacional estimado</p>
        <p className="hero-preview__value">{formatBRL(operatingResult)}</p>
        <span className="hero-preview__chip">{formatPercent(operatingResultPct)} do faturamento</span>
        <ul className="hero-preview__bars" role="list">
          {bars.map((bar, index) => (
            <li key={bar.label} style={{ ['--i' as string]: index }}>
              <div className="hero-preview__bar-head">
                <span>{bar.label}</span>
                <strong>{formatBRL(bar.value)}</strong>
              </div>
              <span className="hero-preview__track">
                <span
                  className="hero-preview__fill"
                  style={{ width: `${(bar.value / revenue) * 100}%`, background: bar.color }}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="hero-preview__card hero-preview__float hero-preview__float--margin">
        <p className="hero-preview__mini-label">Margem de contribuição</p>
        <p className="hero-preview__mini-value">{formatPercent(contributionMarginPct)}</p>
        <span className="hero-preview__meter">
          <span style={{ width: `${contributionMarginPct ?? 0}%` }} />
        </span>
      </div>

      <div className="hero-preview__card hero-preview__float hero-preview__float--break-even">
        <span className="hero-preview__mini-icon" aria-hidden="true">
          <Scale />
        </span>
        <div>
          <p className="hero-preview__mini-label">Ponto de equilíbrio</p>
          <p className="hero-preview__mini-value">{formatBRL(breakEven)}</p>
        </div>
      </div>

      <div className="hero-preview__card hero-preview__float hero-preview__float--alert">
        <span className="hero-preview__mini-icon hero-preview__mini-icon--warning" aria-hidden="true">
          <TriangleExclamationPoint />
        </span>
        <p className="hero-preview__alert-text">Retirada maior que o resultado</p>
      </div>
    </div>
  );
}
