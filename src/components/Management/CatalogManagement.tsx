'use client';

import React, { useMemo, useState } from 'react';
import { Size } from '@/app/types/types';
import type { Category, Collection, Gender, Product, ProductStatus } from '@/app/types/types';
import {
  adminAddMedia,
  adminAddVariant,
  adminCreateProduct,
  adminDeleteMedia,
  adminDeleteProduct,
  adminDeleteVariant,
  adminListCategories,
  adminListCollections,
  adminListProducts,
  adminUpdateMedia,
  adminUpdateProduct,
  adminUpdateVariant,
} from '@/api/admin/catalog';
import { adminUploadStorageFile } from '@/api/admin/storage';
import { AdminEntityListItem } from '@/components/Management/catalog/AdminEntityListItem';
import { AdminProductDetailPanel } from '@/components/Management/catalog/AdminProductDetailPanel';
import { AdminStatusBadge } from '@/components/Management/catalog/AdminStatusBadge';
import { AdminThumbnail } from '@/components/Management/catalog/AdminThumbnail';
import {
  derivePublishChecks,
  getApiErrorMessage,
  parsePublishChecksFromError,
  type PublishCheck,
} from '@/components/Management/catalog/catalog-admin-utils';
import {
  getPrimaryProductImageUrl,
  getPrimaryProductMedia,
} from '@/components/Management/catalog/catalog-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
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
import { Plus, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

type ProductForm = {
  name: string;
  description: string;
  price: number;
  slug?: string | null;
  gender?: Gender | null;
  status?: ProductStatus | null;
  category_id?: number | null;
  collection_id?: number | null;
};

const genderOptions: Gender[] = ['WOMEN', 'MEN', 'UNISEX'];
const MAX_PRODUCT_IMAGES = 5;

type CatalogManagementProps = {
  onOpenTaxonomy?: () => void;
  focusedProductId?: number | null;
  onFocusedProductHandled?: () => void;
};

export default function CatalogManagement({
  onOpenTaxonomy,
  focusedProductId,
  onFocusedProductHandled,
}: CatalogManagementProps) {
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createPrice, setCreatePrice] = useState('0');
  const [createSlug, setCreateSlug] = useState('');
  const [createGender, setCreateGender] = useState<Gender>('UNISEX');
  const [publishChecksOverride, setPublishChecksOverride] = useState<PublishCheck[] | null>(null);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const publishChecks = useMemo(
    () => (selectedProduct ? (publishChecksOverride ?? derivePublishChecks(selectedProduct)) : []),
    [selectedProduct, publishChecksOverride]
  );
  const isPublishReady = publishChecks.every((check) => check.passed);

  const uploadImageToSupabase = async (
    file: File,
    target: { product_id?: number; collection_id?: number; category_id?: number }
  ) => {
    const upload = await adminUploadStorageFile(file, target);
    return upload.public_url;
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const [productsResult, collectionsResult, categories] = await Promise.all([
        adminListProducts(),
        adminListCollections(),
        adminListCategories(),
      ]);

      setProducts(productsResult);
      setCollections(collectionsResult);
      setCategoryOptions(categories);
      setPublishChecksOverride(null);

      if (!selectedProductId && productsResult.length) {
        setSelectedProductId(productsResult[0].id);
      } else if (
        selectedProductId &&
        !productsResult.some((product) => product.id === selectedProductId)
      ) {
        setSelectedProductId(productsResult[0]?.id ?? null);
      }
    } catch (e) {
      console.error(e);
      toast.error('Učitavanje kataloga nije uspjelo.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!focusedProductId) return;
    if (!products.some((product) => product.id === focusedProductId)) return;
    setSelectedProductId(focusedProductId);
    onFocusedProductHandled?.();
  }, [focusedProductId, products, onFocusedProductHandled]);

  React.useEffect(() => {
    setPublishChecksOverride(null);
  }, [selectedProductId]);

  const onCreateProduct = async () => {
    try {
      const parsedPrice = Number(createPrice);
      if (!createName.trim() || !createDescription.trim() || Number.isNaN(parsedPrice)) {
        toast.error('Naziv, opis i cijena su obavezni.');
        return;
      }

      const created = await adminCreateProduct({
        name: createName.trim(),
        description: createDescription.trim(),
        price: parsedPrice,
        slug: createSlug.trim() || null,
        gender: createGender,
        status: 'DRAFT',
        image_url: null,
      });
      toast.success('Novi nacrt je kreiran. Dovršite sekcije pa objavite proizvod.');
      setIsCreateProductOpen(false);
      setCreateName('');
      setCreateDescription('');
      setCreatePrice('0');
      setCreateSlug('');
      setCreateGender('UNISEX');
      await refresh();
      setSelectedProductId(created.id);
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Kreiranje proizvoda nije uspjelo.'));
    }
  };

  const onUpdateProduct = async (
    productId: number,
    patch: Partial<ProductForm>,
    successMessage: string
  ) => {
    try {
      const updated = await adminUpdateProduct(productId, patch);
      toast.success(successMessage);
      setPublishChecksOverride(null);
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updated } : p)));
      await refresh();
    } catch (e: unknown) {
      const checks = parsePublishChecksFromError(e);
      if (checks?.length) setPublishChecksOverride(checks);
      toast.error(getApiErrorMessage(e, 'Ažuriranje proizvoda nije uspjelo.'));
    }
  };

  const onDeleteProduct = async (productId: number) => {
    if (!confirm('Obrisati ovaj proizvod?')) return;
    try {
      await adminDeleteProduct(productId);
      toast.success('Proizvod je obrisan.');
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setSelectedProductId((prev) => {
        if (prev !== productId) return prev;
        const next = products.find((p) => p.id !== productId);
        return next?.id ?? null;
      });
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Brisanje proizvoda nije uspjelo.'));
    }
  };

  const onAddVariant = async (payload: {
    color_name: string;
    color_hex: string;
    size: Size;
    inventory_qty: number;
    is_active: boolean;
  }) => {
    if (!selectedProduct) return;
    try {
      await adminAddVariant(selectedProduct.id, payload);
      toast.success('Varijanta je dodata.');
      await refresh();
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Dodavanje varijante nije uspjelo.'));
    }
  };

  const onDeleteVariant = async (variantId: number) => {
    if (!selectedProduct) return;
    try {
      await adminDeleteVariant(selectedProduct.id, variantId);
      toast.success('Varijanta je obrisana.');
      await refresh();
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Brisanje varijante nije uspjelo.'));
    }
  };

  const onUpdateVariant = async (
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
  ) => {
    if (!selectedProduct) return;
    try {
      await adminUpdateVariant(selectedProduct.id, variantId, patch);
      toast.success('Varijanta je ažurirana.');
      await refresh();
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Ažuriranje varijante nije uspjelo.'));
    }
  };

  const onUploadImage = async (files: FileList | null) => {
    if (!selectedProduct) return;
    if (!files?.length) return;
    const currentCount = selectedProduct.media?.length ?? 0;
    if (currentCount >= MAX_PRODUCT_IMAGES) {
      toast.error(`Maksimalno ${MAX_PRODUCT_IMAGES} slika po proizvodu.`);
      return;
    }

    const allowedFiles = Array.from(files).slice(0, MAX_PRODUCT_IMAGES - currentCount);
    try {
      const currentSortOrder = Math.max(
        -1,
        ...(selectedProduct.media?.map((media) => media.sort_order ?? 0) ?? [])
      );
      for (const [index, file] of allowedFiles.entries()) {
        const publicUrl = await uploadImageToSupabase(file, { product_id: selectedProduct.id });
        await adminAddMedia(selectedProduct.id, {
          url: publicUrl,
          alt_text: selectedProduct.name,
          sort_order: currentSortOrder + index + 1,
        });
      }
      toast.success('Slika je otpremljena.');
      await refresh();
    } catch (e: unknown) {
      console.error(e);
      toast.error(getApiErrorMessage(e, 'Otpremanje slike nije uspjelo.'));
    }
  };

  const onDeleteMedia = async (mediaId: number) => {
    if (!selectedProduct) return;
    try {
      await adminDeleteMedia(selectedProduct.id, mediaId);
      toast.success('Slika je uklonjena.');
      await refresh();
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Uklanjanje slike nije uspjelo.'));
    }
  };

  const onSaveMediaFraming = async (
    mediaId: number,
    patch: { focal_x: number; focal_y: number; zoom: number }
  ) => {
    if (!selectedProduct) return;
    try {
      await adminUpdateMedia(selectedProduct.id, mediaId, patch);
      toast.success('Prikaz slike je sačuvan.');
      await refresh();
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Spremanje prikaza slike nije uspjelo.'));
    }
  };

  const onMoveMedia = async (mediaId: number, direction: 'left' | 'right') => {
    if (!selectedProduct?.media?.length) return;
    const orderedMedia = [...selectedProduct.media].sort(
      (left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0)
    );
    const currentIndex = orderedMedia.findIndex((media) => media.id === mediaId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedMedia.length) return;

    const currentMedia = orderedMedia[currentIndex];
    const targetMedia = orderedMedia[targetIndex];

    try {
      await Promise.all([
        adminUpdateMedia(selectedProduct.id, currentMedia.id, {
          sort_order: targetMedia.sort_order ?? targetIndex,
        }),
        adminUpdateMedia(selectedProduct.id, targetMedia.id, {
          sort_order: currentMedia.sort_order ?? currentIndex,
        }),
      ]);
      toast.success('Redoslijed slika je ažuriran.');
      await refresh();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Ažuriranje redoslijeda slika nije uspjelo.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Katalog</h2>
          <p className="text-muted-foreground">
            Kreirajte nacrt, uredite prikaz proizvoda i objavite tek kada je checklista kompletna.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => void refresh()}
            disabled={loading}
            aria-label="Osvježi"
            title="Osvježi"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Dialog open={isCreateProductOpen} onOpenChange={setIsCreateProductOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Dodaj proizvod"
                title="Dodaj proizvod"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Novi proizvod (nacrt)</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Naziv</Label>
                  <Input
                    value={createName}
                    onChange={(event) => setCreateName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Opis</Label>
                  <Input
                    value={createDescription}
                    onChange={(event) => setCreateDescription(event.target.value)}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Cijena (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={createPrice}
                      onChange={(event) => setCreatePrice(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pol</Label>
                    <Select
                      value={createGender}
                      onValueChange={(value) => setCreateGender(value as Gender)}
                    >
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
                <div className="space-y-2">
                  <Label>Slug (opciono)</Label>
                  <Input
                    value={createSlug}
                    onChange={(event) => setCreateSlug(event.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Otkaži
                    </Button>
                  </DialogClose>
                  <Button type="button" onClick={() => void onCreateProduct()}>
                    Kreiraj nacrt
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Proizvodi</CardTitle>
            <CardDescription>
              Draft proizvodi nisu vidljivi kupcima dok ih ne objavite.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">Još nema proizvoda.</p>
            ) : (
              <div className="max-h-[min(70vh,640px)] space-y-2 overflow-y-auto pr-1">
                {products.map((p) => (
                  <AdminEntityListItem
                    key={p.id}
                    selected={selectedProductId === p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    title={p.name}
                    leading={
                      <AdminThumbnail
                        src={getPrimaryProductImageUrl(p)}
                        framing={getPrimaryProductMedia(p)}
                        alt={p.name}
                        size="md"
                      />
                    }
                    subtitle={
                      <div className="flex items-center gap-2">
                        <AdminStatusBadge status={p.status} />
                        <span>{p.gender ?? 'UNISEX'}</span>
                      </div>
                    }
                    trailing={
                      <span className="text-sm font-medium text-muted-foreground">
                        €{p.price.toFixed(2)}
                      </span>
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detalji</CardTitle>
            <CardDescription>
              Uredite sve sekcije i pratite checklistu prije objave proizvoda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedProduct ? (
              <p className="text-sm text-muted-foreground">
                Odaberite proizvod za uređivanje osnovnih podataka, medija, varijanti i objave.
              </p>
            ) : (
              <AdminProductDetailPanel
                product={selectedProduct}
                categories={categoryOptions}
                collections={collections}
                publishChecks={publishChecks}
                isPublishReady={isPublishReady}
                maxProductImages={MAX_PRODUCT_IMAGES}
                onSaveBasics={(patch) =>
                  void onUpdateProduct(selectedProduct.id, patch, 'Osnovni podaci su sačuvani.')
                }
                onSaveTaxonomy={(patch) =>
                  void onUpdateProduct(
                    selectedProduct.id,
                    patch,
                    'Izbor kategorije/kolekcije je sačuvan.'
                  )
                }
                onSaveDraft={() =>
                  void onUpdateProduct(
                    selectedProduct.id,
                    { status: 'DRAFT' },
                    'Proizvod je sačuvan kao nacrt.'
                  )
                }
                onPublish={() =>
                  void onUpdateProduct(
                    selectedProduct.id,
                    { status: 'ACTIVE' },
                    'Proizvod je objavljen.'
                  )
                }
                onArchive={() =>
                  void onUpdateProduct(
                    selectedProduct.id,
                    { status: 'ARCHIVED' },
                    'Proizvod je arhiviran.'
                  )
                }
                onDeleteProduct={() => void onDeleteProduct(selectedProduct.id)}
                onAddVariant={(payload) => void onAddVariant(payload)}
                onUpdateVariant={(variantId, patch) => void onUpdateVariant(variantId, patch)}
                onDeleteVariant={(variantId) => void onDeleteVariant(variantId)}
                onUploadImage={(files) => {
                  void onUploadImage(files);
                }}
                onDeleteMedia={(mediaId) => void onDeleteMedia(mediaId)}
                onSaveMediaFraming={(mediaId, patch) => void onSaveMediaFraming(mediaId, patch)}
                onMoveMedia={(mediaId, direction) => void onMoveMedia(mediaId, direction)}
                onNavigateToTaxonomy={() => onOpenTaxonomy?.()}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
