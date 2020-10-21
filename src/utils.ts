export const normalizeString = (s?: string): string | undefined =>
  s
    ?.toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
