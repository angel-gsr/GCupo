export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function includesNormalized(source: string, query: string): boolean {
  if (!query.trim()) {
    return true;
  }

  return normalizeText(source).includes(normalizeText(query));
}
