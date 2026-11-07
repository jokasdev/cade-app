/** Tamanho máximo do nome do negócio. */
export const MAX_NAME_LENGTH = 80;

/**
 * Limpa um texto livre digitado pelo usuário: remove caracteres de controle e
 * sinais de marcação (< >), junta espaços repetidos e limita o tamanho.
 * O conteúdo é sempre exibido como texto pelo React — nunca como HTML.
 */
export function sanitizeText(value: string, maxLength: number): string {
  return value
    .replace(/[\u0000-\u001F\u007F-\u009F<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/** Converte um texto em um trecho seguro para nome de arquivo: "Doces da Ana" → "doces-da-ana". */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}
