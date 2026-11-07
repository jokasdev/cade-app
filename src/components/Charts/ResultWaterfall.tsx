import type { CoreIndicators } from '../../types/finance';
import { formatBRL } from '../../utils/format';
import { CHART_COLORS } from './chartTheme';
import './Charts.css';

interface Step {
  key: string;
  label: string;
  kind: 'total' | 'minus' | 'result';
  start: number;
  end: number;
  value: number;
  color: string;
}

function buildSteps(indicators: CoreIndicators): Step[] {
  const {
    revenue,
    variableCostsTotal,
    contributionMargin,
    fixedExpensesTotal,
    operatingResult,
    ownerWithdrawal,
    resultAfterWithdrawal,
  } = indicators;
  const resultColor = (value: number) => (value >= 0 ? CHART_COLORS.surplus : CHART_COLORS.deficit);
  return [
    { key: 'revenue', label: 'Faturamento', kind: 'total', start: 0, end: revenue, value: revenue, color: CHART_COLORS.revenue },
    {
      key: 'variable',
      label: 'Custos variáveis',
      kind: 'minus',
      start: revenue,
      end: contributionMargin,
      value: -variableCostsTotal,
      color: CHART_COLORS.variable,
    },
    {
      key: 'margin',
      label: 'Margem de contribuição',
      kind: 'result',
      start: 0,
      end: contributionMargin,
      value: contributionMargin,
      color: CHART_COLORS.revenue,
    },
    {
      key: 'fixed',
      label: 'Despesas fixas',
      kind: 'minus',
      start: contributionMargin,
      end: operatingResult,
      value: -fixedExpensesTotal,
      color: CHART_COLORS.fixed,
    },
    {
      key: 'operating',
      label: 'Resultado operacional',
      kind: 'result',
      start: 0,
      end: operatingResult,
      value: operatingResult,
      color: resultColor(operatingResult),
    },
    {
      key: 'withdrawal',
      label: 'Retirada do proprietário',
      kind: 'minus',
      start: operatingResult,
      end: resultAfterWithdrawal,
      value: -ownerWithdrawal,
      color: CHART_COLORS.withdrawal,
    },
    {
      key: 'after',
      label: 'Resultado após retirada',
      kind: 'result',
      start: 0,
      end: resultAfterWithdrawal,
      value: resultAfterWithdrawal,
      color: resultColor(resultAfterWithdrawal),
    },
  ];
}

const SYMBOL: Record<Step['kind'], string> = { total: '', minus: '−', result: '=' };

/**
 * “Composição do resultado”: do faturamento ao resultado após a retirada, passo a passo
 * (gráfico em cascata). Valores negativos aparecem à esquerda da linha do zero.
 */
export function ResultWaterfall({ indicators }: { indicators: CoreIndicators }) {
  const steps = buildSteps(indicators);
  const values = steps.flatMap((step) => [step.start, step.end]);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = max - min || 1;
  const toPct = (value: number) => ((value - min) / range) * 100;
  const zero = toPct(0);

  return (
    <div className="waterfall">
      <ul className="waterfall__list" role="list">
        {steps.map((step, index) => {
          const low = Math.min(step.start, step.end);
          const high = Math.max(step.start, step.end);
          const left = toPct(low);
          const width = step.value === 0 ? 0 : Math.max(0.8, toPct(high) - left);
          const valueClass =
            step.kind === 'result' && step.key !== 'margin'
              ? step.value >= 0
                ? 'text-positive'
                : 'text-negative'
              : '';
          return (
            <li
              key={step.key}
              className={`waterfall__row waterfall__row--${step.kind} reveal`}
              style={{ ['--i' as string]: index }}
            >
              <span className="waterfall__label">
                {SYMBOL[step.kind] && (
                  <span className="waterfall__symbol" aria-hidden="true">
                    {SYMBOL[step.kind]}
                  </span>
                )}
                {step.label}
              </span>
              <span className="waterfall__track" aria-hidden="true">
                {min < 0 && <span className="waterfall__zero" style={{ left: `${zero}%` }} />}
                <span
                  className="waterfall__bar"
                  style={{ left: `${left}%`, width: `${width}%`, background: step.color }}
                />
              </span>
              <span className={`waterfall__value tabular ${valueClass}`}>{formatBRL(step.value)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
