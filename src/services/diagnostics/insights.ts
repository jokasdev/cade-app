import type { FinancialResult } from '../../types/finance';
import { COST_META } from '../../utils/categories';
import { formatBRL, formatPercent } from '../../utils/format';

export type InsightSeverity = 'critical' | 'warning' | 'positive' | 'info';

export type InsightId =
  | 'variable-costs-consume-revenue'
  | 'operating-result-negative'
  | 'withdrawal-exceeds-result'
  | 'operating-result-positive'
  | 'operating-result-zero'
  | 'withdrawal-covered'
  | 'break-even'
  | 'largest-cost'
  | 'no-costs'
  | 'no-variable-costs'
  | 'no-withdrawal';

export interface Insight {
  id: InsightId;
  severity: InsightSeverity;
  title: string;
  message: string;
}

const SEVERITY_ORDER: Record<InsightSeverity, number> = {
  critical: 0,
  warning: 1,
  positive: 2,
  info: 3,
};

/**
 * “O que merece sua atenção?” — regras determinísticas aplicadas aos números informados.
 * Cada regra descreve um fato verificável; nenhuma classifica a “saúde” do negócio
 * com base em um único indicador.
 */
export function buildInsights(result: FinancialResult): Insight[] {
  const {
    revenue,
    variableCostsTotal,
    fixedExpensesTotal,
    ownerWithdrawal,
    operatingResult,
    resultAfterWithdrawal,
    breakEven,
    revenueTarget,
    safetyMargin,
    largestCost,
  } = result;
  const insights: Insight[] = [];

  if (revenue > 0 && variableCostsTotal >= revenue) {
    insights.push({
      id: 'variable-costs-consume-revenue',
      severity: 'critical',
      title: 'Custos variáveis consomem o faturamento',
      message: `Seus custos variáveis estão consumindo todo o faturamento ou ultrapassando esse valor. Foram ${formatBRL(variableCostsTotal)} em custos variáveis para ${formatBRL(revenue)} em vendas.`,
    });
  }

  if (operatingResult < 0) {
    insights.push({
      id: 'operating-result-negative',
      severity: 'critical',
      title: 'Resultado operacional negativo',
      message: `Com os valores informados, as despesas operacionais estão superiores à margem de contribuição. Faltam ${formatBRL(-operatingResult)} por mês para cobrir os custos e as despesas.`,
    });
  }

  if (ownerWithdrawal > 0 && resultAfterWithdrawal < 0) {
    const target =
      revenueTarget.status === 'finite'
        ? ` Para sustentar essa retirada com a margem atual, o faturamento estimado precisaria ser de ${formatBRL(revenueTarget.value)} por mês.`
        : '';
    insights.push({
      id: 'withdrawal-exceeds-result',
      severity: 'warning',
      title: 'Retirada maior que o resultado',
      message: `A retirada informada é superior ao resultado operacional estimado. Depois da retirada de ${formatBRL(ownerWithdrawal)}, o mês fecha em ${formatBRL(resultAfterWithdrawal)}.${target}`,
    });
  }

  if (operatingResult > 0) {
    insights.push({
      id: 'operating-result-positive',
      severity: 'positive',
      title: 'Resultado operacional positivo',
      message: `Seu negócio apresenta resultado operacional positivo nesta simulação. Sobram ${formatBRL(operatingResult)} (${formatPercent(result.operatingResultPct)} do faturamento) depois dos custos variáveis e das despesas fixas, antes da sua retirada.`,
    });
  } else if (operatingResult === 0 && revenue > 0) {
    insights.push({
      id: 'operating-result-zero',
      severity: 'info',
      title: 'Resultado operacional zerado',
      message:
        'Com os valores informados, o faturamento cobre exatamente os custos e as despesas operacionais, sem sobra.',
    });
  }

  if (ownerWithdrawal > 0 && resultAfterWithdrawal >= 0 && revenueTarget.status === 'finite') {
    insights.push({
      id: 'withdrawal-covered',
      severity: 'positive',
      title: 'Retirada coberta pelo resultado',
      message: `O resultado operacional cobre a retirada de ${formatBRL(ownerWithdrawal)}. O faturamento mínimo estimado para pagar custos, despesas e a retirada é de ${formatBRL(revenueTarget.value)} por mês.`,
    });
  }

  if (breakEven.status === 'finite' && safetyMargin) {
    let message: string;
    if (fixedExpensesTotal === 0) {
      message =
        'Como não há despesas fixas informadas, o ponto de equilíbrio é R$ 0,00: cada venda com margem positiva já contribui para o resultado.';
    } else if (safetyMargin.value > 0) {
      message = `Seu ponto de equilíbrio estimado é de ${formatBRL(breakEven.value)} por mês. Hoje você vende ${formatBRL(safetyMargin.value)} acima dele: as vendas poderiam cair até ${formatPercent(safetyMargin.pct)} antes de o resultado operacional ficar negativo, mantendo a mesma margem.`;
    } else if (safetyMargin.value < 0) {
      message = `Para cobrir os custos e as despesas, o faturamento estimado precisaria chegar a ${formatBRL(breakEven.value)} por mês: ${formatBRL(-safetyMargin.value)} a mais do que hoje, mantendo a mesma margem.`;
    } else {
      message = `Seu faturamento está exatamente no ponto de equilíbrio estimado (${formatBRL(breakEven.value)}).`;
    }
    insights.push({ id: 'break-even', severity: 'info', title: 'Ponto de equilíbrio', message });
  }

  if (largestCost) {
    const meta = COST_META[largestCost.key];
    const shareOfRevenue =
      largestCost.shareOfRevenue === null ? '' : `, o equivalente a ${formatPercent(largestCost.shareOfRevenue)} do faturamento`;
    insights.push({
      id: 'largest-cost',
      severity: 'info',
      title: `Maior gasto: ${meta.shortLabel}`,
      message: `O maior gasto informado é “${meta.shortLabel}”: ${formatBRL(largestCost.value)}${shareOfRevenue} e ${formatPercent(largestCost.shareOfTotalCosts)} de todos os custos e despesas.`,
    });
  }

  if (variableCostsTotal + fixedExpensesTotal === 0) {
    insights.push({
      id: 'no-costs',
      severity: 'warning',
      title: 'Nenhum custo informado',
      message:
        'Nenhum custo ou despesa foi informado. Confira se nenhum gasto ficou de fora: sem eles, o resultado fica superestimado.',
    });
  } else if (variableCostsTotal === 0) {
    insights.push({
      id: 'no-variable-costs',
      severity: 'info',
      title: 'Sem custos variáveis',
      message:
        'Nenhum custo variável foi informado. Se o negócio tem gastos que acompanham as vendas, como materiais, taxas de cartão ou impostos sobre vendas, inclua-os para um resultado mais preciso.',
    });
  }

  if (ownerWithdrawal === 0) {
    insights.push({
      id: 'no-withdrawal',
      severity: 'info',
      title: 'Retirada não informada',
      message:
        'Você não informou retirada. Se você trabalha no negócio, seu trabalho também tem valor: definir uma retirada mensal ajuda a saber se o negócio consegue remunerá-lo.',
    });
  }

  return insights
    .map((insight, index) => ({ insight, index }))
    .sort((a, b) => SEVERITY_ORDER[a.insight.severity] - SEVERITY_ORDER[b.insight.severity] || a.index - b.index)
    .map(({ insight }) => insight);
}
