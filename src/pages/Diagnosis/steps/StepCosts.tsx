import { CategoryIcon } from '../../../components/CategoryIcon/CategoryIcon';
import { MoneyInput } from '../../../components/Input/MoneyInput';
import { Notice } from '../../../components/Notice/Notice';
import { draftTotals } from '../../../services/validation/diagnosisForm';
import { FIXED_EXPENSE_FIELDS, VARIABLE_COST_FIELDS } from '../../../utils/categories';
import { formatBRL, formatPercent } from '../../../utils/format';
import type { StepProps } from './stepTypes';

interface GroupTotalProps {
  label: string;
  total: number;
  revenue: number | null;
}

function GroupTotal({ label, total, revenue }: GroupTotalProps) {
  return (
    <div className="group-total">
      <span className="group-total__label">{label}</span>
      <span className="group-total__value tabular">{formatBRL(total)}</span>
      {revenue !== null && revenue > 0 && (
        <span className="group-total__share">{formatPercent((total / revenue) * 100)} do faturamento</span>
      )}
    </div>
  );
}

export function StepVariableCosts({ draft, update, errorFor, touch }: StepProps) {
  const totals = draftTotals(draft);
  const exceedsRevenue = totals.revenue !== null && totals.revenue > 0 && totals.variableCosts >= totals.revenue;

  return (
    <div className="step-fields">
      <div className="money-grid">
        {VARIABLE_COST_FIELDS.map((field) => {
          const key = `variableCosts.${field.key}` as const;
          return (
            <MoneyInput
              key={field.key}
              id={`variable-${field.key}`}
              label={
                <span className="money-label">
                  <span className="money-label__icon" aria-hidden="true">
                    <CategoryIcon category={field.key} size={15} />
                  </span>
                  {field.label}
                </span>
              }
              value={draft.variableCosts[field.key]}
              onChange={(value) => update({ variableCosts: { ...draft.variableCosts, [field.key]: value } })}
              onBlur={() => touch(key)}
              hint={field.hint}
              error={errorFor(key)}
            />
          );
        })}
      </div>
      <GroupTotal label="Total de custos variáveis" total={totals.variableCosts} revenue={totals.revenue} />
      {exceedsRevenue && (
        <Notice tone="warning" title="Os custos variáveis igualam ou passam do faturamento">
          Confira os valores. Se estiverem corretos, pode seguir: o diagnóstico vai mostrar o impacto disso no resultado.
        </Notice>
      )}
    </div>
  );
}

export function StepFixedExpenses({ draft, update, errorFor, touch }: StepProps) {
  const totals = draftTotals(draft);
  const spending = totals.variableCosts + totals.fixedExpenses;
  const exceedsRevenue =
    totals.revenue !== null && totals.revenue > 0 && totals.variableCosts < totals.revenue && spending > totals.revenue;

  return (
    <div className="step-fields">
      <div className="money-grid">
        {FIXED_EXPENSE_FIELDS.map((field) => {
          const key = `fixedExpenses.${field.key}` as const;
          return (
            <MoneyInput
              key={field.key}
              id={`fixed-${field.key}`}
              label={
                <span className="money-label">
                  <span className="money-label__icon" aria-hidden="true">
                    <CategoryIcon category={field.key} size={15} />
                  </span>
                  {field.label}
                </span>
              }
              value={draft.fixedExpenses[field.key]}
              onChange={(value) => update({ fixedExpenses: { ...draft.fixedExpenses, [field.key]: value } })}
              onBlur={() => touch(key)}
              hint={field.hint}
              error={errorFor(key)}
            />
          );
        })}
      </div>
      <GroupTotal label="Total de despesas fixas" total={totals.fixedExpenses} revenue={totals.revenue} />
      {exceedsRevenue && (
        <Notice tone="warning" title="Custos e despesas passam do faturamento">
          Somando custos variáveis e despesas fixas, os gastos ficam acima das vendas informadas. Se os valores estiverem
          corretos, siga em frente: o diagnóstico mostrará quanto falta.
        </Notice>
      )}
    </div>
  );
}
