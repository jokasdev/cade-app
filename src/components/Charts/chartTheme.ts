/**
 * Cores dos gráficos. A paleta categórica (variável, fixa, retirada, sobra) foi
 * validada para daltonismo (separação ΔE ≥ 8 entre vizinhos) e cada série tem
 * sempre a mesma cor em todas as telas.
 */
export const CHART_COLORS = {
  revenue: '#334155',
  variable: '#EB6834',
  fixed: '#2A78D6',
  withdrawal: '#E87BA4',
  surplus: '#16A34A',
  deficit: '#DC2626',
  current: '#94A3B8',
  simulated: '#1E293B',
  grid: '#E9EEF4',
  axis: '#CBD5E1',
  tick: '#64748B',
  label: '#334155',
} as const;

/** Espaço (na cor da superfície) entre segmentos encostados. */
export const SEGMENT_GAP = 2;

/**
 * Caminho SVG de uma barra com cantos arredondados (4px) apenas na ponta do dado;
 * o lado da linha de base fica reto.
 */
export function barPath(
  x: number,
  y: number,
  width: number,
  height: number,
  roundedSide: 'left' | 'right' | 'none',
  radius = 4,
): string | null {
  let left = x;
  let top = y;
  let w = width;
  let h = height;
  if (w < 0) {
    left += w;
    w = -w;
  }
  if (h < 0) {
    top += h;
    h = -h;
  }
  if (!(w > 0.5) || !(h > 0)) return null;
  const r = Math.min(radius, w / 2, h / 2);
  const right = left + w;
  const bottom = top + h;
  if (roundedSide === 'right') {
    return `M${left},${top}H${right - r}A${r},${r} 0 0 1 ${right},${top + r}V${bottom - r}A${r},${r} 0 0 1 ${right - r},${bottom}H${left}Z`;
  }
  if (roundedSide === 'left') {
    return `M${right},${top}H${left + r}A${r},${r} 0 0 0 ${left},${top + r}V${bottom - r}A${r},${r} 0 0 0 ${left + r},${bottom}H${right}Z`;
  }
  return `M${left},${top}H${right}V${bottom}H${left}Z`;
}
