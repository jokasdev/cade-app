import type { AppData } from '../../types/app';
import { createEmptyAppData, parseAppData } from './schema';

/** Chave usada no localStorage. */
export const STORAGE_KEY = 'cade:dados:v1';
/** Cópia de segurança de dados salvos que não puderam ser lidos (evita perda silenciosa). */
export const UNREADABLE_BACKUP_KEY = 'cade:dados:v1:nao-lidos';

/** Interface mínima de armazenamento (compatível com localStorage), facilita testes. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type LoadResult =
  | { status: 'empty'; data: AppData }
  | { status: 'loaded'; data: AppData }
  | { status: 'invalid'; data: AppData; error: string }
  | { status: 'unavailable'; data: AppData };

export type SaveResult = { ok: true } | { ok: false; error: string };

/** Armazenamento em memória: usado nos testes e quando o navegador bloqueia o localStorage. */
export class MemoryStorage implements KeyValueStorage {
  private readonly items = new Map<string, string>();

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }

  removeItem(key: string): void {
    this.items.delete(key);
  }
}

/** Devolve o localStorage do navegador, ou null se estiver indisponível (modo privado, bloqueio, etc.). */
export function getBrowserStorage(): KeyValueStorage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const probe = '__cade_teste__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Recupera a sessão salva. Dados corrompidos não derrubam o app: são guardados à parte e o app recomeça. */
export function loadAppData(storage: KeyValueStorage | null, now: Date = new Date()): LoadResult {
  if (!storage) return { status: 'unavailable', data: createEmptyAppData() };

  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { status: 'unavailable', data: createEmptyAppData() };
  }
  if (raw === null || raw === '') return { status: 'empty', data: createEmptyAppData() };

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    preserveUnreadable(storage, raw);
    return { status: 'invalid', data: createEmptyAppData(), error: 'Os dados salvos estão corrompidos.' };
  }

  const parsed = parseAppData(parsedJson, now);
  if (!parsed.ok) {
    preserveUnreadable(storage, raw);
    return { status: 'invalid', data: createEmptyAppData(), error: parsed.error };
  }
  return { status: 'loaded', data: parsed.data };
}

function preserveUnreadable(storage: KeyValueStorage, raw: string): void {
  try {
    storage.setItem(UNREADABLE_BACKUP_KEY, raw);
  } catch {
    // Sem espaço para a cópia: segue sem ela.
  }
}

/** Salva os dados no navegador. */
export function saveAppData(storage: KeyValueStorage | null, data: AppData): SaveResult {
  if (!storage) return { ok: false, error: 'O armazenamento do navegador não está disponível.' };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { ok: true };
  } catch {
    return { ok: false, error: 'Não foi possível salvar os dados neste navegador (espaço cheio ou bloqueado).' };
  }
}

/** Apaga tudo o que o CADÊ? guardou neste navegador. */
export function clearAppData(storage: KeyValueStorage | null): void {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
    storage.removeItem(UNREADABLE_BACKUP_KEY);
  } catch {
    // Nada a fazer: o armazenamento já está inacessível.
  }
}
