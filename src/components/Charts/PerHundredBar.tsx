import { perHundredSold } from '../../services/calculations/financial';
import type { Cents } from '../../types/finance';
import { formatBRL, formatPercent } from '../../utils/format';
import { CHART_COLORS } from './chartTheme';
import './Charts.css';

interface PerHundredBarProps {
  revenue: Cents;
  variableCosts: Cents;
  fixedExpenses: Cents;
  ownerWithdrawal: Cents;
}

interface Part {
  key: string;
  label: string;
  value: Cents;
  color: string;
}

/**
 * “De cada R$ 100 vendidos…”: barra segmentada fina + lista com os valores.
 * Quando as saídas passam do faturamento, a barra cresce além da marca do faturamento.
 */
export function PerHundredBar({ revenue, variableCosts, fixedExpenses, ownerWithdrawal }: PerHundredBarProps) {
  const outflows = variableCosts + fixedExpenses + ownerWithdrawal;
  const balance = revenue - outflows;
  const parts: Part[] = [
    { key: 'variable', label: 'Custos variáveis', value: variableCosts, color: CHART_COLORS.variable },
    { key: 'fixed', label: 'Despesas fixas', value: fixedExpenses, color: CHART_COLORS.fixed },
    { key: 'withdrawal', label: 'Sua retirada', value: ownerWithdrawal, color: CHART_COLORS.withdrawal },
  ];
  if (balance > 0) parts.push({ key: 'surplus', label: 'Sobra', value: balance, color: CHART_COLORS.surplus });

  const scale = Math.max(revenue, outflows, 1);
  const overflow = outflows > revenue;
  const visibleParts = parts.filter((part) => part.value > 0);

  const describe = (value: Cents) => {
    const per100 = perHundredSold(value, revenue);
    return per100 === null ? '—' : formatBRL(per100);
  };

  return (
    <div className="per100">
      <div className="per100__bar-wrap">
        <div
          className="per100__bar"
          role="img"
          aria-label={`De cada R$ 100 vendidos: ${parts.map((part) => `${part.label} ${describe(part.value)}`).join(', ')}${
            balance < 0 ? `; faltam ${describe(-balance)}` : ''
          }.`}
        >
          {visibleParts.map((part) => (
            <span
              key={part.key}
              className="per100__segment"
              style={{ flexGrow: part.value / scale, background: part.color }}
              title={`${part.label}: ${formatPercent((part.value / Math.max(revenue, 1)) * 100)}`}
            />
          ))}
        </div>
        {overflow && (
          <span className="per100__marker" style={{ left: `${(revenue / scale) * 100}%` }} aria-hidden="true">
            <span className="per100__marker-label">Faturamento</span>
          </span>
        )}
      </div>

      <ul className="per100__list" role="list">
        {parts.map((part) => (
          <li key={part.key} className="per100__item">
            <span className="per100__swatch" style={{ background: part.color }} aria-hidden="true" />
            <span className="per100__label">{part.label}</span>
            <span className="per100__value tabular">{describe(part.value)}</span>
          </li>
        ))}
        {balance < 0 && (
          <li className="per100__item per100__item--deficit">
            <span className="per100__swatch per100__swatch--deficit" aria-hidden="true" />
            <span className="per100__label">Falta</span>
            <span className="per100__value tabular text-negative">{describe(-balance)}</span>
          </li>
        )}
        {balance === 0 && (
          <li className="per100__item">
            <span className="per100__swatch per100__swatch--neutral" aria-hidden="true" />
            <span className="per100__label">Sobra</span>
            <span className="per100__value tabular">R$&nbsp;0,00</span>
          </li>
        )}
      </ul>
    </div>
  );
}
