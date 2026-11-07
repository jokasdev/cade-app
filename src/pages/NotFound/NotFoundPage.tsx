import { Compass } from 'lucide-react';
import { ButtonLink } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ROUTES, href } from '../../routes';

export default function NotFoundPage() {
  useDocumentTitle('Página não encontrada');
  return (
    <div className="page">
      <div className="container">
        <h1 className="sr-only">Página não encontrada</h1>
        <EmptyState
          icon={<Compass />}
          title="Cadê esta página?"
          actions={
            <>
              <ButtonLink href={href(ROUTES.home)}>Ir para o início</ButtonLink>
              <ButtonLink href={href(ROUTES.diagnosis)} variant="secondary">
                Fazer meu diagnóstico
              </ButtonLink>
            </>
          }
        >
          <p>O endereço acessado não existe. Use os botões abaixo para continuar.</p>
        </EmptyState>
      </div>
    </div>
  );
}
