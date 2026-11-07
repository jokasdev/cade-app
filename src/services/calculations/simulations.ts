import type { Cents, CoreIndicators, FinancialTotals } from '../../types/finance';
import { computeIndicators } from './financial';
import { mulDivRound, toBasisPoints } from './money';

/** Limites aceitos pelos simuladores (percentuais). */
export const SIMULATION_LIMITS = {
  revenueGrowthPct: { min: 0, max: 500 },
  variableCostReductionPct: { min: 0, max: 100 },
} as const;

export const SIMULATION_PRESETS = [5, 10, 15, 20] as const;

const BASIS = 10_000; // 100% em pontos-base

export class SimulationInputError extends RangeError {
  constructor(message: string) {
    super(message);
    this.name = 'SimulationInputError';
  }
}

export interface ScenarioDelta {
  revenue: Cents;
  variableCosts: Cents;
  fixedExpenses: Cents;
  contributionMargin: Cents;
  operatingResult: Cents;
  resultAfterWithdrawal: Cents;
}

export interface ScenarioComparison {
  /** Situação atual (valores informados). */
  base: CoreIndicators;
  /** Cenário hipotético. */
  simulated: CoreIndicators;
  /** Cenário simulado − situação atual. */
  delta: ScenarioDelta;
}

export interface CombinedScenarioParams {
  revenueGrowthPct: number | null;
  variableCostReductionPct: number | null;
  fixedExpenseReductionCents: Cents | null;
}

function assertPercent(value: number, limits: { min: number; max: number }, label: string): void {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < limits.min || value > limits.max) {
    throw new SimulationInputError(`${label} deve estar entre ${limits.min}% e ${limits.max}%.`);
  }
}

function assertFixedReduction(reduction: number, fixedExpenses: Cents): void {
  if (typeof reduction !== 'number' || !Number.isSafeInteger(reduction) || reduction < 0) {
    throw new SimulationInputError('A economia nas despesas fixas deve ser um valor em reais maior ou igual a zero.');
  }
  if (reduction > fixedExpenses) {
    throw new SimulationInputError('A economia não pode ser maior que o total de despesas fixas.');
  }
}

function compare(baseTotals: FinancialTotals, simulatedTotals: FinancialTotals): ScenarioComparison {
  const base = computeIndicators(baseTotals);
  const simulated = computeIndicators(simulatedTotals);
  return {
    base,
    simulated,
    delta: {
      revenue: simulated.revenue - base.revenue,
      variableCosts: simulated.variableCostsTotal - base.variableCostsTotal,
      fixedExpenses: simulated.fixedExpensesTotal - base.fixedExpensesTotal,
      contributionMargin: simulated.contributionMargin - base.contributionMargin,
      operatingResult: simulated.operatingResult - base.operatingResult,
      resultAfterWithdrawal: simulated.resultAfterWithdrawal - base.resultAfterWithdrawal,
    },
  };
}

/**
 * Simulador 1 — “E se seu faturamento aumentar?”
 * Premissas: os custos variáveis crescem na mesma proporção do faturamento;
 * despesas fixas e retirada permanecem iguais.
 */
export function simulateRevenueGrowth(totals: FinancialTotals, growthPct: number): ScenarioComparison {
  assertPercent(growthPct, SIMULATION_LIMITS.revenueGrowthPct, 'O aumento do faturamento');
  const factor = BASIS + toBasisPoints(growthPct);
  return compare(totals, {
    ...totals,
    revenue: mulDivRound(totals.revenue, factor, BASIS),
    variableCosts: mulDivRound(totals.variableCosts, factor, BASIS),
  });
}

/**
 * Simulador 2 — “E se você reduzir seus custos?”
 * Premissas: redução percentual dos custos variáveis; faturamento,
 * despesas fixas e retirada permanecem iguais.
 */
export function simulateVariableCostReduction(totals: FinancialTotals, reductionPct: number): ScenarioComparison {
  assertPercent(reductionPct, SIMULATION_LIMITS.variableCostReductionPct, 'A redução dos custos variáveis');
  const factor = BASIS - toBasisPoints(reductionPct);
  return compare(totals, {
    ...totals,
    variableCosts: mulDivRound(totals.variableCosts, factor, BASIS),
  });
}

/**
 * Simulador 3 — “E se você economizar nas despesas fixas?”
 * Premissas: economia em reais nas despesas fixas (limitada ao total);
 * faturamento, custos variáveis e retirada permanecem iguais.
 */
export function simulateFixedExpenseReduction(totals: FinancialTotals, reductionCents: Cents): ScenarioComparison {
  assertFixedReduction(reductionCents, totals.fixedExpenses);
  return compare(totals, {
    ...totals,
    fixedExpenses: totals.fixedExpenses - reductionCents,
  });
}

/**
 * Cenário combinado: aplica as três hipóteses ao mesmo tempo.
 * Faturamento e custos variáveis crescem juntos; depois os custos variáveis
 * são reduzidos pelo percentual informado; por fim a economia em reais é
 * descontada das despesas fixas. Parâmetros nulos são ignorados.
 */
export function simulateCombined(totals: FinancialTotals, params: CombinedScenarioParams): ScenarioComparison {
  const growth = params.revenueGrowthPct ?? 0;
  const reduction = params.variableCostReductionPct ?? 0;
  const fixedReduction = params.fixedExpenseReductionCents ?? 0;
  assertPercent(growth, SIMULATION_LIMITS.revenueGrowthPct, 'O aumento do faturamento');
  assertPercent(reduction, SIMULATION_LIMITS.variableCostReductionPct, 'A redução dos custos variáveis');
  assertFixedReduction(fixedReduction, totals.fixedExpenses);

  const growthFactor = BASIS + toBasisPoints(growth);
  const reductionFactor = BASIS - toBasisPoints(reduction);
  return compare(totals, {
    ...totals,
    revenue: mulDivRound(totals.revenue, growthFactor, BASIS),
    variableCosts: mulDivRound(totals.variableCosts, growthFactor * reductionFactor, BASIS * BASIS),
    fixedExpenses: totals.fixedExpenses - fixedReduction,
  });
}
