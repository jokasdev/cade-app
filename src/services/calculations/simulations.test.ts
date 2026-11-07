import { describe, expect, it } from 'vitest';
import { totalsFromInput } from './financial';
import {
  SimulationInputError,
  simulateCombined,
  simulateFixedExpenseReduction,
  simulateRevenueGrowth,
  simulateVariableCostReduction,
} from './simulations';
import { REFERENCE_INPUT } from './testUtils';

// F = R$ 8.000 · CV = R$ 3.000 · DF = R$ 2.000 · R = R$ 1.000 · RO = R$ 3.000
const totals = totalsFromInput(REFERENCE_INPUT);

describe('simulador 1 — aumento de faturamento', () => {
  it('10%: faturamento e custos variáveis crescem juntos, despesas fixas constantes', () => {
    const { base, simulated, delta } = simulateRevenueGrowth(totals, 10);
    expect(base.operatingResult).toBe(300_000);
    expect(simulated.revenue).toBe(880_000);
    expect(simulated.variableCostsTotal).toBe(330_000);
    expect(simulated.fixedExpensesTotal).toBe(200_000);
    expect(simulated.ownerWithdrawal).toBe(100_000);
    expect(simulated.operatingResult).toBe(350_000);
    expect(simulated.resultAfterWithdrawal).toBe(250_000);
    expect(delta.operatingResult).toBe(50_000);
    expect(delta.revenue).toBe(80_000);
    expect(delta.variableCosts).toBe(30_000);
    expect(delta.fixedExpenses).toBe(0);
  });

  it('percentual personalizado com decimais (12,5%)', () => {
    const { simulated } = simulateRevenueGrowth(totals, 12.5);
    expect(simulated.revenue).toBe(900_000);
    expect(simulated.variableCostsTotal).toBe(337_500);
    expect(simulated.operatingResult).toBe(362_500);
  });

  it('a margem percentual se mantém (custos variáveis proporcionais)', () => {
    const { base, simulated } = simulateRevenueGrowth(totals, 20);
    expect(simulated.contributionMarginPct).toBeCloseTo(base.contributionMarginPct ?? 0, 10);
    expect(simulated.breakEven).toEqual(base.breakEven);
  });

  it('arredonda para o centavo mais próximo', () => {
    const { simulated } = simulateRevenueGrowth(
      { revenue: 33_333, variableCosts: 11_111, fixedExpenses: 0, ownerWithdrawal: 0 },
      10,
    );
    expect(simulated.revenue).toBe(36_666); // 36.666,3
    expect(simulated.variableCostsTotal).toBe(12_222); // 12.222,1
  });

  it('rejeita percentuais inválidos', () => {
    expect(() => simulateRevenueGrowth(totals, -5)).toThrow(SimulationInputError);
    expect(() => simulateRevenueGrowth(totals, 501)).toThrow(SimulationInputError);
    expect(() => simulateRevenueGrowth(totals, Number.NaN)).toThrow(SimulationInputError);
  });
});

describe('simulador 2 — redução de custos variáveis', () => {
  it('10%: reduz apenas os custos variáveis', () => {
    const { simulated, delta } = simulateVariableCostReduction(totals, 10);
    expect(simulated.revenue).toBe(800_000);
    expect(simulated.variableCostsTotal).toBe(270_000);
    expect(simulated.fixedExpensesTotal).toBe(200_000);
    expect(simulated.contributionMargin).toBe(530_000);
    expect(simulated.operatingResult).toBe(330_000);
    expect(delta.operatingResult).toBe(30_000);
    // Com margem maior, o ponto de equilíbrio cai: 200.000 × 800.000 ÷ 530.000
    expect(simulated.breakEven).toEqual({ status: 'finite', value: 301_887 });
  });

  it('100%: custos variáveis zerados', () => {
    const { simulated } = simulateVariableCostReduction(totals, 100);
    expect(simulated.variableCostsTotal).toBe(0);
    expect(simulated.operatingResult).toBe(600_000);
  });

  it('rejeita percentuais acima de 100% ou negativos', () => {
    expect(() => simulateVariableCostReduction(totals, 100.01)).toThrow(SimulationInputError);
    expect(() => simulateVariableCostReduction(totals, -1)).toThrow(SimulationInputError);
  });
});

describe('simulador 3 — economia nas despesas fixas', () => {
  it('R$ 500,00: reduz as despesas fixas e melhora o resultado no mesmo valor', () => {
    const { simulated, delta } = simulateFixedExpenseReduction(totals, 50_000);
    expect(simulated.fixedExpensesTotal).toBe(150_000);
    expect(simulated.operatingResult).toBe(350_000);
    expect(delta.operatingResult).toBe(50_000);
    expect(delta.fixedExpenses).toBe(-50_000);
    expect(simulated.breakEven).toEqual({ status: 'finite', value: 240_000 });
  });

  it('permite economizar o total das despesas fixas', () => {
    const { simulated } = simulateFixedExpenseReduction(totals, 200_000);
    expect(simulated.fixedExpensesTotal).toBe(0);
    expect(simulated.breakEven).toEqual({ status: 'finite', value: 0 });
  });

  it('não permite economia maior que o total de despesas fixas', () => {
    expect(() => simulateFixedExpenseReduction(totals, 200_001)).toThrow(SimulationInputError);
  });

  it('rejeita valores negativos ou fracionados', () => {
    expect(() => simulateFixedExpenseReduction(totals, -100)).toThrow(SimulationInputError);
    expect(() => simulateFixedExpenseReduction(totals, 10.5)).toThrow(SimulationInputError);
  });
});

describe('cenário combinado', () => {
  it('aplica as três hipóteses juntas', () => {
    const { simulated, delta } = simulateCombined(totals, {
      revenueGrowthPct: 10,
      variableCostReductionPct: 10,
      fixedExpenseReductionCents: 50_000,
    });
    expect(simulated.revenue).toBe(880_000);
    expect(simulated.variableCostsTotal).toBe(297_000); // 300.000 × 1,1 × 0,9
    expect(simulated.fixedExpensesTotal).toBe(150_000);
    expect(simulated.operatingResult).toBe(433_000);
    expect(delta.operatingResult).toBe(133_000);
  });

  it('sem parâmetros, o cenário é igual à situação atual', () => {
    const { base, simulated, delta } = simulateCombined(totals, {
      revenueGrowthPct: null,
      variableCostReductionPct: null,
      fixedExpenseReductionCents: null,
    });
    expect(simulated).toEqual(base);
    expect(delta.operatingResult).toBe(0);
  });

  it('valida os parâmetros', () => {
    expect(() =>
      simulateCombined(totals, { revenueGrowthPct: 10, variableCostReductionPct: 10, fixedExpenseReductionCents: 999_999 }),
    ).toThrow(SimulationInputError);
  });
});
