import { ChevronDown } from 'lucide-react';
import { GLOSSARY } from '../../utils/glossary';

const FAQ_ITEMS: readonly { question: string; answer: string }[] = [
  {
    question: 'O CADÊ? é gratuito?',
    answer: 'Sim. Esta versão é gratuita, não exige cadastro e funciona direto no navegador, sem instalar nada.',
  },
  {
    question: 'Preciso entender de contabilidade para usar?',
    answer:
      'Não. Você só precisa saber, de forma aproximada, quanto o negócio vende e quanto gasta em um mês. Cada conceito tem uma explicação em linguagem simples ao lado.',
  },
  {
    question: 'Onde ficam os meus dados?',
    answer:
      'No armazenamento local do seu navegador, neste dispositivo. Seus dados financeiros são processados localmente e não são enviados para um servidor pelo CADÊ? nesta versão. Se você limpar os dados do navegador, as informações podem ser apagadas — por isso, exporte backups com frequência.',
  },
  {
    question: 'Qual é a diferença entre faturamento e o dinheiro que sobra?',
    answer:
      'Faturamento é tudo o que você vendeu. Desse valor saem os custos variáveis (mercadorias, embalagens, taxas), as despesas fixas (aluguel, contas, salários) e a sua retirada. O que sobra costuma ser bem menor do que o faturamento — e é isso que o CADÊ? ajuda a enxergar.',
  },
  {
    question: 'O que é margem de contribuição?',
    answer: GLOSSARY.contributionMargin.text,
  },
  {
    question: 'O que é ponto de equilíbrio?',
    answer: `${GLOSSARY.breakEven.text} Exemplo: com despesas fixas de R$ 2.000 e margem de contribuição de 62,5%, o negócio precisa vender R$ 3.200 por mês para empatar.`,
  },
  {
    question: 'Por que a retirada do proprietário aparece separada?',
    answer:
      'Porque ela não é um custo da operação: é o dinheiro que você leva para casa. Separando, fica claro se a operação se paga e se ela sustenta a retirada que você faz.',
  },
  {
    question: 'O resultado substitui o meu contador?',
    answer:
      'Não. O CADÊ? faz estimativas simplificadas a partir dos números que você informa. O resultado operacional não é lucro líquido contábil. Para impostos, obrigações legais e decisões importantes, conte com um contador.',
  },
  {
    question: 'Como salvo o relatório em PDF?',
    answer:
      'Na tela de relatório, toque em “Baixar meu relatório em PDF”. Na janela de impressão que abrir, escolha “Salvar como PDF” como destino.',
  },
  {
    question: 'Funciona no celular?',
    answer: 'Sim. O CADÊ? funciona em celulares, tablets e computadores, nos navegadores modernos.',
  },
];

export function Faq() {
  return (
    <div className="faq">
      {FAQ_ITEMS.map((item) => (
        <details key={item.question} className="faq__item">
          <summary className="faq__question">
            <span>{item.question}</span>
            <ChevronDown aria-hidden="true" />
          </summary>
          <p className="faq__answer">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
