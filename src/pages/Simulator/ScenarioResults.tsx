import { ArrowRight } from 'lucide-react';
import { ScenarioComparisonChart } from '../../components/Charts/ScenarioComparisonChart';
import type { ScenarioComparison } from '../../services/calculations/simulations';
import type { RevenueThreshold } from '../../types/finance';
import { formatBRL } from '../../utils/format';

function thresholdValue(threshold: RevenueThreshold): number | null {
  return threshold.status === 'finite' ? threshold.value : null;
}

interface Row {
  key: string;
  label: string;
  current: number | null;
  simulated: number | null;
  /** Para custos e despesas, diminuir é bom. */
  lowerIsBetter?: boolean;
  emphasis?: boolean;
}

function DeltaChip({ current, simulated, lowerIsBetter }: { current: number | null; simulated: number | null; lowerIsBetter?: boolean }) {
  if (current === null || simulated === null) return <span className="delta delta--neutral">—</span>;
  const diff = simulated - current;
  if (diff === 0) return <span className="delta delta--neutral">sem alteração</span>;
  const good = lowerIsBetter ? diff < 0 : diff > 0;
  return (
    <span className={`delta ${good ? 'delta--good' : 'delta--bad'}`}>
      <span className="sr-only">{good ? 'melhora de ' : 'piora de '}</span>
      {formatBRL(diff, { signDisplay: 'always' })}
    </span>
  );
}

/** Situação atual × cenário simulado: frase-resumo, tabela de valores e gráfico comparativo. */
export function ScenarioResults({ comparison }: { comparison: ScenarioComparison }) {
  const { base, simulated, delta } = comparison;
  const rows: Row[] = [
    { key: 'revenue', label: 'Faturamento', current: base.revenue, simulated: simulated.revenue },
    {
      key: 'variable',
      label: 'Custos variáveis',
      current: base.variableCostsTotal,
      simulated: simulated.variableCostsTotal,
      lowerIsBetter: true,
    },
    {
      key: 'fixed',
      label: 'Despesas fixas',
      current: base.fixedExpensesTotal,
      simulated: simulated.fixedExpensesTotal,
      lowerIsBetter: true,
    },
    {
      key: 'operating',
      label: 'Resultado operacional',
      current: base.operatingResult,
      simulated: simulated.operatingResult,
      emphasis: true,
    },
    {
      key: 'after',
      label: 'Resultado após retirada',
      current: base.resultAfterWithdrawal,
      simulated: simulated.resultAfterWithdrawal,
    },
    {
      key: 'break-even',
      label: 'Ponto de equilíbrio',
      current: thresholdValue(base.breakEven),
      simulated: thresholdValue(simulated.breakEven),
      lowerIsBetter: true,
    },
  ];

  const improved = delta.operatingResult > 0;
  return (
    <div className="scenario-results">
      <p className={`scenario-results__headline ${improved ? 'is-good' : delta.operatingResult < 0 ? 'is-bad' : ''}`}>
        Nesta hipótese, o resultado operacional passaria de <strong>{formatBRL(base.operatingResult)}</strong> para{' '}
        <strong>{formatBRL(simulated.operatingResult)}</strong>
        {delta.operatingResult !== 0 && (
          <>
            {' '}
            — uma diferença de <strong>{formatBRL(delta.operatingResult, { signDisplay: 'always' })}</strong> por mês
          </>
        )}
        .
      </p>

      <div className="scenario-table" role="table" aria-label="Comparação entre situação atual e cenário simulado">
        <div className="scenario-table__head" role="row">
          <span role="columnheader">Indicador</span>
          <span role="columnheader">Atual</span>
          <span role="columnheader">Simulado</span>
          <span role="columnheader">Diferença</span>
        </div>
        {rows.map((row) => (
          <div key={row.key} role="row" className={`scenario-table__row${row.emphasis ? ' is-emphasis' : ''}`}>
            <span role="rowheader" className="scenario-table__label">
              {row.label}
            </span>
            <span role="cell" className="scenario-table__current tabular">
              {row.current === null ? 'Indefinido' : formatBRL(row.current)}
            </span>
            <span role="cell" className="scenario-table__simulated tabular">
              <ArrowRight className="scenario-table__arrow" aria-hidden="true" />
              {row.simulated === null ? 'Indefinido' : formatBRL(row.simulated)}
            </span>
            <span role="cell" className="scenario-table__delta">
              <DeltaChip current={row.current} simulated={row.simulated} lowerIsBetter={row.lowerIsBetter} />
            </span>
          </div>
        ))}
      </div>

      <ScenarioComparisonChart base={base} simulated={simulated} />
    </div>
  );
}
