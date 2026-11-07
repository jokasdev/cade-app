import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { computeFinancials, totalsFromInput } from '../services/calculations';
import { createEmptyAppData, createEmptySimulations } from '../services/storage/schema';
import {
  STORAGE_KEY,
  clearAppData,
  getBrowserStorage,
  loadAppData,
  saveAppData,
  type KeyValueStorage,
} from '../services/storage/storage';
import { createEmptyDraft, draftFromDiagnosis } from '../services/validation/diagnosisForm';
import type { AppData, DiagnosisDraft, SimulationSettings } from '../types/app';
import type { Diagnosis, FinancialResult } from '../types/finance';
import { AppDataContext, type AppDataContextValue } from './appDataContext';

type Action =
  | { type: 'draft/set'; draft: DiagnosisDraft; at: string }
  | { type: 'diagnosis/save'; diagnosis: Diagnosis; draft: DiagnosisDraft; at: string }
  | { type: 'simulations/update'; patch: Partial<SimulationSettings>; at: string }
  | { type: 'data/replace'; data: AppData }
  | { type: 'data/clear' };

/** Descarta uma economia simulada que ficou maior que as novas despesas fixas. */
function reconcileSimulations(simulations: SimulationSettings, diagnosis: Diagnosis): SimulationSettings {
  const fixed = totalsFromInput(diagnosis.financials).fixedExpenses;
  const reduction = simulations.fixedExpenseReductionCents;
  if (reduction !== null && reduction > fixed) return { ...simulations, fixedExpenseReductionCents: null };
  return simulations;
}

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'draft/set':
      return { ...state, draft: action.draft, updatedAt: action.at };
    case 'diagnosis/save':
      return {
        ...state,
        draft: action.draft,
        diagnosis: action.diagnosis,
        generatedAt: action.at,
        simulations: reconcileSimulations(state.simulations, action.diagnosis),
        updatedAt: action.at,
      };
    case 'simulations/update':
      return { ...state, simulations: { ...state.simulations, ...action.patch }, updatedAt: action.at };
    case 'data/replace':
      return action.data;
    case 'data/clear':
      return { ...createEmptyAppData(), simulations: createEmptySimulations() };
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function loadNoticeFor(status: ReturnType<typeof loadAppData>): string | null {
  if (status.status === 'invalid') {
    return 'Não foi possível recuperar os dados salvos anteriormente neste navegador, então o CADÊ? começou do zero. Se você tiver um backup, importe-o em “Meus dados”.';
  }
  return null;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const storageRef = useRef<KeyValueStorage | null>(null);
  const [initial] = useState(() => {
    const storage = getBrowserStorage();
    storageRef.current = storage;
    return loadAppData(storage);
  });

  const [data, dispatch] = useReducer(reducer, initial.data);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadNotice, setLoadNotice] = useState<string | null>(() => loadNoticeFor(initial));
  const skipNextSave = useRef(true);

  // Salva automaticamente a cada alteração.
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const result = saveAppData(storageRef.current, data);
    setSaveError(result.ok ? null : result.error);
  }, [data]);

  // Mantém várias abas sincronizadas.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== STORAGE_KEY) return;
      const loaded = loadAppData(storageRef.current);
      skipNextSave.current = true;
      dispatch({ type: 'data/replace', data: loaded.data });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setDraft = useCallback((draft: DiagnosisDraft) => dispatch({ type: 'draft/set', draft, at: nowIso() }), []);

  const saveDiagnosis = useCallback(
    (diagnosis: Diagnosis, draft: DiagnosisDraft) => dispatch({ type: 'diagnosis/save', diagnosis, draft, at: nowIso() }),
    [],
  );

  const updateSimulations = useCallback(
    (patch: Partial<SimulationSettings>) => dispatch({ type: 'simulations/update', patch, at: nowIso() }),
    [],
  );

  const replaceData = useCallback((next: AppData) => {
    dispatch({ type: 'data/replace', data: { ...next, updatedAt: nowIso() } });
  }, []);

  const clearAll = useCallback(() => {
    clearAppData(storageRef.current);
    skipNextSave.current = true; // o estado vazio não precisa ser gravado
    dispatch({ type: 'data/clear' });
    setLoadNotice(null);
  }, []);

  const dismissLoadNotice = useCallback(() => setLoadNotice(null), []);

  const draft = useMemo<DiagnosisDraft>(() => {
    if (data.draft) return data.draft;
    if (data.diagnosis) return draftFromDiagnosis(data.diagnosis);
    return createEmptyDraft();
  }, [data.draft, data.diagnosis]);

  const result = useMemo<FinancialResult | null>(() => {
    if (!data.diagnosis) return null;
    try {
      return computeFinancials(data.diagnosis.financials);
    } catch {
      return null;
    }
  }, [data.diagnosis]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      draft,
      diagnosis: result ? data.diagnosis : null,
      result,
      storageAvailable: initial.status !== 'unavailable',
      saveError,
      loadNotice,
      dismissLoadNotice,
      setDraft,
      saveDiagnosis,
      updateSimulations,
      replaceData,
      clearAll,
    }),
    [
      data,
      draft,
      result,
      initial.status,
      saveError,
      loadNotice,
      dismissLoadNotice,
      setDraft,
      saveDiagnosis,
      updateSimulations,
      replaceData,
      clearAll,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
