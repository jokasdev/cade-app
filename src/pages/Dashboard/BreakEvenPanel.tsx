import { Scale } from 'lucide-react';
import { Card, CardHeader } from '../../components/Card/Card';
import { Term } from '../../components/Tooltip/Term';
import type { FinancialResult } from '../../types/finance';
import { formatBRL, formatPercent } from '../../utils/format';

interface Marker {
  key: string;
  label: string;
  value: number;
  position: 'above' | 'below';
}

/** Ponto de equilíbrio e meta com retirada, com um gráfico de “bala” (faturamento atual vs. metas). */
export function BreakEvenPanel({ result }: { result: FinancialResult }) {
  const { breakEven, revenueTarget, revenue, safetyMargin, ownerWithdrawal, fixedExpensesTotal } = result;

  if (breakEven.status !== 'finite') {
    return (
      <Card className="break-even">
        <CardHeader icon={<Scale />} title="Ponto de equilíbrio" action={<Term id="breakEven" />} />
        <p className="break-even__na-title">Não há um ponto de equilíbrio com a margem atual</p>
        <p className="break-even__text">
          Os custos variáveis consomem todo o faturamento, então cada venda não deixa margem para pagar as despesas fixas.
          Nessa situação, vender mais com a mesma estrutura não leva ao equilíbrio: antes, é preciso rever preços ou
          custos.
        </p>
      </Card>
    );
  }

  const markers: Marker[] = [{ key: 'break-even', label: 'Equilíbrio', value: breakEven.value, position: 'above' }];
  if (ownerWithdrawal > 0 && revenueTarget.status === 'finite') {
    markers.push({ key: 'target', label: 'Meta com retirada', value: revenueTarget.value, position: 'below' });
  }
  const scaleMax = Math.max(revenue, ...markers.map((marker) => marker.value), 1) * 1.08;
  const toPct = (value: number) => Math.min(100, (value / scaleMax) * 100);

  return (
    <Card className="break-even">
      <CardHeader icon={<Scale />} title="Ponto de equilíbrio" action={<Term id="breakEven" />} />
      <p className="break-even__value">
        {formatBRL(breakEven.value)}
        <span> por mês</span>
      </p>
      <p className="break-even__text">
        {fixedExpensesTotal === 0
          ? 'Sem despesas fixas informadas, qualquer venda com margem positiva já contribui para o resultado.'
          : 'É quanto o negócio precisa vender para cobrir custos variáveis e despesas fixas, mantendo a margem atual.'}
      </p>

      <div
        className="bullet"
        role="img"
        aria-label={`Faturamento atual de ${formatBRL(revenue)}; ponto de equilíbrio de ${formatBRL(breakEven.value)}${
          markers[1] ? `; meta com retirada de ${formatBRL(markers[1].value)}` : ''
        }.`}
      >
        <div className="bullet__track">
          <span className="bullet__fill" style={{ width: `${toPct(revenue)}%` }} />
          {markers.map((marker) => (
            <span
              key={marker.key}
              className={`bullet__marker bullet__marker--${marker.position}`}
              style={{ left: `${toPct(marker.value)}%` }}
            >
              <span className="bullet__marker-label">{marker.label}</span>
            </span>
          ))}
        </div>
        <div className="bullet__legend">
          <span>
            <span className="bullet__swatch" aria-hidden="true" /> Faturamento atual: <strong>{formatBRL(revenue)}</strong>
          </span>
        </div>
      </div>

      <dl className="break-even__facts">
        {safetyMargin && fixedExpensesTotal > 0 && (
          <div>
            <dt>
              Margem de segurança <Term id="safetyMargin" />
            </dt>
            <dd className={safetyMargin.value >= 0 ? 'text-positive' : 'text-negative'}>
              {safetyMargin.value >= 0
                ? `${formatBRL(safetyMargin.value)} (${formatPercent(safetyMargin.pct)})`
                : `Faltam ${formatBRL(-safetyMargin.value)}`}
            </dd>
          </div>
        )}
        {revenueTarget.status === 'finite' && ownerWithdrawal > 0 && (
          <div>
            <dt>
              Meta com retirada <Term id="revenueTarget" />
            </dt>
            <dd>{formatBRL(revenueTarget.value)}</dd>
          </div>
        )}
      </dl>
    </Card>
  );
}
