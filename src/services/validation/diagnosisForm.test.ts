import { describe, expect, it } from 'vitest';
import type { DiagnosisDraft } from '../../types/app';
import {
  createEmptyDraft,
  draftFromDiagnosis,
  draftMatchesDiagnosis,
  draftTotals,
  isStepReachable,
  validateDraft,
  validateStep,
} from './diagnosisForm';

const NOW = new Date(2026, 10, 7); // 07/11/2026

function filledDraft(overrides: Partial<DiagnosisDraft> = {}): DiagnosisDraft {
  const draft = createEmptyDraft(NOW);
  return {
    ...draft,
    name: 'Doces da Ana',
    segment: 'alimentacao',
    revenue: '8.000,00',
    variableCosts: { ...draft.variableCosts, goods: '2.000', packaging: '400', paymentFees: '300', salesTaxes: '300' },
    fixedExpenses: { ...draft.fixedExpenses, rent: '1.200', utilities: '300', accounting: '500' },
    ownerWithdrawal: '1.000',
    ...overrides,
  };
}

describe('rascunho do formulário', () => {
  it('sugere o último mês completo como referência', () => {
    const draft = createEmptyDraft(NOW);
    expect(draft.referenceMonth).toBe(10);
    expect(draft.referenceYear).toBe(2026);
    expect(createEmptyDraft(new Date(2026, 0, 15)).referenceMonth).toBe(12);
    expect(createEmptyDraft(new Date(2026, 0, 15)).referenceYear).toBe(2025);
  });
});

describe('validação por etapa', () => {
  it('etapa 1 exige segmento, mês e ano; nome é opcional', () => {
    const errors = validateStep(1, { ...createEmptyDraft(NOW), referenceMonth: null }, NOW);
    expect(errors.segment).toBeDefined();
    expect(errors.referenceMonth).toBeDefined();
    expect(errors.name).toBeUndefined();
    expect(validateStep(1, filledDraft({ name: '' }), NOW)).toEqual({});
  });

  it('etapa 2 não permite faturamento ausente, inválido, negativo ou zero', () => {
    expect(validateStep(2, filledDraft({ revenue: '' }), NOW).revenue).toBe('Informe quanto seu negócio vende por mês.');
    expect(validateStep(2, filledDraft({ revenue: 'abc' }), NOW).revenue).toMatch(/Valor inválido/);
    expect(validateStep(2, filledDraft({ revenue: '-10' }), NOW).revenue).toMatch(/negativos/);
    expect(validateStep(2, filledDraft({ revenue: '0' }), NOW).revenue).toMatch(/maior que zero/);
    expect(validateStep(2, filledDraft({ revenue: '1.234,56' }), NOW)).toEqual({});
  });

  it('etapas 3, 4 e 5 aceitam zero e campos vazios, mas não negativos', () => {
    const draft = filledDraft();
    expect(validateStep(3, { ...draft, variableCosts: { ...draft.variableCosts, goods: '0' } }, NOW)).toEqual({});
    expect(validateStep(3, { ...draft, variableCosts: { ...draft.variableCosts, goods: '' } }, NOW)).toEqual({});
    expect(
      validateStep(3, { ...draft, variableCosts: { ...draft.variableCosts, delivery: '-5' } }, NOW)['variableCosts.delivery'],
    ).toMatch(/negativos/);
    expect(
      validateStep(4, { ...draft, fixedExpenses: { ...draft.fixedExpenses, rent: '12,345' } }, NOW)['fixedExpenses.rent'],
    ).toMatch(/duas casas/);
    expect(validateStep(5, filledDraft({ ownerWithdrawal: 'mil' }), NOW).ownerWithdrawal).toMatch(/inválido/);
  });

  it('só libera uma etapa quando as anteriores estão válidas', () => {
    const empty = createEmptyDraft(NOW);
    expect(isStepReachable(1, empty, NOW)).toBe(true);
    expect(isStepReachable(2, empty, NOW)).toBe(false);
    expect(isStepReachable(5, filledDraft(), NOW)).toBe(true);
    expect(isStepReachable(3, filledDraft({ revenue: '' }), NOW)).toBe(false);
  });
});

describe('validação completa e conversão para centavos', () => {
  it('gera o diagnóstico do cenário de referência', () => {
    const validation = validateDraft(filledDraft(), NOW);
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;
    const { business, financials } = validation.diagnosis;
    expect(business).toEqual({ name: 'Doces da Ana', segment: 'alimentacao', referenceMonth: 10, referenceYear: 2026 });
    expect(financials.revenue).toBe(800_000);
    expect(financials.variableCosts.goods).toBe(200_000);
    expect(financials.variableCosts.delivery).toBe(0);
    expect(financials.fixedExpenses.rent).toBe(120_000);
    expect(financials.ownerWithdrawal).toBe(100_000);
  });

  it('dados incompletos apontam a primeira etapa com problema', () => {
    const validation = validateDraft(filledDraft({ segment: '', revenue: '' }), NOW);
    expect(validation.ok).toBe(false);
    if (validation.ok) return;
    expect(validation.firstInvalidStep).toBe(1);
    expect(validation.errors.segment).toBeDefined();
    expect(validation.errors.revenue).toBeDefined();
  });

  it('limpa o nome do negócio', () => {
    const validation = validateDraft(filledDraft({ name: '  Loja   <b>Bela</b>\u0007 ' }), NOW);
    expect(validation.ok && validation.diagnosis.business.name).toBe('Loja bBela/b');
  });

  it('ida e volta: diagnóstico → rascunho → diagnóstico', () => {
    const first = validateDraft(filledDraft(), NOW);
    if (!first.ok) throw new Error('rascunho inválido');
    const again = validateDraft(draftFromDiagnosis(first.diagnosis), NOW);
    expect(again.ok && again.diagnosis).toEqual(first.diagnosis);
  });

  it('detecta quando o formulário difere do diagnóstico salvo', () => {
    const first = validateDraft(filledDraft(), NOW);
    if (!first.ok) throw new Error('rascunho inválido');
    expect(draftMatchesDiagnosis(filledDraft(), first.diagnosis, NOW)).toBe(true);
    expect(draftMatchesDiagnosis(filledDraft({ step: 4 }), first.diagnosis, NOW)).toBe(true);
    expect(draftMatchesDiagnosis(filledDraft({ ownerWithdrawal: '1.500' }), first.diagnosis, NOW)).toBe(false);
    expect(draftMatchesDiagnosis(filledDraft({ revenue: 'abc' }), first.diagnosis, NOW)).toBe(false);
  });

  it('totais parciais para o resumo', () => {
    const totals = draftTotals(filledDraft());
    expect(totals).toEqual({
      revenue: 800_000,
      variableCosts: 300_000,
      fixedExpenses: 200_000,
      ownerWithdrawal: 100_000,
      hasInvalid: false,
    });
    expect(draftTotals(filledDraft({ ownerWithdrawal: 'x' })).hasInvalid).toBe(true);
  });
});
