import { describe, expect, it } from 'vitest';
import type { AppData } from '../../types/app';
import { REFERENCE_INPUT } from '../calculations/testUtils';
import { createEmptyDraft } from '../validation/diagnosisForm';
import { createEmptyAppData, parseAppData } from './schema';
import {
  MemoryStorage,
  STORAGE_KEY,
  UNREADABLE_BACKUP_KEY,
  clearAppData,
  loadAppData,
  saveAppData,
  type KeyValueStorage,
} from './storage';

const NOW = new Date(2026, 10, 7);

function sampleData(): AppData {
  return {
    ...createEmptyAppData(),
    draft: { ...createEmptyDraft(NOW), name: 'Doces da Ana', segment: 'alimentacao', revenue: '8.000,00', step: 3 },
    diagnosis: {
      business: { name: 'Doces da Ana', segment: 'alimentacao', referenceMonth: 10, referenceYear: 2026 },
      financials: REFERENCE_INPUT,
    },
    generatedAt: '2026-11-07T12:00:00.000Z',
    simulations: { revenueGrowthPct: 10, variableCostReductionPct: 12.5, fixedExpenseReductionCents: 50_000 },
    updatedAt: '2026-11-07T12:05:00.000Z',
  };
}

describe('persistência local — recuperação de dados salvos', () => {
  it('salva e recupera a sessão completa', () => {
    const storage = new MemoryStorage();
    const data = sampleData();
    expect(saveAppData(storage, data)).toEqual({ ok: true });

    const loaded = loadAppData(storage, NOW);
    expect(loaded.status).toBe('loaded');
    expect(loaded.data).toEqual(data);
  });

  it('armazenamento vazio começa do zero', () => {
    const loaded = loadAppData(new MemoryStorage(), NOW);
    expect(loaded.status).toBe('empty');
    expect(loaded.data).toEqual(createEmptyAppData());
  });

  it('sem localStorage disponível, informa e segue funcionando', () => {
    expect(loadAppData(null, NOW).status).toBe('unavailable');
    expect(saveAppData(null, sampleData()).ok).toBe(false);
  });

  it('JSON corrompido: recomeça e guarda uma cópia do conteúdo original', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, '{ isto não é json');
    const loaded = loadAppData(storage, NOW);
    expect(loaded.status).toBe('invalid');
    expect(loaded.data).toEqual(createEmptyAppData());
    expect(storage.getItem(UNREADABLE_BACKUP_KEY)).toBe('{ isto não é json');
  });

  it('dados com formato inválido são rejeitados', () => {
    const storage = new MemoryStorage();
    const tampered = { ...sampleData(), diagnosis: { ...sampleData().diagnosis, financials: { revenue: -5 } } };
    storage.setItem(STORAGE_KEY, JSON.stringify(tampered));
    const loaded = loadAppData(storage, NOW);
    expect(loaded.status).toBe('invalid');
  });

  it('erro ao gravar (cota cheia) é informado sem quebrar o app', () => {
    const failing: KeyValueStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => undefined,
    };
    expect(saveAppData(failing, sampleData()).ok).toBe(false);
  });

  it('limpar apaga todos os dados do CADÊ?', () => {
    const storage = new MemoryStorage();
    saveAppData(storage, sampleData());
    storage.setItem(UNREADABLE_BACKUP_KEY, 'x');
    clearAppData(storage);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(storage.getItem(UNREADABLE_BACKUP_KEY)).toBeNull();
    expect(loadAppData(storage, NOW).status).toBe('empty');
  });
});

describe('validação do esquema de dados', () => {
  it('descarta propriedades desconhecidas', () => {
    const raw = { ...sampleData(), extra: 'ignorar', diagnosis: { ...sampleData().diagnosis, hack: true } };
    const parsed = parseAppData(raw, NOW);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect('extra' in parsed.data).toBe(false);
      expect(parsed.data.diagnosis && 'hack' in parsed.data.diagnosis).toBe(false);
    }
  });

  it('limpa textos com marcação', () => {
    const data = sampleData();
    const raw = { ...data, diagnosis: { ...data.diagnosis, business: { ...data.diagnosis!.business, name: '<script>x</script>' } } };
    const parsed = parseAppData(raw, NOW);
    expect(parsed.ok && parsed.data.diagnosis?.business.name).toBe('scriptx/script');
  });

  it('rejeita versão desconhecida, segmento inválido e faturamento zero', () => {
    expect(parseAppData({ ...sampleData(), schemaVersion: 99 }, NOW).ok).toBe(false);
    const data = sampleData();
    expect(
      parseAppData({ ...data, diagnosis: { ...data.diagnosis, business: { ...data.diagnosis!.business, segment: 'x' } } }, NOW).ok,
    ).toBe(false);
    expect(
      parseAppData(
        { ...data, diagnosis: { ...data.diagnosis, financials: { ...REFERENCE_INPUT, revenue: 0 } } },
        NOW,
      ).ok,
    ).toBe(false);
  });

  it('rejeita simulações fora dos limites e descarta economia maior que as despesas fixas', () => {
    expect(parseAppData({ ...sampleData(), simulations: { revenueGrowthPct: 900 } }, NOW).ok).toBe(false);
    const parsed = parseAppData(
      { ...sampleData(), simulations: { revenueGrowthPct: 10, fixedExpenseReductionCents: 900_000 } },
      NOW,
    );
    expect(parsed.ok && parsed.data.simulations).toEqual({
      revenueGrowthPct: 10,
      variableCostReductionPct: null,
      fixedExpenseReductionCents: null,
    });
  });
});
