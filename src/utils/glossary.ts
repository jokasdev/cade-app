/** Conceitos financeiros explicados em linguagem simples (usados nos tooltips). */
export const GLOSSARY = {
  revenue: {
    term: 'Faturamento',
    text: 'Tudo o que o negócio vendeu no mês, antes de descontar qualquer gasto. Faturamento não é o dinheiro que sobra nem o saldo do caixa.',
  },
  variableCosts: {
    term: 'Custos variáveis',
    text: 'Gastos que sobem ou descem junto com as vendas: mercadorias, embalagens, entregas, taxas de cartão e impostos sobre as vendas.',
  },
  fixedExpenses: {
    term: 'Despesas fixas',
    text: 'Gastos que se repetem todo mês, vendendo muito ou pouco: aluguel, contas, salários, sistemas e contador.',
  },
  contributionMargin: {
    term: 'Margem de contribuição',
    text: 'O que sobra das vendas depois de pagar os custos variáveis. É esse valor que paga as despesas fixas. Em percentual, mostra quanto de cada R$ 100 vendidos fica para cobrir o resto.',
  },
  operatingResult: {
    term: 'Resultado operacional estimado',
    text: 'Faturamento menos custos variáveis e despesas fixas. Mostra se a operação se paga, antes da sua retirada. É uma estimativa simplificada e não equivale ao lucro líquido contábil.',
  },
  ownerWithdrawal: {
    term: 'Retirada do proprietário',
    text: 'Dinheiro que você tira do negócio para uso pessoal (pró-labore). Fica separada das despesas operacionais para mostrar se o negócio sustenta essa retirada.',
  },
  resultAfterWithdrawal: {
    term: 'Resultado após retirada',
    text: 'O que sobra (ou falta) depois de descontar a sua retirada do resultado operacional.',
  },
  breakEven: {
    term: 'Ponto de equilíbrio',
    text: 'Quanto o negócio precisa vender por mês para cobrir custos variáveis e despesas fixas, sem sobra nem falta, mantendo a margem atual.',
  },
  revenueTarget: {
    term: 'Meta com retirada',
    text: 'Faturamento estimado para cobrir custos variáveis, despesas fixas e também a sua retirada, mantendo a margem atual.',
  },
  safetyMargin: {
    term: 'Margem de segurança',
    text: 'Quanto as vendas podem cair antes de o resultado operacional ficar negativo.',
  },
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;
