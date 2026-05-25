import type { ProductStatus } from '@/app/types/types';
import { Badge } from '@/components/ui/badge';

type AdminStatusBadgeProps = {
  status?: ProductStatus | null;
};

const statusVariantMap: Record<ProductStatus, 'default' | 'secondary' | 'outline'> = {
  ACTIVE: 'default',
  DRAFT: 'secondary',
  ARCHIVED: 'outline',
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  const resolvedStatus: ProductStatus = status ?? 'ACTIVE';
  return <Badge variant={statusVariantMap[resolvedStatus]}>{resolvedStatus}</Badge>;
}
