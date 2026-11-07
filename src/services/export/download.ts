/**
 * Gera um arquivo no próprio navegador e inicia o download.
 * Nenhum dado é enviado pela rede: o conteúdo vira um Blob local.
 */
export function downloadTextFile(fileName: string, content: string, mimeType = 'application/json'): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Dá tempo para o navegador iniciar o download antes de liberar a memória.
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
