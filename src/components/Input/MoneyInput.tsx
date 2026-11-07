import type { ReactNode, Ref } from 'react';
import { formatMoneyInput } from '../../utils/format';
import { parseMoney } from '../../utils/parse';
import { FieldShell, describedBy } from './Field';

interface MoneyInputProps {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  placeholder?: string;
  size?: 'md' | 'lg';
  labelAction?: ReactNode;
  autoFocus?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}

/**
 * Campo de valor em reais. Aceita digitação livre (8000, 8.000, 8.000,50…)
 * e formata no padrão brasileiro ao sair do campo.
 */
export function MoneyInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  hint,
  error,
  optional,
  placeholder = '0,00',
  size = 'md',
  labelAction,
  autoFocus,
  inputRef,
}: MoneyInputProps) {
  const handleBlur = () => {
    const parsed = parseMoney(value);
    if (parsed.ok) {
      const formatted = formatMoneyInput(parsed.cents);
      if (formatted !== value) onChange(formatted);
    }
    onBlur?.();
  };

  return (
    <FieldShell
      id={id}
      label={
        <>
          {label}
          <span className="sr-only"> (em reais)</span>
        </>
      }
      hint={hint}
      error={error}
      optional={optional}
      labelAction={labelAction}
    >
      <div className={`input-wrap input-wrap--money input-wrap--${size}`}>
        <span className="input-wrap__prefix" aria-hidden="true">
          R$
        </span>
        <input
          ref={inputRef}
          id={id}
          className="input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="next"
          maxLength={20}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={handleBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          autoFocus={autoFocus}
        />
      </div>
    </FieldShell>
  );
}
