import { APP_SCHEMA_VERSION, type AppData } from '../../types/app';
import { formatIsoDate } from '../../utils/format';
import { parseAppData } from '../storage/schema';

export const BACKUP_APP_ID = 'cade';
export const BACKUP_KIND = 'backup';
/** Um backup real tem poucos KB; o limite protege contra arquivos errados ou maliciosos. */
export const MAX_BACKUP_BYTES = 256 * 1024;

export interface BackupFile {
  app: typeof BACKUP_APP_ID;
  kind: typeof BACKUP_KIND;
  schemaVersion: typeof APP_SCHEMA_VERSION;
  exportedAt: string;
  data: AppData;
}

export type BackupParseResult = { ok: true; data: AppData; exportedAt: string | null } | { ok: false; error: string };

export function createBackup(data: AppData, now: Date = new Date()): BackupFile {
  return {
    app: BACKUP_APP_ID,
    kind: BACKUP_KIND,
    schemaVersion: APP_SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    data,
  };
}

export function serializeBackup(data: AppData, now: Date = new Date()): string {
  return JSON.stringify(createBackup(data, now), null, 2);
}

export function backupFileName(now: Date = new Date()): string {
  return `cade-backup-${formatIsoDate(now)}.json`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Valida o conteúdo de um arquivo de backup. Nada do arquivo é executado: ele só é lido como dados. */
export function parseBackupText(text: string, now: Date = new Date()): BackupParseResult {
  if (text.trim() === '') return { ok: false, error: 'O arquivo está vazio.' };
  if (text.length > MAX_BACKUP_BYTES) {
    return { ok: false, error: 'O arquivo é grande demais para ser um backup do CADÊ?.' };
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: 'O arquivo não é um JSON válido.' };
  }

  if (!isRecord(json) || json.app !== BACKUP_APP_ID || json.kind !== BACKUP_KIND) {
    return { ok: false, error: 'Este arquivo não parece ser um backup do CADÊ?.' };
  }
  if (typeof json.schemaVersion !== 'number') {
    return { ok: false, error: 'Este arquivo não parece ser um backup do CADÊ?.' };
  }
  if (json.schemaVersion > APP_SCHEMA_VERSION) {
    return { ok: false, error: 'Este backup foi criado por uma versão mais nova do CADÊ? e não pode ser importado.' };
  }
  if (json.schemaVersion !== APP_SCHEMA_VERSION) {
    return { ok: false, error: 'A versão deste backup não é reconhecida.' };
  }

  const parsed = parseAppData(json.data, now);
  if (!parsed.ok) return { ok: false, error: `O backup contém dados inválidos: ${parsed.error}` };
  if (!parsed.data.diagnosis && !parsed.data.draft) {
    return { ok: false, error: 'O backup não contém nenhum diagnóstico para importar.' };
  }

  const exportedAt =
    typeof json.exportedAt === 'string' && !Number.isNaN(Date.parse(json.exportedAt))
      ? new Date(json.exportedAt).toISOString()
      : null;
  return { ok: true, data: parsed.data, exportedAt };
}

/** Lê e valida um arquivo escolhido pelo usuário. */
export async function readBackupFile(file: Blob & { name?: string }, now: Date = new Date()): Promise<BackupParseResult> {
  if (file.size === 0) return { ok: false, error: 'O arquivo está vazio.' };
  if (file.size > MAX_BACKUP_BYTES) {
    return { ok: false, error: 'O arquivo é grande demais para ser um backup do CADÊ? (limite de 256 KB).' };
  }
  if (file.name && !file.name.toLowerCase().endsWith('.json')) {
    return { ok: false, error: 'Escolha um arquivo .json exportado pelo CADÊ?.' };
  }
  try {
    const text = await file.text();
    return parseBackupText(text, now);
  } catch {
    return { ok: false, error: 'Não foi possível ler o arquivo.' };
  }
}
