import { createContext, useContext } from 'react';
import type { AppData, DiagnosisDraft, SimulationSettings } from '../types/app';
import type { Diagnosis, FinancialResult } from '../types/finance';

export interface AppDataContextValue {
  data: AppData;
  /** Rascunho atual do formulário (sempre disponível). */
  draft: DiagnosisDraft;
  diagnosis: Diagnosis | null;
  /** Resultado do motor financeiro para o diagnóstico atual. */
  result: FinancialResult | null;
  /** false quando o navegador não permite salvar (modo privado, bloqueio). */
  storageAvailable: boolean;
  /** Erro da última tentativa de salvar, se houver. */
  saveError: string | null;
  /** Aviso sobre dados salvos que não puderam ser recuperados. */
  loadNotice: string | null;
  dismissLoadNotice: () => void;
  setDraft: (draft: DiagnosisDraft) => void;
  saveDiagnosis: (diagnosis: Diagnosis, draft: DiagnosisDraft) => void;
  updateSimulations: (patch: Partial<SimulationSettings>) => void;
  replaceData: (data: AppData) => void;
  clearAll: () => void;
}

export const AppDataContext = createContext<AppDataContextValue | null>(null);

export function useAppData(): AppDataContextValue {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData precisa estar dentro de <AppDataProvider>.');
  return value;
}
