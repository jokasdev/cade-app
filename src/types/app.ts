import type { Cents, Diagnosis, FixedExpenseKey, Segment, VariableCostKey } from './finance';

export const FORM_STEPS = [1, 2, 3, 4, 5] as const;
export type FormStep = (typeof FORM_STEPS)[number];

/**
 * Rascunho do formulário de diagnóstico.
 * Os valores monetários ficam como texto (exatamente como o usuário digitou)
 * e só são convertidos para centavos na validação.
 */
export interface DiagnosisDraft {
  name: string;
  segment: Segment | '';
  referenceMonth: number | null;
  referenceYear: number | null;
  revenue: string;
  variableCosts: Record<VariableCostKey, string>;
  fixedExpenses: Record<FixedExpenseKey, string>;
  ownerWithdrawal: string;
  /** Etapa em que o usuário parou. */
  step: FormStep;
}

/** Parâmetros escolhidos nos simuladores (null = simulador não utilizado). */
export interface SimulationSettings {
  revenueGrowthPct: number | null;
  variableCostReductionPct: number | null;
  fixedExpenseReductionCents: Cents | null;
}

export const APP_SCHEMA_VERSION = 1;

/** Tudo o que o CADÊ? guarda no navegador. */
export interface AppData {
  schemaVersion: typeof APP_SCHEMA_VERSION;
  draft: DiagnosisDraft | null;
  diagnosis: Diagnosis | null;
  /** Data/hora (ISO) em que o diagnóstico foi gerado. */
  generatedAt: string | null;
  simulations: SimulationSettings;
  /** Data/hora (ISO) da última alteração salva. */
  updatedAt: string | null;
}

export type DraftFieldKey =
  | 'name'
  | 'segment'
  | 'referenceMonth'
  | 'referenceYear'
  | 'revenue'
  | `variableCosts.${VariableCostKey}`
  | `fixedExpenses.${FixedExpenseKey}`
  | 'ownerWithdrawal';

export type FieldErrors = Partial<Record<DraftFieldKey, string>>;
