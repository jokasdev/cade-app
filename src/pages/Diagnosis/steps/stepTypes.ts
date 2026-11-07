import type { DiagnosisDraft, DraftFieldKey, FormStep } from '../../../types/app';

export interface StepProps {
  draft: DiagnosisDraft;
  update: (patch: Partial<DiagnosisDraft>) => void;
  /** Mensagem de erro visível para o campo (somente depois de tocado ou de tentar avançar). */
  errorFor: (field: DraftFieldKey) => string | undefined;
  touch: (field: DraftFieldKey) => void;
  goTo: (step: FormStep) => void;
}
