import { useAppData } from '../../context/appDataContext';
import { ROUTES, href } from '../../routes';
import { Notice } from './Notice';

/** Avisos globais sobre o armazenamento local (indisponível, erro ao salvar ou dados não recuperados). */
export function StorageBanner() {
  const { storageAvailable, saveError, loadNotice, dismissLoadNotice } = useAppData();
  if (storageAvailable && !saveError && !loadNotice) return null;

  return (
    <div className="container storage-banner no-print">
      {!storageAvailable && (
        <Notice tone="warning" title="Os dados não serão salvos neste navegador">
          O navegador bloqueou o armazenamento local (por exemplo, em navegação privada). Você pode usar o CADÊ?
          normalmente, mas as informações serão perdidas ao fechar a aba.{' '}
          <a className="link" href={href(ROUTES.data)}>
            Exporte um backup
          </a>{' '}
          antes de sair.
        </Notice>
      )}
      {storageAvailable && saveError && (
        <Notice tone="danger" title="Não foi possível salvar">
          {saveError}{' '}
          <a className="link" href={href(ROUTES.data)}>
            Exporte um backup
          </a>{' '}
          para não perder seus dados.
        </Notice>
      )}
      {loadNotice && (
        <Notice tone="warning" title="Dados anteriores não recuperados" onDismiss={dismissLoadNotice}>
          {loadNotice}
        </Notice>
      )}
    </div>
  );
}
