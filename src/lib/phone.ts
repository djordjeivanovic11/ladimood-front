/** E.164-style phone: digits only with a leading "+". */
export function normalizePhoneNumber(phone?: string | null): string {
  const trimmed = phone?.trim();
  if (!trimmed) return '';

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  return `+${digits}`;
}

/** Display phone with "+" prefix (does not add spacing). */
export function formatPhoneNumber(phone?: string | null): string {
  const normalized = normalizePhoneNumber(phone);
  return normalized || '';
}
