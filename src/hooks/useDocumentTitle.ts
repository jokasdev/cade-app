import { useEffect } from 'react';

const SUFFIX = 'CADÊ?';

/** Define o título da aba do navegador para a página atual. */
export function useDocumentTitle(title: string | null): void {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : `${SUFFIX} — Diagnóstico financeiro para pequenos negócios`;
  }, [title]);
}
