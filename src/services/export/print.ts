/**
 * Abre a janela de impressão do navegador, onde o usuário pode escolher “Salvar como PDF”.
 * O título da página vira o nome sugerido do arquivo PDF na maioria dos navegadores.
 */
export function printWithTitle(fileTitle: string): void {
  const previousTitle = document.title;
  document.title = fileTitle;

  const restore = () => {
    document.title = previousTitle;
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);

  window.print();
  // Alguns navegadores móveis não disparam “afterprint”: restaura o título de qualquer forma.
  window.setTimeout(restore, 5_000);
}
