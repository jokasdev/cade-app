import { describe, expect, it } from 'vitest';
import { parseMoney, parseOptionalMoney, parsePercent } from './parse';

function cents(text: string): number | string {
  const result = parseMoney(text);
  return result.ok ? result.cents : result.error;
}

describe('parseMoney — valores em reais digitados pelo usuário', () => {
  it('aceita o padrão brasileiro', () => {
    expect(cents('8.000,00')).toBe(800_000);
    expect(cents('1.234,56')).toBe(123_456);
    expect(cents('1234,56')).toBe(123_456);
    expect(cents('0,5')).toBe(50);
    expect(cents(',99')).toBe(99);
    expect(cents('1.234.567,89')).toBe(123_456_789);
  });

  it('aceita prefixo R$ e espaços', () => {
    expect(cents('R$ 1.500')).toBe(150_000);
    expect(cents(' r$1500,5 ')).toBe(150_050);
  });

  it('interpreta ponto como milhar quando seguido de 3 dígitos e como decimal nos demais casos', () => {
    expect(cents('8.000')).toBe(800_000);
    expect(cents('1.234.567')).toBe(123_456_700);
    expect(cents('1234.56')).toBe(123_456);
    expect(cents('12.5')).toBe(1_250);
    expect(cents('12.')).toBe(1_200);
  });

  it('aceita números inteiros e zero', () => {
    expect(cents('8000')).toBe(800_000);
    expect(cents('0')).toBe(0);
    expect(cents('000150')).toBe(15_000);
  });

  it('rejeita negativos', () => {
    expect(cents('-50')).toBe('negative');
    expect(cents('R$ -1.000,00')).toBe('negative');
  });

  it('rejeita textos e formatos inválidos', () => {
    expect(cents('abc')).toBe('invalid');
    expect(cents('12a')).toBe('invalid');
    expect(cents('1,2,3')).toBe('invalid');
    expect(cents('1,234.56')).toBe('invalid');
    expect(cents('1.23,45')).toBe('invalid');
    expect(cents('1.2345')).toBe('invalid');
    expect(cents('.')).toBe('invalid');
    expect(cents('1e5')).toBe('invalid');
  });

  it('rejeita mais de duas casas decimais', () => {
    expect(cents('10,999')).toBe('too-many-decimals');
  });

  it('rejeita valores acima do limite', () => {
    expect(cents('999.999.999,99')).toBe(99_999_999_999);
    expect(cents('1.000.000.000')).toBe('too-large');
  });

  it('vazio é erro no campo obrigatório e zero no opcional', () => {
    expect(cents('')).toBe('empty');
    expect(cents('   ')).toBe('empty');
    expect(parseOptionalMoney('')).toEqual({ ok: true, cents: 0 });
    expect(parseOptionalMoney('12,30')).toEqual({ ok: true, cents: 1_230 });
  });
});

describe('parsePercent', () => {
  it('aceita vírgula, ponto e símbolo %', () => {
    expect(parsePercent('12,5', 0, 100)).toEqual({ ok: true, value: 12.5 });
    expect(parsePercent('7.25', 0, 100)).toEqual({ ok: true, value: 7.25 });
    expect(parsePercent('15%', 0, 100)).toEqual({ ok: true, value: 15 });
  });

  it('valida limites e formato', () => {
    expect(parsePercent('', 0, 100).ok).toBe(false);
    expect(parsePercent('0', 0, 100).ok).toBe(false);
    expect(parsePercent('101', 0, 100).ok).toBe(false);
    expect(parsePercent('-3', 0, 100).ok).toBe(false);
    expect(parsePercent('1,234', 0, 100).ok).toBe(false);
    expect(parsePercent('dez', 0, 100).ok).toBe(false);
  });
});
