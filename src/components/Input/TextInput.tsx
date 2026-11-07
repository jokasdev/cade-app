import type { ReactNode, Ref } from 'react';
import { FieldShell, describedBy } from './Field';

interface TextInputProps {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  placeholder?: string;
  maxLength?: number;
  autoComplete?: string;
  inputRef?: Ref<HTMLInputElement>;
}

export function TextInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  hint,
  error,
  optional,
  placeholder,
  maxLength,
  autoComplete = 'off',
  inputRef,
}: TextInputProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <div className="input-wrap">
        <input
          ref={inputRef}
          id={id}
          className="input"
          type="text"
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
        />
      </div>
    </FieldShell>
  );
}
