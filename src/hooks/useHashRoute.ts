import { useSyncExternalStore } from 'react';
import type { RoutePath } from '../routes';

function readPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  const path = (hash.split('?')[0] ?? '').replace(/\/+$/, '');
  if (path === '') return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/** Caminho atual (ex.: "/painel"), atualizado a cada mudança de hash. */
export function useHashRoute(): string {
  return useSyncExternalStore(subscribe, readPath, () => '/');
}

/** Navega para uma rota interna. */
export function navigate(path: RoutePath): void {
  const target = `#${path}`;
  if (window.location.hash === target) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = target;
  }
}
