/**
 * Tipos do domínio financeiro do CADÊ?.
 *
 * Todos os valores monetários são inteiros em CENTAVOS (R$ 1,00 = 100),
 * o que evita erros de arredondamento de ponto flutuante.
 */

/** Valor monetário em centavos (inteiro, nunca fração de centavo). */
export type Cents = number;

export const SEGMENTS = ['alimentacao', 'comercio', 'beleza', 'servicos', 'vestuario', 'outros'] as const;
export type Segment = (typeof SEGMENTS)[number];

export const VARIABLE_COST_KEYS = [
  'goods',
  'packaging',
  'delivery',
  'paymentFees',
  'salesTaxes',
  'otherVariable',
] as const;
export type VariableCostKey = (typeof VARIABLE_COST_KEYS)[number];

export const FIXED_EXPENSE_KEYS = [
  'rent',
  'utilities',
  'internetPhone',
  'payroll',
  'software',
  'accounting',
  'otherFixed',
] as const;
export type FixedExpenseKey = (typeof FIXED_EXPENSE_KEYS)[number];

export type CostKey = VariableCostKey | FixedExpenseKey;
export type CostGroup = 'variable' | 'fixed';

export type VariableCosts = Record<VariableCostKey, Cents>;
export type FixedExpenses = Record<FixedExpenseKey, Cents>;

/** Números do mês informados pelo usuário. */
export interface FinancialInput {
  /** F — faturamento mensal. */
  revenue: Cents;
  /** Itens que compõem CV — custos variáveis. */
  variableCosts: VariableCosts;
  /** Itens que compõem DF — despesas fixas. */
  fixedExpenses: FixedExpenses;
  /** R — retirada mensal do proprietário (apresentada separadamente das despesas operacionais). */
  ownerWithdrawal: Cents;
}

/** Totais usados pelo motor de cálculo (e pelos simuladores). */
export interface FinancialTotals {
  revenue: Cents;
  variableCosts: Cents;
  fixedExpenses: Cents;
  ownerWithdrawal: Cents;
}

export interface BusinessInfo {
  /** Nome do negócio (opcional, pode ser vazio). */
  name: string;
  segment: Segment;
  /** 1 a 12. */
  referenceMonth: number;
  referenceYear: number;
}

/** Diagnóstico completo e validado, pronto para o cálculo. */
export interface Diagnosis {
  business: BusinessInfo;
  financials: FinancialInput;
}

/**
 * Resultado de um limiar de faturamento (ponto de equilíbrio ou meta).
 * Quando a margem de contribuição é zero ou negativa não existe valor finito.
 */
export type RevenueThreshold =
  | { status: 'finite'; value: Cents }
  | { status: 'not-applicable'; reason: 'zero-revenue' | 'non-positive-margin' };

/** Margem de segurança: quanto o faturamento está acima (ou abaixo) do ponto de equilíbrio. */
export interface SafetyMargin {
  /** F − PE (pode ser negativo quando o faturamento está abaixo do ponto de equilíbrio). */
  value: Cents;
  /** (F − PE) / F × 100. */
  pct: number;
}

/** Indicadores calculados a partir dos totais. */
export interface CoreIndicators {
  revenue: Cents;
  variableCostsTotal: Cents;
  fixedExpensesTotal: Cents;
  ownerWithdrawal: Cents;
  /** CV + DF. */
  totalCosts: Cents;
  /** MC = F − CV. */
  contributionMargin: Cents;
  /** MC% = MC / F × 100 (null quando F = 0). */
  contributionMarginPct: number | null;
  /** RO = F − CV − DF. Não é lucro líquido. */
  operatingResult: Cents;
  /** RO% = RO / F × 100 (null quando F = 0). */
  operatingResultPct: number | null;
  /** RA = RO − R. */
  resultAfterWithdrawal: Cents;
  /** PE = DF / (MC / F). */
  breakEven: RevenueThreshold;
  /** Meta = (DF + R) / (MC / F). */
  revenueTarget: RevenueThreshold;
  /** Disponível apenas quando há ponto de equilíbrio finito e faturamento maior que zero. */
  safetyMargin: SafetyMargin | null;
}

export interface CostItem {
  key: CostKey;
  group: CostGroup;
  value: Cents;
  /** Percentual do faturamento (null quando F = 0). */
  shareOfRevenue: number | null;
  /** Percentual do total de custos e despesas (null quando o total é 0). */
  shareOfTotalCosts: number | null;
}

export interface FinancialResult extends CoreIndicators {
  /** Todos os itens de custo e despesa, do maior para o menor valor. */
  costItems: CostItem[];
  /** Maior item de custo/despesa informado (null quando tudo é zero). */
  largestCost: CostItem | null;
  /** Grupo (custos variáveis ou despesas fixas) com maior valor; 'equal' quando empatam; null quando ambos são zero. */
  largestGroup: CostGroup | 'equal' | null;
}
