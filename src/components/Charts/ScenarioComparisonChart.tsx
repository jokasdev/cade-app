import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type YAxisTickContentProps,
} from 'recharts';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import type { CoreIndicators } from '../../types/finance';
import { formatBRL, formatBRLCompact } from '../../utils/format';
import { CHART_COLORS, barPath } from './chartTheme';
import { ChartLegend, ChartTooltipBox } from './ChartParts';

interface Row {
  name: string;
  current: number;
  simulated: number;
}

type SeriesKey = 'current' | 'simulated';

function valueShape(key: SeriesKey) {
  return function ValueShape(props: BarShapeProps) {
    const row = props.payload as Row | undefined;
    const value = row?.[key] ?? 0;
    const path = barPath(props.x, props.y, props.width, props.height, value < 0 ? 'left' : 'right');
    return path ? <path d={path} fill={props.fill} /> : null;
  };
}

/** Rótulo do eixo em até duas linhas, para caber no celular. */
function WrappedTick({ x, y, payload }: YAxisTickContentProps) {
  const text = String(payload?.value ?? '');
  const words = text.split(' ');
  const lines = text.length > 14 && words.length > 1 ? [words.slice(0, -1).join(' '), words[words.length - 1] ?? ''] : [text];
  const offset = lines.length === 2 ? -7 : 0;
  return (
    <text x={Number(x) - 8} y={Number(y) + offset} textAnchor="end" fill={CHART_COLORS.label} fontSize={12} fontWeight={600}>
      {lines.map((line, index) => (
        <tspan key={line} x={Number(x) - 8} dy={index === 0 ? 4 : 14}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

interface TooltipContentLike {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
}

function renderTooltip({ active, payload }: TooltipContentLike) {
  const row = payload?.[0]?.payload as Row | undefined;
  if (!active || !row) return null;
  const diff = row.simulated - row.current;
  return (
    <ChartTooltipBox
      title={row.name}
      rows={[
        { label: 'situação atual', value: formatBRL(row.current), color: CHART_COLORS.current },
        { label: 'cenário simulado', value: formatBRL(row.simulated), color: CHART_COLORS.simulated },
      ]}
      footer={`Diferença: ${formatBRL(diff, { signDisplay: 'always' })}`}
    />
  );
}

/** Comparação visual entre a situação atual e o cenário simulado. */
export function ScenarioComparisonChart({ base, simulated }: { base: CoreIndicators; simulated: CoreIndicators }) {
  const reducedMotion = usePrefersReducedMotion();
  const data: Row[] = [
    { name: 'Faturamento', current: base.revenue, simulated: simulated.revenue },
    { name: 'Custos variáveis', current: base.variableCostsTotal, simulated: simulated.variableCostsTotal },
    { name: 'Despesas fixas', current: base.fixedExpensesTotal, simulated: simulated.fixedExpensesTotal },
    { name: 'Resultado operacional', current: base.operatingResult, simulated: simulated.operatingResult },
  ];
  const hasNegative = data.some((row) => row.current < 0 || row.simulated < 0);

  return (
    <figure className="chart">
      <div
        className="chart__canvas"
        role="img"
        aria-label={`Resultado operacional: ${formatBRL(base.operatingResult)} na situação atual e ${formatBRL(simulated.operatingResult)} no cenário simulado.`}
      >
        <BarChart
          layout="vertical"
          data={data}
          responsive
          style={{ width: '100%', height: 268 }}
          margin={{ top: 4, right: 14, bottom: 0, left: 0 }}
          barGap={2}
          barCategoryGap="24%"
          accessibilityLayer={false}
        >
          <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
          <XAxis
            type="number"
            domain={hasNegative ? ['auto', 'auto'] : [0, 'auto']}
            tickFormatter={(value: number) => formatBRLCompact(value)}
            tick={{ fill: CHART_COLORS.tick, fontSize: 12 }}
            axisLine={{ stroke: CHART_COLORS.axis }}
            tickLine={false}
            tickCount={5}
          />
          <YAxis type="category" dataKey="name" width={104} tick={WrappedTick} axisLine={false} tickLine={false} interval={0} />
          {hasNegative && <ReferenceLine x={0} stroke={CHART_COLORS.axis} />}
          <Tooltip cursor={{ fill: 'rgba(16, 24, 39, 0.04)' }} content={renderTooltip} isAnimationActive={false} />
          <Bar
            dataKey="current"
            name="Situação atual"
            fill={CHART_COLORS.current}
            barSize={14}
            shape={valueShape('current')}
            isAnimationActive={!reducedMotion}
          />
          <Bar
            dataKey="simulated"
            name="Cenário simulado"
            fill={CHART_COLORS.simulated}
            barSize={14}
            shape={valueShape('simulated')}
            isAnimationActive={!reducedMotion}
          />
        </BarChart>
      </div>
      <figcaption className="chart__caption">
        <ChartLegend
          items={[
            { label: 'Situação atual', color: CHART_COLORS.current },
            { label: 'Cenário simulado', color: CHART_COLORS.simulated },
          ]}
        />
      </figcaption>
    </figure>
  );
}
