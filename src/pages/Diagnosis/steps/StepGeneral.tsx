import { SegmentIcon } from '../../../components/CategoryIcon/CategoryIcon';
import { FieldError } from '../../../components/Input/Field';
import { SelectInput } from '../../../components/Input/SelectInput';
import { TextInput } from '../../../components/Input/TextInput';
import { referenceYearOptions } from '../../../services/validation/diagnosisForm';
import { SEGMENTS } from '../../../types/finance';
import { SEGMENT_LABELS } from '../../../utils/categories';
import { MONTH_NAMES } from '../../../utils/format';
import { MAX_NAME_LENGTH } from '../../../utils/text';
import type { StepProps } from './stepTypes';

const MONTH_OPTIONS = MONTH_NAMES.map((name, index) => ({
  value: String(index + 1),
  label: `${name.charAt(0).toUpperCase()}${name.slice(1)}`,
}));

export function StepGeneral({ draft, update, errorFor, touch }: StepProps) {
  const segmentError = errorFor('segment');
  const yearOptions = referenceYearOptions().map((year) => ({ value: String(year), label: String(year) }));

  return (
    <div className="step-fields">
      <TextInput
        id="business-name"
        label="Nome do negócio"
        optional
        value={draft.name}
        onChange={(name) => update({ name })}
        onBlur={() => touch('name')}
        placeholder="Ex.: Doces da Ana"
        maxLength={MAX_NAME_LENGTH}
        autoComplete="organization"
        hint="Aparece no seu relatório. Não informe CPF nem dados pessoais."
        error={errorFor('name')}
      />

      <fieldset className="segment-picker" aria-describedby={segmentError ? 'segment-error' : undefined}>
        <legend className="field__label">Segmento do negócio</legend>
        <div className="segment-picker__grid">
          {SEGMENTS.map((segment, index) => (
            <label key={segment} className={`segment-option${draft.segment === segment ? ' is-selected' : ''}`}>
              <input
                type="radio"
                name="segment"
                value={segment}
                className="segment-option__input"
                checked={draft.segment === segment}
                onChange={() => update({ segment })}
                aria-invalid={segmentError && index === 0 ? true : undefined}
              />
              <span className="segment-option__icon">
                <SegmentIcon segment={segment} />
              </span>
              <span className="segment-option__label">{SEGMENT_LABELS[segment]}</span>
            </label>
          ))}
        </div>
        {segmentError && <FieldError id="segment-error">{segmentError}</FieldError>}
      </fieldset>

      <div className="step-fields__row">
        <SelectInput
          id="reference-month"
          label="Mês de referência"
          value={draft.referenceMonth === null ? '' : String(draft.referenceMonth)}
          options={MONTH_OPTIONS}
          placeholder="Escolha o mês"
          onChange={(value) => {
            update({ referenceMonth: value === '' ? null : Number(value) });
            touch('referenceMonth');
          }}
          error={errorFor('referenceMonth')}
        />
        <SelectInput
          id="reference-year"
          label="Ano de referência"
          value={draft.referenceYear === null ? '' : String(draft.referenceYear)}
          options={yearOptions}
          placeholder="Escolha o ano"
          onChange={(value) => {
            update({ referenceYear: value === '' ? null : Number(value) });
            touch('referenceYear');
          }}
          error={errorFor('referenceYear')}
        />
      </div>
      <p className="step-fields__tip">
        Use os números de um mês completo — de preferência, o último mês fechado. Sugerimos o mês anterior, mas você pode
        alterar.
      </p>
    </div>
  );
}
