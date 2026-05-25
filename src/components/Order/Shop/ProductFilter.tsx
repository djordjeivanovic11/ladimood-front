import React, { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import type { Category } from '@/app/types/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface ProductFilterProps {
  categories: Category[];
  selectedCategoryId: number | null;
  setSelectedCategoryId: (categoryId: number | null) => void;
  selectedPriceRange: [number, number];
  setSelectedPriceRange: (range: [number, number]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  selectedCategoryId,
  setSelectedCategoryId,
  selectedPriceRange,
  setSelectedPriceRange,
  sortBy,
  setSortBy,
}) => {
  const [open, setOpen] = useState(false);

  const maxPrice = useMemo(() => {
    // Keep the slider smooth even if backend has no products yet.
    return Math.max(50, selectedPriceRange[1], 500);
  }, [selectedPriceRange]);

  const FiltersPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Kategorija
        </h3>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
              selectedCategoryId === null ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
            }`}
          >
            Sve
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategoryId(c.id)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                selectedCategoryId === c.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Cijena
        </h3>
        <div className="space-y-3">
          <input
            aria-label="Maksimalna cijena"
            type="range"
            min={0}
            max={maxPrice}
            value={selectedPriceRange[1]}
            onChange={(e) => setSelectedPriceRange([0, Number(e.target.value)])}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>€0</span>
            <span>€{selectedPriceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Sortiranje
        </h3>
        <select
          title="Sortiraj po"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="relevance">Relevantnost</option>
          <option value="priceLowToHigh">Cijena: od niže ka višoj</option>
          <option value="priceHighToLow">Cijena: od više ka nižoj</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Mobile */}
      <div className="mb-4 flex items-center justify-between md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filteri
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px] sm:w-[360px]">
            <SheetHeader>
              <SheetTitle>Filteri</SheetTitle>
            </SheetHeader>
            <div className="mt-6">{FiltersPanel}</div>
            <div className="mt-6">
              <Button className="w-full" onClick={() => setOpen(false)}>
                Primijeni
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <aside className="hidden md:block rounded-lg border bg-card p-6">{FiltersPanel}</aside>
    </div>
  );
};

export default ProductFilter;
