import { CircleCheck, CircleExclamationPoint, Info, LayoutDashboard, Printer, TriangleExclamationPoint } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { Button, ButtonLink } from '../../components/Button/Button';
import { NoDiagnosis } from '../../components/EmptyState/NoDiagnosis';
import { Logo } from '../../components/Logo/Logo';
import { Notice } from '../../components/Notice/Notice';
import { useAppData } from '../../context/appDataContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ROUTES, href } from '../../routes';
import { totalsFromInput } from '../../services/calculations/financial';
import {
  simulateCombined,
  simulateFixedExpenseReduction,
  simulateRevenueGrowth,
  simulateVariableCostReduction,
  type ScenarioComparison,
} from '../../services/calculations/simulations';
import { buildInsights, type InsightSeverity } from '../../services/diagnostics/insights';
import { buildSuggestions } from '../../services/diagnostics/suggestions';
import { printWithTitle } from '../../services/export/print';
import type { RevenueThreshold } from '../../types/finance';
import { COST_META, SEGMENT_LABELS } from '../../utils/categories';
import { formatBRL, formatDateTime, formatDecimal, formatPercent, formatPeriod } from '../../utils/format';
import { slugify } from '../../utils/text';
import './Report.css';

const SEVERITY_ICON: Record<InsightSeverity, { icon: ReactNode; label: string }> = {
  critical: { icon: <CircleExclamationPoint />, label: 'Alerta' },
  warning: { icon: <TriangleExclamationPoint />, label: 'Atenção' },
  positive: { icon: <CircleCheck />, label: 'Positivo' },
  info: { icon: <Info />, label: 'Informação' },
};

interface ReportScenario {
  key: string;
  title: string;
  premises: string[];
  comparison: ScenarioComparison;
}

function thresholdText(threshold: RevenueThreshold): string {
  if (threshold.status === 'finite') return formatBRL(threshold.value);
  return threshold.reason === 'zero-revenue' ? 'Indisponível (sem faturamento)' : 'Não há valor finito (margem ≤ 0)';
}

export default function ReportPage() {
  useDocumentTitle('Relatório');
  const { diagnosis, result, data } = useAppData();

  const insights = useMemo(() => (result ? buildInsights(result) : []), [result]);
  const suggestions = useMemo(
    () => (result && diagnosis ? buildSuggestions(result, diagnosis.business.segment) : []),
    [result, diagnosis],
  );

  const scenarios = useMemo<ReportScenario[]>(() => {
    if (!diagnosis) return [];
    const totals = totalsFromInput(diagnosis.financials);
    const { revenueGrowthPct, variableCostReductionPct, fixedExpenseReductionCents } = data.simulations;
    const fixedReduction =
      fixedExpenseReductionCents !== null && fixedExpenseReductionCents <= totals.fixedExpenses
        ? fixedExpenseReductionCents
        : null;
    const list: ReportScenario[] = [];
    if (revenueGrowthPct !== null) {
      list.push({
        key: 'growth',
        title: `Aumento de ${formatDecimal(revenueGrowthPct, 2)}% no faturamento`,
        premises: ['Custos variáveis crescem na mesma proporção do faturamento.', 'Despesas fixas e retirada permanecem iguais.'],
        comparison: simulateRevenueGrowth(totals, revenueGrowthPct),
      });
    }
    if (variableCostReductionPct !== null) {
      list.push({
        key: 'costs',
        title: `Redução de ${formatDecimal(variableCostReductionPct, 2)}% nos custos variáveis`,
        premises: ['Faturamento, despesas fixas e retirada permanecem iguais.'],
        comparison: simulateVariableCostReduction(totals, variableCostReductionPct),
      });
    }
    if (fixedReduction !== null) {
      list.push({
        key: 'fixed',
        title: `Economia de ${formatBRL(fixedReduction)} por mês nas despesas fixas`,
        premises: ['Faturamento, custos variáveis e retirada permanecem iguais.'],
        comparison: simulateFixedExpenseReduction(totals, fixedReduction),
      });
    }
    if (list.length >= 2) {
      list.push({
        key: 'combined',
        title: 'Cenário combinado (todas as hipóteses acima juntas)',
        premises: ['Aplica ao mesmo tempo as simulações listadas acima.'],
        comparison: simulateCombined(totals, {
          revenueGrowthPct,
          variableCostReductionPct,
          fixedExpenseReductionCents: fixedReduction,
        }),
      });
    }
    return list;
  }, [diagnosis, data.simulations]);

  if (!diagnosis || !result) {
    return (
      <div className="page">
        <div className="container">
          <header className="page-header">
            <div className="page-header__text">
              <h1 className="page-title">Relatório financeiro</h1>
            </div>
          </header>
          <NoDiagnosis what="o relatório" />
        </div>
      </div>
    );
  }

  const { business } = diagnosis;
  const period = formatPeriod(business.referenceMonth, business.referenceYear);
  const now = new Date().toISOString();
  const pctOfRevenue = (value: number) => formatPercent((value / result.revenue) * 100);

  const handlePrint = () => {
    const name = slugify(business.name) || 'negocio';
    const month = String(business.referenceMonth).padStart(2, '0');
    printWithTitle(`CADE-relatorio-${name}-${business.referenceYear}-${month}`);
  };

  const statement = [
    { label: 'Faturamento', value: result.revenue, kind: 'total' },
    { label: '(−) Custos variáveis', value: -result.variableCostsTotal, kind: 'minus' },
    { label: '(=) Margem de contribuição', value: result.contributionMargin, kind: 'subtotal' },
    { label: '(−) Despesas fixas', value: -result.fixedExpensesTotal, kind: 'minus' },
    { label: '(=) Resultado operacional estimado', value: result.operatingResult, kind: 'result' },
    { label: '(−) Retirada do proprietário', value: -result.ownerWithdrawal, kind: 'minus' },
    { label: '(=) Resultado após retirada', value: result.resultAfterWithdrawal, kind: 'result' },
  ] as const;

  const informedCosts = result.costItems.filter((item) => item.value > 0);
  const maxCost = informedCosts[0]?.value ?? 0;
  let section = 0;
  const nextSection = () => {
    section += 1;
    return section;
  };

  return (
    <div className="page report-page">
      <div className="container">
        <div className="report-toolbar no-print">
          <header className="page-header">
            <div className="page-header__text">
              <span className="eyebrow">Relatório</span>
              <h1 className="page-title">Seu relatório financeiro</h1>
              <p className="page-subtitle">Confira o conteúdo abaixo e salve em PDF para guardar, imprimir ou compartilhar.</p>
            </div>
            <div className="page-actions">
              <ButtonLink href={href(ROUTES.dashboard)} variant="secondary" icon={<LayoutDashboard />}>
                Voltar ao painel
              </ButtonLink>
              <Button size="lg" icon={<Printer />} onClick={handlePrint}>
                Baixar meu relatório em PDF
              </Button>
            </div>
          </header>
          <Notice tone="info" title="Como salvar em PDF">
            Ao tocar no botão, a janela de impressão do navegador será aberta. Em “Destino”, escolha{' '}
            <strong>Salvar como PDF</strong>. No celular, use a opção de imprimir e depois salve como PDF. Nada é enviado
            pela internet: o arquivo é gerado no seu aparelho.
          </Notice>
        </div>

        <article className="report-sheet" aria-label={`Relatório de diagnóstico financeiro — ${period}`}>
          <header className="report-header">
            <Logo size={34} />
            <div className="report-header__text">
              <p className="report-header__title">Relatório de diagnóstico financeiro</p>
              <p className="report-header__meta">Emitido em {formatDateTime(now)}</p>
            </div>
          </header>

          <dl className="report-identity">
            <div>
              <dt>Negócio</dt>
              <dd>{business.name || 'Não informado'}</dd>
            </div>
            <div>
              <dt>Segmento</dt>
              <dd>{SEGMENT_LABELS[business.segment]}</dd>
            </div>
            <div>
              <dt>Período analisado</dt>
              <dd>{period}</dd>
            </div>
            <div>
              <dt>Diagnóstico gerado em</dt>
              <dd>{formatDateTime(data.generatedAt)}</dd>
            </div>
          </dl>

          {/* Resumo */}
          <section className="report-section">
            <h2 className="report-section__title">{nextSection()}. Resumo do mês</h2>
            <div className="report-highlights">
              <div className={`report-highlight report-highlight--main ${result.operatingResult < 0 ? 'is-negative' : 'is-positive'}`}>
                <span>Resultado operacional estimado</span>
                <strong>{formatBRL(result.operatingResult)}</strong>
                <small>{formatPercent(result.operatingResultPct)} do faturamento</small>
              </div>
              <div className="report-highlight">
                <span>Resultado após retirada</span>
                <strong className={result.resultAfterWithdrawal < 0 ? 'text-negative' : ''}>
                  {formatBRL(result.resultAfterWithdrawal)}
                </strong>
                <small>Retirada de {formatBRL(result.ownerWithdrawal)}</small>
              </div>
              <div className="report-highlight">
                <span>Margem de contribuição</span>
                <strong>{formatPercent(result.contributionMarginPct)}</strong>
                <small>{formatBRL(result.contributionMargin)}</small>
              </div>
              <div className="report-highlight">
                <span>Ponto de equilíbrio</span>
                <strong>{result.breakEven.status === 'finite' ? formatBRL(result.breakEven.value) : '—'}</strong>
                <small>{result.breakEven.status === 'finite' ? 'faturamento mensal' : 'sem valor finito'}</small>
              </div>
            </div>

            <table className="report-table">
              <caption className="sr-only">Demonstração simplificada do resultado</caption>
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Valor</th>
                  <th scope="col">% do faturamento</th>
                </tr>
              </thead>
              <tbody>
                {statement.map((row) => (
                  <tr key={row.label} className={`report-table__row--${row.kind}`}>
                    <th scope="row">{row.label}</th>
                    <td className={row.kind === 'result' ? (row.value < 0 ? 'text-negative' : 'text-positive') : ''}>
                      {formatBRL(row.value)}
                    </td>
                    <td>{pctOfRevenue(Math.abs(row.value))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Indicadores */}
          <section className="report-section">
            <h2 className="report-section__title">{nextSection()}. Indicadores</h2>
            <table className="report-table report-table--indicators">
              <caption className="sr-only">Indicadores financeiros</caption>
              <tbody>
                <tr>
                  <th scope="row">Faturamento mensal</th>
                  <td>{formatBRL(result.revenue)}</td>
                </tr>
                <tr>
                  <th scope="row">Custos variáveis</th>
                  <td>
                    {formatBRL(result.variableCostsTotal)} ({pctOfRevenue(result.variableCostsTotal)})
                  </td>
                </tr>
                <tr>
                  <th scope="row">Despesas fixas</th>
                  <td>
                    {formatBRL(result.fixedExpensesTotal)} ({pctOfRevenue(result.fixedExpensesTotal)})
                  </td>
                </tr>
                <tr>
                  <th scope="row">Margem de contribuição</th>
                  <td>
                    {formatBRL(result.contributionMargin)} ({formatPercent(result.contributionMarginPct)})
                  </td>
                </tr>
                <tr>
                  <th scope="row">Resultado operacional estimado</th>
                  <td>
                    {formatBRL(result.operatingResult)} ({formatPercent(result.operatingResultPct)})
                  </td>
                </tr>
                <tr>
                  <th scope="row">Retirada do proprietário</th>
                  <td>{formatBRL(result.ownerWithdrawal)}</td>
                </tr>
                <tr>
                  <th scope="row">Resultado após retirada</th>
                  <td>{formatBRL(result.resultAfterWithdrawal)}</td>
                </tr>
                <tr>
                  <th scope="row">Ponto de equilíbrio operacional</th>
                  <td>{thresholdText(result.breakEven)}</td>
                </tr>
                <tr>
                  <th scope="row">Faturamento necessário incluindo a retirada</th>
                  <td>{thresholdText(result.revenueTarget)}</td>
                </tr>
                {result.safetyMargin && result.fixedExpensesTotal > 0 && (
                  <tr>
                    <th scope="row">Margem de segurança</th>
                    <td>
                      {formatBRL(result.safetyMargin.value)} ({formatPercent(result.safetyMargin.pct)})
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {result.breakEven.status !== 'finite' && (
              <p className="report-note">
                Não há ponto de equilíbrio finito porque a margem de contribuição é zero ou negativa: os custos variáveis
                consomem todo o faturamento, então vender mais com a mesma estrutura não cobre as despesas fixas.
              </p>
            )}
          </section>

          {/* Custos */}
          <section className="report-section">
            <h2 className="report-section__title">{nextSection()}. Para onde o dinheiro está indo</h2>
            {informedCosts.length === 0 ? (
              <p className="report-note">Nenhum custo ou despesa foi informado.</p>
            ) : (
              <table className="report-table report-table--costs">
                <caption className="sr-only">Custos e despesas por categoria</caption>
                <thead>
                  <tr>
                    <th scope="col">Categoria</th>
                    <th scope="col">Grupo</th>
                    <th scope="col">Valor</th>
                    <th scope="col">% do faturamento</th>
                    <th scope="col">% dos custos</th>
                  </tr>
                </thead>
                <tbody>
                  {informedCosts.map((item) => (
                    <tr key={item.key}>
                      <th scope="row">
                        {COST_META[item.key].shortLabel}
                        <span className="report-bar" aria-hidden="true">
                          <span
                            className={`report-bar__fill report-bar__fill--${item.group}`}
                            style={{ width: `${(item.value / maxCost) * 100}%` }}
                          />
                        </span>
                      </th>
                      <td>{item.group === 'variable' ? 'Variável' : 'Fixa'}</td>
                      <td>{formatBRL(item.value)}</td>
                      <td>{formatPercent(item.shareOfRevenue)}</td>
                      <td>{formatPercent(item.shareOfTotalCosts)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Diagnóstico */}
          <section className="report-section">
            <h2 className="report-section__title">{nextSection()}. Diagnóstico</h2>
            <ul className="report-insights" role="list">
              {insights.map((insight) => (
                <li key={insight.id} className={`report-insight report-insight--${insight.severity}`}>
                  <span className="report-insight__icon" aria-hidden="true">
                    {SEVERITY_ICON[insight.severity].icon}
                  </span>
                  <div>
                    <p className="report-insight__title">
                      <span className="report-insight__tag">{SEVERITY_ICON[insight.severity].label}:</span> {insight.title}
                    </p>
                    <p className="report-insight__text">{insight.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Sugestões */}
          <section className="report-section">
            <h2 className="report-section__title">{nextSection()}. Sugestões de organização e melhoria</h2>
            <ol className="report-suggestions">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <strong>{suggestion.title}.</strong> {suggestion.text}
                </li>
              ))}
            </ol>
          </section>

          {/* Cenários */}
          {scenarios.length > 0 && (
            <section className="report-section">
              <h2 className="report-section__title">{nextSection()}. Cenários simulados</h2>
              <p className="report-note">Hipóteses configuradas no simulador. Não são previsões.</p>
              {scenarios.map((scenario) => {
                const { base, simulated, delta } = scenario.comparison;
                const rows = [
                  { label: 'Faturamento', current: base.revenue, next: simulated.revenue },
                  { label: 'Custos variáveis', current: base.variableCostsTotal, next: simulated.variableCostsTotal },
                  { label: 'Despesas fixas', current: base.fixedExpensesTotal, next: simulated.fixedExpensesTotal },
                  { label: 'Resultado operacional', current: base.operatingResult, next: simulated.operatingResult },
                  { label: 'Resultado após retirada', current: base.resultAfterWithdrawal, next: simulated.resultAfterWithdrawal },
                ];
                return (
                  <div key={scenario.key} className="report-scenario">
                    <h3 className="report-scenario__title">{scenario.title}</h3>
                    <p className="report-scenario__premises">Premissas: {scenario.premises.join(' ')}</p>
                    <table className="report-table report-table--scenario">
                      <caption className="sr-only">{scenario.title}</caption>
                      <thead>
                        <tr>
                          <th scope="col">Indicador</th>
                          <th scope="col">Situação atual</th>
                          <th scope="col">Cenário simulado</th>
                          <th scope="col">Diferença</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.label}>
                            <th scope="row">{row.label}</th>
                            <td>{formatBRL(row.current)}</td>
                            <td>{formatBRL(row.next)}</td>
                            <td>{row.next === row.current ? '—' : formatBRL(row.next - row.current, { signDisplay: 'always' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="report-scenario__summary">
                      Diferença no resultado operacional: <strong>{formatBRL(delta.operatingResult, { signDisplay: 'always' })}</strong>{' '}
                      por mês.
                    </p>
                  </div>
                );
              })}
            </section>
          )}

          {/* Premissas */}
          <section className="report-section report-section--assumptions">
            <h2 className="report-section__title">Premissas e avisos importantes</h2>
            <ul className="report-assumptions">
              <li>Valores informados pelo usuário, referentes a {period}, em reais (R$).</li>
              <li>
                Fórmulas: Margem de contribuição = Faturamento − Custos variáveis · Resultado operacional = Faturamento −
                Custos variáveis − Despesas fixas · Resultado após retirada = Resultado operacional − Retirada · Ponto de
                equilíbrio = Despesas fixas ÷ (Margem de contribuição ÷ Faturamento) · Meta com retirada = (Despesas fixas +
                Retirada) ÷ (Margem de contribuição ÷ Faturamento).
              </li>
              <li>
                O resultado operacional estimado não é lucro líquido contábil, e faturamento não é o mesmo que dinheiro
                disponível em caixa.
              </li>
              <li>
                Os resultados são estimativas simplificadas, não são documentos contábeis ou fiscais e não substituem a
                contabilidade nem a orientação de um profissional.
              </li>
            </ul>
          </section>

          <footer className="report-footer">
            <span>Gerado pelo CADÊ? · Diagnóstico financeiro para pequenos negócios</span>
            <span>Dados processados localmente no navegador do usuário.</span>
          </footer>
        </article>
      </div>
    </div>
  );
}
