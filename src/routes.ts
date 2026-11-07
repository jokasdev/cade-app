/** Rotas da aplicação (navegação por hash, compatível com qualquer hospedagem estática). */
export const ROUTES = {
  home: '/',
  diagnosis: '/diagnostico',
  dashboard: '/painel',
  simulator: '/simulador',
  report: '/relatorio',
  data: '/meus-dados',
  privacy: '/privacidade',
  terms: '/termos',
  about: '/sobre',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/** Valor para o atributo href de um link interno. */
export function href(path: RoutePath): string {
  return `#${path}`;
}
