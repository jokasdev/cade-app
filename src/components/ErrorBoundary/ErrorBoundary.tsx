import { Component, type ErrorInfo, type ReactNode } from 'react';
import { TriangleExclamationPoint } from 'lucide-react';
import { ROUTES, href } from '../../routes';
import { EmptyState } from '../EmptyState/EmptyState';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Quando muda (ex.: a rota), o erro é descartado e a tela tenta renderizar de novo. */
  resetKey: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  resetKey: string;
}

/** Evita tela em branco: mostra uma mensagem amigável se algo inesperado falhar. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState): Partial<ErrorBoundaryState> | null {
    if (props.resetKey !== state.resetKey) return { hasError: false, resetKey: props.resetKey };
    return null;
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Nenhum dado do usuário é registrado em log.
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            icon={<TriangleExclamationPoint />}
            title="Algo não saiu como esperado"
            actions={
              <>
                <a className="btn btn--primary btn--md" href={href(ROUTES.home)}>
                  Voltar ao início
                </a>
                <a className="btn btn--secondary btn--md" href={href(ROUTES.data)}>
                  Ir para Meus dados
                </a>
              </>
            }
          >
            <p>
              Esta tela encontrou um erro. Seus dados salvos continuam no navegador. Tente recarregar a página; se o problema
              continuar, exporte um backup em “Meus dados”.
            </p>
          </EmptyState>
        </div>
      </div>
    );
  }
}
