import { ClipboardList, Upload } from 'lucide-react';
import { useAppData } from '../../context/appDataContext';
import { ROUTES, href } from '../../routes';
import { ButtonLink } from '../Button/Button';
import { EmptyState } from './EmptyState';

/** Estado vazio das telas que dependem de um diagnóstico gerado. */
export function NoDiagnosis({ what }: { what: string }) {
  const { data } = useAppData();
  const inProgress = data.draft !== null && (data.draft.revenue.trim() !== '' || data.draft.step > 1);
  return (
    <EmptyState
      icon={<ClipboardList />}
      title="Você ainda não tem um diagnóstico"
      actions={
        <>
          <ButtonLink href={href(ROUTES.diagnosis)}>
            {inProgress ? 'Continuar meu diagnóstico' : 'Fazer meu diagnóstico'}
          </ButtonLink>
          <ButtonLink href={href(ROUTES.data)} variant="secondary" icon={<Upload />}>
            Importar um backup
          </ButtonLink>
        </>
      }
    >
      <p>
        Para ver {what}, preencha o diagnóstico com os números de um mês do seu negócio. Leva poucos minutos e não precisa
        de cadastro.
      </p>
    </EmptyState>
  );
}
