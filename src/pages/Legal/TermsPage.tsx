import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ROUTES, href } from '../../routes';
import { LegalLayout } from './LegalLayout';

export default function TermsPage() {
  useDocumentTitle('Termos de uso');
  return (
    <LegalLayout
      eyebrow="Termos"
      title="Termos de uso"
      updated="novembro de 2026 (versão MVP 1.0)"
      intro={<p>Ao usar o CADÊ?, você concorda com as condições abaixo. Elas foram escritas para serem diretas e claras.</p>}
    >
      <h2>1. O que é o CADÊ?</h2>
      <p>
        O CADÊ? é uma ferramenta gratuita que ajuda pequenos negócios a organizar e entender seus números mensais. Ela
        calcula indicadores simplificados — como margem de contribuição, resultado operacional estimado e ponto de equilíbrio
        — a partir dos valores que você informa.
      </p>

      <h2>2. Os resultados são estimativas</h2>
      <p>
        Os resultados dependem dos valores digitados e de um modelo simplificado. Eles não são demonstrações contábeis
        oficiais, não equivalem ao lucro líquido contábil e não representam o saldo em caixa. O CADÊ? não substitui a
        contabilidade, nem a orientação de contadores, consultores ou outros profissionais.
      </p>

      <h2>3. Simulações são hipóteses</h2>
      <p>
        O simulador mostra o que aconteceria se determinadas premissas se confirmassem. As simulações não são previsões e não
        garantem nenhum resultado futuro.
      </p>

      <h2>4. Não é emissor fiscal</h2>
      <p>
        O CADÊ? não emite notas fiscais, guias de impostos ou qualquer documento fiscal, e não calcula tributos devidos. O
        relatório gerado serve apenas para acompanhamento interno.
      </p>

      <h2>5. Suas responsabilidades</h2>
      <ul>
        <li>Informar valores corretos e referentes ao mesmo período.</li>
        <li>Guardar backups dos seus dados, já que eles ficam apenas no seu navegador.</li>
        <li>Avaliar as sugestões com cuidado antes de tomar decisões sobre o seu negócio.</li>
      </ul>

      <h2>6. Dados e privacidade</h2>
      <p>
        Nesta versão, os dados são processados e armazenados localmente no seu navegador. Veja os detalhes na{' '}
        <a className="link" href={href(ROUTES.privacy)}>
          Política de privacidade
        </a>
        .
      </p>

      <h2>7. Disponibilidade e garantias</h2>
      <p>
        O CADÊ? é oferecido “como está”, em versão MVP (produto mínimo viável), sem garantia de disponibilidade contínua, de
        ausência de erros ou de adequação a uma finalidade específica. Funcionalidades podem mudar em versões futuras.
      </p>

      <h2>8. Limitação de responsabilidade</h2>
      <p>
        As decisões tomadas a partir das informações do CADÊ? são de responsabilidade de quem as toma. Na medida permitida
        pela lei, os responsáveis pela ferramenta não respondem por perdas decorrentes do uso das estimativas, de valores
        informados incorretamente ou da perda de dados salvos no navegador.
      </p>

      <h2>9. Aviso</h2>
      <p>
        Estes termos descrevem as condições de uso desta versão e não substituem uma revisão jurídica. Recomenda-se essa
        revisão antes de qualquer uso comercial da ferramenta.
      </p>
    </LegalLayout>
  );
}
