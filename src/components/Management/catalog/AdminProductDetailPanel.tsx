import React from 'react';
import {
  Size,
  type Category,
  type Collection,
  type Gender,
  type Product,
  type ProductStatus,
  type ProductVariant,
} from '@/app/types/types';
import { AdminImageGallery } from '@/components/Management/catalog/AdminImageGallery';
import { FramedImage } from '@/components/Management/catalog/FramedImage';
import { AdminSection } from '@/components/Management/catalog/AdminSection';
import { AdminStatusBadge } from '@/components/Management/catalog/AdminStatusBadge';
import {
  type CatalogColorOption,
  normalizeHex,
} from '@/components/Management/catalog/catalog-colors';
import {
  getPrimaryProductImageUrl,
  getPrimaryProductMedia,
} from '@/components/Management/catalog/catalog-image';
import { VariantColorMultiSelect } from '@/components/Management/catalog/VariantColorMultiSelect';
import { VariantSizeMultiSelect } from '@/components/Management/catalog/VariantSizeMultiSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pencil, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type ProductEditPatch = Partial<{
  name: string;
  description: string;
  price: number;
  slug: string | null;
  gender: Gender | null;
  category_id: number | null;
  collection_id: number | null;
}>;
type ProductTaxonomyPatch = Partial<{
  category_id: number | null;
  collection_id: number | null;
}>;

type AddVariantPayload = {
  sku?: string | null;
  color_name: string;
  color_hex: string;
  size: Size;
  inventory_qty: number;
  is_active: boolean;
  price_override?: number | null;
};

type AdminProductDetailPanelProps = {
  product: Product;
  categories: Category[];
  collections: Collection[];
  publishChecks: Array<{
    key: string;
    label: string;
    passed: boolean;
    current?: number;
    required_min?: number;
  }>;
  isPublishReady: boolean;
  maxProductImages: number;
  onSaveBasics: (patch: ProductEditPatch) => void;
  onSaveTaxonomy: (patch: ProductTaxonomyPatch) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onToggleSoldOut: () => void;
  onDeleteProduct: () => void;
  onAddVariants: (payloads: AddVariantPayload[]) => void;
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
  onReorderMedia: (mediaIds: number[]) => void | Promise<void>;
  onNavigateToTaxonomy: () => void;
};

export function AdminProductDetailPanel({
  product,
  categories,
  collections,
  publishChecks,
  isPublishReady,
  maxProductImages,
  onSaveBasics,
  onSaveTaxonomy,
  onSaveDraft,
  onPublish,
  onArchive,
  onToggleSoldOut,
  onDeleteProduct,
  onAddVariants,
  onUpdateVariant,
  onDeleteVariant,
  onUploadImage,
  onDeleteMedia,
  onSaveMediaFraming,
  onReorderMedia,
  onNavigateToTaxonomy,
}: AdminProductDetailPanelProps) {
  const [isProductSettingsOpen, setIsProductSettingsOpen] = React.useState(false);
  const [editName, setEditName] = React.useState(product.name);
  const [editDescription, setEditDescription] = React.useState(product.description ?? '');
  const [editPrice, setEditPrice] = React.useState(product.price.toString());
  const [editSlug, setEditSlug] = React.useState(product.slug ?? '');
  const [editGender, setEditGender] = React.useState<Gender>(
    (product.gender ?? 'UNISEX') as Gender
  );
  const [editCategoryId, setEditCategoryId] = React.useState<number | null>(
    product.category_id ?? product.category?.id ?? null
  );
  const [editCollectionId, setEditCollectionId] = React.useState<number | null>(
    product.collection_id ?? product.collection?.id ?? null
  );

  const [isAddVariantOpen, setIsAddVariantOpen] = React.useState(false);
  const [editingVariant, setEditingVariant] = React.useState<ProductVariant | null>(null);
  const [variantSku, setVariantSku] = React.useState('');
  const [variantColorName, setVariantColorName] = React.useState('Crna');
  const [variantColorHex, setVariantColorHex] = React.useState('#000000');
  const [addVariantColors, setAddVariantColors] = React.useState<CatalogColorOption[]>([
    { name: 'Crna', hex: '#000000' },
  ]);
  const [addVariantSizes, setAddVariantSizes] = React.useState<Size[]>([Size.M]);
  const [variantSize, setVariantSize] = React.useState<Size>(Size.M);
  const [variantInventory, setVariantInventory] = React.useState(0);
  const [variantIsActive, setVariantIsActive] = React.useState(true);
  const [variantPriceOverride, setVariantPriceOverride] = React.useState('');
  const selectedProductImageCount = product.media?.length ?? 0;
  const primaryMedia = getPrimaryProductMedia(product);
  const primaryImage = primaryMedia?.url ?? getPrimaryProductImageUrl(product);
  const sizeOptions = Object.values(Size);
  const genderOptions: Gender[] = ['WOMEN', 'MEN', 'UNISEX'];

  React.useEffect(() => {
    setIsProductSettingsOpen(false);
    setEditName(product.name);
    setEditDescription(product.description ?? '');
    setEditPrice(product.price.toString());
    setEditSlug(product.slug ?? '');
    setEditGender((product.gender ?? 'UNISEX') as Gender);
    setEditCategoryId(product.category_id ?? product.category?.id ?? null);
    setEditCollectionId(product.collection_id ?? product.collection?.id ?? null);
  }, [product]);

  const resetVariantForm = () => {
    setVariantSku('');
    setVariantColorName('Crna');
    setVariantColorHex('#000000');
    setVariantSize(Size.M);
    setAddVariantColors([{ name: 'Crna', hex: '#000000' }]);
    setAddVariantSizes([Size.M]);
    setVariantInventory(0);
    setVariantIsActive(true);
    setVariantPriceOverride('');
  };

  const submitBasics = () => {
    const parsedPrice = Number(editPrice);
    if (!editName.trim() || !editDescription.trim() || Number.isNaN(parsedPrice)) {
      toast.error('Naziv, opis i cijena su obavezni.');
      return;
    }
    onSaveBasics({
      name: editName.trim(),
      description: editDescription.trim(),
      price: parsedPrice,
      slug: editSlug.trim() || null,
      gender: editGender,
      category_id: editCategoryId,
      collection_id: editCollectionId,
    });
  };

  const submitVariant = () => {
    if (!addVariantColors.length) {
      toast.error('Odaberite barem jednu boju.');
      return;
    }
    if (!addVariantSizes.length) {
      toast.error('Odaberite barem jednu veličinu.');
      return;
    }

    const payloads: AddVariantPayload[] = [];
    for (const color of addVariantColors) {
      const colorName = color.name.trim();
      const colorHex = normalizeHex(color.hex);
      if (!colorName || !colorHex) {
        toast.error('Boja i HEX su obavezni.');
        return;
      }

      for (const size of addVariantSizes) {
        payloads.push({
          color_name: colorName,
          color_hex: colorHex,
          size,
          inventory_qty: Number.isFinite(variantInventory) ? variantInventory : 0,
          is_active: variantIsActive,
          price_override: variantPriceOverride.trim() ? Number(variantPriceOverride) : null,
        });
      }
    }

    if (!payloads.length) {
      toast.error('Nije moguće kreirati varijante bez boja i veličina.');
      return;
    }

    onAddVariants(payloads);
    resetVariantForm();
    setIsAddVariantOpen(false);
  };

  const startEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setVariantSku(variant.sku ?? '');
    setVariantColorName(variant.color_name);
    setVariantColorHex(variant.color_hex);
    setVariantSize(variant.size as Size);
    setVariantInventory(variant.inventory_qty);
    setVariantIsActive(variant.is_active);
    setVariantPriceOverride(
      variant.price_override != null && Number.isFinite(variant.price_override)
        ? String(variant.price_override)
        : ''
    );
  };

  const closeEditVariant = () => {
    setEditingVariant(null);
    resetVariantForm();
  };

  const submitEditedVariant = () => {
    if (!editingVariant) return;
    onUpdateVariant(editingVariant.id, {
      sku: variantSku.trim() || null,
      color_name: variantColorName.trim(),
      color_hex: normalizeHex(variantColorHex),
      size: variantSize,
      inventory_qty: Number.isFinite(variantInventory) ? variantInventory : 0,
      is_active: variantIsActive,
      price_override: variantPriceOverride.trim() ? Number(variantPriceOverride) : null,
    });
    closeEditVariant();
  };

  const statusInfo: Record<ProductStatus, string> = {
    DRAFT: 'Nacrt nije vidljiv kupcima.',
    ACTIVE: 'Aktivan proizvod je odmah vidljiv kupcima.',
    ARCHIVED: 'Arhiviran proizvod je skriven kupcima.',
  };
  const productStatus: ProductStatus = (product.status ?? 'DRAFT') as ProductStatus;

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
              <p className="text-xs text-muted-foreground">{statusInfo[productStatus]}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsProductSettingsOpen((prev) => !prev)}
                aria-expanded={isProductSettingsOpen}
                aria-label="Podešavanja proizvoda"
                title="Podešavanja proizvoda"
              >
                <Settings className="h-4 w-4" />
              </Button>
              {isProductSettingsOpen ? (
                <div className="grid w-full gap-2 rounded-md border bg-muted/30 p-2 sm:grid-cols-2">
                  <Button variant="outline" onClick={onSaveDraft}>
                    Sačuvaj nacrt
                  </Button>
                  {product.status === 'ACTIVE' ? (
                    <Button variant="outline" onClick={onArchive}>
                      Arhiviraj
                    </Button>
                  ) : null}
                  <Button variant="outline" onClick={onToggleSoldOut}>
                    {product.is_sold_out ? 'Ukloni oznaku rasprodato' : 'Označi kao rasprodato'}
                  </Button>
                  <Button variant="destructive" onClick={onDeleteProduct}>
                    Obriši
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminStatusBadge status={product.status} />
            {product.is_sold_out ? (
              <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                SOLD OUT
              </span>
            ) : null}
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
        title="Osnovne informacije"
        action={
          <Button variant="outline" onClick={submitBasics}>
            Sačuvaj izmjene
          </Button>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Naziv</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Opis</Label>
            <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Cijena (€)</Label>
            <Input
              type="number"
              step="0.01"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Slug (opciono)</Label>
            <Input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Pol</Label>
            <Select value={editGender} onValueChange={(value) => setEditGender(value as Gender)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((gender) => (
                  <SelectItem key={gender} value={gender}>
                    {gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </AdminSection>

      <AdminSection
        title="Kategorija i kolekcija"
        action={
          <Button variant="ghost" onClick={onNavigateToTaxonomy}>
            Upravljaj kategorijama i kolekcijama
          </Button>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Kategorija</Label>
            <Select
              value={editCategoryId != null ? String(editCategoryId) : 'none'}
              onValueChange={(value) => {
                const nextCategoryId = value === 'none' ? null : Number(value);
                setEditCategoryId(nextCategoryId);
                onSaveTaxonomy({ category_id: nextCategoryId });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">(nema)</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kolekcija</Label>
            <Select
              value={editCollectionId != null ? String(editCollectionId) : 'none'}
              onValueChange={(value) => {
                const nextCollectionId = value === 'none' ? null : Number(value);
                setEditCollectionId(nextCollectionId);
                onSaveTaxonomy({ collection_id: nextCollectionId });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">(nema)</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={String(collection.id)}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </AdminSection>

      <AdminSection title="Spremno za objavu">
        <div className="space-y-2 text-sm">
          {publishChecks.map((check) => (
            <div
              key={check.key}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <p>{check.label}</p>
              <p className={check.passed ? 'text-emerald-600' : 'text-rose-600'}>
                {check.passed ? 'Spremno' : 'Nedostaje'}
                {typeof check.current === 'number' && typeof check.required_min === 'number'
                  ? ` (${check.current}/${check.required_min})`
                  : ''}
              </p>
            </div>
          ))}
        </div>
      </AdminSection>

      <Separator />

      <AdminSection
        title="Varijante"
        action={
          <Button variant="outline" onClick={() => setIsAddVariantOpen(true)}>
            Dodaj varijantu
          </Button>
        }
      >
        {product.variants?.length ? (
          <div className="space-y-2">
            {product.variants.map((variant) => (
              <div
                key={variant.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full border"
                    style={{ backgroundColor: normalizeHex(variant.color_hex) }}
                    aria-hidden
                  />
                  <div>
                    <div className="font-medium">
                      {variant.color_name} • {variant.size}
                    </div>
                    <div className="text-muted-foreground">
                      Zaliha: {variant.inventory_qty} {variant.is_active ? '' : '• neaktivno'}
                      {variant.sku ? ` • SKU ${variant.sku}` : ''}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Opcije varijante ${variant.color_name} ${variant.size}`}
                      title="Opcije varijante"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => startEditVariant(variant)}>
                      <Pencil className="h-4 w-4" />
                      Uredi
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteVariant(variant.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Ukloni
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Još nema varijanti. Dodajte barem jednu veličinu/boju.
          </p>
        )}
      </AdminSection>

      <Dialog open={isAddVariantOpen} onOpenChange={setIsAddVariantOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova varijanta</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Boje</Label>
              <VariantColorMultiSelect value={addVariantColors} onChange={setAddVariantColors} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Veličine</Label>
                <VariantSizeMultiSelect
                  value={addVariantSizes}
                  onChange={setAddVariantSizes}
                  options={sizeOptions}
                />
              </div>
              <div className="space-y-2">
                <Label>Zaliha (opciono za preorder)</Label>
                <Input
                  type="number"
                  min={0}
                  value={variantInventory}
                  onChange={(e) => setVariantInventory(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Variantna cijena (opciono)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={variantPriceOverride}
                  onChange={(e) => setVariantPriceOverride(e.target.value)}
                  placeholder="npr. 24.99"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={variantIsActive ? 'active' : 'inactive'}
                  onValueChange={(value) => setVariantIsActive(value === 'active')}
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
            </div>
            <p className="text-xs text-muted-foreground">
              Kreirati {addVariantColors.length * addVariantSizes.length} varijanti (
              {addVariantColors.length} boja × {addVariantSizes.length} veličina).
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddVariantOpen(false)}>
                Otkaži
              </Button>
              <Button onClick={submitVariant}>Sačuvaj</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              <Label>SKU (opciono)</Label>
              <Input value={variantSku} onChange={(e) => setVariantSku(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Boja</Label>
              <VariantColorMultiSelect
                mode="single"
                value={[{ name: variantColorName, hex: variantColorHex }]}
                onChange={(nextColors) => {
                  const next = nextColors[0];
                  if (!next) return;
                  setVariantColorName(next.name);
                  setVariantColorHex(next.hex);
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Veličina</Label>
                <VariantSizeMultiSelect
                  mode="single"
                  value={[variantSize]}
                  onChange={(nextSizes) => {
                    const next = nextSizes[0];
                    if (next) setVariantSize(next);
                  }}
                  options={sizeOptions}
                />
              </div>
              <div className="space-y-2">
                <Label>Zaliha (opciono za preorder)</Label>
                <Input
                  type="number"
                  min={0}
                  value={variantInventory}
                  onChange={(e) => setVariantInventory(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Variantna cijena (opciono)</Label>
              <Input
                type="number"
                step="0.01"
                value={variantPriceOverride}
                onChange={(e) => setVariantPriceOverride(e.target.value)}
              />
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
          onReorder={onReorderMedia}
        />
      </AdminSection>

      <div className="rounded-lg border bg-muted/20 p-3">
        <Button
          className="w-full"
          size="lg"
          onClick={onPublish}
          disabled={!isPublishReady || product.status === 'ACTIVE'}
        >
          {product.status === 'ACTIVE' ? 'Proizvod je objavljen' : 'Objavi proizvod'}
        </Button>
      </div>
    </div>
  );
}
