import { Database, Download, FileJson, HardDrive, ShieldCheck, Trash, Upload } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';
import { Button } from '../../components/Button/Button';
import { Card, CardHeader } from '../../components/Card/Card';
import { ConfirmDialog } from '../../components/Dialog/ConfirmDialog';
import { Notice } from '../../components/Notice/Notice';
import { useToast } from '../../components/Toast/toastContext';
import { useAppData } from '../../context/appDataContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ROUTES, href } from '../../routes';
import { backupFileName, readBackupFile, serializeBackup } from '../../services/export/backup';
import { downloadTextFile } from '../../services/export/download';
import { hasSavedContent } from '../../services/storage/schema';
import type { AppData } from '../../types/app';
import { formatDateTime, formatPeriod } from '../../utils/format';
import './Data.css';

interface PendingImport {
  data: AppData;
  exportedAt: string | null;
  fileName: string;
}

function describeDiagnosis(data: AppData): string {
  if (!data.diagnosis) return 'Nenhum diagnóstico gerado';
  const { business } = data.diagnosis;
  const period = formatPeriod(business.referenceMonth, business.referenceYear);
  return business.name ? `${business.name} · ${period}` : period;
}

export default function DataPage() {
  useDocumentTitle('Meus dados');
  const { data, storageAvailable, replaceData, clearAll } = useAppData();
  const { notify } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [reading, setReading] = useState(false);

  const hasData = hasSavedContent(data);
  const simulationsCount = [
    data.simulations.revenueGrowthPct,
    data.simulations.variableCostReductionPct,
    data.simulations.fixedExpenseReductionCents,
  ].filter((value) => value !== null).length;

  const exportBackup = () => {
    try {
      downloadTextFile(backupFileName(), serializeBackup(data));
      notify({ type: 'success', message: 'Backup exportado. Guarde o arquivo em um local seguro.' });
    } catch {
      notify({ type: 'error', message: 'Não foi possível gerar o arquivo de backup neste navegador.' });
    }
  };

  const onFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // permite escolher o mesmo arquivo de novo
    if (!file) return;
    setImportError(null);
    setReading(true);
    const result = await readBackupFile(file);
    setReading(false);
    if (!result.ok) {
      setImportError(result.error);
      notify({ type: 'error', message: 'O arquivo não pôde ser importado.' });
      return;
    }
    setPendingImport({ data: result.data, exportedAt: result.exportedAt, fileName: file.name });
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    replaceData(pendingImport.data);
    setPendingImport(null);
    notify({ type: 'success', title: 'Backup importado!', message: 'Seus dados foram restaurados neste navegador.' });
  };

  const confirmClearAll = () => {
    clearAll();
    setConfirmClear(false);
    notify({ type: 'success', message: 'Todos os dados do CADÊ? foram apagados deste navegador.' });
  };

  return (
    <div className="page data-page">
      <div className="container">
        <header className="page-header">
          <div className="page-header__text">
            <span className="eyebrow">Privacidade e backup</span>
            <h1 className="page-title">Meus dados</h1>
            <p className="page-subtitle">Veja o que está salvo neste navegador, faça backup, restaure ou apague tudo.</p>
          </div>
        </header>

        <Card className="privacy-card" tone="inverse">
          <span className="privacy-card__icon" aria-hidden="true">
            <ShieldCheck />
          </span>
          <div className="privacy-card__body">
            <p className="privacy-card__lead">
              Seus dados financeiros são processados localmente neste navegador e não são enviados para um servidor pelo
              CADÊ? nesta versão.
            </p>
            <p className="privacy-card__text">
              O CADÊ? não coleta CPF, senhas bancárias, dados de cartão, informações de contas bancárias nem dados de
              clientes finais. Saiba mais na{' '}
              <a className="link link--light" href={href(ROUTES.privacy)}>
                política de privacidade
              </a>
              .
            </p>
          </div>
        </Card>

        {!storageAvailable && (
          <Notice tone="warning" title="Este navegador não permite salvar dados" className="data-page__notice">
            Pode ser o modo de navegação privada ou uma configuração de bloqueio. Você consegue usar o CADÊ?, mas os dados
            serão perdidos ao fechar a aba. Exporte um backup antes de sair.
          </Notice>
        )}

        <section className="section" aria-labelledby="saved-title">
          <Card>
            <CardHeader icon={<HardDrive />} title="O que está salvo agora" titleId="saved-title" level={2} />
            <dl className="saved-list">
              <div>
                <dt>Diagnóstico</dt>
                <dd>{describeDiagnosis(data)}</dd>
              </div>
              <div>
                <dt>Gerado em</dt>
                <dd>{formatDateTime(data.generatedAt)}</dd>
              </div>
              <div>
                <dt>Formulário</dt>
                <dd>{data.draft ? `Rascunho salvo (etapa ${data.draft.step} de 5)` : 'Vazio'}</dd>
              </div>
              <div>
                <dt>Simulações configuradas</dt>
                <dd>{simulationsCount}</dd>
              </div>
              <div>
                <dt>Última alteração</dt>
                <dd>{formatDateTime(data.updatedAt)}</dd>
              </div>
              <div>
                <dt>Onde fica</dt>
                <dd>Armazenamento local (localStorage) deste navegador, neste dispositivo</dd>
              </div>
            </dl>
          </Card>
        </section>

        <section className="section data-actions" aria-label="Ações">
          <Card className="data-action">
            <CardHeader icon={<Download />} title="Exportar backup" level={2} />
            <p className="data-action__text">
              Baixe um arquivo <strong>.json</strong> com todos os seus dados. Ele contém seus números financeiros em texto
              simples: guarde-o em um local seguro.
            </p>
            <Button icon={<FileJson />} onClick={exportBackup} disabled={!hasData} fullWidth>
              Exportar backup (.json)
            </Button>
            {!hasData && <p className="data-action__hint">Ainda não há dados para exportar.</p>}
          </Card>

          <Card className="data-action">
            <CardHeader icon={<Upload />} title="Importar backup" level={2} />
            <p className="data-action__text">
              Restaure um arquivo exportado pelo CADÊ?. O arquivo é verificado antes de qualquer alteração.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={onFileSelected}
            />
            <Button
              variant="secondary"
              icon={<Upload />}
              onClick={() => fileInputRef.current?.click()}
              loading={reading}
              fullWidth
            >
              Escolher arquivo de backup
            </Button>
            {importError && (
              <Notice tone="danger" title="Não foi possível importar" className="data-action__error">
                {importError}
              </Notice>
            )}
          </Card>

          <Card className="data-action">
            <CardHeader icon={<Trash />} title="Apagar todos os dados" level={2} />
            <p className="data-action__text">
              Remove diagnóstico, formulário e simulações deste navegador. Esta ação não pode ser desfeita.
            </p>
            <Button variant="danger" icon={<Trash />} onClick={() => setConfirmClear(true)} disabled={!hasData} fullWidth>
              Apagar todos os dados
            </Button>
          </Card>
        </section>

        <Notice tone="warning" icon={<Database />} title="Exporte backups regularmente" className="section">
          Limpar os dados do navegador (histórico, cookies e dados de sites), usar outro navegador ou outro aparelho pode
          fazer com que as informações salvas não apareçam ou sejam apagadas. O backup é a forma de levar seus dados com
          você.
        </Notice>
      </div>

      <ConfirmDialog
        open={pendingImport !== null}
        title="Importar este backup?"
        confirmLabel="Importar e substituir"
        onConfirm={confirmImport}
        onClose={() => setPendingImport(null)}
      >
        {pendingImport && (
          <>
            <p>
              Arquivo: <strong>{pendingImport.fileName}</strong>
              {pendingImport.exportedAt && <> · exportado em {formatDateTime(pendingImport.exportedAt)}</>}
            </p>
            <p>
              Conteúdo: <strong>{describeDiagnosis(pendingImport.data)}</strong>
            </p>
            {hasData && <p>Os dados atuais deste navegador serão substituídos pelos dados do backup.</p>}
          </>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmClear}
        title="Apagar todos os dados?"
        confirmLabel="Apagar tudo"
        tone="danger"
        onConfirm={confirmClearAll}
        onClose={() => setConfirmClear(false)}
        secondaryAction={
          <Button variant="ghost" icon={<Download />} onClick={exportBackup}>
            Exportar backup antes
          </Button>
        }
      >
        <p>
          O diagnóstico, o formulário e as simulações salvos neste navegador serão apagados permanentemente. Não é possível
          desfazer.
        </p>
        <p>Se quiser guardar uma cópia, exporte um backup antes de continuar.</p>
      </ConfirmDialog>
    </div>
  );
}
