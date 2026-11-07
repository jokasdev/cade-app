import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ROUTES, href } from '../../routes';
import { LegalLayout } from './LegalLayout';

export default function PrivacyPage() {
  useDocumentTitle('Política de privacidade');
  return (
    <LegalLayout
      eyebrow="Privacidade"
      title="Política de privacidade"
      updated="novembro de 2026 (versão MVP 1.0)"
      intro={
        <p>
          <strong>
            Seus dados financeiros são processados localmente neste navegador e não são enviados para um servidor pelo CADÊ?
            nesta versão.
          </strong>{' '}
          Esta política explica, de forma simples, como esta versão do CADÊ? funciona em relação às informações que você
          digita.
        </p>
      }
    >
      <h2>1. Quais informações você informa</h2>
      <p>Para gerar o diagnóstico, o CADÊ? pede apenas:</p>
      <ul>
        <li>nome do negócio (opcional), segmento e mês/ano de referência;</li>
        <li>valores mensais de faturamento, custos variáveis, despesas fixas e retirada do proprietário;</li>
        <li>os parâmetros que você escolher no simulador.</li>
      </ul>

      <h2>2. O que o CADÊ? não coleta</h2>
      <p>
        O CADÊ? não pede nem coleta CPF, senhas bancárias, dados de cartão, informações de contas bancárias ou dados de
        clientes finais. Recomendamos não digitar dados pessoais no campo “Nome do negócio”.
      </p>

      <h2>3. Onde as informações ficam</h2>
      <p>
        Os dados ficam no armazenamento local (localStorage) do navegador que você está usando, neste dispositivo. Todos os
        cálculos acontecem no próprio navegador. Nesta versão não há cadastro, login, banco de dados externo, ferramentas de
        análise de uso (analytics), cookies de rastreamento nem envio dos seus dados financeiros para servidores do CADÊ?.
      </p>
      <p>
        As fontes, os ícones e os gráficos fazem parte dos próprios arquivos do site — o CADÊ? não carrega scripts de
        terceiros.
      </p>

      <h2>4. Hospedagem do site</h2>
      <p>
        Para abrir o CADÊ?, seu navegador baixa os arquivos do site a partir do serviço de hospedagem onde ele foi publicado.
        Esse serviço pode registrar dados técnicos de acesso (como endereço IP, data e hora e tipo de navegador), de acordo
        com as políticas dele. Esses registros não incluem os valores financeiros que você digita no CADÊ?.
      </p>

      <h2>5. Relatório em PDF e backup</h2>
      <p>
        O relatório em PDF é gerado pela função de impressão do seu navegador, no seu aparelho. O backup é um arquivo .json
        criado localmente e salvo onde você escolher. Esses arquivos contêm seus números financeiros em formato legível:
        guarde-os em local seguro e compartilhe apenas com quem você confia.
      </p>

      <h2>6. Por quanto tempo os dados ficam salvos</h2>
      <p>
        Até você apagá-los. Você pode excluir tudo a qualquer momento em{' '}
        <a className="link" href={href(ROUTES.data)}>
          Meus dados
        </a>{' '}
        → “Apagar todos os dados”. Limpar os dados de navegação do navegador também pode apagar as informações. Por isso,
        exporte backups regularmente.
      </p>

      <h2>7. Cuidados com o seu dispositivo</h2>
      <p>
        Qualquer pessoa com acesso ao seu navegador neste dispositivo pode ver os dados salvos. Em computadores
        compartilhados, apague os dados ao terminar ou use o backup para levá-los com você.
      </p>

      <h2>8. Alterações nesta política</h2>
      <p>
        Se o funcionamento do CADÊ? mudar — por exemplo, com a criação de contas ou armazenamento online em versões futuras —
        esta política será atualizada antes da mudança, informando o que passa a ser coletado e por quê.
      </p>

      <h2>9. Aviso</h2>
      <p>
        Este texto descreve o funcionamento técnico desta versão do CADÊ?. Ele não constitui parecer jurídico nem declaração
        de conformidade com leis específicas, como a Lei Geral de Proteção de Dados (LGPD). Uma análise jurídica é
        recomendada antes de qualquer uso comercial da ferramenta. Dúvidas podem ser encaminhadas ao responsável pela
        publicação desta versão.
      </p>
    </LegalLayout>
  );
}
