export type CatalogColorOption = {
  name: string;
  hex: string;
};

export const PRESET_COLORS: CatalogColorOption[] = [
  { name: 'Crna', hex: '#000000' },
  { name: 'Bijela', hex: '#ffffff' },
  { name: 'Crvena', hex: '#ff0000' },
  { name: 'Zelena', hex: '#00ff00' },
  { name: 'Plava', hex: '#0000ff' },
  { name: 'Žuta', hex: '#ffff00' },
  { name: 'Narandžasta', hex: '#ffa500' },
  { name: 'Ljubičasta', hex: '#800080' },
  { name: 'Siva', hex: '#808080' },
  { name: 'Braon', hex: '#a52a2a' },
  { name: 'Roze', hex: '#ffc0cb' },
  { name: 'Bež', hex: '#f5f5dc' },
];

const COLOR_NAME_FROM_HEX: Record<string, string> = PRESET_COLORS.reduce<Record<string, string>>(
  (acc, color) => {
    acc[color.hex] = color.name;
    return acc;
  },
  {}
);

export function normalizeHex(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return '';

  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  if (withHash.length === 4) {
    return `#${withHash[1]}${withHash[1]}${withHash[2]}${withHash[2]}${withHash[3]}${withHash[3]}`;
  }
  return withHash;
}

export function isValidHexColor(value: string): boolean {
  const normalized = normalizeHex(value);
  if (!normalized.startsWith('#')) return false;
  const body = normalized.slice(1);
  return body.length === 6 && /^[0-9a-f]{6}$/i.test(body);
}

export function colorNameFromHex(colorHex: string): string | null {
  const normalized = normalizeHex(colorHex);
  return COLOR_NAME_FROM_HEX[normalized] ?? null;
}
