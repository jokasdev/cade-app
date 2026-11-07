import type { CostKey, FinancialResult, Segment } from '../../types/finance';
import { formatBRL } from '../../utils/format';

export interface Suggestion {
  id: string;
  title: string;
  text: string;
}

const MAX_SUGGESTIONS = 6;

/** Dica associada ao maior gasto informado. */
const LARGEST_COST_TIPS: Record<CostKey, Omit<Suggestion, 'id'>> = {
  goods: {
    title: 'Negocie com fornecedores',
    text: 'Mercadorias e matérias-primas são seu maior gasto. Compare preços de pelo menos três fornecedores, avalie compras em maior volume quando fizer sentido e controle perdas e desperdícios.',
  },
  packaging: {
    title: 'Revise as embalagens',
    text: 'Embalagens são seu maior gasto. Compare fornecedores, padronize tamanhos e avalie comprar em maior quantidade.',
  },
  delivery: {
    title: 'Reveja a política de entregas',
    text: 'Entregas são seu maior gasto. Avalie cobrar taxa de entrega, definir um pedido mínimo ou agrupar entregas por região.',
  },
  paymentFees: {
    title: 'Compare as taxas de recebimento',
    text: 'Taxas de pagamento são seu maior gasto. Compare as taxas de maquininhas e plataformas, confira se você paga por antecipação sem precisar e incentive formas de pagamento mais baratas, como o Pix, quando possível.',
  },
  salesTaxes: {
    title: 'Converse com um contador sobre impostos',
    text: 'Impostos sobre vendas são seu maior gasto. Um contador pode verificar se o enquadramento tributário do negócio é o mais adequado para o seu faturamento.',
  },
  otherVariable: {
    title: 'Detalhe os outros custos variáveis',
    text: '“Outros custos variáveis” é seu maior gasto. Separe esses valores em categorias para enxergar melhor para onde o dinheiro está indo.',
  },
  rent: {
    title: 'Avalie o custo do espaço',
    text: 'O aluguel é seu maior gasto. Verifique se é possível renegociar o contrato ou se o tamanho do espaço é compatível com o volume de vendas.',
  },
  utilities: {
    title: 'Acompanhe o consumo de água e energia',
    text: 'Água e energia são seu maior gasto. Compare as contas mês a mês, identifique equipamentos que consomem muito e combine com a equipe como evitar desperdícios.',
  },
  internetPhone: {
    title: 'Revise os planos de internet e telefone',
    text: 'Internet e telefone são seu maior gasto. Compare planos e cancele serviços que não são usados.',
  },
  payroll: {
    title: 'Planeje a equipe com base nas vendas',
    text: 'Salários e colaboradores são seu maior gasto. Compare o custo da equipe com o volume de vendas e organize escalas de acordo com os horários de maior movimento.',
  },
  software: {
    title: 'Revise as assinaturas',
    text: 'Sistemas e ferramentas são seu maior gasto. Liste as assinaturas pagas e cancele as que não são usadas com frequência.',
  },
  accounting: {
    title: 'Aproveite melhor a contabilidade',
    text: 'A contabilidade é seu maior gasto. Use esse serviço também para tirar dúvidas sobre impostos, pró-labore e organização financeira.',
  },
  otherFixed: {
    title: 'Detalhe as outras despesas fixas',
    text: '“Outras despesas fixas” é seu maior gasto. Separe esses valores em categorias para identificar o que pode ser reduzido.',
  },
};

/** Boa prática de organização relacionada ao segmento. */
const SEGMENT_TIPS: Partial<Record<Segment, Omit<Suggestion, 'id'>>> = {
  alimentacao: {
    title: 'Monte a ficha técnica dos produtos',
    text: 'Anote ingredientes e quantidades de cada receita para saber o custo real de cada unidade vendida e definir preços com segurança.',
  },
  comercio: {
    title: 'Acompanhe o giro do estoque',
    text: 'Identifique os produtos que vendem mais e os que ficam parados. Estoque parado é dinheiro que não volta para o caixa.',
  },
  beleza: {
    title: 'Calcule o custo por atendimento',
    text: 'Some os produtos e materiais usados em cada serviço para conferir se o preço cobre o custo e o seu tempo.',
  },
  servicos: {
    title: 'Calcule o valor da sua hora',
    text: 'Divida as despesas e a retirada pelas horas trabalhadas no mês para saber quanto cada hora de trabalho precisa render.',
  },
  vestuario: {
    title: 'Planeje coleções e promoções',
    text: 'Acompanhe quais peças vendem mais e programe promoções para liberar o estoque parado antes da próxima coleção.',
  },
};

/**
 * Sugestões de organização e melhoria, escolhidas por regras fixas a partir dos números.
 * São orientações gerais — não substituem a análise de um contador ou consultor.
 */
export function buildSuggestions(result: FinancialResult, segment: Segment | null = null): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const { contributionMargin, operatingResult, resultAfterWithdrawal, ownerWithdrawal, breakEven, largestCost, revenue } =
    result;

  if (revenue > 0 && contributionMargin <= 0) {
    suggestions.push({
      id: 'review-pricing',
      title: 'Revise preços e custos por produto',
      text: 'Hoje cada venda custa tanto quanto rende, ou mais. Calcule o custo de cada produto ou serviço e confira se o preço de venda cobre esse custo com folga. Confira também se todos os valores se referem ao mesmo mês.',
    });
  } else if (operatingResult < 0 && breakEven.status === 'finite') {
    suggestions.push({
      id: 'reach-break-even',
      title: 'Trace um caminho até o ponto de equilíbrio',
      text: `Com a margem atual, o negócio precisaria vender cerca de ${formatBRL(breakEven.value)} por mês para cobrir custos e despesas. Use o simulador para testar aumento de vendas, redução de custos ou economia nas despesas fixas.`,
    });
  }

  if (ownerWithdrawal > 0 && resultAfterWithdrawal < 0) {
    suggestions.push({
      id: 'adjust-withdrawal',
      title: 'Ajuste a retirada ao resultado',
      text: 'Retirar mais do que o negócio gera pode consumir o caixa e o capital de giro (o dinheiro que mantém a operação funcionando). Considere uma retirada compatível com o resultado até que as vendas ou a margem melhorem.',
    });
  }

  if (largestCost) {
    suggestions.push({ id: `largest-${largestCost.key}`, ...LARGEST_COST_TIPS[largestCost.key] });
  }

  const segmentTip = segment ? SEGMENT_TIPS[segment] : undefined;
  if (segmentTip) {
    suggestions.push({ id: `segment-${segment}`, ...segmentTip });
  }

  if (ownerWithdrawal === 0) {
    suggestions.push({
      id: 'fixed-withdrawal',
      title: 'Defina uma retirada fixa',
      text: 'Combine um valor mensal fixo para você (pró-labore) em vez de retirar dinheiro conforme a necessidade. Assim fica mais fácil saber se o negócio se sustenta.',
    });
  }

  suggestions.push(
    {
      id: 'separate-accounts',
      title: 'Separe as finanças pessoais das do negócio',
      text: 'Use uma conta só para o negócio. Isso facilita saber quanto ele realmente vende, gasta e quanto sobra.',
    },
    {
      id: 'record-daily',
      title: 'Registre vendas e gastos todos os dias',
      text: 'Anote entradas e saídas diariamente, mesmo que em uma planilha simples. Números mais precisos geram diagnósticos mais confiáveis.',
    },
    {
      id: 'monthly-review',
      title: 'Repita o diagnóstico todo mês',
      text: 'Comparar meses ajuda a perceber mudanças antes que virem problema. Exporte um backup ou salve o relatório em PDF a cada diagnóstico.',
    },
  );

  return suggestions.slice(0, MAX_SUGGESTIONS);
}
