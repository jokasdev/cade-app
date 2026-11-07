import { ArrowLeft, ArrowRight, Banknote, Building, Package, Receipt, RotateCcw, Sparkles, Wallet } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '../../components/Button/Button';
import { ConfirmDialog } from '../../components/Dialog/ConfirmDialog';
import { Notice } from '../../components/Notice/Notice';
import { StepProgress, type StepDefinition } from '../../components/Progress/StepProgress';
import { useToast } from '../../components/Toast/toastContext';
import { useAppData } from '../../context/appDataContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { navigate } from '../../hooks/useHashRoute';
import { ROUTES } from '../../routes';
import {
  createEmptyDraft,
  isStepReachable,
  stepOfField,
  validateDraft,
  validateStep,
} from '../../services/validation/diagnosisForm';
import type { DiagnosisDraft, DraftFieldKey, FieldErrors, FormStep } from '../../types/app';
import { formatPeriod } from '../../utils/format';
import { DraftSummary } from './DraftSummary';
import { StepVariableCosts, StepFixedExpenses } from './steps/StepCosts';
import { StepGeneral } from './steps/StepGeneral';
import { StepRevenue } from './steps/StepRevenue';
import { StepWithdrawal } from './steps/StepWithdrawal';
import type { StepProps } from './steps/stepTypes';
import './Diagnosis.css';

interface StepMeta extends StepDefinition {
  icon: ReactNode;
  heading: string;
  description: string;
}

const STEPS: readonly StepMeta[] = [
  {
    step: 1,
    title: 'Informações gerais',
    icon: <Building />,
    heading: 'Conte um pouco sobre o seu negócio',
    description: 'Essas informações identificam o diagnóstico e o período analisado.',
  },
  {
    step: 2,
    title: 'Faturamento',
    icon: <Banknote />,
    heading: 'Faturamento do mês',
    description: 'O total de vendas do mês de referência.',
  },
  {
    step: 3,
    title: 'Custos variáveis',
    icon: <Package />,
    heading: 'Custos variáveis',
    description: 'Gastos que aumentam ou diminuem conforme você vende. Deixe em branco o que não se aplica.',
  },
  {
    step: 4,
    title: 'Despesas fixas',
    icon: <Receipt />,
    heading: 'Despesas fixas',
    description: 'Gastos que se repetem todo mês, vendendo muito ou pouco. Deixe em branco o que não se aplica.',
  },
  {
    step: 5,
    title: 'Retirada',
    icon: <Wallet />,
    heading: 'Retirada do proprietário',
    description: 'O dinheiro que você tira do negócio para a sua vida pessoal.',
  },
];

const STEP_COMPONENTS: Record<FormStep, (props: StepProps) => ReactNode> = {
  1: StepGeneral,
  2: StepRevenue,
  3: StepVariableCosts,
  4: StepFixedExpenses,
  5: StepWithdrawal,
};

function hasContent(draft: DiagnosisDraft): boolean {
  return (
    draft.name.trim() !== '' ||
    draft.segment !== '' ||
    draft.revenue.trim() !== '' ||
    draft.ownerWithdrawal.trim() !== '' ||
    Object.values(draft.variableCosts).some((value) => value.trim() !== '') ||
    Object.values(draft.fixedExpenses).some((value) => value.trim() !== '')
  );
}

export default function DiagnosisPage() {
  useDocumentTitle('Diagnóstico');
  const { draft, setDraft, saveDiagnosis, diagnosis, storageAvailable, data } = useAppData();
  const { notify } = useToast();
  const [touched, setTouched] = useState<ReadonlySet<DraftFieldKey>>(() => new Set());
  const [attempted, setAttempted] = useState<ReadonlySet<FormStep>>(() => new Set());
  const [submitting, setSubmitting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const previousStep = useRef<FormStep>(draft.step);
  const submitTimer = useRef<number | undefined>(undefined);
  const [maxVisited, setMaxVisited] = useState<number>(() => (diagnosis ? 5 : draft.step));

  const step = draft.step;
  const meta = STEPS[step - 1] ?? STEPS[0]!;
  const errors: FieldErrors = useMemo(() => validateStep(step, draft), [step, draft]);

  // Ao trocar de etapa, leva o foco (e a rolagem) para o título da nova etapa.
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    setMaxVisited((current) => Math.max(current, step));
    const heading = headingRef.current;
    if (!heading) return;
    heading.focus({ preventScroll: true });
    const top = heading.getBoundingClientRect().top + window.scrollY - 120;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
  }, [step]);

  useEffect(() => () => window.clearTimeout(submitTimer.current), []);

  const update = (patch: Partial<DiagnosisDraft>) => setDraft({ ...draft, ...patch });

  const touch = (field: DraftFieldKey) =>
    setTouched((current) => (current.has(field) ? current : new Set(current).add(field)));

  const errorFor = (field: DraftFieldKey) =>
    touched.has(field) || attempted.has(stepOfField(field)) ? errors[field] : undefined;

  const goTo = (target: FormStep) => {
    if (target === step) return;
    if (target > step && !isStepReachable(target, draft)) return;
    update({ step: target });
  };

  const focusFirstInvalid = () => {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
  };

  const next = () => {
    if (Object.keys(errors).length > 0) {
      setAttempted((current) => new Set(current).add(step));
      focusFirstInvalid();
      return;
    }
    goTo((step + 1) as FormStep);
  };

  const submit = () => {
    const validation = validateDraft(draft);
    if (!validation.ok) {
      setAttempted(new Set([1, 2, 3, 4, 5] as const));
      update({ step: validation.firstInvalidStep });
      notify({ type: 'error', message: 'Revise os campos destacados antes de gerar o diagnóstico.' });
      focusFirstInvalid();
      return;
    }
    setSubmitting(true);
    // Pausa curta apenas para dar retorno visual; o cálculo em si é instantâneo.
    submitTimer.current = window.setTimeout(() => {
      saveDiagnosis(validation.diagnosis, { ...draft, step: 1 });
      notify({
        type: 'success',
        title: 'Diagnóstico gerado!',
        message: storageAvailable
          ? 'Os dados foram salvos neste navegador.'
          : 'Atenção: este navegador não permite salvar. Exporte um backup para não perder os dados.',
      });
      navigate(ROUTES.dashboard);
    }, 450);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (step < 5) next();
    else submit();
  };

  const resetForm = () => {
    setDraft(createEmptyDraft());
    setTouched(new Set());
    setAttempted(new Set());
    setConfirmReset(false);
    notify({ type: 'info', message: 'Formulário limpo. Você pode começar de novo.' });
  };

  const StepComponent = STEP_COMPONENTS[step];
  const stepErrorCount = attempted.has(step) ? Object.keys(errors).length : 0;

  return (
    <div className="page diagnosis">
      <div className="container">
        <header className="page-header">
          <div className="page-header__text">
            <span className="eyebrow">Diagnóstico financeiro</span>
            <h1 className="page-title">Vamos entender os números do seu negócio</h1>
            <p className="page-subtitle">
              São 5 etapas curtas. Você pode voltar e alterar qualquer resposta — tudo fica salvo neste navegador.
            </p>
          </div>
          {hasContent(draft) && (
            <div className="page-actions">
              <Button variant="ghost" size="sm" icon={<RotateCcw />} onClick={() => setConfirmReset(true)}>
                Limpar formulário
              </Button>
            </div>
          )}
        </header>

        {diagnosis && (
          <Notice tone="info" className="diagnosis__existing">
            Você já tem um diagnóstico salvo de{' '}
            <strong>{formatPeriod(diagnosis.business.referenceMonth, diagnosis.business.referenceYear)}</strong>. Ao gerar
            novamente, ele será atualizado com os valores abaixo.
          </Notice>
        )}

        <div className="diagnosis__layout">
          <div className="diagnosis__main">
            <StepProgress
              steps={STEPS}
              current={step}
              isReachable={(target) => isStepReachable(target, draft)}
              isComplete={(target) =>
                target <= maxVisited &&
                isStepReachable(target, draft) &&
                Object.keys(validateStep(target, draft)).length === 0
              }
              onSelect={goTo}
            />

            <form ref={formRef} className="diagnosis-form" onSubmit={onSubmit} noValidate>
              <div className="diagnosis-form__head" key={`head-${step}`}>
                <span className="diagnosis-form__icon" aria-hidden="true">
                  {meta.icon}
                </span>
                <div>
                  <p className="diagnosis-form__step">
                    Etapa {step} de {STEPS.length}
                  </p>
                  <h2 ref={headingRef} tabIndex={-1} className="diagnosis-form__title">
                    {meta.heading}
                  </h2>
                  <p className="diagnosis-form__description">{meta.description}</p>
                </div>
              </div>

              {stepErrorCount > 0 && (
                <p className="diagnosis-form__errors" role="alert">
                  {stepErrorCount === 1
                    ? 'Há 1 campo para corrigir nesta etapa.'
                    : `Há ${stepErrorCount} campos para corrigir nesta etapa.`}
                </p>
              )}

              <div className="diagnosis-form__body" key={`body-${step}`}>
                <StepComponent draft={draft} update={update} errorFor={errorFor} touch={touch} goTo={goTo} />
              </div>

              <div className="diagnosis-form__footer">
                {step > 1 ? (
                  <Button variant="secondary" icon={<ArrowLeft />} onClick={() => goTo((step - 1) as FormStep)}>
                    Voltar
                  </Button>
                ) : (
                  <span />
                )}
                {step < 5 ? (
                  <Button type="submit" iconRight={<ArrowRight />}>
                    Continuar
                  </Button>
                ) : (
                  <Button type="submit" size="lg" icon={<Sparkles />} loading={submitting}>
                    {submitting ? 'Gerando diagnóstico…' : 'Gerar meu diagnóstico'}
                  </Button>
                )}
              </div>
            </form>
          </div>

          <DraftSummary draft={draft} storageAvailable={storageAvailable} updatedAt={data.updatedAt} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Limpar o formulário?"
        confirmLabel="Limpar formulário"
        tone="danger"
        onConfirm={resetForm}
        onClose={() => setConfirmReset(false)}
      >
        <p>Todos os valores digitados no formulário serão apagados.</p>
        {diagnosis && <p>O diagnóstico já gerado continua salvo até você gerar um novo.</p>}
      </ConfirmDialog>
    </div>
  );
}
