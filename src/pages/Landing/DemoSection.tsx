import { Check, Package, Receipt, TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '../../components/Card/Card';
import { ResultWaterfall } from '../../components/Charts/ResultWaterfall';
import { InsightList } from '../../components/Insights/InsightList';
import { KpiCard, OperatingResultCard } from '../../components/Kpi/KpiCard';
import { computeFinancials } from '../../services/calculations/financial';
import { buildInsights } from '../../services/diagnostics/insights';
import { formatPercent, formatPeriod } from '../../utils/format';
import { SAMPLE_DIAGNOSIS } from '../../utils/sampleData';

const sample = computeFinancials(SAMPLE_DIAGNOSIS.financials);
const sampleInsights = buildInsights(sample);

const DISCOVERIES = [
  'Quanto sobra de verdade depois de custos, despesas e da sua retirada',
  'Sua margem de contribuição e o ponto de equilíbrio do negócio',
  'Qual é o maior gasto e quanto ele pesa no faturamento',
  'Alertas objetivos, explicados em linguagem simples',
  'Simulações de cenários e relatório em PDF',
];

export function DemoSection() {
  const period = formatPeriod(SAMPLE_DIAGNOSIS.business.referenceMonth, SAMPLE_DIAGNOSIS.business.referenceYear);
  return (
    <section className="landing-section demo" aria-labelledby="demo-title">
      <div className="container">
        <div className="landing-section__header">
          <span className="eyebrow">Demonstração</span>
          <h2 id="demo-title" className="landing-section__title">
            Veja como fica o seu diagnóstico
          </h2>
          <p className="landing-section__subtitle">
            Abaixo, um painel montado com valores fictícios de uma doceria. Com os seus números, ele mostra a realidade do
            seu negócio.
          </p>
        </div>

        <div className="demo__layout">
          <ul className="demo__discoveries" role="list">
            {DISCOVERIES.map((item) => (
              <li key={item}>
                <span className="demo__check" aria-hidden="true">
                  <Check strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="demo__frame">
            <div className="demo__toolbar">
              <span className="demo__dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="demo__title">
                Painel · {SAMPLE_DIAGNOSIS.business.name} · {period}
              </span>
              <span className="sample-badge sample-badge--light">Exemplo ilustrativo · valores fictícios</span>
            </div>

            <div className="demo__content">
              <OperatingResultCard indicators={sample} animate={false} />
              <div className="demo__kpis">
                <KpiCard label="Faturamento mensal" value={sample.revenue} icon={<TrendingUp />} term="revenue" />
                <KpiCard
                  label="Custos variáveis"
                  value={sample.variableCostsTotal}
                  icon={<Package />}
                  meta={`${formatPercent((sample.variableCostsTotal / sample.revenue) * 100)} do faturamento`}
                />
                <KpiCard
                  label="Despesas fixas"
                  value={sample.fixedExpensesTotal}
                  icon={<Receipt />}
                  meta={`${formatPercent((sample.fixedExpensesTotal / sample.revenue) * 100)} do faturamento`}
                />
              </div>
              <div className="demo__panels">
                <Card padding="md">
                  <CardHeader title="Composição do resultado" subtitle="Do faturamento ao que sobra no mês" />
                  <ResultWaterfall indicators={sample} />
                </Card>
                <Card padding="md">
                  <CardHeader title="O que merece sua atenção?" subtitle="Regras objetivas aplicadas aos números" />
                  <InsightList insights={sampleInsights} limit={3} />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
