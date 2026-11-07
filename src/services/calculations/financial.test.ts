import { describe, expect, it } from 'vitest';
import {
  FinancialInputError,
  computeFinancials,
  computeIndicators,
  perHundredSold,
  totalsFromInput,
  validateFinancialInput,
} from './financial';
import { MAX_CENTS } from './money';
import { REFERENCE_INPUT, makeInput } from './testUtils';

describe('motor financeiro — cenário de referência', () => {
  // F = R$ 8.000 · CV = R$ 3.000 · DF = R$ 2.000 · R = R$ 1.000
  const result = computeFinancials(REFERENCE_INPUT);

  it('soma os grupos de custos e despesas', () => {
    expect(result.revenue).toBe(800_000);
    expect(result.variableCostsTotal).toBe(300_000);
    expect(result.fixedExpensesTotal).toBe(200_000);
    expect(result.ownerWithdrawal).toBe(100_000);
    expect(result.totalCosts).toBe(500_000);
  });

  it('margem de contribuição = R$ 5.000,00', () => {
    expect(result.contributionMargin).toBe(500_000);
  });

  it('percentual da margem de contribuição = 62,5%', () => {
    expect(result.contributionMarginPct).toBeCloseTo(62.5, 10);
  });

  it('resultado operacional estimado = R$ 3.000,00 (37,5%)', () => {
    expect(result.operatingResult).toBe(300_000);
    expect(result.operatingResultPct).toBeCloseTo(37.5, 10);
  });

  it('resultado após retirada = R$ 2.000,00', () => {
    expect(result.resultAfterWithdrawal).toBe(200_000);
  });

  it('ponto de equilíbrio operacional = R$ 3.200,00', () => {
    expect(result.breakEven).toEqual({ status: 'finite', value: 320_000 });
  });

  it('meta de faturamento incluindo a retirada = R$ 4.800,00', () => {
    expect(result.revenueTarget).toEqual({ status: 'finite', value: 480_000 });
  });

  it('margem de segurança = R$ 4.800,00 (60%)', () => {
    expect(result.safetyMargin?.value).toBe(480_000);
    expect(result.safetyMargin?.pct).toBeCloseTo(60, 10);
  });

  it('identifica o maior item e o maior grupo de custos', () => {
    expect(result.largestCost?.key).toBe('goods');
    expect(result.largestCost?.value).toBe(200_000);
    expect(result.largestCost?.shareOfRevenue).toBeCloseTo(25, 10);
    expect(result.largestCost?.shareOfTotalCosts).toBeCloseTo(40, 10);
    expect(result.largestGroup).toBe('variable');
  });

  it('lista todos os 13 itens ordenados do maior para o menor', () => {
    expect(result.costItems).toHaveLength(13);
    const values = result.costItems.map((item) => item.value);
    expect(values).toEqual([...values].sort((a, b) => b - a));
    expect(result.costItems[1]?.key).toBe('rent');
  });
});

describe('motor financeiro — casos especiais', () => {
  it('faturamento zero: percentuais e ponto de equilíbrio indisponíveis, sem erro', () => {
    const result = computeFinancials(makeInput({ revenue: 0, fixed: { rent: 100_000 } }));
    expect(result.contributionMargin).toBe(0);
    expect(result.contributionMarginPct).toBeNull();
    expect(result.operatingResult).toBe(-100_000);
    expect(result.operatingResultPct).toBeNull();
    expect(result.breakEven).toEqual({ status: 'not-applicable', reason: 'zero-revenue' });
    expect(result.revenueTarget).toEqual({ status: 'not-applicable', reason: 'zero-revenue' });
    expect(result.safetyMargin).toBeNull();
    expect(result.costItems.every((item) => item.shareOfRevenue === null)).toBe(true);
  });

  it('faturamento zero com custos variáveis gera margem negativa', () => {
    const result = computeFinancials(makeInput({ revenue: 0, variable: { goods: 5_000 } }));
    expect(result.contributionMargin).toBe(-5_000);
    expect(result.contributionMarginPct).toBeNull();
    expect(result.breakEven.status).toBe('not-applicable');
  });

  it('margem de contribuição negativa: sem ponto de equilíbrio finito', () => {
    const result = computeFinancials(
      makeInput({ revenue: 500_000, variable: { goods: 600_000 }, fixed: { rent: 100_000 } }),
    );
    expect(result.contributionMargin).toBe(-100_000);
    expect(result.contributionMarginPct).toBeCloseTo(-20, 10);
    expect(result.operatingResult).toBe(-200_000);
    expect(result.breakEven).toEqual({ status: 'not-applicable', reason: 'non-positive-margin' });
    expect(result.revenueTarget).toEqual({ status: 'not-applicable', reason: 'non-positive-margin' });
    expect(result.safetyMargin).toBeNull();
  });

  it('margem de contribuição igual a zero: sem ponto de equilíbrio finito', () => {
    const result = computeFinancials(
      makeInput({ revenue: 500_000, variable: { goods: 500_000 }, fixed: { rent: 50_000 } }),
    );
    expect(result.contributionMargin).toBe(0);
    expect(result.contributionMarginPct).toBe(0);
    expect(result.breakEven).toEqual({ status: 'not-applicable', reason: 'non-positive-margin' });
    expect(result.revenueTarget).toEqual({ status: 'not-applicable', reason: 'non-positive-margin' });
  });

  it('custos variáveis iguais ao faturamento: margem zero e resultado igual a −DF', () => {
    const result = computeFinancials(
      makeInput({ revenue: 300_000, variable: { goods: 200_000, delivery: 100_000 }, fixed: { rent: 80_000 } }),
    );
    expect(result.contributionMargin).toBe(0);
    expect(result.operatingResult).toBe(-80_000);
  });

  it('custos e despesas iguais ao faturamento: resultado zero e faturamento no ponto de equilíbrio', () => {
    const result = computeFinancials(
      makeInput({ revenue: 800_000, variable: { goods: 300_000 }, fixed: { rent: 500_000 } }),
    );
    expect(result.operatingResult).toBe(0);
    expect(result.operatingResultPct).toBe(0);
    expect(result.breakEven).toEqual({ status: 'finite', value: 800_000 });
    expect(result.safetyMargin?.value).toBe(0);
  });

  it('resultado operacional negativo com margem positiva', () => {
    const result = computeFinancials(
      makeInput({ revenue: 800_000, variable: { goods: 300_000 }, fixed: { payroll: 600_000 }, withdrawal: 50_000 }),
    );
    expect(result.operatingResult).toBe(-100_000);
    expect(result.operatingResultPct).toBeCloseTo(-12.5, 10);
    expect(result.resultAfterWithdrawal).toBe(-150_000);
    expect(result.breakEven).toEqual({ status: 'finite', value: 960_000 });
    expect(result.safetyMargin?.value).toBe(-160_000);
    expect(result.safetyMargin?.pct).toBeCloseTo(-20, 10);
    expect(result.largestGroup).toBe('fixed');
  });

  it('despesas fixas iguais a zero: ponto de equilíbrio R$ 0,00 e meta cobre só a retirada', () => {
    const result = computeFinancials(
      makeInput({ revenue: 800_000, variable: { goods: 300_000 }, withdrawal: 100_000 }),
    );
    expect(result.fixedExpensesTotal).toBe(0);
    expect(result.operatingResult).toBe(500_000);
    expect(result.breakEven).toEqual({ status: 'finite', value: 0 });
    expect(result.revenueTarget).toEqual({ status: 'finite', value: 160_000 });
  });

  it('despesas fixas e retirada iguais a zero: meta R$ 0,00', () => {
    const result = computeFinancials(makeInput({ revenue: 100_000, variable: { goods: 10_000 } }));
    expect(result.breakEven).toEqual({ status: 'finite', value: 0 });
    expect(result.revenueTarget).toEqual({ status: 'finite', value: 0 });
  });

  it('valores decimais são calculados em centavos, sem erro de arredondamento', () => {
    // R$ 0,10 + R$ 0,20 em ponto flutuante daria 0,30000000000000004
    const tiny = computeFinancials(makeInput({ revenue: 100, variable: { goods: 10, packaging: 20 } }));
    expect(tiny.variableCostsTotal).toBe(30);
    expect(tiny.contributionMargin).toBe(70);

    // F = R$ 1.234,56 · CV = R$ 333,33 · DF = R$ 456,78 · R = R$ 100,01
    const result = computeFinancials(
      makeInput({ revenue: 123_456, variable: { goods: 33_333 }, fixed: { rent: 45_678 }, withdrawal: 10_001 }),
    );
    expect(result.contributionMargin).toBe(90_123);
    expect(result.operatingResult).toBe(44_445);
    expect(result.resultAfterWithdrawal).toBe(34_444);
    expect(result.contributionMarginPct).toBeCloseTo((90_123 / 123_456) * 100, 10);
    // 45.678 × 123.456 ÷ 90.123 = 62.572,52 → arredondado para 62.573 centavos
    expect(result.breakEven).toEqual({ status: 'finite', value: 62_573 });
    expect(Number.isInteger(result.operatingResult)).toBe(true);
  });

  it('mantém precisão exata em valores muito altos', () => {
    const result = computeFinancials(makeInput({ revenue: MAX_CENTS, fixed: { rent: MAX_CENTS - 1 } }));
    expect(result.breakEven).toEqual({ status: 'finite', value: MAX_CENTS - 1 });
  });

  it('sem custos informados: maior custo e maior grupo nulos', () => {
    const result = computeFinancials(makeInput({ revenue: 100_000 }));
    expect(result.largestCost).toBeNull();
    expect(result.largestGroup).toBeNull();
    expect(result.costItems.every((item) => item.shareOfTotalCosts === null)).toBe(true);
  });

  it('empate entre grupos é identificado', () => {
    const result = computeFinancials(makeInput({ revenue: 100_000, variable: { goods: 20_000 }, fixed: { rent: 20_000 } }));
    expect(result.largestGroup).toBe('equal');
    // Em empate de itens, vale a ordem do formulário (custos variáveis primeiro).
    expect(result.largestCost?.key).toBe('goods');
  });
});

describe('motor financeiro — validação de dados', () => {
  it('rejeita dados ausentes', () => {
    expect(validateFinancialInput(undefined).ok).toBe(false);
    expect(validateFinancialInput(null).ok).toBe(false);
    expect(validateFinancialInput('8000').ok).toBe(false);
  });

  it('rejeita dados incompletos e informa o que falta', () => {
    const validation = validateFinancialInput({ revenue: 800_000 });
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.issues).toContain('Custos variáveis: grupo não informado.');
      expect(validation.issues).toContain('Despesas fixas: grupo não informado.');
      expect(validation.issues).toContain('Retirada do proprietário: valor não informado.');
    }
  });

  it('rejeita item de custo ausente', () => {
    const input = makeInput({ revenue: 800_000 }) as unknown as { variableCosts: Record<string, unknown> };
    delete input.variableCosts.goods;
    const validation = validateFinancialInput(input);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.issues[0]).toMatch(/Compra de mercadorias/);
    }
  });

  it('rejeita faturamento ausente', () => {
    const input = { ...makeInput({ revenue: 0 }), revenue: undefined };
    const validation = validateFinancialInput(input);
    expect(validation.ok).toBe(false);
    if (!validation.ok) expect(validation.issues).toContain('Faturamento: valor não informado.');
  });

  it('rejeita valores negativos, não numéricos, fracionados ou acima do limite', () => {
    const cases: unknown[] = [-1, Number.NaN, Number.POSITIVE_INFINITY, '100', 10.5, MAX_CENTS + 1];
    for (const value of cases) {
      const input = { ...makeInput({ revenue: 100_000 }), ownerWithdrawal: value };
      expect(validateFinancialInput(input).ok, String(value)).toBe(false);
    }
  });

  it('aceita zero em todos os campos de custo', () => {
    expect(validateFinancialInput(makeInput({ revenue: 100_000 })).ok).toBe(true);
  });

  it('computeFinancials lança FinancialInputError para dados inválidos', () => {
    const invalid = makeInput({ revenue: -100 });
    expect(() => computeFinancials(invalid)).toThrow(FinancialInputError);
    try {
      computeFinancials(invalid);
    } catch (error) {
      expect((error as FinancialInputError).issues).toContain('Faturamento: valores negativos não são aceitos.');
    }
  });

  it('computeIndicators rejeita totais inválidos', () => {
    expect(() =>
      computeIndicators({ revenue: 100, variableCosts: -1, fixedExpenses: 0, ownerWithdrawal: 0 }),
    ).toThrow(FinancialInputError);
  });
});

describe('utilitários do motor', () => {
  it('totalsFromInput soma os itens', () => {
    expect(totalsFromInput(REFERENCE_INPUT)).toEqual({
      revenue: 800_000,
      variableCosts: 300_000,
      fixedExpenses: 200_000,
      ownerWithdrawal: 100_000,
    });
  });

  it('perHundredSold: quanto de cada R$ 100 vendidos vai para cada destino', () => {
    expect(perHundredSold(300_000, 800_000)).toBe(3_750); // R$ 37,50
    expect(perHundredSold(-100_000, 800_000)).toBe(-1_250);
    expect(perHundredSold(100, 0)).toBeNull();
  });
});
