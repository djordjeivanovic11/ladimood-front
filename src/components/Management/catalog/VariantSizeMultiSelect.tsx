import { type Size } from '@/app/types/types';
import { cn } from '@/lib/utils';

type VariantSizeMultiSelectProps = {
  value: Size[];
  onChange: (next: Size[]) => void;
  options: Size[];
  mode?: 'multi' | 'single';
};

export function VariantSizeMultiSelect({
  value,
  onChange,
  options,
  mode = 'multi',
}: VariantSizeMultiSelectProps) {
  const toggleSize = (size: Size) => {
    if (mode === 'single') {
      onChange([size]);
      return;
    }

    if (value.includes(size)) {
      onChange(value.filter((entry) => entry !== size));
      return;
    }
    onChange([...value, size]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((size) => {
        const isSelected = value.includes(size);
        return (
          <button
            key={size}
            type="button"
            onClick={() => toggleSize(size)}
            className={cn(
              'min-h-10 rounded-full border px-3 py-2 text-sm font-semibold transition-all',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:bg-muted'
            )}
            aria-label={`Odaberi veličinu ${size}`}
            title={`Odaberi veličinu ${size}`}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
