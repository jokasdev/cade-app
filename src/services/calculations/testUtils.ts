import type { FinancialInput, FixedExpenses, VariableCosts } from '../../types/finance';

const ZERO_VARIABLE: VariableCosts = {
  goods: 0,
  packaging: 0,
  delivery: 0,
  paymentFees: 0,
  salesTaxes: 0,
  otherVariable: 0,
};

const ZERO_FIXED: FixedExpenses = {
  rent: 0,
  utilities: 0,
  internetPhone: 0,
  payroll: 0,
  software: 0,
  accounting: 0,
  otherFixed: 0,
};

/** Monta uma entrada do motor financeiro (valores em centavos) para os testes. */
export function makeInput(options: {
  revenue: number;
  variable?: Partial<VariableCosts>;
  fixed?: Partial<FixedExpenses>;
  withdrawal?: number;
}): FinancialInput {
  return {
    revenue: options.revenue,
    variableCosts: { ...ZERO_VARIABLE, ...options.variable },
    fixedExpenses: { ...ZERO_FIXED, ...options.fixed },
    ownerWithdrawal: options.withdrawal ?? 0,
  };
}

/**
 * Cenário de referência do documento de requisitos:
 * F = R$ 8.000,00 · CV = R$ 3.000,00 · DF = R$ 2.000,00 · R = R$ 1.000,00
 */
export const REFERENCE_INPUT: FinancialInput = makeInput({
  revenue: 800_000,
  variable: { goods: 200_000, packaging: 40_000, paymentFees: 30_000, salesTaxes: 30_000 },
  fixed: { rent: 120_000, utilities: 30_000, accounting: 50_000 },
  withdrawal: 100_000,
});
