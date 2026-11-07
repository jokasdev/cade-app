import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '../../components/Button/Button';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ROUTES, href } from '../../routes';
import { LegalLayout } from './LegalLayout';

const FORMULAS = [
  { name: 'Margem de contribuição (MC)', formula: 'Faturamento − Custos variáveis' },
  { name: 'Margem de contribuição (%)', formula: 'MC ÷ Faturamento × 100' },
  { name: 'Resultado operacional estimado (RO)', formula: 'Faturamento − Custos variáveis − Despesas fixas' },
  { name: 'Resultado operacional (%)', formula: 'RO ÷ Faturamento × 100' },
  { name: 'Resultado após retirada', formula: 'RO − Retirada do proprietário' },
  { name: 'Ponto de equilíbrio operacional', formula: 'Despesas fixas ÷ (MC ÷ Faturamento)' },
  { name: 'Meta de faturamento com retirada', formula: '(Despesas fixas + Retirada) ÷ (MC ÷ Faturamento)' },
  { name: 'Margem de segurança', formula: '(Faturamento − Ponto de equilíbrio) ÷ Faturamento × 100' },
];

export default function AboutPage() {
  useDocumentTitle('Sobre o projeto');
  return (
    <LegalLayout
      eyebrow="Sobre"
      title="Sobre o CADÊ?"
      intro={
        <p>
          <strong>Seu negócio vende. Mas quanto dinheiro realmente sobra?</strong> O CADÊ? nasceu para responder essa
          pergunta de forma simples para MEIs, pequenos comerciantes, confeiteiras, lojas, prestadores de serviços e quem
          trabalha por conta própria.
        </p>
      }
    >
      <h2>O problema</h2>
      <p>
        Muitos pequenos negócios vendem bem, mas não sabem quanto realmente sobra no fim do mês. Faturamento costuma ser
        confundido com dinheiro disponível, custos ficam espalhados e a retirada do dono se mistura às despesas do negócio.
      </p>

      <h2>O que o CADÊ? faz</h2>
      <ul>
        <li>organiza os números do mês em etapas curtas;</li>
        <li>calcula margem de contribuição, resultado operacional, ponto de equilíbrio e meta com retirada;</li>
        <li>mostra os maiores gastos e para onde vai cada real vendido;</li>
        <li>aponta situações que merecem atenção, com regras objetivas;</li>
        <li>simula cenários e gera um relatório para salvar em PDF.</li>
      </ul>

      <h2>Como calculamos</h2>
      <p>
        Todos os cálculos são feitos no seu navegador, com valores em centavos para evitar erros de arredondamento. As
        fórmulas são:
      </p>
      <div className="formula-table" role="table" aria-label="Fórmulas usadas pelo CADÊ?">
        {FORMULAS.map((item) => (
          <div key={item.name} className="formula-table__row" role="row">
            <span role="rowheader" className="formula-table__name">
              {item.name}
            </span>
            <code role="cell" className="formula-table__formula">
              {item.formula}
            </code>
          </div>
        ))}
      </div>
      <p>
        Quando a margem de contribuição é zero ou negativa, não existe ponto de equilíbrio finito: vender mais com a mesma
        estrutura não cobre as despesas fixas. Nesse caso, o CADÊ? explica o motivo em vez de mostrar um número.
      </p>

      <h2>Limitações desta versão</h2>
      <ul>
        <li>É uma visão simplificada e mensal: não considera estoque, prazos de pagamento e recebimento, parcelas de empréstimos ou investimentos.</li>
        <li>O resultado operacional estimado não é lucro líquido contábil, e faturamento não é saldo em caixa.</li>
        <li>Os dados ficam apenas no navegador e no dispositivo em uso; não há sincronização entre aparelhos.</li>
        <li>Guarda um diagnóstico por vez (o mais recente). Para comparar meses, salve os relatórios em PDF ou backups.</li>
        <li>As sugestões são orientações gerais baseadas em regras fixas — não há inteligência artificial nesta versão.</li>
      </ul>

      <h2>Tecnologia e custo</h2>
      <p>
        O CADÊ? é um aplicativo web feito com React, TypeScript e Vite, sem servidor próprio e sem serviços pagos. Pode ser
        publicado gratuitamente em qualquer hospedagem de sites estáticos.
      </p>

      <div className="legal__cta">
        <ButtonLink href={href(ROUTES.diagnosis)} iconRight={<ArrowRight />}>
          Fazer meu diagnóstico
        </ButtonLink>
      </div>
    </LegalLayout>
  );
}
