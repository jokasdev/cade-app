import { describe, expect, it } from 'vitest';
import { MAX_CENTS, isValidCents, mulDivRound, percentOf, sumCents, toBasisPoints } from './money';

describe('mulDivRound', () => {
  it('calcula a × b ÷ c com arredondamento para o inteiro mais próximo', () => {
    expect(mulDivRound(200_000, 800_000, 500_000)).toBe(320_000);
    expect(mulDivRound(5, 1, 3)).toBe(2); // 1,67
    expect(mulDivRound(4, 1, 3)).toBe(1); // 1,33
  });

  it('arredonda a metade para longe do zero', () => {
    expect(mulDivRound(1, 1, 2)).toBe(1);
    expect(mulDivRound(3, 1, 2)).toBe(2);
    expect(mulDivRound(-1, 1, 2)).toBe(-1);
    expect(mulDivRound(1, -3, 2)).toBe(-2);
  });

  it('não devolve -0', () => {
    expect(Object.is(mulDivRound(0, -5, 3), 0)).toBe(true);
  });

  it('é exato para produtos acima de 2^53', () => {
    // 99.999.999.999 × 99.999.999.998 ultrapassa a precisão do Number
    expect(mulDivRound(99_999_999_998, 99_999_999_999, 99_999_999_999)).toBe(99_999_999_998);
  });

  it('rejeita divisão por zero e números não inteiros', () => {
    expect(() => mulDivRound(1, 1, 0)).toThrow(RangeError);
    expect(() => mulDivRound(1.5, 1, 1)).toThrow(RangeError);
  });
});

describe('auxiliares monetários', () => {
  it('isValidCents', () => {
    expect(isValidCents(0)).toBe(true);
    expect(isValidCents(MAX_CENTS)).toBe(true);
    expect(isValidCents(MAX_CENTS + 1)).toBe(false);
    expect(isValidCents(-1)).toBe(false);
    expect(isValidCents(1.5)).toBe(false);
    expect(isValidCents('100')).toBe(false);
  });

  it('percentOf devolve null quando o total é zero', () => {
    expect(percentOf(5_000, 8_000)).toBeCloseTo(62.5, 10);
    expect(percentOf(1, 0)).toBeNull();
  });

  it('toBasisPoints e sumCents', () => {
    expect(toBasisPoints(12.5)).toBe(1_250);
    expect(toBasisPoints(0.01)).toBe(1);
    expect(sumCents([10, 20, 30])).toBe(60);
    expect(sumCents([])).toBe(0);
  });
});
