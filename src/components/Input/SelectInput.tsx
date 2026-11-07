import type { ReactNode, Ref } from 'react';
import { ChevronDown } from 'lucide-react';
import { FieldShell, describedBy } from './Field';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  id: string;
  label: ReactNode;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  error?: string;
  selectRef?: Ref<HTMLSelectElement>;
}

export function SelectInput({ id, label, value, options, onChange, placeholder, hint, error, selectRef }: SelectInputProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="input-wrap input-wrap--select">
        <select
          ref={selectRef}
          id={id}
          className="input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="input-wrap__chevron" aria-hidden="true" />
      </div>
    </FieldShell>
  );
}
