import {
  FIXED_EXPENSE_KEYS,
  VARIABLE_COST_KEYS,
  type CoreIndicators,
  type CostGroup,
  type CostItem,
  type CostKey,
  type Cents,
  type FinancialInput,
  type FinancialResult,
  type FinancialTotals,
  type RevenueThreshold,
} from '../../types/finance';
import { COST_META } from '../../utils/categories';
import { isValidCents, mulDivRound, percentOf, sumCents } from './money';

/** Erro lançado quando o motor recebe dados incompletos ou inválidos. */
export class FinancialInputError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Dados financeiros inválidos: ${issues.join(' ')}`);
    this.name = 'FinancialInputError';
    this.issues = issues;
  }
}

export type FinancialValidation = { ok: true; value: FinancialInput } | { ok: false; issues: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function checkAmount(value: unknown, label: string, issues: string[]): void {
  if (value === undefined || value === null) {
    issues.push(`${label}: valor não informado.`);
  } else if (typeof value !== 'number' || !Number.isFinite(value)) {
    issues.push(`${label}: valor inválido.`);
  } else if (value < 0) {
    issues.push(`${label}: valores negativos não são aceitos.`);
  } else if (!Number.isInteger(value)) {
    issues.push(`${label}: o valor deve estar em centavos inteiros.`);
  } else if (!isValidCents(value)) {
    issues.push(`${label}: valor acima do limite permitido.`);
  }
}

/**
 * Valida os dados de entrada do motor financeiro.
 * Todos os campos são obrigatórios (zero é permitido) e precisam ser centavos inteiros não negativos.
 */
export function validateFinancialInput(input: unknown): FinancialValidation {
  if (!isRecord(input)) {
    return { ok: false, issues: ['Os dados financeiros não foram informados.'] };
  }
  const issues: string[] = [];

  checkAmount(input.revenue, 'Faturamento', issues);

  const groups = [
    { field: 'variableCosts', label: 'Custos variáveis', keys: VARIABLE_COST_KEYS },
    { field: 'fixedExpenses', label: 'Despesas fixas', keys: FIXED_EXPENSE_KEYS },
  ] as const;
  for (const group of groups) {
    const values = input[group.field];
    if (!isRecord(values)) {
      issues.push(`${group.label}: grupo não informado.`);
      continue;
    }
    for (const key of group.keys) {
      checkAmount(values[key], COST_META[key].label, issues);
    }
  }

  checkAmount(input.ownerWithdrawal, 'Retirada do proprietário', issues);

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: input as unknown as FinancialInput };
}

function assertValidTotals(totals: FinancialTotals): void {
  const entries: [string, unknown][] = [
    ['Faturamento', totals.revenue],
    ['Custos variáveis', totals.variableCosts],
    ['Despesas fixas', totals.fixedExpenses],
    ['Retirada do proprietário', totals.ownerWithdrawal],
  ];
  const issues = entries
    .filter(([, value]) => typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0)
    .map(([label]) => `${label}: valor inválido.`);
  if (issues.length > 0) throw new FinancialInputError(issues);
}

/** Soma os itens informados e devolve F, CV, DF e R. */
export function totalsFromInput(input: FinancialInput): FinancialTotals {
  return {
    revenue: input.revenue,
    variableCosts: sumCents(VARIABLE_COST_KEYS.map((key) => input.variableCosts[key])),
    fixedExpenses: sumCents(FIXED_EXPENSE_KEYS.map((key) => input.fixedExpenses[key])),
    ownerWithdrawal: input.ownerWithdrawal,
  };
}

/**
 * Faturamento necessário para cobrir `amountToCover` mantendo a margem atual:
 * valor ÷ (MC ÷ F) = valor × F ÷ MC (calculado com inteiros, sem perda de precisão).
 */
function revenueNeededToCover(amountToCover: Cents, revenue: Cents, contributionMargin: Cents): RevenueThreshold {
  if (revenue <= 0) return { status: 'not-applicable', reason: 'zero-revenue' };
  if (contributionMargin <= 0) return { status: 'not-applicable', reason: 'non-positive-margin' };
  return { status: 'finite', value: mulDivRound(amountToCover, revenue, contributionMargin) };
}

/**
 * Calcula os indicadores a partir dos totais.
 *
 *   MC  = F − CV                 MC% = MC ÷ F × 100
 *   RO  = F − CV − DF            RO% = RO ÷ F × 100
 *   RA  = RO − R
 *   PE  = DF ÷ (MC ÷ F)          (somente quando MC > 0)
 *   Meta = (DF + R) ÷ (MC ÷ F)   (somente quando MC > 0)
 */
export function computeIndicators(totals: FinancialTotals): CoreIndicators {
  assertValidTotals(totals);
  const { revenue, variableCosts, fixedExpenses, ownerWithdrawal } = totals;

  const contributionMargin = revenue - variableCosts;
  const operatingResult = contributionMargin - fixedExpenses;
  const resultAfterWithdrawal = operatingResult - ownerWithdrawal;

  const breakEven = revenueNeededToCover(fixedExpenses, revenue, contributionMargin);
  const revenueTarget = revenueNeededToCover(fixedExpenses + ownerWithdrawal, revenue, contributionMargin);

  const safetyMargin =
    breakEven.status === 'finite' && revenue > 0
      ? { value: revenue - breakEven.value, pct: ((revenue - breakEven.value) / revenue) * 100 }
      : null;

  return {
    revenue,
    variableCostsTotal: variableCosts,
    fixedExpensesTotal: fixedExpenses,
    ownerWithdrawal,
    totalCosts: variableCosts + fixedExpenses,
    contributionMargin,
    contributionMarginPct: percentOf(contributionMargin, revenue),
    operatingResult,
    operatingResultPct: percentOf(operatingResult, revenue),
    resultAfterWithdrawal,
    breakEven,
    revenueTarget,
    safetyMargin,
  };
}

function buildCostItem(key: CostKey, group: CostGroup, value: Cents, revenue: Cents, totalCosts: Cents): CostItem {
  return {
    key,
    group,
    value,
    shareOfRevenue: percentOf(value, revenue),
    shareOfTotalCosts: percentOf(value, totalCosts),
  };
}

/**
 * Ponto de entrada do motor: valida os dados, calcula os indicadores e
 * identifica os maiores custos. Lança `FinancialInputError` para dados inválidos.
 */
export function computeFinancials(input: FinancialInput): FinancialResult {
  const validation = validateFinancialInput(input);
  if (!validation.ok) throw new FinancialInputError(validation.issues);

  const totals = totalsFromInput(input);
  const indicators = computeIndicators(totals);
  const { revenue, totalCosts, variableCostsTotal, fixedExpensesTotal } = indicators;

  const items: CostItem[] = [
    ...VARIABLE_COST_KEYS.map((key) =>
      buildCostItem(key, 'variable', input.variableCosts[key], revenue, totalCosts),
    ),
    ...FIXED_EXPENSE_KEYS.map((key) => buildCostItem(key, 'fixed', input.fixedExpenses[key], revenue, totalCosts)),
  ];
  // Ordenação estável: em caso de empate, mantém a ordem do formulário.
  const costItems = [...items].sort((a, b) => b.value - a.value);
  const first = costItems[0];
  const largestCost = first && first.value > 0 ? first : null;

  let largestGroup: FinancialResult['largestGroup'] = null;
  if (variableCostsTotal > 0 || fixedExpensesTotal > 0) {
    if (variableCostsTotal > fixedExpensesTotal) largestGroup = 'variable';
    else if (fixedExpensesTotal > variableCostsTotal) largestGroup = 'fixed';
    else largestGroup = 'equal';
  }

  return { ...indicators, costItems, largestCost, largestGroup };
}

/** Quanto de cada R$ 100,00 vendidos vai para `value` (em centavos). */
export function perHundredSold(value: Cents, revenue: Cents): Cents | null {
  if (revenue <= 0) return null;
  return mulDivRound(value, 10_000, revenue);
}
