import React from 'react';
import { Size, type Product, type ProductVariant } from '@/app/types/types';
import { AdminImageGallery } from '@/components/Management/catalog/AdminImageGallery';
import { FramedImage } from '@/components/Management/catalog/FramedImage';
import { AdminSection } from '@/components/Management/catalog/AdminSection';
import { AdminStatusBadge } from '@/components/Management/catalog/AdminStatusBadge';
import {
  getPrimaryProductImageUrl,
  getPrimaryProductMedia,
} from '@/components/Management/catalog/catalog-image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

type AddVariantPayload = {
  color_name: string;
  color_hex: string;
  size: Size;
  inventory_qty: number;
  is_active: boolean;
};

type AdminProductDetailPanelProps = {
  product: Product;
  maxProductImages: number;
  onSetDraft: () => void;
  onDeleteProduct: () => void;
  onAddVariant: (payload: AddVariantPayload) => void;
  onUpdateVariant: (
    variantId: number,
    patch: Partial<{
      color_name: string;
      color_hex: string;
      size: Size;
      inventory_qty: number;
      is_active: boolean;
      sku: string | null;
      price_override: number | null;
    }>
  ) => void;
  onDeleteVariant: (variantId: number) => void;
  onUploadImage: (files: FileList | null) => void;
  onDeleteMedia: (mediaId: number) => void;
  onSaveMediaFraming: (
    mediaId: number,
    patch: { focal_x: number; focal_y: number; zoom: number }
  ) => void;
};

export function AdminProductDetailPanel({
  product,
  maxProductImages,
  onSetDraft,
  onDeleteProduct,
  onAddVariant,
  onUpdateVariant,
  onDeleteVariant,
  onUploadImage,
  onDeleteMedia,
  onSaveMediaFraming,
}: AdminProductDetailPanelProps) {
  const [isAddVariantOpen, setIsAddVariantOpen] = React.useState(false);
  const [editingVariant, setEditingVariant] = React.useState<ProductVariant | null>(null);
  const [variantColorName, setVariantColorName] = React.useState('Black');
  const [variantColorHex, setVariantColorHex] = React.useState('#000000');
  const [variantSize, setVariantSize] = React.useState<Size>(Size.M);
  const [variantInventory, setVariantInventory] = React.useState(10);
  const [variantIsActive, setVariantIsActive] = React.useState(true);
  const selectedProductImageCount = product.media?.length ?? 0;
  const primaryMedia = getPrimaryProductMedia(product);
  const primaryImage = primaryMedia?.url ?? getPrimaryProductImageUrl(product);
  const sizeOptions = Object.values(Size);

  const submitVariant = () => {
    const colorName = variantColorName.trim();
    const colorHex = variantColorHex.trim();
    if (!colorName || !colorHex) return;

    onAddVariant({
      color_name: colorName,
      color_hex: colorHex,
      size: variantSize,
      inventory_qty: Number.isFinite(variantInventory) ? variantInventory : 0,
      is_active: true,
    });
    setIsAddVariantOpen(false);
  };

  const startEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setVariantColorName(variant.color_name);
    setVariantColorHex(variant.color_hex);
    setVariantSize(variant.size as Size);
    setVariantInventory(variant.inventory_qty);
    setVariantIsActive(variant.is_active);
  };

  const closeEditVariant = () => {
    setEditingVariant(null);
  };

  const submitEditedVariant = () => {
    if (!editingVariant) return;
    onUpdateVariant(editingVariant.id, {
      color_name: variantColorName.trim(),
      color_hex: variantColorHex.trim(),
      size: variantSize,
      inventory_qty: Number.isFinite(variantInventory) ? variantInventory : 0,
      is_active: variantIsActive,
    });
    closeEditVariant();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        {primaryImage ? (
          <FramedImage
            src={primaryImage}
            alt={product.name}
            framing={primaryMedia ?? undefined}
            containerClassName="h-48 w-full rounded-lg border"
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed bg-muted text-xs text-muted-foreground">
            N/A
          </div>
        )}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="text-muted-foreground">€{product.price.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onSetDraft}>
                Postavi nacrt
              </Button>
              <Button variant="destructive" onClick={onDeleteProduct}>
                Obriši
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminStatusBadge status={product.status} />
            <span className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
              {product.gender ?? 'UNISEX'}
            </span>
            {product.category?.name ? (
              <span className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
                {product.category.name}
              </span>
            ) : null}
            {product.collection?.name ? (
              <span className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
                {product.collection.name}
              </span>
            ) : null}
          </div>
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {product.description?.trim() || 'Nema opisa proizvoda.'}
          </p>
        </div>
      </div>

      <Separator />

      <AdminSection
        title="Varijante"
        action={
          <Dialog open={isAddVariantOpen} onOpenChange={setIsAddVariantOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Dodaj varijantu</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nova varijanta</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Naziv boje</Label>
                  <Input
                    value={variantColorName}
                    onChange={(e) => setVariantColorName(e.target.value)}
                    placeholder="Black"
                  />
                </div>
                <div className="space-y-2">
                  <Label>HEX boje</Label>
                  <Input
                    value={variantColorHex}
                    onChange={(e) => setVariantColorHex(e.target.value)}
                    placeholder="#000000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Veličina</Label>
                    <Select value={variantSize} onValueChange={(v) => setVariantSize(v as Size)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Zaliha</Label>
                    <Input
                      type="number"
                      min={0}
                      value={variantInventory}
                      onChange={(e) => setVariantInventory(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddVariantOpen(false)}>
                    Otkaži
                  </Button>
                  <Button onClick={submitVariant}>Sačuvaj</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      >
        {product.variants?.length ? (
          <div className="space-y-2">
            {product.variants.map((variant) => (
              <div
                key={variant.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div>
                  <div className="font-medium">
                    {variant.color_name} • {variant.size}
                  </div>
                  <div className="text-muted-foreground">
                    Zaliha: {variant.inventory_qty} {variant.is_active ? '' : '• neaktivno'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => startEditVariant(variant)}>
                    Uredi
                  </Button>
                  <Button variant="outline" onClick={() => onDeleteVariant(variant.id)}>
                    Ukloni
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Još nema varijanti. Dodajte barem jednu veličinu/boju.
          </p>
        )}
      </AdminSection>

      <Dialog
        open={Boolean(editingVariant)}
        onOpenChange={(open) => (!open ? closeEditVariant() : undefined)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Uredi varijantu</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Naziv boje</Label>
              <Input
                value={variantColorName}
                onChange={(e) => setVariantColorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>HEX boje</Label>
              <Input value={variantColorHex} onChange={(e) => setVariantColorHex(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Veličina</Label>
                <Select value={variantSize} onValueChange={(v) => setVariantSize(v as Size)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeOptions.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zaliha</Label>
                <Input
                  type="number"
                  min={0}
                  value={variantInventory}
                  onChange={(e) => setVariantInventory(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={variantIsActive ? 'active' : 'inactive'}
                onValueChange={(v) => setVariantIsActive(v === 'active')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktivna</SelectItem>
                  <SelectItem value="inactive">Neaktivna</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeEditVariant}>
                Otkaži
              </Button>
              <Button onClick={submitEditedVariant}>Sačuvaj izmjene</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Separator />

      <AdminSection
        title={`Slike (${selectedProductImageCount}/${maxProductImages})`}
        action={
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
            Otpremi / zamijeni
            <input
              type="file"
              accept="image/*"
              multiple
              aria-label="Otpremi slike postojećeg proizvoda"
              title="Otpremi slike"
              className="hidden"
              onChange={(e) => {
                onUploadImage(e.target.files);
                e.currentTarget.value = '';
              }}
            />
          </label>
        }
      >
        <AdminImageGallery
          title="Otvori original"
          media={product.media ?? []}
          productName={product.name}
          onRemove={onDeleteMedia}
          onSaveFraming={onSaveMediaFraming}
        />
      </AdminSection>
    </div>
  );
}
