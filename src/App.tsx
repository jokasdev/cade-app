import { Suspense, lazy, useEffect, useRef, type ReactNode } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { StorageBanner } from './components/Notice/StorageBanner';
import { useHashRoute } from './hooks/useHashRoute';
import LandingPage from './pages/Landing/LandingPage';
import DiagnosisPage from './pages/Diagnosis/DiagnosisPage';
import { ROUTES } from './routes';

// Páginas com gráficos e conteúdos secundários são carregadas sob demanda.
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const SimulatorPage = lazy(() => import('./pages/Simulator/SimulatorPage'));
const ReportPage = lazy(() => import('./pages/Report/ReportPage'));
const DataPage = lazy(() => import('./pages/Data/DataPage'));
const PrivacyPage = lazy(() => import('./pages/Legal/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/Legal/TermsPage'));
const AboutPage = lazy(() => import('./pages/Legal/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage'));

function renderRoute(path: string): ReactNode {
  switch (path) {
    case ROUTES.home:
      return <LandingPage />;
    case ROUTES.diagnosis:
      return <DiagnosisPage />;
    case ROUTES.dashboard:
      return <DashboardPage />;
    case ROUTES.simulator:
      return <SimulatorPage />;
    case ROUTES.report:
      return <ReportPage />;
    case ROUTES.data:
      return <DataPage />;
    case ROUTES.privacy:
      return <PrivacyPage />;
    case ROUTES.terms:
      return <TermsPage />;
    case ROUTES.about:
      return <AboutPage />;
    default:
      return <NotFoundPage />;
  }
}

function PageLoading() {
  return (
    <div className="page-loading" role="status">
      <span className="spinner" aria-hidden="true" />
      Carregando…
    </div>
  );
}

export function App() {
  const path = useHashRoute();
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  // A cada troca de página: volta ao topo e move o foco para o conteúdo (leitores de tela anunciam a nova página).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    mainRef.current?.focus({ preventScroll: true });
  }, [path]);

  return (
    <>
      <a
        className="skip-link"
        href="#conteudo"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Pular para o conteúdo
      </a>
      <Header currentPath={path} variant={path === ROUTES.home ? 'dark' : 'light'} />
      <main id="conteudo" ref={mainRef} className="app-main" tabIndex={-1}>
        <StorageBanner />
        <ErrorBoundary resetKey={path}>
          <Suspense fallback={<PageLoading />}>{renderRoute(path)}</Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}
