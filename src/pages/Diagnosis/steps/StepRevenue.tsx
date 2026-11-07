import { Lightbulb } from 'lucide-react';
import { MoneyInput } from '../../../components/Input/MoneyInput';
import { Notice } from '../../../components/Notice/Notice';
import { Term } from '../../../components/Tooltip/Term';
import type { StepProps } from './stepTypes';

export function StepRevenue({ draft, update, errorFor, touch }: StepProps) {
  return (
    <div className="step-fields">
      <MoneyInput
        id="revenue"
        size="lg"
        label="Quanto seu negócio vende por mês?"
        labelAction={<Term id="revenue" />}
        value={draft.revenue}
        onChange={(revenue) => update({ revenue })}
        onBlur={() => touch('revenue')}
        hint="Some todas as vendas do mês — dinheiro, Pix, cartão e aplicativos — antes de descontar qualquer gasto. Pode usar centavos."
        error={errorFor('revenue')}
        placeholder="0,00"
      />
      <Notice tone="neutral" icon={<Lightbulb />} title="Faturamento não é o dinheiro que sobra">
        Nas próximas etapas, vamos descontar os custos variáveis e as despesas fixas para descobrir quanto realmente fica
        no negócio.
      </Notice>
    </div>
  );
}
