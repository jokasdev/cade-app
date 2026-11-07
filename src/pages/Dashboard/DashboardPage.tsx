import {
  ArrowRight,
  Coins,
  FileDown,
  FileText,
  Info,
  Package,
  Pencil,
  Receipt,
  SlidersHorizontal,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useMemo } from 'react';
import { ButtonLink } from '../../components/Button/Button';
import { Card, CardHeader } from '../../components/Card/Card';
import { CostDistribution } from '../../components/Charts/CostDistribution';
import { PerHundredBar } from '../../components/Charts/PerHundredBar';
import { ResultWaterfall } from '../../components/Charts/ResultWaterfall';
import { RevenueVsCostsChart } from '../../components/Charts/RevenueVsCostsChart';
import { NoDiagnosis } from '../../components/EmptyState/NoDiagnosis';
import { InsightList } from '../../components/Insights/InsightList';
import { KpiCard, OperatingResultCard } from '../../components/Kpi/KpiCard';
import { Notice } from '../../components/Notice/Notice';
import { useAppData } from '../../context/appDataContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ROUTES, href } from '../../routes';
import { buildInsights } from '../../services/diagnostics/insights';
import { buildSuggestions } from '../../services/diagnostics/suggestions';
import { draftMatchesDiagnosis } from '../../services/validation/diagnosisForm';
import { COST_META, SEGMENT_LABELS } from '../../utils/categories';
import { formatBRL, formatDateTime, formatPercent, formatPeriod } from '../../utils/format';
import { BreakEvenPanel } from './BreakEvenPanel';
import { SuggestionList } from './SuggestionList';
import './Dashboard.css';

export default function DashboardPage() {
  useDocumentTitle('Painel');
  const { diagnosis, result, draft, data } = useAppData();

  const insights = useMemo(() => (result ? buildInsights(result) : []), [result]);
  const suggestions = useMemo(
    () => (result && diagnosis ? buildSuggestions(result, diagnosis.business.segment) : []),
    [result, diagnosis],
  );

  if (!diagnosis || !result) {
    return (
      <div className="page">
        <div className="container">
          <header className="page-header">
            <div className="page-header__text">
              <h1 className="page-title">Painel</h1>
            </div>
          </header>
          <NoDiagnosis what="o painel com seus resultados" />
        </div>
      </div>
    );
  }

  const { business } = diagnosis;
  const period = formatPeriod(business.referenceMonth, business.referenceYear);
  const hasUnsavedEdits = !draftMatchesDiagnosis(draft, diagnosis);
  const share = (value: number) => formatPercent((value / result.revenue) * 100);

  return (
    <div className="page dashboard">
      <div className="container">
        <header className="page-header">
          <div className="page-header__text">
            <span className="eyebrow">Diagnóstico · {period}</span>
            <h1 className="page-title">Veja o que está acontecendo com seu negócio.</h1>
            <p className="page-subtitle">
              {[business.name || null, SEGMENT_LABELS[business.segment], data.generatedAt ? `gerado em ${formatDateTime(data.generatedAt)}` : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <div className="page-actions">
            <ButtonLink href={href(ROUTES.diagnosis)} variant="secondary" icon={<Pencil />}>
              Editar dados
            </ButtonLink>
            <ButtonLink href={href(ROUTES.simulator)} variant="secondary" icon={<SlidersHorizontal />}>
              Simular cenários
            </ButtonLink>
            <ButtonLink href={href(ROUTES.report)} icon={<FileDown />}>
              Relatório em PDF
            </ButtonLink>
          </div>
        </header>

        {hasUnsavedEdits && (
          <Notice
            tone="warning"
            className="dashboard__notice"
            title="Há alterações no formulário que ainda não entraram no diagnóstico"
            action={
              <a className="link" href={href(ROUTES.diagnosis)}>
                Revisar e gerar novamente
              </a>
            }
          >
            O painel abaixo mostra o último diagnóstico gerado.
          </Notice>
        )}

        {/* Indicadores */}
        <section aria-labelledby="kpis-title">
          <h2 id="kpis-title" className="sr-only">
            Indicadores do mês
          </h2>
          <div className="kpi-layout">
            <div className="kpi-layout__hero">
              <OperatingResultCard indicators={result} />
            </div>
            <KpiCard
              label="Resultado após retirada"
              value={result.resultAfterWithdrawal}
              icon={<Wallet />}
              term="resultAfterWithdrawal"
              tone={result.resultAfterWithdrawal < 0 ? 'negative' : 'positive'}
              meta={
                result.ownerWithdrawal > 0 ? (
                  <>
                    Depois da retirada de <strong>{formatBRL(result.ownerWithdrawal)}</strong>
                  </>
                ) : (
                  'Nenhuma retirada informada'
                )
              }
              index={1}
            />
            <KpiCard label="Faturamento mensal" value={result.revenue} icon={<TrendingUp />} term="revenue" meta="Total de vendas do mês" index={2} />
            <KpiCard
              label="Custos variáveis"
              value={result.variableCostsTotal}
              icon={<Package />}
              term="variableCosts"
              meta={
                <>
                  <strong>{share(result.variableCostsTotal)}</strong> do faturamento
                </>
              }
              index={3}
            />
            <KpiCard
              label="Despesas fixas"
              value={result.fixedExpensesTotal}
              icon={<Receipt />}
              term="fixedExpenses"
              meta={
                <>
                  <strong>{share(result.fixedExpensesTotal)}</strong> do faturamento
                </>
              }
              index={4}
            />
            <KpiCard
              label="Margem de contribuição"
              value={result.contributionMargin}
              icon={<Coins />}
              term="contributionMargin"
              tone={result.contributionMargin <= 0 ? 'negative' : 'default'}
              meta={
                <>
                  <strong>{formatPercent(result.contributionMarginPct)}</strong> do faturamento
                </>
              }
              index={5}
            />
          </div>
        </section>

        {/* Para onde vai o dinheiro */}
        <section className="section" aria-labelledby="where-title">
          <div className="section__header">
            <h2 id="where-title" className="section__title">
              Para onde seu dinheiro está indo?
            </h2>
            <p className="section__subtitle">
              Cada categoria de custo e despesa, do maior para o menor valor, com o percentual que representa.
            </p>
          </div>
          <div className="dashboard__where">
            <Card>
              <CardHeader title="Distribuição dos custos" subtitle="Valor de cada categoria e quanto ela pesa" />
              <CostDistribution items={result.costItems} />
            </Card>
            <Card>
              <CardHeader title="De cada R$ 100 vendidos…" subtitle="Quanto vai para cada destino" />
              <PerHundredBar
                revenue={result.revenue}
                variableCosts={result.variableCostsTotal}
                fixedExpenses={result.fixedExpensesTotal}
                ownerWithdrawal={result.ownerWithdrawal}
              />
              <dl className="cost-highlights">
                <div className="cost-highlight">
                  <dt>Maior gasto</dt>
                  <dd>
                    {result.largestCost ? (
                      <>
                        <strong>{COST_META[result.largestCost.key].shortLabel}</strong>
                        <span>
                          {formatBRL(result.largestCost.value)} · {formatPercent(result.largestCost.shareOfRevenue)} do
                          faturamento
                        </span>
                      </>
                    ) : (
                      <strong>Nenhum custo informado</strong>
                    )}
                  </dd>
                </div>
                <div className="cost-highlight">
                  <dt>Maior grupo</dt>
                  <dd>
                    <strong>
                      {result.largestGroup === 'variable'
                        ? 'Custos variáveis'
                        : result.largestGroup === 'fixed'
                          ? 'Despesas fixas'
                          : result.largestGroup === 'equal'
                            ? 'Empate entre os grupos'
                            : '—'}
                    </strong>
                    <span>
                      Variáveis {formatBRL(result.variableCostsTotal)} · Fixas {formatBRL(result.fixedExpensesTotal)}
                    </span>
                  </dd>
                </div>
              </dl>
            </Card>
          </div>
        </section>

        {/* Gráficos de resultado */}
        <section className="section" aria-labelledby="result-title">
          <div className="section__header">
            <h2 id="result-title" className="section__title">
              Do faturamento ao resultado
            </h2>
            <p className="section__subtitle">Compare o que entra com o que sai e veja, passo a passo, como se forma o resultado.</p>
          </div>
          <div className="grid grid--2">
            <Card>
              <CardHeader
                title="Faturamento versus custos e despesas"
                subtitle="Saídas = custos variáveis + despesas fixas + retirada"
              />
              <RevenueVsCostsChart
                revenue={result.revenue}
                variableCosts={result.variableCostsTotal}
                fixedExpenses={result.fixedExpensesTotal}
                ownerWithdrawal={result.ownerWithdrawal}
              />
            </Card>
            <Card>
              <CardHeader title="Composição do resultado" subtitle="Do faturamento ao que sobra (ou falta) no mês" />
              <ResultWaterfall indicators={result} />
            </Card>
          </div>
        </section>

        {/* Atenção + ponto de equilíbrio */}
        <section className="section" aria-labelledby="attention-title">
          <div className="section__header">
            <h2 id="attention-title" className="section__title">
              O que merece sua atenção?
            </h2>
            <p className="section__subtitle">
              Observações geradas por regras fixas a partir dos valores informados — sem classificações genéricas.
            </p>
          </div>
          <div className="dashboard__attention">
            <InsightList insights={insights} />
            <BreakEvenPanel result={result} />
          </div>
        </section>

        {/* Sugestões */}
        <section className="section" aria-labelledby="suggestions-title">
          <div className="section__header">
            <h2 id="suggestions-title" className="section__title">
              Sugestões para organizar e melhorar
            </h2>
            <p className="section__subtitle">Orientações práticas escolhidas de acordo com os seus números.</p>
          </div>
          <SuggestionList suggestions={suggestions} />
        </section>

        {/* Próximos passos */}
        <section className="section dashboard__next" aria-label="Próximos passos">
          <a className="next-card" href={href(ROUTES.simulator)}>
            <span className="next-card__icon" aria-hidden="true">
              <SlidersHorizontal />
            </span>
            <span className="next-card__body">
              <strong>Simule seu futuro</strong>
              <span>E se as vendas aumentarem? E se os custos caírem? Teste hipóteses antes de decidir.</span>
            </span>
            <ArrowRight className="next-card__arrow" aria-hidden="true" />
          </a>
          <a className="next-card next-card--dark" href={href(ROUTES.report)}>
            <span className="next-card__icon" aria-hidden="true">
              <FileText />
            </span>
            <span className="next-card__body">
              <strong>Baixe seu relatório</strong>
              <span>Um resumo profissional do diagnóstico para salvar em PDF ou imprimir.</span>
            </span>
            <ArrowRight className="next-card__arrow" aria-hidden="true" />
          </a>
        </section>

        <p className="estimate-note section">
          <Info aria-hidden="true" width={16} height={16} />
          <span>
            Os valores são estimativas calculadas a partir do que você informou e representam uma visão simplificada do
            negócio. O resultado operacional não é lucro líquido contábil e faturamento não é o mesmo que dinheiro em
            caixa. Este diagnóstico não substitui a contabilidade.
          </span>
        </p>
      </div>
    </div>
  );
}
