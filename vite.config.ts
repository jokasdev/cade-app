import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Política de segurança de conteúdo (CSP) aplicada somente no build de produção.
 * Em desenvolvimento o Vite injeta scripts inline (HMR), por isso a CSP não é usada no `npm run dev`.
 *
 * - script-src 'self': nenhum script externo ou inline é executado.
 * - connect-src 'self': o app não envia dados para outros domínios.
 * - style-src 'unsafe-inline': necessário para estilos inline gerados pelos gráficos (SVG).
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function contentSecurityPolicy(): Plugin {
  return {
    name: 'cade-content-security-policy',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<!-- CSP -->',
        `<meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`,
      );
    },
  };
}

export default defineConfig({
  // Caminhos relativos: o build funciona em qualquer hospedagem estática, inclusive em subpastas.
  base: './',
  plugins: [react(), contentSecurityPolicy()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
});
