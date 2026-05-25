import type { Product } from '@/app/types/types';
import { AdminEntityListItem } from '@/components/Management/catalog/AdminEntityListItem';
import { AdminStatusBadge } from '@/components/Management/catalog/AdminStatusBadge';
import { AdminThumbnail } from '@/components/Management/catalog/AdminThumbnail';
import { getPrimaryProductImageUrl } from '@/components/Management/catalog/catalog-image';

type AssociatedProductsListProps = {
  products: Product[];
  emptyLabel: string;
};

export function AssociatedProductsList({ products, emptyLabel }: AssociatedProductsListProps) {
  if (products.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <AdminEntityListItem
          key={product.id}
          selected={false}
          title={product.name}
          leading={
            <AdminThumbnail src={getPrimaryProductImageUrl(product)} alt={product.name} size="md" />
          }
          subtitle={
            <div className="flex items-center gap-2">
              <span>ID {product.id}</span>
              <AdminStatusBadge status={product.status} />
            </div>
          }
          trailing={<p className="font-medium">€{product.price.toFixed(2)}</p>}
        />
      ))}
    </div>
  );
}
