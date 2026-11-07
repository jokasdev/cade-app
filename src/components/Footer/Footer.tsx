import { ShieldCheck } from 'lucide-react';
import { ROUTES, href } from '../../routes';
import { Logo } from '../Logo/Logo';
import './Footer.css';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <Logo tone="light" />
          <p className="site-footer__tagline">Seu negócio vende. Mas quanto dinheiro realmente sobra?</p>
          <p className="site-footer__privacy">
            <ShieldCheck aria-hidden="true" />
            Seus dados financeiros são processados localmente neste navegador e não são enviados para um servidor pelo
            CADÊ? nesta versão.
          </p>
        </div>

        <nav className="site-footer__nav" aria-label="Rodapé">
          <div>
            <h2 className="site-footer__heading">Ferramenta</h2>
            <ul role="list">
              <li>
                <a href={href(ROUTES.diagnosis)}>Fazer diagnóstico</a>
              </li>
              <li>
                <a href={href(ROUTES.dashboard)}>Painel</a>
              </li>
              <li>
                <a href={href(ROUTES.simulator)}>Simulador</a>
              </li>
              <li>
                <a href={href(ROUTES.report)}>Relatório em PDF</a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="site-footer__heading">Projeto</h2>
            <ul role="list">
              <li>
                <a href={href(ROUTES.about)}>Sobre o projeto</a>
              </li>
              <li>
                <a href={href(ROUTES.privacy)}>Política de privacidade</a>
              </li>
              <li>
                <a href={href(ROUTES.terms)}>Termos de uso</a>
              </li>
              <li>
                <a href={href(ROUTES.data)}>Meus dados</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="container site-footer__bottom">
        <p className="site-footer__disclaimer">
          <strong>Aviso:</strong> os resultados do CADÊ? são estimativas calculadas a partir dos valores informados por você.
          Eles oferecem uma visão simplificada do negócio e não substituem a contabilidade, nem a orientação de um contador
          ou consultor.
        </p>
        <p className="site-footer__meta">CADÊ? · MVP versão 1.0 · Gratuito e sem cadastro</p>
      </div>
    </footer>
  );
}
