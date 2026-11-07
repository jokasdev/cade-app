/**
 * Formatação no padrão brasileiro (pt-BR, BRL).
 * Implementada com aritmética inteira para que centavos nunca sejam arredondados de forma errada.
 */

const NBSP = ' ';
/** Sinal de menos tipográfico: não se separa do número numa quebra de linha. */
export const MINUS = '−';

export const MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function splitCents(cents: number): { negative: boolean; reais: string; centavos: string } {
  const rounded = Math.round(cents);
  const negative = rounded < 0;
  const abs = BigInt(Math.abs(rounded));
  return {
    negative,
    reais: groupThousands((abs / 100n).toString()),
    centavos: (abs % 100n).toString().padStart(2, '0'),
  };
}

export interface MoneyFormatOptions {
  /** 'always' acrescenta “+” aos valores positivos (útil para diferenças). */
  signDisplay?: 'auto' | 'always';
}

/** 123456 → "R$ 1.234,56" (com espaço não separável). */
export function formatBRL(cents: number, options: MoneyFormatOptions = {}): string {
  if (!Number.isFinite(cents)) return '—';
  const { negative, reais, centavos } = splitCents(cents);
  const body = `R$${NBSP}${reais},${centavos}`;
  if (negative) return `${MINUS}${body}`;
  if (options.signDisplay === 'always' && Math.round(cents) > 0) return `+${body}`;
  return body;
}

/** Valor sem símbolo, para campos de formulário: 123456 → "1.234,56". */
export function formatMoneyInput(cents: number): string {
  if (!Number.isFinite(cents)) return '';
  const { negative, reais, centavos } = splitCents(cents);
  return `${negative ? '-' : ''}${reais},${centavos}`;
}

/** Valor compacto para eixos de gráficos: 1250000 → "R$ 12,5 mil". */
export function formatBRLCompact(cents: number): string {
  if (!Number.isFinite(cents)) return '—';
  const reais = cents / 100;
  const abs = Math.abs(reais);
  const sign = reais < 0 ? MINUS : '';
  const trim = (n: number) => formatDecimal(n, 1);
  if (abs >= 1_000_000_000) return `${sign}R$${NBSP}${trim(abs / 1_000_000_000)} bi`;
  if (abs >= 1_000_000) return `${sign}R$${NBSP}${trim(abs / 1_000_000)} mi`;
  if (abs >= 1_000) return `${sign}R$${NBSP}${trim(abs / 1_000)} mil`;
  return `${sign}R$${NBSP}${formatDecimal(abs, 0)}`;
}

/** Número com até `decimals` casas, sem zeros à direita: 62.5 → "62,5"; 40 → "40". */
export function formatDecimal(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '—';
  const factor = 10 ** decimals;
  const rounded = Math.round(Math.abs(value) * factor) / factor;
  const [intPart = '0', fracPart = ''] = rounded.toFixed(decimals).split('.');
  const trimmed = fracPart.replace(/0+$/, '');
  const sign = value < 0 && rounded !== 0 ? MINUS : '';
  return `${sign}${groupThousands(intPart)}${trimmed ? `,${trimmed}` : ''}`;
}

export interface PercentFormatOptions {
  decimals?: number;
  signDisplay?: 'auto' | 'always';
}

/** 62.5 → "62,5%". Valores indisponíveis (null) → "—". */
export function formatPercent(value: number | null | undefined, options: PercentFormatOptions = {}): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  const { decimals = 1, signDisplay = 'auto' } = options;
  const text = formatDecimal(value, decimals);
  const isPositive = !text.startsWith(MINUS) && text !== '0';
  return `${signDisplay === 'always' && isPositive ? '+' : ''}${text}%`;
}

/** (3, 2026) → "Março de 2026". */
export function formatPeriod(month: number, year: number): string {
  const name = MONTH_NAMES[month - 1];
  if (!name) return String(year);
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${year}`;
}

/** ISO → "07/11/2026 às 14:05". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} às ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Data local no formato AAAA-MM-DD (usada em nomes de arquivo). */
export function formatIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
