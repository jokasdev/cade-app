import {
  APP_SCHEMA_VERSION,
  FORM_STEPS,
  type AppData,
  type DiagnosisDraft,
  type FormStep,
  type SimulationSettings,
} from '../../types/app';
import {
  FIXED_EXPENSE_KEYS,
  VARIABLE_COST_KEYS,
  type Diagnosis,
  type FixedExpenseKey,
  type VariableCostKey,
} from '../../types/finance';
import { totalsFromInput, validateFinancialInput } from '../calculations/financial';
import { isValidCents } from '../calculations/money';
import { SIMULATION_LIMITS } from '../calculations/simulations';
import { MIN_REFERENCE_YEAR, isSegment, maxReferenceYear } from '../validation/diagnosisForm';
import { MAX_NAME_LENGTH, sanitizeText } from '../../utils/text';

/** Tamanho máximo de um campo de texto monetário guardado no rascunho. */
const MAX_DRAFT_FIELD_LENGTH = 32;

export type AppDataParseResult = { ok: true; data: AppData } | { ok: false; error: string };

class SchemaError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fail(message: string): never {
  throw new SchemaError(message);
}

function readRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) fail(`${label} ausente ou em formato inválido.`);
  return value;
}

function readString(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== 'string') fail(`${label} deve ser um texto.`);
  if (value.length > maxLength * 4) fail(`${label} é longo demais.`);
  return sanitizeText(value, maxLength);
}

function readDraftMoney(value: unknown, label: string): string {
  if (typeof value !== 'string') fail(`${label} deve ser um texto.`);
  if (value.length > MAX_DRAFT_FIELD_LENGTH) fail(`${label} é longo demais.`);
  // Apenas caracteres que podem aparecer em um valor digitado.
  return value.replace(/[^\d.,R$\s-]/gi, '');
}

function readMonth(value: unknown, label: string, nullable: boolean): number | null {
  if (value === null && nullable) return null;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 12) fail(`${label} inválido.`);
  return value;
}

function readYear(value: unknown, label: string, nullable: boolean, now: Date): number | null {
  if (value === null && nullable) return null;
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < MIN_REFERENCE_YEAR ||
    value > maxReferenceYear(now)
  ) {
    fail(`${label} inválido.`);
  }
  return value;
}

function readIsoDate(value: unknown, label: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string' || value.length > 40 || Number.isNaN(Date.parse(value))) fail(`${label} inválida.`);
  return new Date(value).toISOString();
}

function parseDraft(value: unknown, now: Date): DiagnosisDraft | null {
  if (value === null || value === undefined) return null;
  const draft = readRecord(value, 'Rascunho');
  const variable = readRecord(draft.variableCosts, 'Custos variáveis do rascunho');
  const fixed = readRecord(draft.fixedExpenses, 'Despesas fixas do rascunho');

  const segment = draft.segment === '' ? '' : draft.segment;
  if (segment !== '' && !isSegment(segment)) fail('Segmento do rascunho inválido.');

  const step = draft.step;
  if (!(FORM_STEPS as readonly unknown[]).includes(step)) fail('Etapa do rascunho inválida.');

  return {
    name: readString(draft.name, 'Nome do negócio', MAX_NAME_LENGTH),
    segment: segment as DiagnosisDraft['segment'],
    referenceMonth: readMonth(draft.referenceMonth, 'Mês de referência do rascunho', true),
    referenceYear: readYear(draft.referenceYear, 'Ano de referência do rascunho', true, now),
    revenue: readDraftMoney(draft.revenue, 'Faturamento do rascunho'),
    variableCosts: Object.fromEntries(
      VARIABLE_COST_KEYS.map((key) => [key, readDraftMoney(variable[key], 'Custo variável do rascunho')]),
    ) as Record<VariableCostKey, string>,
    fixedExpenses: Object.fromEntries(
      FIXED_EXPENSE_KEYS.map((key) => [key, readDraftMoney(fixed[key], 'Despesa fixa do rascunho')]),
    ) as Record<FixedExpenseKey, string>,
    ownerWithdrawal: readDraftMoney(draft.ownerWithdrawal, 'Retirada do rascunho'),
    step: step as FormStep,
  };
}

function parseDiagnosis(value: unknown, now: Date): Diagnosis | null {
  if (value === null || value === undefined) return null;
  const diagnosis = readRecord(value, 'Diagnóstico');
  const business = readRecord(diagnosis.business, 'Informações do negócio');
  const financials = readRecord(diagnosis.financials, 'Valores do diagnóstico');

  if (!isSegment(business.segment)) fail('Segmento do negócio inválido.');

  const validation = validateFinancialInput(financials);
  if (!validation.ok) fail(validation.issues[0] ?? 'Valores do diagnóstico inválidos.');
  if (validation.value.revenue <= 0) fail('Faturamento deve ser maior que zero.');

  const variable = validation.value.variableCosts;
  const fixed = validation.value.fixedExpenses;
  return {
    business: {
      name: readString(business.name, 'Nome do negócio', MAX_NAME_LENGTH),
      segment: business.segment,
      referenceMonth: readMonth(business.referenceMonth, 'Mês de referência', false) as number,
      referenceYear: readYear(business.referenceYear, 'Ano de referência', false, now) as number,
    },
    // Reconstrói os objetos campo a campo: propriedades desconhecidas são descartadas.
    financials: {
      revenue: validation.value.revenue,
      variableCosts: Object.fromEntries(VARIABLE_COST_KEYS.map((key) => [key, variable[key]])) as Record<
        VariableCostKey,
        number
      >,
      fixedExpenses: Object.fromEntries(FIXED_EXPENSE_KEYS.map((key) => [key, fixed[key]])) as Record<
        FixedExpenseKey,
        number
      >,
      ownerWithdrawal: validation.value.ownerWithdrawal,
    },
  };
}

function readOptionalPercent(value: unknown, limits: { min: number; max: number }, label: string): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= limits.min || value > limits.max) {
    fail(`${label} inválido.`);
  }
  return value;
}

function parseSimulations(value: unknown, diagnosis: Diagnosis | null): SimulationSettings {
  if (value === null || value === undefined) return createEmptySimulations();
  const sims = readRecord(value, 'Simulações');

  let fixedReduction: number | null = null;
  if (sims.fixedExpenseReductionCents !== null && sims.fixedExpenseReductionCents !== undefined) {
    if (!isValidCents(sims.fixedExpenseReductionCents) || sims.fixedExpenseReductionCents === 0) {
      fail('Economia nas despesas fixas inválida.');
    }
    fixedReduction = sims.fixedExpenseReductionCents;
    // Uma economia maior que as despesas fixas atuais não faz sentido: é descartada.
    if (!diagnosis || fixedReduction > totalsFromInput(diagnosis.financials).fixedExpenses) fixedReduction = null;
  }

  return {
    revenueGrowthPct: readOptionalPercent(sims.revenueGrowthPct, SIMULATION_LIMITS.revenueGrowthPct, 'Aumento de faturamento'),
    variableCostReductionPct: readOptionalPercent(
      sims.variableCostReductionPct,
      SIMULATION_LIMITS.variableCostReductionPct,
      'Redução de custos variáveis',
    ),
    fixedExpenseReductionCents: fixedReduction,
  };
}

export function createEmptySimulations(): SimulationSettings {
  return { revenueGrowthPct: null, variableCostReductionPct: null, fixedExpenseReductionCents: null };
}

export function createEmptyAppData(): AppData {
  return {
    schemaVersion: APP_SCHEMA_VERSION,
    draft: null,
    diagnosis: null,
    generatedAt: null,
    simulations: createEmptySimulations(),
    updatedAt: null,
  };
}

/**
 * Valida (por lista de campos permitidos) e normaliza os dados do aplicativo,
 * vindos do armazenamento local ou de um arquivo de backup.
 */
export function parseAppData(raw: unknown, now: Date = new Date()): AppDataParseResult {
  try {
    const record = readRecord(raw, 'Dados');
    if (record.schemaVersion !== APP_SCHEMA_VERSION) {
      if (typeof record.schemaVersion === 'number' && record.schemaVersion > APP_SCHEMA_VERSION) {
        fail('Os dados foram criados por uma versão mais nova do CADÊ?.');
      }
      fail('Versão dos dados não reconhecida.');
    }
    const diagnosis = parseDiagnosis(record.diagnosis, now);
    return {
      ok: true,
      data: {
        schemaVersion: APP_SCHEMA_VERSION,
        draft: parseDraft(record.draft, now),
        diagnosis,
        generatedAt: diagnosis ? readIsoDate(record.generatedAt, 'Data do diagnóstico') : null,
        simulations: parseSimulations(record.simulations, diagnosis),
        updatedAt: readIsoDate(record.updatedAt, 'Data de atualização'),
      },
    };
  } catch (error) {
    if (error instanceof SchemaError) return { ok: false, error: error.message };
    return { ok: false, error: 'Não foi possível ler os dados.' };
  }
}

/** Indica se há algo útil salvo (diagnóstico ou rascunho). */
export function hasSavedContent(data: AppData): boolean {
  return data.diagnosis !== null || data.draft !== null;
}
