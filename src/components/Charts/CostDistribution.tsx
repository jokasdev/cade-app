import type { CostItem } from '../../types/finance';
import { COST_META, GROUP_LABELS } from '../../utils/categories';
import { formatBRL, formatPercent } from '../../utils/format';
import { CategoryIcon } from '../CategoryIcon/CategoryIcon';
import { CHART_COLORS } from './chartTheme';
import { ChartLegend } from './ChartParts';
import './Charts.css';

interface CostDistributionProps {
  items: readonly CostItem[];
  /** Limita a quantidade de linhas (ex.: na demonstração da página inicial). */
  limit?: number;
  showLegend?: boolean;
}

const GROUP_COLOR = {
  variable: CHART_COLORS.variable,
  fixed: CHART_COLORS.fixed,
} as const;

/**
 * “Distribuição dos custos”: barras horizontais ordenadas da maior para a menor.
 * A barra mais longa é o maior gasto; a cor indica o grupo (variável ou fixo).
 */
export function CostDistribution({ items, limit, showLegend = true }: CostDistributionProps) {
  const informed = items.filter((item) => item.value > 0);
  const visible = limit ? informed.slice(0, limit) : informed;
  const hiddenCount = informed.length - visible.length;
  const emptyCount = items.length - informed.length;
  const maxValue = informed[0]?.value ?? 0;

  if (informed.length === 0) {
    return <p className="cost-dist__empty">Nenhum custo ou despesa foi informado.</p>;
  }

  return (
    <div className="cost-dist">
      {showLegend && (
        <ChartLegend
          items={[
            { label: GROUP_LABELS.variable, color: CHART_COLORS.variable },
            { label: GROUP_LABELS.fixed, color: CHART_COLORS.fixed },
          ]}
        />
      )}
      <ol className="cost-dist__list" role="list">
        {visible.map((item, index) => {
          const meta = COST_META[item.key];
          const width = maxValue > 0 ? Math.max(1.5, (item.value / maxValue) * 100) : 0;
          return (
            <li key={item.key} className="cost-row reveal" style={{ ['--i' as string]: index }}>
              <div className="cost-row__head">
                <span className="cost-row__icon" aria-hidden="true">
                  <CategoryIcon category={item.key} size={16} />
                </span>
                <span className="cost-row__name">
                  {meta.shortLabel}
                  <span className="cost-row__group">
                    <span className="cost-row__dot" style={{ background: GROUP_COLOR[item.group] }} aria-hidden="true" />
                    {item.group === 'variable' ? 'Custo variável' : 'Despesa fixa'}
                  </span>
                </span>
                <span className="cost-row__value tabular">{formatBRL(item.value)}</span>
              </div>
              <div className="cost-row__track" aria-hidden="true">
                <span className="cost-row__fill" style={{ width: `${width}%`, background: GROUP_COLOR[item.group] }} />
              </div>
              <div className="cost-row__meta">
                <span>
                  <strong>{formatPercent(item.shareOfRevenue)}</strong> do faturamento
                </span>
                <span>
                  <strong>{formatPercent(item.shareOfTotalCosts)}</strong> dos custos e despesas
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      {(hiddenCount > 0 || emptyCount > 0) && (
        <p className="cost-dist__note">
          {hiddenCount > 0 && `Mais ${hiddenCount} ${hiddenCount === 1 ? 'item' : 'itens'} com valores menores. `}
          {emptyCount > 0 &&
            `${emptyCount} ${emptyCount === 1 ? 'categoria sem valor informado não aparece' : 'categorias sem valor informado não aparecem'} aqui.`}
        </p>
      )}
    </div>
  );
}
