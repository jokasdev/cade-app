import { describe, expect, it } from 'vitest';
import {
  formatBRL,
  formatBRLCompact,
  formatDecimal,
  formatIsoDate,
  formatMoneyInput,
  formatPercent,
  formatPeriod,
} from './format';

const NBSP = ' ';
const MINUS = '−';

describe('formatação em reais', () => {
  it('formatBRL usa o padrão brasileiro', () => {
    expect(formatBRL(800_000)).toBe(`R$${NBSP}8.000,00`);
    expect(formatBRL(123_456_789)).toBe(`R$${NBSP}1.234.567,89`);
    expect(formatBRL(5)).toBe(`R$${NBSP}0,05`);
    expect(formatBRL(0)).toBe(`R$${NBSP}0,00`);
    // Sinal de menos tipográfico (U+2212), que não quebra linha antes do “R$”.
    expect(formatBRL(-300_000)).toBe(`${MINUS}R$${NBSP}3.000,00`);
  });

  it('formatBRL com sinal explícito para diferenças', () => {
    expect(formatBRL(50_000, { signDisplay: 'always' })).toBe(`+R$${NBSP}500,00`);
    expect(formatBRL(-50_000, { signDisplay: 'always' })).toBe(`${MINUS}R$${NBSP}500,00`);
    expect(formatBRL(0, { signDisplay: 'always' })).toBe(`R$${NBSP}0,00`);
  });

  it('formatBRL não quebra com valores enormes ou inválidos', () => {
    expect(formatBRL(1e22)).toBe(`R$${NBSP}100.000.000.000.000.000.000,00`);
    expect(formatBRL(Number.NaN)).toBe('—');
  });

  it('formatMoneyInput e formatBRLCompact', () => {
    expect(formatMoneyInput(123_456)).toBe('1.234,56');
    expect(formatMoneyInput(0)).toBe('0,00');
    expect(formatBRLCompact(1_250_000)).toBe(`R$${NBSP}12,5 mil`);
    expect(formatBRLCompact(50_000)).toBe(`R$${NBSP}500`);
    expect(formatBRLCompact(-250_000_000)).toBe(`${MINUS}R$${NBSP}2,5 mi`);
  });
});

describe('formatação de percentuais e números', () => {
  it('formatPercent', () => {
    expect(formatPercent(62.5)).toBe('62,5%');
    expect(formatPercent(40)).toBe('40%');
    expect(formatPercent(-12.5)).toBe(`${MINUS}12,5%`);
    expect(formatPercent(12.5, { signDisplay: 'always' })).toBe('+12,5%');
    expect(formatPercent(0, { signDisplay: 'always' })).toBe('0%');
    expect(formatPercent(null)).toBe('—');
    expect(formatPercent(1234.56)).toBe('1.234,6%');
  });

  it('formatDecimal', () => {
    expect(formatDecimal(73.00056, 1)).toBe('73');
    expect(formatDecimal(-0.04, 1)).toBe('0');
  });
});

describe('datas e períodos', () => {
  it('formatPeriod', () => {
    expect(formatPeriod(3, 2026)).toBe('Março de 2026');
    expect(formatPeriod(12, 2025)).toBe('Dezembro de 2025');
  });

  it('formatIsoDate', () => {
    expect(formatIsoDate(new Date(2026, 10, 7))).toBe('2026-11-07');
  });
});
