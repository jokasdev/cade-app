import { describe, expect, it } from 'vitest';
import { computeFinancials } from '../calculations/financial';
import { REFERENCE_INPUT, makeInput } from '../calculations/testUtils';
import { buildInsights } from './insights';
import { buildSuggestions } from './suggestions';

function ids(input: Parameters<typeof computeFinancials>[0]): string[] {
  return buildInsights(computeFinancials(input)).map((insight) => insight.id);
}

describe('O que merece sua atenção? — regras determinísticas', () => {
  it('cenário de referência: resultado positivo, retirada coberta e ponto de equilíbrio', () => {
    const insights = buildInsights(computeFinancials(REFERENCE_INPUT));
    const found = insights.map((insight) => insight.id);
    expect(found).toContain('operating-result-positive');
    expect(found).toContain('withdrawal-covered');
    expect(found).toContain('break-even');
    expect(found).toContain('largest-cost');
    expect(found).not.toContain('operating-result-negative');
    expect(found).not.toContain('withdrawal-exceeds-result');

    const positive = insights.find((insight) => insight.id === 'operating-result-positive');
    expect(positive?.message).toContain('Seu negócio apresenta resultado operacional positivo nesta simulação.');
    expect(positive?.message).toContain('R$ 3.000,00');
  });

  it('custos variáveis iguais ou maiores que o faturamento', () => {
    const insights = buildInsights(
      computeFinancials(makeInput({ revenue: 100_000, variable: { goods: 120_000 } })),
    );
    expect(insights[0]?.id).toBe('variable-costs-consume-revenue');
    expect(insights[0]?.severity).toBe('critical');
    expect(insights[0]?.message).toContain(
      'Seus custos variáveis estão consumindo todo o faturamento ou ultrapassando esse valor.',
    );
    expect(ids(makeInput({ revenue: 100_000, variable: { goods: 100_000 } }))).toContain(
      'variable-costs-consume-revenue',
    );
  });

  it('resultado operacional negativo', () => {
    const insights = buildInsights(
      computeFinancials(makeInput({ revenue: 800_000, variable: { goods: 300_000 }, fixed: { payroll: 600_000 } })),
    );
    const negative = insights.find((insight) => insight.id === 'operating-result-negative');
    expect(negative?.severity).toBe('critical');
    expect(negative?.message).toContain(
      'Com os valores informados, as despesas operacionais estão superiores à margem de contribuição.',
    );
    expect(negative?.message).toContain('R$ 1.000,00');
  });

  it('retirada superior ao resultado operacional', () => {
    const insights = buildInsights(
      computeFinancials(makeInput({ revenue: 800_000, variable: { goods: 300_000 }, fixed: { rent: 200_000 }, withdrawal: 400_000 })),
    );
    const withdrawal = insights.find((insight) => insight.id === 'withdrawal-exceeds-result');
    expect(withdrawal?.severity).toBe('warning');
    expect(withdrawal?.message).toContain('A retirada informada é superior ao resultado operacional estimado.');
    // Meta = (200.000 + 400.000) × 800.000 ÷ 500.000 = 960.000
    expect(withdrawal?.message).toContain('R$ 9.600,00');
  });

  it('retirada zero não gera alerta de retirada, mas gera lembrete', () => {
    const found = ids(makeInput({ revenue: 100_000, variable: { goods: 20_000 }, fixed: { rent: 100_000 } }));
    expect(found).toContain('operating-result-negative');
    expect(found).not.toContain('withdrawal-exceeds-result');
    expect(found).toContain('no-withdrawal');
  });

  it('resultado zero', () => {
    expect(ids(makeInput({ revenue: 800_000, variable: { goods: 300_000 }, fixed: { rent: 500_000 } }))).toContain(
      'operating-result-zero',
    );
  });

  it('nenhum custo informado', () => {
    const found = ids(makeInput({ revenue: 100_000 }));
    expect(found).toContain('no-costs');
    expect(found).not.toContain('largest-cost');
  });

  it('ordena por gravidade: crítico, atenção, positivo, informativo', () => {
    const insights = buildInsights(
      computeFinancials(makeInput({ revenue: 100_000, variable: { goods: 150_000 }, fixed: { rent: 10_000 }, withdrawal: 5_000 })),
    );
    const order = { critical: 0, warning: 1, positive: 2, info: 3 } as const;
    const severities = insights.map((insight) => order[insight.severity]);
    expect(severities).toEqual([...severities].sort((a, b) => a - b));
  });

  it('é determinístico: mesma entrada, mesmo resultado', () => {
    const first = buildInsights(computeFinancials(REFERENCE_INPUT));
    const second = buildInsights(computeFinancials(REFERENCE_INPUT));
    expect(second).toEqual(first);
  });
});

describe('sugestões de organização', () => {
  it('inclui dica do maior gasto e do segmento', () => {
    const suggestions = buildSuggestions(computeFinancials(REFERENCE_INPUT), 'alimentacao');
    const found = suggestions.map((suggestion) => suggestion.id);
    expect(found).toContain('largest-goods');
    expect(found).toContain('segment-alimentacao');
    expect(suggestions.length).toBeLessThanOrEqual(6);
  });

  it('margem negativa sugere revisar preços', () => {
    const suggestions = buildSuggestions(computeFinancials(makeInput({ revenue: 100_000, variable: { goods: 150_000 } })));
    expect(suggestions[0]?.id).toBe('review-pricing');
  });

  it('resultado negativo com margem positiva sugere buscar o ponto de equilíbrio', () => {
    const suggestions = buildSuggestions(
      computeFinancials(makeInput({ revenue: 800_000, variable: { goods: 300_000 }, fixed: { payroll: 600_000 } })),
    );
    expect(suggestions[0]?.id).toBe('reach-break-even');
    expect(suggestions[0]?.text).toContain('R$ 9.600,00');
  });
});
