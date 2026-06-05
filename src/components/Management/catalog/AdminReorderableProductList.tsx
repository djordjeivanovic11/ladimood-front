'use client';

import React from 'react';
import { GripVertical } from 'lucide-react';
import type { Product } from '@/app/types/types';
import { AdminEntityListItem } from '@/components/Management/catalog/AdminEntityListItem';
import { AdminStatusBadge } from '@/components/Management/catalog/AdminStatusBadge';
import { AdminThumbnail } from '@/components/Management/catalog/AdminThumbnail';
import {
  getPrimaryProductImageUrl,
  getPrimaryProductMedia,
} from '@/components/Management/catalog/catalog-image';
import { cn } from '@/lib/utils';
import { sortProductsByDisplayOrder } from '@/lib/product-order';

type AdminReorderableProductListProps = {
  products: Product[];
  selectedProductId: number | null;
  onSelectProduct: (productId: number) => void;
  onReorder: (productIds: number[]) => Promise<void>;
};

function reorderProducts(products: Product[], fromIndex: number, toIndex: number) {
  const next = [...products];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function AdminReorderableProductList({
  products,
  selectedProductId,
  onSelectProduct,
  onReorder,
}: AdminReorderableProductListProps) {
  const [orderedProducts, setOrderedProducts] = React.useState(() =>
    sortProductsByDisplayOrder(products)
  );
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dropIndex, setDropIndex] = React.useState<number | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setOrderedProducts(sortProductsByDisplayOrder(products));
  }, [products]);

  const persistOrder = async (nextProducts: Product[]) => {
    const previousProducts = orderedProducts;
    setOrderedProducts(nextProducts);
    setIsSaving(true);
    try {
      await onReorder(nextProducts.map((product) => product.id));
    } catch (error) {
      setOrderedProducts(previousProducts);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDrop = async (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDropIndex(null);
      return;
    }

    const nextProducts = reorderProducts(orderedProducts, draggedIndex, targetIndex);
    setDraggedIndex(null);
    setDropIndex(null);
    await persistOrder(nextProducts);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Prevucite proizvode da promijenite redoslijed u prodavnici.
        {isSaving ? ' Spremanje…' : null}
      </p>
      {orderedProducts.map((product, index) => {
        const isDragging = draggedIndex === index;
        const isDropTarget = dropIndex === index && draggedIndex !== index;

        return (
          <div
            key={product.id}
            draggable={!isSaving}
            onDragStart={() => setDraggedIndex(index)}
            onDragEnd={() => {
              setDraggedIndex(null);
              setDropIndex(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDropIndex(index);
            }}
            onDrop={(event) => {
              event.preventDefault();
              void handleDrop(index);
            }}
            className={cn(
              'rounded-lg transition-colors',
              isDragging && 'opacity-50',
              isDropTarget && 'ring-2 ring-primary/30'
            )}
          >
            <AdminEntityListItem
              selected={selectedProductId === product.id}
              onClick={() => onSelectProduct(product.id)}
              title={product.name}
              leading={
                <div className="flex items-center gap-2">
                  <span
                    className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
                    aria-label={`Promijeni redoslijed proizvoda ${product.name}`}
                    onClick={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <AdminThumbnail
                    src={getPrimaryProductImageUrl(product)}
                    framing={getPrimaryProductMedia(product)}
                    alt={product.name}
                    size="md"
                  />
                </div>
              }
              subtitle={
                <div className="flex items-center gap-2">
                  <AdminStatusBadge status={product.status} />
                  {product.is_sold_out ? (
                    <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                      SOLD OUT
                    </span>
                  ) : null}
                  <span>{product.gender ?? 'UNISEX'}</span>
                </div>
              }
              trailing={
                <span className="text-sm font-medium text-muted-foreground">
                  €{product.price.toFixed(2)}
                </span>
              }
            />
          </div>
        );
      })}
    </div>
  );
}
