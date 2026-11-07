import { describe, expect, it } from 'vitest';
import type { AppData } from '../../types/app';
import { REFERENCE_INPUT } from '../calculations/testUtils';
import { createEmptyAppData } from '../storage/schema';
import { MAX_BACKUP_BYTES, backupFileName, parseBackupText, readBackupFile, serializeBackup } from './backup';

const NOW = new Date(2026, 10, 7, 10, 30);

function sampleData(): AppData {
  return {
    ...createEmptyAppData(),
    diagnosis: {
      business: { name: 'Studio Bela', segment: 'beleza', referenceMonth: 9, referenceYear: 2026 },
      financials: REFERENCE_INPUT,
    },
    generatedAt: '2026-10-01T09:00:00.000Z',
    simulations: { revenueGrowthPct: 15, variableCostReductionPct: null, fixedExpenseReductionCents: null },
    updatedAt: '2026-10-01T09:00:00.000Z',
  };
}

describe('exportação de backup', () => {
  it('gera um JSON identificado e o nome do arquivo com a data', () => {
    const json = JSON.parse(serializeBackup(sampleData(), NOW));
    expect(json.app).toBe('cade');
    expect(json.kind).toBe('backup');
    expect(json.schemaVersion).toBe(1);
    expect(json.exportedAt).toBe(NOW.toISOString());
    expect(backupFileName(NOW)).toBe('cade-backup-2026-11-07.json');
  });

  it('exportar e importar devolve exatamente os mesmos dados', () => {
    const data = sampleData();
    const parsed = parseBackupText(serializeBackup(data, NOW), NOW);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data).toEqual(data);
      expect(parsed.exportedAt).toBe(NOW.toISOString());
    }
  });
});

describe('importação inválida de backup', () => {
  function errorOf(text: string): string {
    const result = parseBackupText(text, NOW);
    return result.ok ? 'ok' : result.error;
  }

  it('arquivo vazio', () => {
    expect(errorOf('')).toBe('O arquivo está vazio.');
  });

  it('JSON malformado', () => {
    expect(errorOf('{"app": "cade",')).toBe('O arquivo não é um JSON válido.');
  });

  it('JSON de outro aplicativo', () => {
    expect(errorOf('{"nome": "planilha"}')).toBe('Este arquivo não parece ser um backup do CADÊ?.');
    expect(errorOf('[1, 2, 3]')).toBe('Este arquivo não parece ser um backup do CADÊ?.');
    expect(errorOf('"texto"')).toBe('Este arquivo não parece ser um backup do CADÊ?.');
  });

  it('versão mais nova do que a suportada', () => {
    const backup = JSON.parse(serializeBackup(sampleData(), NOW));
    backup.schemaVersion = 2;
    expect(errorOf(JSON.stringify(backup))).toMatch(/versão mais nova/);
  });

  it('valores negativos, tipos errados ou campos ausentes', () => {
    const negative = JSON.parse(serializeBackup(sampleData(), NOW));
    negative.data.diagnosis.financials.variableCosts.goods = -100;
    expect(errorOf(JSON.stringify(negative))).toMatch(/dados inválidos.*negativos/);

    const wrongType = JSON.parse(serializeBackup(sampleData(), NOW));
    wrongType.data.diagnosis.financials.revenue = '8000';
    expect(errorOf(JSON.stringify(wrongType))).toMatch(/dados inválidos/);

    const missing = JSON.parse(serializeBackup(sampleData(), NOW));
    delete missing.data.diagnosis.financials.fixedExpenses;
    expect(errorOf(JSON.stringify(missing))).toMatch(/dados inválidos/);
  });

  it('backup sem diagnóstico nem rascunho', () => {
    expect(errorOf(serializeBackup(createEmptyAppData(), NOW))).toBe(
      'O backup não contém nenhum diagnóstico para importar.',
    );
  });

  it('tentativa de injeção de protótipo não contamina objetos', () => {
    const backup = JSON.parse(serializeBackup(sampleData(), NOW));
    const text = JSON.stringify(backup).replace('"app":"cade"', '"__proto__":{"polluted":true},"app":"cade"');
    const result = parseBackupText(text, NOW);
    expect(result.ok).toBe(true);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('arquivo grande demais', () => {
    expect(errorOf(' '.repeat(10) + 'x'.repeat(MAX_BACKUP_BYTES + 1))).toMatch(/grande demais/);
  });

  it('readBackupFile valida tamanho e extensão antes de ler', async () => {
    const valid = new File([serializeBackup(sampleData(), NOW)], 'cade-backup.json', { type: 'application/json' });
    expect((await readBackupFile(valid, NOW)).ok).toBe(true);

    const wrongExtension = new File(['{}'], 'foto.png', { type: 'image/png' });
    const wrong = await readBackupFile(wrongExtension, NOW);
    expect(wrong.ok).toBe(false);

    const empty = new File([], 'vazio.json');
    expect(await readBackupFile(empty, NOW)).toEqual({ ok: false, error: 'O arquivo está vazio.' });

    const huge = new File(['x'.repeat(MAX_BACKUP_BYTES + 1)], 'grande.json');
    const hugeResult = await readBackupFile(huge, NOW);
    expect(hugeResult.ok).toBe(false);
  });
});
