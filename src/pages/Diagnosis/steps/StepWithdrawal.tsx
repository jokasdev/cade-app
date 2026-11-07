import { Pencil, Split } from 'lucide-react';
import { MoneyInput } from '../../../components/Input/MoneyInput';
import { Notice } from '../../../components/Notice/Notice';
import { Term } from '../../../components/Tooltip/Term';
import { draftTotals } from '../../../services/validation/diagnosisForm';
import type { FormStep } from '../../../types/app';
import { SEGMENT_LABELS } from '../../../utils/categories';
import { formatBRL, formatPeriod } from '../../../utils/format';
import type { StepProps } from './stepTypes';

export function StepWithdrawal({ draft, update, errorFor, touch, goTo }: StepProps) {
  const totals = draftTotals(draft);
  const review: { label: string; value: string; step: FormStep }[] = [
    {
      label: 'Negócio',
      value: [draft.name.trim() || 'Sem nome', draft.segment ? SEGMENT_LABELS[draft.segment] : '—'].join(' · '),
      step: 1,
    },
    {
      label: 'Período',
      value:
        draft.referenceMonth !== null && draft.referenceYear !== null
          ? formatPeriod(draft.referenceMonth, draft.referenceYear)
          : '—',
      step: 1,
    },
    { label: 'Faturamento', value: totals.revenue === null ? '—' : formatBRL(totals.revenue), step: 2 },
    { label: 'Custos variáveis', value: formatBRL(totals.variableCosts), step: 3 },
    { label: 'Despesas fixas', value: formatBRL(totals.fixedExpenses), step: 4 },
  ];

  return (
    <div className="step-fields">
      <MoneyInput
        id="owner-withdrawal"
        size="lg"
        label="Quanto você retira do negócio mensalmente para uso pessoal?"
        labelAction={<Term id="ownerWithdrawal" />}
        value={draft.ownerWithdrawal}
        onChange={(ownerWithdrawal) => update({ ownerWithdrawal })}
        onBlur={() => touch('ownerWithdrawal')}
        hint="Inclua pró-labore e o dinheiro que você usa para despesas pessoais. Se o valor varia, informe uma média. Se não retira nada, deixe em branco."
        error={errorFor('ownerWithdrawal')}
      />

      <Notice tone="info" icon={<Split />} title="Por que a retirada fica separada?">
        A retirada será apresentada separadamente das despesas operacionais. Assim você vê primeiro se a operação se paga
        (resultado operacional) e, depois, se ela também sustenta a sua retirada.
      </Notice>

      <section className="review" aria-labelledby="review-title">
        <h3 id="review-title" className="review__title">
          Confira antes de gerar
        </h3>
        <dl className="review__list">
          {review.map((item) => (
            <div key={item.label} className="review__row">
              <dt>{item.label}</dt>
              <dd className="tabular">{item.value}</dd>
              <button type="button" className="review__edit" onClick={() => goTo(item.step)}>
                <Pencil aria-hidden="true" />
                <span>
                  Editar<span className="sr-only"> {item.label.toLowerCase()}</span>
                </span>
              </button>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
