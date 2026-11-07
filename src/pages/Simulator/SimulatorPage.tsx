import { FileDown, FlaskConical, LayoutDashboard } from 'lucide-react';
import { ButtonLink } from '../../components/Button/Button';
import { NoDiagnosis } from '../../components/EmptyState/NoDiagnosis';
import { Notice } from '../../components/Notice/Notice';
import { useAppData } from '../../context/appDataContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ROUTES, href } from '../../routes';
import { totalsFromInput } from '../../services/calculations/financial';
import { formatBRL, formatPeriod } from '../../utils/format';
import { CombinedScenario, CostReductionSimulator, FixedReductionSimulator, RevenueGrowthSimulator } from './Simulators';
import './Simulator.css';

export default function SimulatorPage() {
  useDocumentTitle('Simulador');
  const { diagnosis, result, data, updateSimulations } = useAppData();

  if (!diagnosis || !result) {
    return (
      <div className="page">
        <div className="container">
          <header className="page-header">
            <div className="page-header__text">
              <h1 className="page-title">Simule seu futuro.</h1>
            </div>
          </header>
          <NoDiagnosis what="as simulações" />
        </div>
      </div>
    );
  }

  const totals = totalsFromInput(diagnosis.financials);
  const settings = data.simulations;
  const anyActive =
    settings.revenueGrowthPct !== null ||
    settings.variableCostReductionPct !== null ||
    settings.fixedExpenseReductionCents !== null;

  const current = [
    { label: 'Faturamento', value: result.revenue },
    { label: 'Custos variáveis', value: result.variableCostsTotal },
    { label: 'Despesas fixas', value: result.fixedExpensesTotal },
    { label: 'Resultado operacional', value: result.operatingResult, result: true },
  ];

  return (
    <div className="page simulator">
      <div className="container">
        <header className="page-header">
          <div className="page-header__text">
            <span className="eyebrow">Simulador</span>
            <h1 className="page-title">Simule seu futuro.</h1>
            <p className="page-subtitle">
              Altere valores hipotéticos e veja como o resultado poderia mudar. As simulações não alteram o seu diagnóstico.
            </p>
          </div>
          <div className="page-actions">
            <ButtonLink href={href(ROUTES.dashboard)} variant="secondary" icon={<LayoutDashboard />}>
              Voltar ao painel
            </ButtonLink>
            <ButtonLink href={href(ROUTES.report)} icon={<FileDown />}>
              Relatório em PDF
            </ButtonLink>
          </div>
        </header>

        <section className="current-strip" aria-labelledby="current-title">
          <h2 id="current-title" className="current-strip__title">
            Situação atual · {formatPeriod(diagnosis.business.referenceMonth, diagnosis.business.referenceYear)}
          </h2>
          <dl className="current-strip__list">
            {current.map((item) => (
              <div key={item.label} className="current-strip__item">
                <dt>{item.label}</dt>
                <dd
                  className={`tabular${item.result ? (item.value < 0 ? ' text-negative' : ' text-positive') : ''}`}
                >
                  {formatBRL(item.value)}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <Notice tone="neutral" icon={<FlaskConical />} title="Hipóteses, não previsões" className="simulator__notice">
          Cada simulação mostra o que aconteceria <strong>se</strong> as premissas indicadas se confirmassem, mantendo todo o
          resto igual. Não é uma previsão do futuro.
          {anyActive && ' As simulações configuradas aparecem no seu relatório.'}
        </Notice>

        <div className="simulator__list">
          <RevenueGrowthSimulator totals={totals} settings={settings} onChange={updateSimulations} />
          <CostReductionSimulator totals={totals} settings={settings} onChange={updateSimulations} />
          <FixedReductionSimulator totals={totals} settings={settings} onChange={updateSimulations} />
          <CombinedScenario totals={totals} settings={settings} />
        </div>
      </div>
    </div>
  );
}
