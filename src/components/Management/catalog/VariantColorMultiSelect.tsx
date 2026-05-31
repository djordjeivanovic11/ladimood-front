import React from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  PRESET_COLORS,
  colorNameFromHex,
  isValidHexColor,
  normalizeHex,
  type CatalogColorOption,
} from '@/components/Management/catalog/catalog-colors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type VariantColorMultiSelectProps = {
  value: CatalogColorOption[];
  onChange: (next: CatalogColorOption[]) => void;
  mode?: 'multi' | 'single';
};

function ensureColorName(hex: string, fallbackName?: string): string {
  if (fallbackName?.trim()) return fallbackName.trim();
  return colorNameFromHex(hex) ?? 'Nova boja';
}

export function VariantColorMultiSelect({
  value,
  onChange,
  mode = 'multi',
}: VariantColorMultiSelectProps) {
  const [showCustom, setShowCustom] = React.useState(mode === 'single');
  const [customHex, setCustomHex] = React.useState('#000000');
  const [customName, setCustomName] = React.useState('Crna');

  React.useEffect(() => {
    if (mode !== 'single') return;
    const selected = value[0];
    if (!selected) return;
    setCustomHex(normalizeHex(selected.hex));
    setCustomName(selected.name);
  }, [mode, value]);

  const updateSingleColor = (next: CatalogColorOption) => {
    onChange([
      { name: next.name.trim() || ensureColorName(next.hex), hex: normalizeHex(next.hex) },
    ]);
  };

  const togglePreset = (preset: CatalogColorOption) => {
    const presetHex = normalizeHex(preset.hex);
    if (mode === 'single') {
      updateSingleColor({ name: preset.name, hex: presetHex });
      return;
    }

    const existing = value.find((entry) => normalizeHex(entry.hex) === presetHex);
    if (existing) {
      onChange(value.filter((entry) => normalizeHex(entry.hex) !== presetHex));
      return;
    }
    onChange([...value, { name: preset.name, hex: presetHex }]);
  };

  const addCustomColor = () => {
    const normalizedHex = normalizeHex(customHex);
    if (!isValidHexColor(normalizedHex)) return;

    const nextColor: CatalogColorOption = {
      hex: normalizedHex,
      name: ensureColorName(normalizedHex, customName),
    };

    if (mode === 'single') {
      updateSingleColor(nextColor);
      return;
    }

    const existingIdx = value.findIndex((entry) => normalizeHex(entry.hex) === normalizedHex);
    if (existingIdx >= 0) {
      const next = [...value];
      next[existingIdx] = nextColor;
      onChange(next);
      return;
    }
    onChange([...value, nextColor]);
  };

  const removeColor = (hex: string) => {
    const normalizedHex = normalizeHex(hex);
    onChange(value.filter((entry) => normalizeHex(entry.hex) !== normalizedHex));
  };

  const selectedSingle = value[0];
  const customHexValid = isValidHexColor(customHex);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((preset) => {
          const presetHex = normalizeHex(preset.hex);
          const selected = value.some((entry) => normalizeHex(entry.hex) === presetHex);
          return (
            <button
              key={presetHex}
              type="button"
              onClick={() => togglePreset(preset)}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-transform hover:scale-105',
                selected ? 'border-primary ring-2 ring-primary/40' : 'border-border'
              )}
              style={{ backgroundColor: presetHex }}
              title={preset.name}
              aria-label={`Odaberi boju ${preset.name}`}
            />
          );
        })}
      </div>

      {mode === 'multi' && value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((color) => (
            <div
              key={normalizeHex(color.hex)}
              className="inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs"
            >
              <span
                className="h-3.5 w-3.5 rounded-full border"
                style={{ backgroundColor: normalizeHex(color.hex) }}
                aria-hidden
              />
              <span>{color.name}</span>
              <button
                type="button"
                onClick={() => removeColor(color.hex)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Ukloni boju ${color.name}`}
                title={`Ukloni boju ${color.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {mode === 'single' && selectedSingle ? (
        <div className="space-y-2 rounded-md border p-3">
          <div className="flex items-center gap-3">
            <span
              className="h-6 w-6 rounded-full border"
              style={{ backgroundColor: normalizeHex(selectedSingle.hex) }}
              aria-hidden
            />
            <Input
              value={selectedSingle.name}
              onChange={(event) =>
                updateSingleColor({ ...selectedSingle, name: event.target.value || 'Nova boja' })
              }
              placeholder="Naziv boje"
            />
          </div>
          <Input
            value={selectedSingle.hex}
            onChange={(event) => updateSingleColor({ ...selectedSingle, hex: event.target.value })}
            placeholder="#000000"
          />
        </div>
      ) : null}

      <div className="space-y-2">
        {mode === 'multi' ? (
          <Button type="button" variant="outline" onClick={() => setShowCustom((prev) => !prev)}>
            {showCustom ? 'Sakrij prilagođenu boju' : 'Dodaj prilagođenu boju'}
          </Button>
        ) : null}

        {(showCustom || mode === 'single') && (
          <div className="space-y-2 rounded-md border p-3">
            <HexColorPicker
              color={customHexValid ? normalizeHex(customHex) : '#000000'}
              onChange={(nextColor) => {
                setCustomHex(nextColor);
                if (!customName.trim()) {
                  setCustomName(colorNameFromHex(nextColor) ?? '');
                }
              }}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                placeholder="Naziv boje"
              />
              <Input
                value={customHex}
                onChange={(event) => setCustomHex(event.target.value)}
                placeholder="#000000"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {customHexValid ? 'HEX je validan' : 'Unesite validan HEX (npr. #aabbcc)'}
              </p>
              <Button type="button" onClick={addCustomColor} disabled={!customHexValid}>
                {mode === 'single' ? 'Postavi boju' : 'Dodaj boju'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
