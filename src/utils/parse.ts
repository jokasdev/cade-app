import { MAX_CENTS } from '../services/calculations/money';
import type { Cents } from '../types/finance';

export type MoneyParseError = 'empty' | 'negative' | 'invalid' | 'too-many-decimals' | 'too-large';

export type MoneyParseResult = { ok: true; cents: Cents } | { ok: false; error: MoneyParseError };

export const MONEY_ERROR_MESSAGES: Record<MoneyParseError, string> = {
  empty: 'Informe um valor.',
  negative: 'Não são aceitos valores negativos.',
  invalid: 'Valor inválido. Use apenas números, por exemplo: 1.250,90.',
  'too-many-decimals': 'Use no máximo duas casas decimais (centavos).',
  'too-large': 'Valor muito alto. O limite é R$ 999.999.999,99.',
};

/**
 * Interpreta um valor digitado em reais e devolve centavos inteiros, sem usar ponto flutuante.
 *
 * Aceita o padrão brasileiro e variações comuns:
 *  "1.234,56" · "1234,56" · "1234.56" · "8.000" (oito mil) · "R$ 99,9" · "0,5"
 */
export function parseMoney(raw: string): MoneyParseResult {
  const text = raw.replace(/r\$/gi, '').replace(/[\s ]/g, '');
  if (text === '') return { ok: false, error: 'empty' };
  if (text.includes('-')) return { ok: false, error: 'negative' };
  if (!/^[\d.,]+$/.test(text) || !/\d/.test(text)) return { ok: false, error: 'invalid' };

  let integerPart: string;
  let fractionPart = '';

  const commaCount = (text.match(/,/g) ?? []).length;
  if (commaCount > 1) return { ok: false, error: 'invalid' };

  if (commaCount === 1) {
    // Vírgula é o separador decimal; pontos são separadores de milhar.
    const [left = '', right = ''] = text.split(',');
    if (right.includes('.')) return { ok: false, error: 'invalid' };
    if (!isValidThousandsGrouping(left)) return { ok: false, error: 'invalid' };
    integerPart = left.replace(/\./g, '');
    fractionPart = right;
  } else if (text.includes('.')) {
    const groups = text.split('.');
    const last = groups[groups.length - 1] ?? '';
    if (groups.length > 2) {
      // Vários pontos: todos são separadores de milhar (ex.: 1.234.567).
      if (!isValidThousandsGrouping(text)) return { ok: false, error: 'invalid' };
      integerPart = groups.join('');
    } else if (last.length === 3) {
      // Um ponto seguido de 3 dígitos: milhar (ex.: 8.000 = oito mil).
      integerPart = groups.join('');
    } else {
      // Um ponto seguido de 0 a 2 dígitos: decimal (ex.: 1234.5).
      if (last.length > 3) return { ok: false, error: 'invalid' };
      integerPart = groups[0] ?? '';
      fractionPart = last;
    }
  } else {
    integerPart = text;
  }

  if (fractionPart.length > 2) return { ok: false, error: 'too-many-decimals' };

  const normalizedInteger = integerPart.replace(/^0+(?=\d)/, '');
  if (normalizedInteger.length > 9) return { ok: false, error: 'too-large' };

  const cents = Number(normalizedInteger || '0') * 100 + Number(fractionPart.padEnd(2, '0') || '0');
  if (!Number.isSafeInteger(cents)) return { ok: false, error: 'invalid' };
  if (cents > MAX_CENTS) return { ok: false, error: 'too-large' };
  return { ok: true, cents };
}

/** Confere se os pontos de milhar estão em posições válidas (grupos de 3 dígitos). */
function isValidThousandsGrouping(value: string): boolean {
  if (!value.includes('.')) return true;
  const groups = value.split('.');
  const [first = '', ...rest] = groups;
  if (first.length === 0 || first.length > 3) return false;
  return rest.every((group) => /^\d{3}$/.test(group));
}

/** Campo monetário opcional: vazio vale R$ 0,00. */
export function parseOptionalMoney(raw: string): MoneyParseResult {
  if (raw.trim() === '') return { ok: true, cents: 0 };
  return parseMoney(raw);
}

export type PercentParseResult = { ok: true; value: number } | { ok: false; error: string };

/** Interpreta um percentual digitado ("12,5", "12.5", "15%") com no máximo duas casas decimais. */
export function parsePercent(raw: string, min: number, max: number): PercentParseResult {
  const text = raw.replace(/%/g, '').replace(/[\s ]/g, '');
  if (text === '') return { ok: false, error: 'Informe um percentual.' };
  if (text.includes('-')) return { ok: false, error: 'Não são aceitos valores negativos.' };
  if (!/^\d+([.,]\d+)?$/.test(text)) return { ok: false, error: 'Percentual inválido. Use apenas números, por exemplo: 12,5.' };
  const [, decimals = ''] = text.split(/[.,]/);
  if (decimals.length > 2) return { ok: false, error: 'Use no máximo duas casas decimais.' };
  const value = Number(text.replace(',', '.'));
  if (!Number.isFinite(value)) return { ok: false, error: 'Percentual inválido.' };
  if (value <= min) return { ok: false, error: `Informe um percentual maior que ${min}%.` };
  if (value > max) return { ok: false, error: `O percentual máximo é ${max}%.` };
  return { ok: true, value };
}
