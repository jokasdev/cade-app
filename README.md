# CADÊ? — Diagnóstico financeiro para pequenos negócios

> **Seu negócio vende. Mas quanto dinheiro realmente sobra?**

O CADÊ? é uma aplicação web (MVP) que ajuda MEIs, pequenos comerciantes, confeiteiras, lojas e prestadores de serviço a entender a situação financeira do negócio. O usuário informa faturamento, custos variáveis, despesas fixas e retirada; a plataforma calcula margem de contribuição, resultado operacional estimado, ponto de equilíbrio e meta de faturamento, aponta o que merece atenção, simula cenários e gera um relatório para salvar em PDF.

- **Sem backend, sem cadastro e sem custo:** todos os cálculos rodam no navegador.
- **Privacidade:** os dados ficam no `localStorage` do navegador do usuário; nada é enviado a servidores pelo CADÊ?.
- **Sem serviços pagos, APIs externas ou IA:** diagnósticos e sugestões vêm de regras fixas e auditáveis.

---

## Sumário

1. [Instalação e comandos](#1-instalação-e-comandos)
2. [Publicar gratuitamente](#2-publicar-gratuitamente)
3. [Funcionalidades implementadas](#3-funcionalidades-implementadas)
4. [Motor de cálculo financeiro](#4-motor-de-cálculo-financeiro)
5. [Estrutura de pastas](#5-estrutura-de-pastas)
6. [Persistência, privacidade e segurança](#6-persistência-privacidade-e-segurança)
7. [Acessibilidade e experiência](#7-acessibilidade-e-experiência)
8. [Testes e resultados](#8-testes-e-resultados)
9. [Decisões de produto](#9-decisões-de-produto)
10. [Limitações conhecidas](#10-limitações-conhecidas)

---

## 1. Instalação e comandos

**Requisito:** [Node.js](https://nodejs.org) 20.19+ ou 22.12+ (testado com Node 26 e npm 11).

```bash
npm install
```

```bash
npm run dev
```

Abre o servidor de desenvolvimento em `http://localhost:5173`.

```bash
npm run build
```

Verifica os tipos (TypeScript) e gera a versão de produção na pasta `dist/`.

```bash
npm run preview
```

Serve a versão de produção localmente em `http://localhost:4173` (com a política de segurança de conteúdo ativa).

```bash
npm test
```

Roda os testes automatizados (Vitest). Também existem `npm run test:watch` e `npm run typecheck`.

### Tecnologias

| Item | Versão |
| --- | --- |
| React | 19 |
| TypeScript | 7 |
| Vite | 8 |
| Recharts | 3 (gráficos interativos, carregados sob demanda) |
| Lucide React | 1.x (ícones) |
| Vitest | 5 (testes) |
| Inter (`@fontsource-variable/inter`) | fonte servida pelo próprio site, sem Google Fonts |

---

## 2. Publicar gratuitamente

O build é um site estático (`dist/`), com caminhos relativos e navegação por hash (`/#/painel`). Por isso funciona em qualquer hospedagem estática, inclusive em subpastas, **sem configurar redirecionamentos**.

### Netlify (mais simples, sem Git)

1. Rode `npm run build`.
2. Acesse **app.netlify.com/drop** e arraste a pasta `dist/`.
3. Pronto: o Netlify gera um endereço público gratuito.

### Vercel ou Cloudflare Pages (com GitHub)

1. Envie o projeto para um repositório no GitHub.
2. Importe o repositório na Vercel (vercel.com) ou no Cloudflare Pages (pages.cloudflare.com).
3. Configure: comando de build `npm run build`, pasta de saída `dist`. A Vercel detecta Vite automaticamente.

### GitHub Pages

1. Rode `npm run build`.
2. Publique o conteúdo de `dist/` na branch `gh-pages` (por exemplo, com `npx gh-pages -d dist`) ou use o GitHub Actions oficial de Pages.
3. Em *Settings → Pages*, selecione a branch `gh-pages`.

> Antes de publicar para o público, revise os textos da **Política de privacidade** e dos **Termos de uso** e inclua um canal de contato do responsável pela publicação. Os textos não constituem parecer jurídico.

---

## 3. Funcionalidades implementadas

### Página inicial (`/#/`)
- Hero com título, subtítulo, botões **Fazer meu diagnóstico** e **Como funciona?** (rola até a seção e move o foco).
- Prévia visual do painel e seção de demonstração montadas com o motor real sobre **valores fictícios**, sempre com o selo “Exemplo ilustrativo”.
- Três benefícios, “Como funciona” em 3 etapas, faixa de privacidade, perguntas frequentes (acordeão nativo) e chamada final.
- Recuperação de sessão: se houver diagnóstico salvo, aparece “Seu diagnóstico de … está salvo — Ver painel”; se houver formulário em andamento, “Continuar”.
- Sem depoimentos, avaliações ou números de usuários inventados.

### Formulário de diagnóstico (`/#/diagnostico`)
- 5 etapas com indicador de progresso clicável (etapas liberadas podem ser abertas) e versão compacta no celular.
  1. Informações gerais — nome (opcional), segmento (6 opções em cartões), mês e ano (sugere o último mês fechado).
  2. Faturamento — campo grande em reais.
  3. Custos variáveis — 6 campos, com dica de preenchimento em cada um e total ao vivo (R$ e % do faturamento).
  4. Despesas fixas — 7 campos, com total ao vivo.
  5. Retirada — explicação de por que ela fica separada e revisão de tudo, com atalhos “Editar”.
- Campo monetário com digitação livre (`8000`, `8.000`, `8.000,50`, `R$ 1.234,56`), formatação brasileira ao sair do campo e teclado numérico no celular.
- Validações: não aceita negativos; aceita zero (campo vazio = R$ 0,00); faturamento obrigatório e maior que zero; até 2 casas decimais; limite de R$ 999.999.999,99; mensagens claras por campo e resumo de erros por etapa; foco vai para o primeiro campo inválido.
- Avisos **não bloqueantes** quando custos passam do faturamento (resultados negativos são permitidos).
- Salvamento automático a cada alteração; resumo lateral com prévia do resultado (desktop); botão “Limpar formulário” com confirmação.

### Painel de resultados (`/#/painel`)
- Título “Veja o que está acontecendo com seu negócio.”, negócio, segmento e data.
- 6 indicadores: faturamento, custos variáveis, despesas fixas, margem de contribuição, **resultado operacional estimado (em destaque, com contagem animada e frase “de cada R$ 100 vendidos…”)** e resultado após retirada.
- **Para onde seu dinheiro está indo?** — “Distribuição dos custos” (barras ordenadas por categoria, coloridas por grupo, com % do faturamento e % dos custos) e “De cada R$ 100 vendidos” (barra segmentada; quando as saídas passam do faturamento, mostra a marca do faturamento e quanto falta), além de maior gasto e maior grupo.
- **Faturamento versus custos e despesas** — gráfico Recharts de barras empilhadas com tooltip e tabela alternativa.
- **Composição do resultado** — gráfico em cascata (faturamento → margem → resultado operacional → após retirada), com linha do zero para valores negativos.
- **O que merece sua atenção?** — regras determinísticas (veja a seção 4) com ícone + rótulo (nunca só cor).
- Ponto de equilíbrio com gráfico de “bala” (faturamento atual × equilíbrio × meta com retirada), margem de segurança e explicação quando não existe valor finito.
- Sugestões de organização escolhidas por regras (maior gasto, segmento, situação do resultado e boas práticas).
- Aviso de que os resultados são estimativas; alerta quando o formulário tem alterações ainda não geradas.

### Simulador (`/#/simulador`) — “Simule seu futuro.”
- **E se seu faturamento aumentar?** — 5%, 10%, 15%, 20% ou personalizado (até 500%, com decimais). Custos variáveis crescem na mesma proporção; despesas fixas constantes. Mostra novo faturamento, novos custos variáveis, novo resultado operacional e a diferença.
- **E se você reduzir seus custos?** — redução percentual dos custos variáveis (até 100%), despesas fixas constantes.
- **E se você economizar nas despesas fixas?** — valor em reais (campo + controle deslizante), limitado ao total das despesas fixas.
- **Cenário combinado** — junta as simulações configuradas.
- Cada simulação mostra as premissas usadas, frase-resumo, tabela atual × simulado × diferença (incluindo ponto de equilíbrio) e gráfico comparativo (Recharts). Aviso: “hipóteses, não previsões”. As simulações ficam salvas e entram no relatório.

### Relatório (`/#/relatorio`)
- Folha em formato A4 com: identificação (negócio, segmento, período, datas), resumo com destaques, demonstração simplificada do resultado, indicadores (inclui ponto de equilíbrio e meta com retirada), custos por categoria, diagnóstico, sugestões, cenários simulados (quando houver) e premissas/avisos com as fórmulas.
- Botão **Baixar meu relatório em PDF**: usa `window.print()` com CSS de impressão dedicado (sem menus, cores preservadas, quebras de página controladas) e sugere o nome do arquivo `CADE-relatorio-<negocio>-<ano>-<mes>`. Nenhum serviço externo é usado.

### Meus dados (`/#/meus-dados`)
- Mensagem: “Seus dados financeiros são processados localmente neste navegador e não são enviados para um servidor pelo CADÊ? nesta versão.”
- Situação do armazenamento (diagnóstico, rascunho, simulações, última alteração).
- **Exportar backup (.json)**, **Importar backup** (com validação e confirmação antes de substituir) e **Apagar todos os dados** (com confirmação e opção de exportar antes).
- Aviso para exportar backups regularmente.

### Páginas institucionais
- Política de privacidade e Termos de uso compatíveis com o funcionamento real (sem afirmar conformidade legal).
- Sobre o projeto, com as fórmulas usadas e as limitações.
- Página 404 amigável.

---

## 4. Motor de cálculo financeiro

Arquivos: `src/services/calculations/` (separado da interface, com testes).

| Indicador | Fórmula |
| --- | --- |
| Margem de contribuição (MC) | `F − CV` |
| MC % | `MC ÷ F × 100` |
| Resultado operacional estimado (RO) | `F − CV − DF` |
| RO % | `RO ÷ F × 100` |
| Resultado após retirada (RA) | `RO − R` |
| Ponto de equilíbrio (PE) | `DF ÷ (MC ÷ F)` — calculado como `DF × F ÷ MC` |
| Meta com retirada | `(DF + R) ÷ (MC ÷ F)` |
| Margem de segurança | `(F − PE) ÷ F × 100` |

- **Centavos inteiros:** todo valor monetário é um inteiro em centavos. Somas e diferenças são exatas; divisões usam `BigInt` (`mulDivRound`) com arredondamento para o centavo mais próximo, exato mesmo acima de 2⁵³.
- **Sem valor finito quando MC ≤ 0** (ou F = 0): o motor devolve `{ status: 'not-applicable', reason }` e a interface explica o motivo.
- **Validação também no motor:** `computeFinancials` recusa dados ausentes, negativos, não numéricos, com fração de centavo ou acima do limite (`FinancialInputError`).
- **Maior custo e maior grupo** identificados entre os 13 itens (empates seguem a ordem do formulário).
- **Simulações** (`simulations.ts`) usam pontos-base inteiros (12,5% = 1.250) e as mesmas funções de indicadores.
- **Diagnósticos** (`src/services/diagnostics/`): regras fixas como “custos variáveis ≥ faturamento”, “resultado operacional negativo”, “retirada maior que o resultado”, “resultado positivo”, ponto de equilíbrio/margem de segurança, maior gasto, ausência de custos e de retirada. Nenhuma classificação genérica de “saúde financeira”.
- O texto nunca chama o resultado operacional de lucro líquido e reforça que faturamento não é caixa.

---

## 5. Estrutura de pastas

```
.
├── index.html                 # HTML base (a CSP é injetada só no build)
├── vite.config.ts             # Vite + política de segurança de conteúdo
├── vitest.config.ts
├── tsconfig.json
├── public/favicon.svg
└── src/
    ├── main.tsx               # ponto de entrada (estilos globais + provedores)
    ├── App.tsx                # cabeçalho, rotas (hash), rodapé, carregamento sob demanda
    ├── routes.ts
    ├── components/            # peças reutilizáveis
    │   ├── Button/  Card/  Input/  Progress/  Tooltip/  Dialog/  Toast/
    │   ├── Header/  Footer/  Logo/  Notice/  EmptyState/  ErrorBoundary/
    │   ├── Charts/            # Recharts + gráficos em HTML (cascata, barras, R$ 100)
    │   ├── Kpi/  Insights/  CategoryIcon/
    ├── pages/
    │   ├── Landing/  Diagnosis/ (steps/)  Dashboard/  Simulator/  Report/
    │   ├── Data/ (Meus dados)  Legal/ (privacidade, termos, sobre)  NotFound/
    ├── services/
    │   ├── calculations/      # motor financeiro + simulações (+ testes)
    │   ├── diagnostics/       # regras de alerta e sugestões (+ testes)
    │   ├── validation/        # validação do formulário (+ testes)
    │   ├── storage/           # localStorage + esquema/validação dos dados (+ testes)
    │   └── export/            # backup JSON, download local, impressão (+ testes)
    ├── context/               # estado global com salvamento automático
    ├── hooks/                 # rota por hash, título, animações, movimento reduzido
    ├── types/                 # tipos do domínio e do app
    ├── utils/                 # formatação BRL, leitura de valores, categorias, glossário
    └── styles/                # tokens de design, base e impressão
```

---

## 6. Persistência, privacidade e segurança

- **Armazenamento:** `localStorage`, chave `cade:dados:v1`, com versão de esquema. Salva a cada alteração e sincroniza entre abas. IndexedDB não foi necessário (os dados têm poucos KB).
- **Dados corrompidos** não derrubam o app: o conteúdo ilegível é guardado à parte, o app recomeça e avisa o usuário.
- **Navegador sem armazenamento** (modo privado/bloqueio): o app funciona e exibe um aviso para exportar backup.
- **Importação de backup:** limite de 256 KB, extensão `.json`, identificação do arquivo (`app`/`kind`/`schemaVersion`), validação campo a campo por lista de campos permitidos (propriedades desconhecidas são descartadas), números em centavos inteiros e não negativos, textos limpos (sem caracteres de controle e sem `< >`). Proteção contra *prototype pollution*.
- **Sem execução de conteúdo do usuário:** não há `eval`, `new Function`, `innerHTML` nem `dangerouslySetInnerHTML`; todo texto é renderizado pelo React como texto.
- **CSP no build de produção:** `script-src 'self'`, `connect-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'none'` (os estilos inline são permitidos por causa dos gráficos SVG). Também `referrer: no-referrer`.
- **Nenhuma requisição a terceiros:** fontes e ícones fazem parte do build. Verificado no `npm run preview`: todos os recursos vêm do próprio domínio.
- **Sem logs de dados** e sem coleta de CPF, senhas, cartões, contas bancárias ou dados de clientes.

---

## 7. Acessibilidade e experiência

- Navegação completa por teclado, link “Pular para o conteúdo”, foco visível; a cada troca de página o foco vai para o conteúdo principal e, no formulário, para o título de cada etapa.
- Rótulos associados a todos os campos, erros ligados via `aria-describedby` e `aria-invalid`, mensagens anunciadas (`role="alert"`/`status`).
- Tooltips de conceitos (abrem com mouse, foco ou toque; fecham com Esc), caixas de confirmação com `<dialog>` nativo (foco preso, Esc).
- Paleta dos gráficos validada para daltonismo (separação ΔE ≥ 8 entre cores vizinhas); legendas sempre presentes, valores também em texto e tabelas alternativas; status sempre com ícone + rótulo.
- Contraste adequado (texto verde/vermelho em tons escuros sobre fundo claro), sinal de menos tipográfico (−) que não quebra linha.
- Respeita `prefers-reduced-motion`; animações discretas (entrada de cartões, crescimento de barras, contagem do resultado).
- Layout responsivo do celular (375 px) ao desktop, sem rolagem horizontal; campos com fonte de 16 px (sem zoom automático no iPhone).

---

## 8. Testes e resultados

```bash
npm test
```

Resultado da última execução: **9 arquivos, 120 testes, todos aprovados.**

| Arquivo | O que cobre |
| --- | --- |
| `calculations/financial.test.ts` (33) | Cenário de referência; faturamento zero; margem negativa; margem zero; custos iguais ao faturamento; resultado negativo; despesas fixas zero; decimais; valores enormes; dados incompletos e inválidos |
| `calculations/simulations.test.ts` (15) | Os três simuladores, arredondamento, limites e cenário combinado |
| `calculations/money.test.ts` (8) | Divisão exata com BigInt, arredondamento e auxiliares |
| `diagnostics/diagnostics.test.ts` (12) | Cada regra de alerta, ordem por gravidade, determinismo e sugestões |
| `validation/diagnosisForm.test.ts` (11) | Validação por etapa, conversão para centavos, dados incompletos, limpeza de texto |
| `storage/storage.test.ts` (11) | Recuperação de dados salvos, dados corrompidos, cota cheia, limpeza, esquema |
| `export/backup.test.ts` (11) | Exportação/importação e importações inválidas (JSON quebrado, outro app, versão, negativos, tamanho, extensão, protótipo) |
| `utils/parse.test.ts` (11) e `utils/format.test.ts` (8) | Leitura de valores digitados e formatação brasileira |

**Cenário de referência** (F = R$ 8.000 · CV = R$ 3.000 · DF = R$ 2.000 · R = R$ 1.000):

| Indicador | Esperado | Obtido |
| --- | --- | --- |
| Margem de contribuição | R$ 5.000,00 | R$ 5.000,00 ✅ |
| % da margem de contribuição | 62,5% | 62,5% ✅ |
| Resultado operacional estimado | R$ 3.000,00 | R$ 3.000,00 ✅ |
| Resultado após retirada | R$ 2.000,00 | R$ 2.000,00 ✅ |
| Ponto de equilíbrio operacional | R$ 3.200,00 | R$ 3.200,00 ✅ |
| Meta de faturamento com retirada | R$ 4.800,00 | R$ 4.800,00 ✅ |

**Verificações manuais no navegador:** fluxo completo do formulário com o cenário de referência; validação de campos; painel, gráficos e textos com valores corretos; cenário com margem negativa; três simuladores e combinado; relatório com os cenários; PDF gerado pelo motor de impressão do Edge (4 páginas A4, sem menus); importação válida/inválida de backup; apagar dados; recuperação após recarregar a página; layout em 375 px sem rolagem horizontal; build de produção sem erros de console nem violações da CSP.

---

## 9. Decisões de produto

- **Faturamento precisa ser maior que zero no formulário:** sem vendas não há margem nem ponto de equilíbrio. O motor, porém, trata faturamento zero sem erro (testado).
- **DAS do MEI** é orientado como despesa fixa (valor mensal fixo), enquanto impostos proporcionais às vendas ficam em custos variáveis.
- **Simuladores começam vazios:** só aparecem no relatório as simulações que o usuário configurou de fato.
- **Navegação por hash** (`/#/painel`): publica em qualquer hospedagem estática sem regras de redirecionamento.
- **Gráficos:** Recharts nos gráficos interativos (faturamento × custos e comparação de cenários, carregados sob demanda); cascata e barras em HTML/CSS, que ficam legíveis no celular e saem bem na impressão.
- **Pausa de 0,45 s ao gerar o diagnóstico** apenas como retorno visual; o cálculo é instantâneo.

---

## 10. Limitações conhecidas

- Visão **mensal e simplificada**: não considera estoque, prazos de pagamento/recebimento, parcelas de empréstimos, investimentos, depreciação ou regime tributário.
- Guarda **um diagnóstico por vez** (o mais recente). Para comparar meses, use os PDFs ou backups. Não há histórico nem gráfico de evolução.
- Dados ficam **apenas no navegador e no aparelho em uso**; não há conta, sincronização ou recuperação se o usuário limpar os dados sem backup.
- O PDF depende da função de impressão do navegador; a aparência pode variar um pouco entre navegadores, e no celular o caminho é “Imprimir → Salvar como PDF”.
- Sugestões são orientações gerais por regras fixas; não há inteligência artificial.
- Política de privacidade e termos descrevem o funcionamento técnico, mas **não substituem revisão jurídica** (inclusive LGPD) antes de uso comercial.
- Testes automatizados cobrem motor, regras, validação, armazenamento e backup; a interface foi verificada manualmente (não há testes automatizados de interface).
