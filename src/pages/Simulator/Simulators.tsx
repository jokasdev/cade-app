import { Layers, Receipt, Scissors, TrendingUp } from 'lucide-react';
import { useRef, useState } from 'react';
import { MoneyInput } from '../../components/Input/MoneyInput';
import {
  SIMULATION_LIMITS,
  SIMULATION_PRESETS,
  simulateCombined,
  simulateFixedExpenseReduction,
  simulateRevenueGrowth,
  simulateVariableCostReduction,
} from '../../services/calculations/simulations';
import type { SimulationSettings } from '../../types/app';
import type { FinancialTotals } from '../../types/finance';
import { formatBRL, formatDecimal, formatMoneyInput } from '../../utils/format';
import { MONEY_ERROR_MESSAGES, parseMoney } from '../../utils/parse';
import { PresetPicker } from './PresetPicker';
import { ScenarioResults } from './ScenarioResults';
import { ResultsPlaceholder, SimulatorCard } from './SimulatorCard';

interface SimulatorProps {
  totals: FinancialTotals;
  settings: SimulationSettings;
  onChange: (patch: Partial<SimulationSettings>) => void;
}

const pct = (value: number) => `${formatDecimal(value, 2)}%`;

/** Simulador 1 — aumento de faturamento (custos variáveis acompanham). */
export function RevenueGrowthSimulator({ totals, settings, onChange }: SimulatorProps) {
  const growth = settings.revenueGrowthPct;
  const [resetKey, setResetKey] = useState(0);
  const comparison = growth !== null ? simulateRevenueGrowth(totals, growth) : null;
  return (
    <SimulatorCard
      id="sim-revenue"
      number={1}
      icon={<TrendingUp />}
      question="E se seu faturamento aumentar?"
      description="Escolha um percentual de aumento nas vendas e veja o efeito no resultado."
      onClear={
        growth !== null
          ? () => {
              onChange({ revenueGrowthPct: null });
              setResetKey((key) => key + 1);
            }
          : undefined
      }
      controls={
        <PresetPicker
          key={resetKey}
          legend="Aumento do faturamento"
          presets={SIMULATION_PRESETS}
          value={growth}
          min={SIMULATION_LIMITS.revenueGrowthPct.min}
          max={SIMULATION_LIMITS.revenueGrowthPct.max}
          sign="+"
          onChange={(value) => onChange({ revenueGrowthPct: value })}
        />
      }
      assumptions={[
        <>
          O faturamento aumenta {growth !== null ? <strong>{pct(growth)}</strong> : 'o percentual escolhido'}.
        </>,
        <>
          Os <strong>custos variáveis crescem na mesma proporção</strong>, porque acompanham as vendas.
        </>,
        <>
          As despesas fixas permanecem iguais ({formatBRL(totals.fixedExpenses)}).
        </>,
        <>A retirada permanece igual ({formatBRL(totals.ownerWithdrawal)}).</>,
      ]}
      results={
        comparison ? (
          <ScenarioResults comparison={comparison} />
        ) : (
          <ResultsPlaceholder>Escolha um percentual para ver o novo faturamento, os novos custos e o novo resultado.</ResultsPlaceholder>
        )
      }
    />
  );
}

/** Simulador 2 — redução percentual dos custos variáveis. */
export function CostReductionSimulator({ totals, settings, onChange }: SimulatorProps) {
  const reduction = settings.variableCostReductionPct;
  const [resetKey, setResetKey] = useState(0);
  const comparison = reduction !== null ? simulateVariableCostReduction(totals, reduction) : null;
  const noVariableCosts = totals.variableCosts === 0;
  return (
    <SimulatorCard
      id="sim-costs"
      number={2}
      icon={<Scissors />}
      question="E se você reduzir seus custos?"
      description="Simule uma redução percentual nos custos variáveis — por exemplo, negociando com fornecedores."
      onClear={
        reduction !== null
          ? () => {
              onChange({ variableCostReductionPct: null });
              setResetKey((key) => key + 1);
            }
          : undefined
      }
      controls={
        <PresetPicker
          key={resetKey}
          legend="Redução dos custos variáveis"
          presets={SIMULATION_PRESETS}
          value={reduction}
          min={SIMULATION_LIMITS.variableCostReductionPct.min}
          max={SIMULATION_LIMITS.variableCostReductionPct.max}
          sign="−"
          onChange={(value) => onChange({ variableCostReductionPct: value })}
        />
      }
      assumptions={[
        <>
          Os custos variáveis diminuem {reduction !== null ? <strong>{pct(reduction)}</strong> : 'o percentual escolhido'}.
        </>,
        <>O faturamento permanece igual ({formatBRL(totals.revenue)}).</>,
        <>As despesas fixas permanecem iguais ({formatBRL(totals.fixedExpenses)}).</>,
        <>A retirada permanece igual.</>,
      ]}
      results={
        noVariableCosts ? (
          <ResultsPlaceholder>Você não informou custos variáveis, então não há o que reduzir nesta simulação.</ResultsPlaceholder>
        ) : comparison ? (
          <ScenarioResults comparison={comparison} />
        ) : (
          <ResultsPlaceholder>Escolha um percentual para ver a diferença no resultado operacional.</ResultsPlaceholder>
        )
      }
    />
  );
}

/** Simulador 3 — economia em reais nas despesas fixas. */
export function FixedReductionSimulator({ totals, settings, onChange }: SimulatorProps) {
  const saved = settings.fixedExpenseReductionCents;
  const [text, setText] = useState(saved !== null ? formatMoneyInput(saved) : '');
  const textRef = useRef(text);
  const [error, setError] = useState<string | undefined>(undefined);
  const max = totals.fixedExpenses;
  const comparison = saved !== null && saved <= max ? simulateFixedExpenseReduction(totals, saved) : null;

  const apply = (raw: string, showErrors: boolean) => {
    textRef.current = raw;
    setText(raw);
    if (raw.trim() === '') {
      setError(undefined);
      onChange({ fixedExpenseReductionCents: null });
      return;
    }
    const parsed = parseMoney(raw);
    if (!parsed.ok) {
      // Enquanto digita, mantém a última simulação válida; ao sair do campo, mostra o erro.
      if (showErrors) {
        setError(MONEY_ERROR_MESSAGES[parsed.error]);
        onChange({ fixedExpenseReductionCents: null });
      }
      return;
    }
    if (parsed.cents > max) {
      setError(`A economia não pode ser maior que o total de despesas fixas (${formatBRL(max)}).`);
      onChange({ fixedExpenseReductionCents: null });
      return;
    }
    setError(undefined);
    onChange({ fixedExpenseReductionCents: parsed.cents === 0 ? null : parsed.cents });
  };

  const sliderStep = Math.max(100, Math.round(max / 200 / 100) * 100);

  return (
    <SimulatorCard
      id="sim-fixed"
      number={3}
      icon={<Receipt />}
      question="E se você economizar nas despesas fixas?"
      description="Informe quanto, em reais, você conseguiria economizar por mês nas despesas fixas."
      onClear={
        saved !== null || text !== ''
          ? () => {
              textRef.current = '';
              setText('');
              setError(undefined);
              onChange({ fixedExpenseReductionCents: null });
            }
          : undefined
      }
      controls={
        max === 0 ? (
          <p className="sim-card__empty-control">Você não informou despesas fixas, então não há o que economizar nesta simulação.</p>
        ) : (
          <div className="fixed-control">
            <MoneyInput
              id="fixed-reduction"
              label="Economia mensal nas despesas fixas"
              value={text}
              onChange={(value) => apply(value, false)}
              onBlur={() => apply(textRef.current, true)}
              hint={`Máximo: ${formatBRL(max)} (total das suas despesas fixas).`}
              error={error}
            />
            <label className="range">
              <span className="sr-only">Ajustar a economia com o controle deslizante</span>
              <input
                type="range"
                min={0}
                max={max}
                step={Math.min(sliderStep, max)}
                value={Math.min(saved ?? 0, max)}
                onChange={(event) => {
                  const cents = Number(event.target.value);
                  textRef.current = cents === 0 ? '' : formatMoneyInput(cents);
                  setText(textRef.current);
                  setError(undefined);
                  onChange({ fixedExpenseReductionCents: cents === 0 ? null : cents });
                }}
                aria-valuetext={formatBRL(saved ?? 0)}
              />
              <span className="range__scale" aria-hidden="true">
                <span>R$ 0</span>
                <span>{formatBRL(max)}</span>
              </span>
            </label>
          </div>
        )
      }
      assumptions={[
        <>
          As despesas fixas diminuem {saved !== null ? <strong>{formatBRL(saved)}</strong> : 'o valor informado'}
          {saved !== null && <> (de {formatBRL(max)} para {formatBRL(max - saved)})</>}.
        </>,
        <>O faturamento e os custos variáveis permanecem iguais.</>,
        <>A retirada permanece igual.</>,
        <>A economia não pode ser maior que o total de despesas fixas.</>,
      ]}
      results={
        comparison ? (
          <ScenarioResults comparison={comparison} />
        ) : (
          <ResultsPlaceholder>Informe um valor de economia para ver o novo resultado operacional.</ResultsPlaceholder>
        )
      }
    />
  );
}

/** Cenário combinado — as três hipóteses ao mesmo tempo. */
export function CombinedScenario({ totals, settings }: Omit<SimulatorProps, 'onChange'>) {
  const active = [
    settings.revenueGrowthPct !== null,
    settings.variableCostReductionPct !== null,
    settings.fixedExpenseReductionCents !== null,
  ].filter(Boolean).length;

  const fixedReduction =
    settings.fixedExpenseReductionCents !== null && settings.fixedExpenseReductionCents <= totals.fixedExpenses
      ? settings.fixedExpenseReductionCents
      : null;
  const comparison =
    active >= 2
      ? simulateCombined(totals, {
          revenueGrowthPct: settings.revenueGrowthPct,
          variableCostReductionPct: settings.variableCostReductionPct,
          fixedExpenseReductionCents: fixedReduction,
        })
      : null;

  const assumptions = [
    settings.revenueGrowthPct !== null && (
      <>
        Faturamento <strong>+{pct(settings.revenueGrowthPct)}</strong>, com os custos variáveis acompanhando as vendas.
      </>
    ),
    settings.variableCostReductionPct !== null && (
      <>
        Custos variáveis <strong>−{pct(settings.variableCostReductionPct)}</strong> (aplicado depois do aumento de vendas).
      </>
    ),
    fixedReduction !== null && (
      <>
        Despesas fixas <strong>−{formatBRL(fixedReduction)}</strong>.
      </>
    ),
    <>Simulações não usadas ficam como estão hoje. A retirada permanece igual.</>,
  ].filter(Boolean);

  return (
    <SimulatorCard
      id="sim-combined"
      number="combinada"
      icon={<Layers />}
      question="E se você fizer tudo isso junto?"
      description="Junta as simulações que você configurou acima em um único cenário."
      controls={null}
      assumptions={assumptions}
      results={
        comparison ? (
          <ScenarioResults comparison={comparison} />
        ) : (
          <ResultsPlaceholder>Configure pelo menos duas das simulações acima para ver o efeito combinado.</ResultsPlaceholder>
        )
      }
    />
  );
}
