import type { CostGroup, CostKey, FixedExpenseKey, Segment, VariableCostKey } from '../types/finance';

export interface CostFieldMeta<K extends CostKey = CostKey> {
  key: K;
  group: CostGroup;
  /** Rótulo completo usado no formulário. */
  label: string;
  /** Rótulo curto usado em gráficos, tabelas e relatórios. */
  shortLabel: string;
  /** Explicação em linguagem simples exibida abaixo do campo. */
  hint: string;
}

export const VARIABLE_COST_FIELDS: readonly CostFieldMeta<VariableCostKey>[] = [
  {
    key: 'goods',
    group: 'variable',
    label: 'Compra de mercadorias ou matérias-primas',
    shortLabel: 'Mercadorias e matérias-primas',
    hint: 'Ingredientes, produtos para revenda, tecidos, insumos usados em cada venda.',
  },
  {
    key: 'packaging',
    group: 'variable',
    label: 'Embalagens',
    shortLabel: 'Embalagens',
    hint: 'Caixas, potes, sacolas, etiquetas e fitas.',
  },
  {
    key: 'delivery',
    group: 'variable',
    label: 'Entregas e transporte pagos pelo negócio',
    shortLabel: 'Entregas e transporte',
    hint: 'Motoboy, fretes, taxas de aplicativos de entrega e combustível usado nas entregas.',
  },
  {
    key: 'paymentFees',
    group: 'variable',
    label: 'Taxas de cartão e meios de pagamento',
    shortLabel: 'Taxas de pagamento',
    hint: 'Maquininha, link de pagamento, antecipação e comissões de marketplaces ou aplicativos.',
  },
  {
    key: 'salesTaxes',
    group: 'variable',
    label: 'Impostos incidentes sobre as vendas',
    shortLabel: 'Impostos sobre vendas',
    hint: 'Ex.: Simples Nacional calculado sobre o faturamento. Se você é MEI, o DAS tem valor fixo: informe-o em “Outras despesas fixas”.',
  },
  {
    key: 'otherVariable',
    group: 'variable',
    label: 'Outros custos variáveis',
    shortLabel: 'Outros custos variáveis',
    hint: 'Comissões de vendedores e outros gastos que aumentam ou diminuem conforme as vendas.',
  },
];

export const FIXED_EXPENSE_FIELDS: readonly CostFieldMeta<FixedExpenseKey>[] = [
  {
    key: 'rent',
    group: 'fixed',
    label: 'Aluguel',
    shortLabel: 'Aluguel',
    hint: 'Aluguel do ponto, sala ou espaço. Inclua condomínio e IPTU, se houver.',
  },
  {
    key: 'utilities',
    group: 'fixed',
    label: 'Água e energia',
    shortLabel: 'Água e energia',
    hint: 'Contas de água e luz (e gás, se for o caso) do negócio.',
  },
  {
    key: 'internetPhone',
    group: 'fixed',
    label: 'Internet e telefone',
    shortLabel: 'Internet e telefone',
    hint: 'Planos de internet, telefone fixo e celular usados no negócio.',
  },
  {
    key: 'payroll',
    group: 'fixed',
    label: 'Salários e colaboradores',
    shortLabel: 'Salários e colaboradores',
    hint: 'Salários, encargos e pagamentos fixos a ajudantes. Não inclua a sua retirada aqui.',
  },
  {
    key: 'software',
    group: 'fixed',
    label: 'Sistemas e ferramentas',
    shortLabel: 'Sistemas e ferramentas',
    hint: 'Assinaturas de sistemas, aplicativos, site e ferramentas pagas todo mês.',
  },
  {
    key: 'accounting',
    group: 'fixed',
    label: 'Contabilidade',
    shortLabel: 'Contabilidade',
    hint: 'Honorários do contador ou do escritório de contabilidade.',
  },
  {
    key: 'otherFixed',
    group: 'fixed',
    label: 'Outras despesas fixas',
    shortLabel: 'Outras despesas fixas',
    hint: 'DAS do MEI, manutenção, seguros e outros gastos mensais que não mudam com as vendas.',
  },
];

export const COST_META: Record<CostKey, CostFieldMeta> = Object.fromEntries(
  [...VARIABLE_COST_FIELDS, ...FIXED_EXPENSE_FIELDS].map((meta) => [meta.key, meta]),
) as Record<CostKey, CostFieldMeta>;

export const GROUP_LABELS: Record<CostGroup, string> = {
  variable: 'Custos variáveis',
  fixed: 'Despesas fixas',
};

export const SEGMENT_LABELS: Record<Segment, string> = {
  alimentacao: 'Alimentação',
  comercio: 'Comércio',
  beleza: 'Beleza',
  servicos: 'Serviços',
  vestuario: 'Vestuário',
  outros: 'Outros',
};
