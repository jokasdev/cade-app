import type { DiagnosisDraft, DraftFieldKey, FieldErrors, FormStep } from '../../types/app';
import {
  FIXED_EXPENSE_KEYS,
  SEGMENTS,
  VARIABLE_COST_KEYS,
  type Cents,
  type Diagnosis,
  type FixedExpenseKey,
  type FixedExpenses,
  type Segment,
  type VariableCostKey,
  type VariableCosts,
} from '../../types/finance';
import { formatMoneyInput } from '../../utils/format';
import { MONEY_ERROR_MESSAGES, parseMoney, parseOptionalMoney } from '../../utils/parse';
import { MAX_NAME_LENGTH, sanitizeText } from '../../utils/text';

export const MIN_REFERENCE_YEAR = 2000;

export function maxReferenceYear(now: Date = new Date()): number {
  return now.getFullYear() + 1;
}

/** Anos oferecidos no formulário, do mais recente para o mais antigo. */
export function referenceYearOptions(now: Date = new Date()): number[] {
  const years: number[] = [];
  for (let year = maxReferenceYear(now); year >= MIN_REFERENCE_YEAR; year -= 1) years.push(year);
  return years;
}

function emptyRecord<K extends string>(keys: readonly K[]): Record<K, string> {
  return Object.fromEntries(keys.map((key) => [key, ''])) as Record<K, string>;
}

/** Rascunho vazio. O período sugerido é o último mês completo. */
export function createEmptyDraft(now: Date = new Date()): DiagnosisDraft {
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return {
    name: '',
    segment: '',
    referenceMonth: previousMonth.getMonth() + 1,
    referenceYear: previousMonth.getFullYear(),
    revenue: '',
    variableCosts: emptyRecord(VARIABLE_COST_KEYS),
    fixedExpenses: emptyRecord(FIXED_EXPENSE_KEYS),
    ownerWithdrawal: '',
    step: 1,
  };
}

/** Converte um diagnóstico salvo de volta para o formulário (ex.: “Editar dados”). */
export function draftFromDiagnosis(diagnosis: Diagnosis, step: FormStep = 1): DiagnosisDraft {
  const { business, financials } = diagnosis;
  const money = (cents: Cents) => (cents === 0 ? '' : formatMoneyInput(cents));
  return {
    name: business.name,
    segment: business.segment,
    referenceMonth: business.referenceMonth,
    referenceYear: business.referenceYear,
    revenue: formatMoneyInput(financials.revenue),
    variableCosts: Object.fromEntries(
      VARIABLE_COST_KEYS.map((key) => [key, money(financials.variableCosts[key])]),
    ) as Record<VariableCostKey, string>,
    fixedExpenses: Object.fromEntries(
      FIXED_EXPENSE_KEYS.map((key) => [key, money(financials.fixedExpenses[key])]),
    ) as Record<FixedExpenseKey, string>,
    ownerWithdrawal: money(financials.ownerWithdrawal),
    step,
  };
}

export function isSegment(value: unknown): value is Segment {
  return typeof value === 'string' && (SEGMENTS as readonly string[]).includes(value);
}

function optionalMoneyError(raw: string): string | undefined {
  const parsed = parseOptionalMoney(raw);
  return parsed.ok ? undefined : MONEY_ERROR_MESSAGES[parsed.error];
}

/** Valida apenas os campos de uma etapa. */
export function validateStep(step: FormStep, draft: DiagnosisDraft, now: Date = new Date()): FieldErrors {
  const errors: FieldErrors = {};

  switch (step) {
    case 1: {
      if (draft.name.length > MAX_NAME_LENGTH) {
        errors.name = `Use no máximo ${MAX_NAME_LENGTH} caracteres.`;
      }
      if (!isSegment(draft.segment)) {
        errors.segment = 'Escolha o segmento do seu negócio.';
      }
      const month = draft.referenceMonth;
      if (month === null || !Number.isInteger(month) || month < 1 || month > 12) {
        errors.referenceMonth = 'Escolha o mês de referência.';
      }
      const year = draft.referenceYear;
      if (year === null || !Number.isInteger(year) || year < MIN_REFERENCE_YEAR || year > maxReferenceYear(now)) {
        errors.referenceYear = 'Escolha o ano de referência.';
      }
      break;
    }
    case 2: {
      const parsed = parseMoney(draft.revenue);
      if (!parsed.ok) {
        errors.revenue =
          parsed.error === 'empty' ? 'Informe quanto seu negócio vende por mês.' : MONEY_ERROR_MESSAGES[parsed.error];
      } else if (parsed.cents === 0) {
        errors.revenue =
          'Informe um faturamento maior que zero. Sem vendas não é possível calcular margens nem ponto de equilíbrio.';
      }
      break;
    }
    case 3: {
      for (const key of VARIABLE_COST_KEYS) {
        const error = optionalMoneyError(draft.variableCosts[key]);
        if (error) errors[`variableCosts.${key}`] = error;
      }
      break;
    }
    case 4: {
      for (const key of FIXED_EXPENSE_KEYS) {
        const error = optionalMoneyError(draft.fixedExpenses[key]);
        if (error) errors[`fixedExpenses.${key}`] = error;
      }
      break;
    }
    case 5: {
      const error = optionalMoneyError(draft.ownerWithdrawal);
      if (error) errors.ownerWithdrawal = error;
      break;
    }
  }
  return errors;
}

/** Uma etapa pode ser aberta quando todas as anteriores são válidas. */
export function isStepReachable(step: FormStep, draft: DiagnosisDraft, now: Date = new Date()): boolean {
  for (let previous = 1; previous < step; previous += 1) {
    if (Object.keys(validateStep(previous as FormStep, draft, now)).length > 0) return false;
  }
  return true;
}

export type DraftValidation =
  | { ok: true; diagnosis: Diagnosis }
  | { ok: false; errors: FieldErrors; firstInvalidStep: FormStep };

function moneyOrZero(raw: string): Cents {
  const parsed = parseOptionalMoney(raw);
  return parsed.ok ? parsed.cents : 0;
}

/** Valida o formulário inteiro e, se tudo estiver certo, devolve o diagnóstico em centavos. */
export function validateDraft(draft: DiagnosisDraft, now: Date = new Date()): DraftValidation {
  let errors: FieldErrors = {};
  let firstInvalidStep: FormStep | null = null;
  for (const step of [1, 2, 3, 4, 5] as const) {
    const stepErrors = validateStep(step, draft, now);
    if (Object.keys(stepErrors).length > 0) {
      errors = { ...errors, ...stepErrors };
      firstInvalidStep ??= step;
    }
  }
  if (firstInvalidStep !== null) return { ok: false, errors, firstInvalidStep };

  const variableCosts = Object.fromEntries(
    VARIABLE_COST_KEYS.map((key) => [key, moneyOrZero(draft.variableCosts[key])]),
  ) as VariableCosts;
  const fixedExpenses = Object.fromEntries(
    FIXED_EXPENSE_KEYS.map((key) => [key, moneyOrZero(draft.fixedExpenses[key])]),
  ) as FixedExpenses;

  return {
    ok: true,
    diagnosis: {
      business: {
        name: sanitizeText(draft.name, MAX_NAME_LENGTH),
        segment: draft.segment as Segment,
        referenceMonth: draft.referenceMonth as number,
        referenceYear: draft.referenceYear as number,
      },
      financials: {
        revenue: moneyOrZero(draft.revenue),
        variableCosts,
        fixedExpenses,
        ownerWithdrawal: moneyOrZero(draft.ownerWithdrawal),
      },
    },
  };
}

export interface DraftTotals {
  revenue: Cents | null;
  variableCosts: Cents;
  fixedExpenses: Cents;
  ownerWithdrawal: Cents;
  /** Há algum campo com valor inválido (ignorado nos totais). */
  hasInvalid: boolean;
}

/** Totais parciais para o resumo exibido durante o preenchimento. */
export function draftTotals(draft: DiagnosisDraft): DraftTotals {
  let hasInvalid = false;
  const read = (raw: string): Cents => {
    const parsed = parseOptionalMoney(raw);
    if (!parsed.ok) {
      hasInvalid = true;
      return 0;
    }
    return parsed.cents;
  };
  const revenueParsed = parseMoney(draft.revenue);
  if (!revenueParsed.ok && revenueParsed.error !== 'empty') hasInvalid = true;
  return {
    revenue: revenueParsed.ok ? revenueParsed.cents : null,
    variableCosts: VARIABLE_COST_KEYS.reduce((sum, key) => sum + read(draft.variableCosts[key]), 0),
    fixedExpenses: FIXED_EXPENSE_KEYS.reduce((sum, key) => sum + read(draft.fixedExpenses[key]), 0),
    ownerWithdrawal: read(draft.ownerWithdrawal),
    hasInvalid,
  };
}

/** true quando o formulário contém exatamente os mesmos dados do diagnóstico salvo. */
export function draftMatchesDiagnosis(draft: DiagnosisDraft, diagnosis: Diagnosis, now: Date = new Date()): boolean {
  const validation = validateDraft(draft, now);
  return validation.ok && JSON.stringify(validation.diagnosis) === JSON.stringify(diagnosis);
}

/** Em qual etapa fica cada campo. */
export function stepOfField(field: DraftFieldKey): FormStep {
  if (field === 'revenue') return 2;
  if (field.startsWith('variableCosts.')) return 3;
  if (field.startsWith('fixedExpenses.')) return 4;
  if (field === 'ownerWithdrawal') return 5;
  return 1;
}
