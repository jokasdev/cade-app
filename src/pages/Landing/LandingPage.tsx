import {
  ArrowRight,
  ChartColumn,
  Check,
  ClipboardList,
  Database,
  FileText,
  History,
  LayoutDashboard,
  Lock,
  ShieldCheck,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react';
import { useRef } from 'react';
import { Button, ButtonLink } from '../../components/Button/Button';
import { useAppData } from '../../context/appDataContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { ROUTES, href } from '../../routes';
import { formatPeriod } from '../../utils/format';
import { DemoSection } from './DemoSection';
import { Faq } from './Faq';
import { HeroPreview } from './HeroPreview';
import './Landing.css';

const BENEFITS = [
  {
    icon: <ChartColumn />,
    title: 'Entenda seus custos',
    text: 'Veja, em reais e em percentual, quanto cada gasto consome do que você vende — e qual deles pesa mais.',
  },
  {
    icon: <Wallet />,
    title: 'Descubra quanto realmente sobra',
    text: 'Separe faturamento de resultado: saiba o que fica depois de pagar custos, despesas e a sua retirada.',
  },
  {
    icon: <SlidersHorizontal />,
    title: 'Simule mudanças antes de decidir',
    text: 'Teste aumento de vendas, redução de custos ou economia nas despesas fixas e compare com a situação atual.',
  },
];

const STEPS = [
  {
    icon: <ClipboardList />,
    title: 'Informe os números do negócio',
    text: 'Faturamento, custos variáveis, despesas fixas e sua retirada, em etapas curtas. Sem cadastro e sem senha.',
  },
  {
    icon: <LayoutDashboard />,
    title: 'Receba seu diagnóstico',
    text: 'Margem de contribuição, resultado operacional, ponto de equilíbrio e alertas explicados em linguagem simples.',
  },
  {
    icon: <SlidersHorizontal />,
    title: 'Simule possibilidades de melhoria',
    text: 'Veja como o resultado mudaria com outras vendas, custos ou despesas e salve tudo em um relatório em PDF.',
  },
];

export default function LandingPage() {
  useDocumentTitle(null);
  const { data, diagnosis } = useAppData();
  const reducedMotion = usePrefersReducedMotion();
  const howItWorksRef = useRef<HTMLHeadingElement>(null);

  const draft = data.draft;
  const draftInProgress =
    !diagnosis && draft !== null && (draft.segment !== '' || draft.revenue.trim() !== '' || draft.step > 1);

  const scrollToHowItWorks = () => {
    const heading = howItWorksRef.current;
    if (!heading) return;
    heading.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    heading.focus({ preventScroll: true });
  };

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__backdrop" aria-hidden="true" />
        <div className="container hero__inner">
          <div className="hero__content">
            {diagnosis ? (
              <a className="hero__session" href={href(ROUTES.dashboard)}>
                <History aria-hidden="true" />
                <span>
                  Seu diagnóstico de{' '}
                  <strong>{formatPeriod(diagnosis.business.referenceMonth, diagnosis.business.referenceYear)}</strong> está
                  salvo neste navegador.
                </span>
                <span className="hero__session-cta">
                  Ver painel <ArrowRight aria-hidden="true" />
                </span>
              </a>
            ) : draftInProgress ? (
              <a className="hero__session" href={href(ROUTES.diagnosis)}>
                <History aria-hidden="true" />
                <span>
                  Você tem um diagnóstico em andamento (etapa {draft.step} de 5).
                </span>
                <span className="hero__session-cta">
                  Continuar <ArrowRight aria-hidden="true" />
                </span>
              </a>
            ) : (
              <span className="hero__pill">
                <span className="hero__pill-dot" aria-hidden="true" />
                Diagnóstico financeiro gratuito para pequenos negócios
              </span>
            )}

            <h1 id="hero-title" className="hero__title">
              Seu negócio vende. Mas quanto dinheiro <span className="hero__highlight">realmente sobra?</span>
            </h1>
            <p className="hero__subtitle">
              Descubra para onde seu dinheiro está indo e entenda o que pode estar comprometendo os resultados do seu
              negócio.
            </p>

            <div className="hero__actions">
              <ButtonLink href={href(ROUTES.diagnosis)} size="lg" iconRight={<ArrowRight />}>
                Fazer meu diagnóstico
              </ButtonLink>
              <Button variant="outline-light" size="lg" onClick={scrollToHowItWorks}>
                Como funciona?
              </Button>
            </div>

            <ul className="hero__trust" role="list">
              <li>
                <Check aria-hidden="true" /> Gratuito
              </li>
              <li>
                <Check aria-hidden="true" /> Sem cadastro
              </li>
              <li>
                <Check aria-hidden="true" /> Dados ficam no seu navegador
              </li>
            </ul>
          </div>

          <HeroPreview />
        </div>
      </section>

      {/* Benefícios */}
      <section className="landing-section benefits" aria-labelledby="benefits-title">
        <div className="container">
          <div className="landing-section__header">
            <span className="eyebrow">Por que usar</span>
            <h2 id="benefits-title" className="landing-section__title">
              Clareza sobre o dinheiro do seu negócio, sem planilhas complicadas
            </h2>
          </div>
          <ul className="benefits__grid" role="list">
            {BENEFITS.map((benefit, index) => (
              <li key={benefit.title} className="benefit-card reveal" style={{ ['--i' as string]: index }}>
                <span className="benefit-card__icon" aria-hidden="true">
                  {benefit.icon}
                </span>
                <span className="benefit-card__number" aria-hidden="true">
                  0{index + 1}
                </span>
                <h3 className="benefit-card__title">{benefit.title}</h3>
                <p className="benefit-card__text">{benefit.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Como funciona */}
      <section className="landing-section how" aria-labelledby="como-funciona">
        <div className="container">
          <div className="landing-section__header">
            <span className="eyebrow">Como funciona</span>
            <h2 id="como-funciona" ref={howItWorksRef} tabIndex={-1} className="landing-section__title">
              Três passos até entender seus números
            </h2>
            <p className="landing-section__subtitle">
              Tenha em mãos os valores de um mês completo — de preferência o último mês fechado.
            </p>
          </div>
          <ol className="how__steps" role="list">
            {STEPS.map((step, index) => (
              <li key={step.title} className="how-step">
                <div className="how-step__marker">
                  <span className="how-step__icon" aria-hidden="true">
                    {step.icon}
                  </span>
                  <span className="how-step__number">Etapa {index + 1}</span>
                </div>
                <h3 className="how-step__title">{step.title}</h3>
                <p className="how-step__text">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="how__cta">
            <ButtonLink href={href(ROUTES.diagnosis)} size="lg" variant="dark" iconRight={<ArrowRight />}>
              Começar agora
            </ButtonLink>
          </div>
        </div>
      </section>

      <DemoSection />

      {/* Privacidade */}
      <section className="landing-section privacy-band" aria-labelledby="privacy-title">
        <div className="container privacy-band__inner">
          <div className="privacy-band__text">
            <span className="privacy-band__icon" aria-hidden="true">
              <ShieldCheck />
            </span>
            <h2 id="privacy-title" className="privacy-band__title">
              Seus números ficam com você
            </h2>
            <p className="privacy-band__lead">
              Seus dados financeiros são processados localmente neste navegador e não são enviados para um servidor pelo
              CADÊ? nesta versão.
            </p>
            <a className="link link--light" href={href(ROUTES.privacy)}>
              Ler a política de privacidade
            </a>
          </div>
          <ul className="privacy-band__list" role="list">
            <li>
              <Lock aria-hidden="true" />
              <div>
                <strong>Sem cadastro e sem senha</strong>
                <span>Você usa o CADÊ? sem criar conta.</span>
              </div>
            </li>
            <li>
              <ShieldCheck aria-hidden="true" />
              <div>
                <strong>Nada de dados sensíveis</strong>
                <span>Não pedimos CPF, senhas bancárias, dados de cartão ou de clientes.</span>
              </div>
            </li>
            <li>
              <Database aria-hidden="true" />
              <div>
                <strong>Backup quando quiser</strong>
                <span>Exporte e importe seus dados em um arquivo, sempre que precisar.</span>
              </div>
            </li>
            <li>
              <FileText aria-hidden="true" />
              <div>
                <strong>Relatório em PDF</strong>
                <span>Gerado no próprio navegador, sem enviar nada para fora.</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Perguntas frequentes */}
      <section className="landing-section faq-section" aria-labelledby="faq-title">
        <div className="container container--narrow">
          <div className="landing-section__header">
            <span className="eyebrow">Perguntas frequentes</span>
            <h2 id="faq-title" className="landing-section__title">
              Dúvidas comuns
            </h2>
          </div>
          <Faq />
        </div>
      </section>

      {/* Chamada final */}
      <section className="final-cta" aria-labelledby="final-cta-title">
        <div className="container final-cta__inner">
          <h2 id="final-cta-title" className="final-cta__title">
            Pronto para descobrir quanto sobra?
          </h2>
          <p className="final-cta__text">Leva poucos minutos. Você só precisa dos números de um mês.</p>
          <ButtonLink href={href(ROUTES.diagnosis)} size="lg" iconRight={<ArrowRight />}>
            Fazer meu diagnóstico
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
