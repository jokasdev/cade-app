import { CloudOff, ShieldCheck } from 'lucide-react';
import { draftTotals } from '../../services/validation/diagnosisForm';
import type { DiagnosisDraft } from '../../types/app';
import { formatBRL, formatDateTime } from '../../utils/format';

interface DraftSummaryProps {
  draft: DiagnosisDraft;
  storageAvailable: boolean;
  updatedAt: string | null;
}

/** Resumo lateral, atualizado enquanto o usuário preenche. */
export function DraftSummary({ draft, storageAvailable, updatedAt }: DraftSummaryProps) {
  const totals = draftTotals(draft);
  const preview =
    totals.revenue !== null && totals.revenue > 0 ? totals.revenue - totals.variableCosts - totals.fixedExpenses : null;

  const rows = [
    { label: 'Faturamento', value: totals.revenue === null ? '—' : formatBRL(totals.revenue) },
    { label: 'Custos variáveis', value: formatBRL(totals.variableCosts) },
    { label: 'Despesas fixas', value: formatBRL(totals.fixedExpenses) },
    { label: 'Retirada', value: formatBRL(totals.ownerWithdrawal) },
  ];

  return (
    <aside className="draft-summary" aria-labelledby="draft-summary-title">
      <h2 id="draft-summary-title" className="draft-summary__title">
        Resumo até agora
      </h2>
      <dl className="draft-summary__list">
        {rows.map((row) => (
          <div key={row.label} className="draft-summary__row">
            <dt>{row.label}</dt>
            <dd className="tabular">{row.value}</dd>
          </div>
        ))}
      </dl>
      {preview !== null && (
        <div className={`draft-summary__preview ${preview < 0 ? 'is-negative' : 'is-positive'}`}>
          <span>Prévia do resultado operacional</span>
          <strong className="tabular">{formatBRL(preview)}</strong>
        </div>
      )}
      {totals.hasInvalid && <p className="draft-summary__warning">Há valores inválidos que ainda não entraram na soma.</p>}

      <div className="draft-summary__status">
        {storageAvailable ? (
          <>
            <ShieldCheck aria-hidden="true" />
            <span>
              Salvo automaticamente neste navegador
              {updatedAt ? ` · ${formatDateTime(updatedAt)}` : ''}.
            </span>
          </>
        ) : (
          <>
            <CloudOff aria-hidden="true" />
            <span>Este navegador não permite salvar. Os dados ficam só nesta aba.</span>
          </>
        )}
      </div>
    </aside>
  );
}
