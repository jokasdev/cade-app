import type { ReactNode } from 'react';
import './Charts.css';

export interface LegendItem {
  label: string;
  color: string;
  /** 'line' para marcadores verticais (ex.: linha do faturamento). */
  shape?: 'rect' | 'line';
}

/** Legenda em HTML (sempre presente quando há duas ou mais séries). */
export function ChartLegend({ items }: { items: readonly LegendItem[] }) {
  return (
    <ul className="chart-legend" role="list">
      {items.map((item) => (
        <li key={item.label} className="chart-legend__item">
          <span
            className={`chart-legend__swatch chart-legend__swatch--${item.shape ?? 'rect'}`}
            style={{ background: item.color }}
            aria-hidden="true"
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export interface TooltipRow {
  label: string;
  value: string;
  color?: string;
}

/** Caixa do tooltip: o valor vem em destaque e o nome da série em seguida. */
export function ChartTooltipBox({ title, rows, footer }: { title?: string; rows: readonly TooltipRow[]; footer?: ReactNode }) {
  return (
    <div className="chart-tooltip">
      {title && <p className="chart-tooltip__title">{title}</p>}
      <ul className="chart-tooltip__rows" role="list">
        {rows.map((row) => (
          <li key={row.label} className="chart-tooltip__row">
            {row.color && <span className="chart-tooltip__key" style={{ background: row.color }} aria-hidden="true" />}
            <strong className="chart-tooltip__value">{row.value}</strong>
            <span className="chart-tooltip__label">{row.label}</span>
          </li>
        ))}
      </ul>
      {footer && <div className="chart-tooltip__footer">{footer}</div>}
    </div>
  );
}

/** Tabela com os mesmos dados do gráfico (alternativa acessível). */
export function ChartDataTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  return (
    <details className="chart-table no-print">
      <summary>Ver dados em tabela</summary>
      <div className="chart-table__scroll">
        <table>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) =>
                  index === 0 ? (
                    <th key={index} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={index}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
