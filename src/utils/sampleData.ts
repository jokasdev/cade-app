import type { Diagnosis } from '../types/finance';

/**
 * Exemplo ILUSTRATIVO com valores fictícios, usado apenas nas demonstrações da
 * página inicial. Sempre exibido com o selo “Exemplo ilustrativo”. Nunca é
 * misturado aos dados do usuário.
 */
export const SAMPLE_DIAGNOSIS: Diagnosis = {
  business: { name: 'Doceria Exemplo', segment: 'alimentacao', referenceMonth: 10, referenceYear: 2026 },
  financials: {
    revenue: 1_250_000,
    variableCosts: {
      goods: 380_000,
      packaging: 62_000,
      delivery: 48_000,
      paymentFees: 37_500,
      salesTaxes: 75_000,
      otherVariable: 0,
    },
    fixedExpenses: {
      rent: 180_000,
      utilities: 42_000,
      internetPhone: 15_000,
      payroll: 160_000,
      software: 9_900,
      accounting: 35_000,
      otherFixed: 7_600,
    },
    ownerWithdrawal: 250_000,
  },
};
