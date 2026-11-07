import type { ReactNode, Ref } from 'react';
import { FieldShell, describedBy } from './Field';

interface PercentInputProps {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onEnter?: () => void;
  hint?: ReactNode;
  error?: string;
  placeholder?: string;
  inputRef?: Ref<HTMLInputElement>;
}

export function PercentInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  onEnter,
  hint,
  error,
  placeholder = '0',
  inputRef,
}: PercentInputProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="input-wrap input-wrap--percent">
        <input
          ref={inputRef}
          id={id}
          className="input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          maxLength={8}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && onEnter) {
              event.preventDefault();
              onEnter();
            }
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
        />
        <span className="input-wrap__suffix" aria-hidden="true">
          %
        </span>
      </div>
    </FieldShell>
  );
}
