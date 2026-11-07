import { useId, useState } from 'react';
import { PercentInput } from '../../components/Input/PercentInput';
import { formatDecimal } from '../../utils/format';
import { parsePercent } from '../../utils/parse';

interface PresetPickerProps {
  legend: string;
  presets: readonly number[];
  value: number | null;
  min: number;
  max: number;
  /** Prefixo exibido nos botões (“+” para aumento, “−” para redução). */
  sign: '+' | '−';
  onChange: (value: number | null) => void;
}

/** Escolha de percentual: atalhos (5%, 10%, 15%, 20%) ou um valor personalizado. */
export function PresetPicker({ legend, presets, value, min, max, sign, onChange }: PresetPickerProps) {
  const name = useId();
  const isCustomValue = value !== null && !presets.includes(value);
  const [customMode, setCustomMode] = useState(isCustomValue);
  const [customText, setCustomText] = useState(isCustomValue && value !== null ? formatDecimal(value, 2) : '');
  const [customError, setCustomError] = useState<string | undefined>(undefined);

  const selected = customMode ? 'custom' : value === null ? '' : String(value);

  const applyCustom = (text: string, showErrors: boolean) => {
    setCustomText(text);
    if (text.trim() === '') {
      setCustomError(showErrors ? 'Informe um percentual.' : undefined);
      return;
    }
    const parsed = parsePercent(text, min, max);
    if (parsed.ok) {
      setCustomError(undefined);
      onChange(parsed.value);
    } else if (showErrors) {
      // Enquanto digita, mantém a última simulação válida; ao sair do campo, mostra o erro.
      setCustomError(parsed.error);
      onChange(null);
    }
  };

  return (
    <fieldset className="preset-picker">
      <legend className="field__label">{legend}</legend>
      <div className="preset-picker__options">
        {presets.map((preset) => (
          <label key={preset} className={`chip${selected === String(preset) ? ' is-selected' : ''}`}>
            <input
              type="radio"
              name={name}
              className="chip__input"
              checked={selected === String(preset)}
              onChange={() => {
                setCustomMode(false);
                setCustomError(undefined);
                onChange(preset);
              }}
            />
            {sign}
            {preset}%
          </label>
        ))}
        <label className={`chip${selected === 'custom' ? ' is-selected' : ''}`}>
          <input
            type="radio"
            name={name}
            className="chip__input"
            checked={selected === 'custom'}
            onChange={() => {
              setCustomMode(true);
              if (customText) applyCustom(customText, false);
            }}
          />
          Personalizado
        </label>
      </div>
      {customMode && (
        <div className="preset-picker__custom">
          <PercentInput
            id={`${name}-custom`}
            label="Percentual personalizado"
            value={customText}
            onChange={(text) => applyCustom(text, false)}
            onBlur={() => applyCustom(customText, true)}
            onEnter={() => applyCustom(customText, true)}
            placeholder="Ex.: 12,5"
            hint={`Entre ${formatDecimal(min, 0)}% e ${formatDecimal(max, 0)}%, com até duas casas decimais.`}
            error={customError}
          />
        </div>
      )}
    </fieldset>
  );
}
