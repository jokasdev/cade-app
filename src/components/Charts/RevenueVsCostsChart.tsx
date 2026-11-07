import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis, type BarShapeProps } from 'recharts';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import type { Cents } from '../../types/finance';
import { formatBRL, formatBRLCompact, formatPercent } from '../../utils/format';
import { CHART_COLORS, SEGMENT_GAP, barPath } from './chartTheme';
import { ChartDataTable, ChartLegend, ChartTooltipBox, type TooltipRow } from './ChartParts';

type SegmentKey = 'revenue' | 'variable' | 'fixed' | 'withdrawal';

interface Row {
  name: string;
  revenue: Cents;
  variable: Cents;
  fixed: Cents;
  withdrawal: Cents;
  /** Último segmento visível da linha (recebe a ponta arredondada). */
  last: SegmentKey;
}

interface RevenueVsCostsChartProps {
  revenue: Cents;
  variableCosts: Cents;
  fixedExpenses: Cents;
  ownerWithdrawal: Cents;
}

const SEGMENTS: readonly { key: SegmentKey; label: string; color: string }[] = [
  { key: 'revenue', label: 'Faturamento', color: CHART_COLORS.revenue },
  { key: 'variable', label: 'Custos variáveis', color: CHART_COLORS.variable },
  { key: 'fixed', label: 'Despesas fixas', color: CHART_COLORS.fixed },
  { key: 'withdrawal', label: 'Retirada', color: CHART_COLORS.withdrawal },
];

function segmentShape(key: SegmentKey) {
  return function SegmentShape(props: BarShapeProps) {
    const row = props.payload as Row | undefined;
    const isLast = row?.last === key;
    const width = isLast ? props.width : Math.max(0, props.width - SEGMENT_GAP);
    const path = barPath(props.x, props.y, width, props.height, isLast ? 'right' : 'none');
    return path ? <path d={path} fill={props.fill} /> : null;
  };
}

interface TooltipContentLike {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
}

/** Gráfico “Faturamento versus custos e despesas” (barras horizontais empilhadas). */
export function RevenueVsCostsChart({ revenue, variableCosts, fixedExpenses, ownerWithdrawal }: RevenueVsCostsChartProps) {
  const reducedMotion = usePrefersReducedMotion();
  const outflows = variableCosts + fixedExpenses + ownerWithdrawal;
  const lastOutflow: SegmentKey = ownerWithdrawal > 0 ? 'withdrawal' : fixedExpenses > 0 ? 'fixed' : 'variable';

  const data: Row[] = [
    { name: 'Faturamento', revenue, variable: 0, fixed: 0, withdrawal: 0, last: 'revenue' },
    { name: 'Saídas', revenue: 0, variable: variableCosts, fixed: fixedExpenses, withdrawal: ownerWithdrawal, last: lastOutflow },
  ];

  const renderTooltip = ({ active, payload }: TooltipContentLike) => {
    const row = payload?.[0]?.payload as Row | undefined;
    if (!active || !row) return null;
    if (row.name === 'Faturamento') {
      return <ChartTooltipBox title="Faturamento" rows={[{ label: 'vendas no mês', value: formatBRL(row.revenue), color: CHART_COLORS.revenue }]} />;
    }
    const rows: TooltipRow[] = SEGMENTS.slice(1).map((segment) => ({
      label: segment.label,
      value: formatBRL(row[segment.key]),
      color: segment.color,
    }));
    return (
      <ChartTooltipBox
        title="Saídas do mês"
        rows={rows}
        footer={`Total: ${formatBRL(outflows)} (${formatPercent((outflows / Math.max(revenue, 1)) * 100)} do faturamento)`}
      />
    );
  };

  const difference = revenue - outflows;

  return (
    <figure className="chart">
      <div
        className="chart__canvas"
        role="img"
        aria-label={`Faturamento de ${formatBRL(revenue)} comparado a saídas de ${formatBRL(outflows)}: custos variáveis ${formatBRL(variableCosts)}, despesas fixas ${formatBRL(fixedExpenses)} e retirada ${formatBRL(ownerWithdrawal)}.`}
      >
        <BarChart
          layout="vertical"
          data={data}
          responsive
          style={{ width: '100%', height: 150 }}
          margin={{ top: 4, right: 12, bottom: 0, left: 0 }}
          barCategoryGap="30%"
          accessibilityLayer={false}
        >
          <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
          <XAxis
            type="number"
            domain={[0, 'auto']}
            tickFormatter={(value: number) => formatBRLCompact(value)}
            tick={{ fill: CHART_COLORS.tick, fontSize: 12 }}
            axisLine={{ stroke: CHART_COLORS.axis }}
            tickLine={false}
            tickCount={5}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={96}
            tick={{ fill: CHART_COLORS.label, fontSize: 13, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip cursor={{ fill: 'rgba(16, 24, 39, 0.04)' }} content={renderTooltip} isAnimationActive={false} />
          {SEGMENTS.map((segment) => (
            <Bar
              key={segment.key}
              dataKey={segment.key}
              name={segment.label}
              stackId="total"
              fill={segment.color}
              barSize={24}
              shape={segmentShape(segment.key)}
              isAnimationActive={!reducedMotion}
              animationDuration={700}
            />
          ))}
        </BarChart>
      </div>
      <figcaption className="chart__caption">
        <ChartLegend items={SEGMENTS.map(({ label, color }) => ({ label, color }))} />
        <p className="chart__summary">
          As saídas somam <strong>{formatBRL(outflows)}</strong>.{' '}
          {difference >= 0 ? (
            <>
              Sobram <strong className="text-positive">{formatBRL(difference)}</strong> do faturamento depois de tudo, inclusive
              da retirada.
            </>
          ) : (
            <>
              Faltam <strong className="text-negative">{formatBRL(-difference)}</strong> para cobrir custos, despesas e retirada.
            </>
          )}
        </p>
      </figcaption>
      <ChartDataTable
        caption="Faturamento versus custos e despesas"
        headers={['Item', 'Valor']}
        rows={[
          ['Faturamento', formatBRL(revenue)],
          ['Custos variáveis', formatBRL(variableCosts)],
          ['Despesas fixas', formatBRL(fixedExpenses)],
          ['Retirada', formatBRL(ownerWithdrawal)],
          ['Total de saídas', formatBRL(outflows)],
        ]}
      />
    </figure>
  );
}
