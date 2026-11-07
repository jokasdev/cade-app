import type { Cents } from '../../types/finance';

/** Maior valor aceito em qualquer campo monetário: R$ 999.999.999,99. */
export const MAX_CENTS: Cents = 99_999_999_999;

/** Verifica se é um valor monetário válido: inteiro, finito, não negativo e dentro do limite. */
export function isValidCents(value: unknown): value is Cents {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= MAX_CENTS;
}

/**
 * Calcula round(a × b ÷ c) com aritmética inteira exata (BigInt), evitando
 * perda de precisão em produtos grandes. Arredonda metade para longe do zero.
 */
export function mulDivRound(a: number, b: number, c: number): number {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || !Number.isSafeInteger(c)) {
    throw new RangeError('mulDivRound aceita apenas inteiros seguros.');
  }
  if (c === 0) {
    throw new RangeError('Divisão por zero.');
  }
  const numerator = BigInt(a) * BigInt(b);
  const denominator = BigInt(c);
  const negative = numerator < 0n !== denominator < 0n;
  const absNumerator = numerator < 0n ? -numerator : numerator;
  const absDenominator = denominator < 0n ? -denominator : denominator;
  const rounded = (absNumerator * 2n + absDenominator) / (absDenominator * 2n);
  const result = Number(negative ? -rounded : rounded);
  return result === 0 ? 0 : result; // evita -0
}

/** Percentual de `part` em relação a `whole` (null quando `whole` é zero). */
export function percentOf(part: number, whole: number): number | null {
  if (whole === 0) return null;
  return (part / whole) * 100;
}

/** Converte um percentual (ex.: 12,5) em pontos-base inteiros (1.250). */
export function toBasisPoints(pct: number): number {
  return Math.round(pct * 100);
}

/** Soma valores em centavos. */
export function sumCents(values: readonly Cents[]): Cents {
  return values.reduce((total, value) => total + value, 0);
}
