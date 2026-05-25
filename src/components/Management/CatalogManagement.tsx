'use client';

import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Resolver, useForm } from 'react-hook-form';
import { Size } from '@/app/types/types';
import type { Category, Collection, Gender, Product, ProductStatus } from '@/app/types/types';
import {
  adminAddMedia,
  adminAddVariant,
  adminCreateCategory,
  adminCreateCollection,
  adminCreateStorageUploadUrl,
  adminCreateProduct,
  adminDeleteMedia,
  adminDeleteProduct,
  adminDeleteVariant,
  adminListCategories,
  adminListCollections,
  adminListProducts,
  adminUpdateCategory,
  adminUpdateCollection,
  adminUpdateProduct,
} from '@/api/admin/catalog';
import { getCategories } from '@/api/account/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.preprocess((v) => Number(v), z.number().min(0)),
  slug: z.string().optional().nullable(),
  gender: z.enum(['WOMEN', 'MEN', 'UNISEX']).optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional().nullable(),
  category_id: z
    .preprocess(
      (v) => (v === '' || v === 'none' || v === null || v === undefined ? null : Number(v)),
      z.number().nullable()
    )
    .optional()
    .nullable(),
  collection_id: z
    .preprocess(
      (v) => (v === '' || v === 'none' || v === null || v === undefined ? null : Number(v)),
      z.number().nullable()
    )
    .optional()
    .nullable(),
});

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

type CreateCollectionForm = {
  name: string;
  slug: string;
  description: string;
};

const genderOptions: Gender[] = ['WOMEN', 'MEN', 'UNISEX'];
const statusOptions: ProductStatus[] = ['ACTIVE', 'DRAFT', 'ARCHIVED'];
const MAX_PRODUCT_IMAGES = 5;

function getApiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === 'object' && 'detail' in data) {
      const detail = (data as { detail?: unknown }).detail;
      if (typeof detail === 'string' && detail.trim()) return detail;
    }
    const msg = err.message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

export default function CatalogManagement() {
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [newProductImages, setNewProductImages] = useState<File[]>([]);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);

  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);

  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [collectionForm, setCollectionForm] = useState<CreateCollectionForm>({
    name: '',
    slug: '',
    description: '',
  });
  const [newCollectionHeroImage, setNewCollectionHeroImage] = useState<File | null>(null);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const selectedProductImageCount = selectedProduct?.media?.length ?? 0;
  const newProductImagePreviewUrls = useMemo(
    () => newProductImages.map((file) => URL.createObjectURL(file)),
    [newProductImages]
  );
  React.useEffect(
    () => () => {
      newProductImagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    },
    [newProductImagePreviewUrls]
  );

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductForm>,
    defaultValues: {
      status: 'ACTIVE',
      gender: 'UNISEX',
    },
  });

  const uploadImageToSupabase = async (
    file: File,
    target: { product_id?: number; collection_id?: number; category_id?: number }
  ) => {
    const upload = await adminCreateStorageUploadUrl({
      filename: file.name,
      ...target,
    });
    const uploadRes = await fetch(upload.signed_upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!uploadRes.ok) {
      throw new Error('Supabase upload failed');
    }
    return upload.public_url;
  };

  const loadCategoryOptions = async (): Promise<Category[]> => {
    try {
      return await adminListCategories();
    } catch (adminError) {
      console.warn('Admin categories endpoint failed, falling back to catalog API.', adminError);
      try {
        return await getCategories();
      } catch (catalogError) {
        console.error(catalogError);
        return [];
      }
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const [productsResult, collectionsResult, categories] = await Promise.all([
        adminListProducts(),
        adminListCollections(),
        loadCategoryOptions(),
      ]);

      setProducts(productsResult);
      setCollections(collectionsResult);
      setCategoryOptions(categories);

      if (!selectedProductId && productsResult.length) {
        setSelectedProductId(productsResult[0].id);
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

  const onCreateProduct = async (data: ProductForm) => {
    try {
      const created = await adminCreateProduct({
        ...data,
        image_url: null,
      });

      const filesToUpload = newProductImages.slice(0, MAX_PRODUCT_IMAGES);
      for (const [index, file] of filesToUpload.entries()) {
        const publicUrl = await uploadImageToSupabase(file, { product_id: created.id });
        await adminAddMedia(created.id, {
          url: publicUrl,
          alt_text: created.name,
          sort_order: index,
        });
      }

      toast.success('Proizvod je kreiran.');
      setIsCreateProductOpen(false);
      setNewProductImages([]);
      form.reset();
      await refresh();
      setSelectedProductId(created.id);
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Kreiranje proizvoda nije uspjelo.'));
    }
  };

  const onUpdateProduct = async (productId: number, patch: Partial<ProductForm>) => {
    try {
      const updated = await adminUpdateProduct(productId, patch);
      toast.success('Proizvod je ažuriran.');
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updated } : p)));
    } catch (e: unknown) {
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

  const onAddVariant = async () => {
    if (!selectedProduct) return;
    try {
      await adminAddVariant(selectedProduct.id, {
        color_name: 'Black',
        color_hex: '#000000',
        size: Size.M,
        inventory_qty: 10,
        is_active: true,
      });
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
      for (const [index, file] of allowedFiles.entries()) {
        const publicUrl = await uploadImageToSupabase(file, { product_id: selectedProduct.id });
        await adminAddMedia(selectedProduct.id, {
          url: publicUrl,
          alt_text: selectedProduct.name,
          sort_order: (selectedProduct.media?.length ?? 0) + index,
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

  const handleChooseNewProductImages = (files: FileList | null) => {
    if (!files?.length) return;
    const picked = Array.from(files);
    setNewProductImages((prev) => {
      const merged = [...prev, ...picked];
      if (merged.length > MAX_PRODUCT_IMAGES) {
        toast.warning(`Dozvoljeno je maksimalno ${MAX_PRODUCT_IMAGES} slika.`);
      }
      return merged.slice(0, MAX_PRODUCT_IMAGES);
    });
  };

  const removePendingImage = (idx: number) => {
    setNewProductImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) {
      toast.error('Naziv kategorije je obavezan.');
      return;
    }

    try {
      const created = await adminCreateCategory({
        name,
        description: newCategoryDescription.trim() || null,
      });
      let finalCategory = created;
      if (newCategoryImage) {
        const imageUrl = await uploadImageToSupabase(newCategoryImage, { category_id: created.id });
        finalCategory = await adminUpdateCategory(created.id, { image_url: imageUrl });
      }
      setCategoryOptions((prev) =>
        [...prev, finalCategory].sort((a, b) => a.name.localeCompare(b.name))
      );
      form.setValue('category_id', finalCategory.id);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setNewCategoryImage(null);
      setIsCreateCategoryOpen(false);
      toast.success('Kategorija je kreirana.');
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Kreiranje kategorije nije uspjelo.'));
    }
  };

  const onCreateCollection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = collectionForm.name.trim();
    const slug = collectionForm.slug.trim();
    if (!name || !slug) {
      toast.error('Naziv i slug kolekcije su obavezni.');
      return;
    }
    try {
      let created = await adminCreateCollection({
        name,
        slug,
        description: collectionForm.description.trim() || null,
      });
      if (newCollectionHeroImage) {
        const heroUrl = await uploadImageToSupabase(newCollectionHeroImage, {
          collection_id: created.id,
        });
        created = await adminUpdateCollection(created.id, { hero_image_url: heroUrl });
      }
      setCollections((prev) => [created, ...prev]);
      form.setValue('collection_id', created.id);
      setCollectionForm({ name: '', slug: '', description: '' });
      setNewCollectionHeroImage(null);
      setIsCreateCollectionOpen(false);
      toast.success('Kolekcija je kreirana.');
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Kreiranje kolekcije nije uspjelo.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Katalog</h2>
          <p className="text-muted-foreground">
            Proizvodi, varijante (veličine/boje), zalihe, slike, kolekcije.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void refresh()} disabled={loading}>
            Osvježi
          </Button>
          <Dialog open={isCreateProductOpen} onOpenChange={setIsCreateProductOpen}>
            <DialogTrigger asChild>
              <Button>Dodaj proizvod</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Novi proizvod</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onCreateProduct)} className="space-y-4">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant={previewMode ? 'default' : 'outline'}
                    onClick={() => setPreviewMode(true)}
                  >
                    Preview
                  </Button>
                  <Button
                    type="button"
                    variant={!previewMode ? 'default' : 'outline'}
                    onClick={() => setPreviewMode(false)}
                  >
                    Forma
                  </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {!previewMode ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Naziv</Label>
                        <Input {...form.register('name')} />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Opis</Label>
                        <Input {...form.register('description')} />
                      </div>
                      <div className="space-y-2">
                        <Label>Cijena (€)</Label>
                        <Input type="number" step="0.01" {...form.register('price')} />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug (opciono)</Label>
                        <Input {...form.register('slug')} />
                      </div>
                      <div className="space-y-2">
                        <Label>Pol</Label>
                        <Select
                          value={form.watch('gender') ?? 'UNISEX'}
                          onValueChange={(v) => form.setValue('gender', v as Gender)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {genderOptions.map((g) => (
                              <SelectItem key={g} value={g}>
                                {g}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={form.watch('status') ?? 'ACTIVE'}
                          onValueChange={(v) => form.setValue('status', v as ProductStatus)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Kategorija</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCreateCategoryOpen(true)}
                          >
                            Dodaj kategoriju
                          </Button>
                        </div>
                        <Select
                          value={
                            form.watch('category_id') != null
                              ? String(form.watch('category_id'))
                              : 'none'
                          }
                          onValueChange={(v) =>
                            form.setValue('category_id', v === 'none' ? null : Number(v))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="(opciono)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">(nema)</SelectItem>
                            {categoryOptions
                              .filter((c) => c.id != null && String(c.id) !== '')
                              .map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                  {c.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Kolekcija</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCreateCollectionOpen(true)}
                          >
                            Dodaj kolekciju
                          </Button>
                        </div>
                        <Select
                          value={
                            form.watch('collection_id') != null
                              ? String(form.watch('collection_id'))
                              : 'none'
                          }
                          onValueChange={(v) =>
                            form.setValue('collection_id', v === 'none' ? null : Number(v))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="(opciono)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">(nema)</SelectItem>
                            {collections
                              .filter((c) => c.id != null && String(c.id) !== '')
                              .map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                  {c.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>
                          Slike proizvoda ({newProductImages.length}/{MAX_PRODUCT_IMAGES})
                        </Label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          aria-label="Dodaj slike proizvoda za kreiranje"
                          title="Dodaj slike proizvoda"
                          onChange={(e) => {
                            handleChooseNewProductImages(e.target.files);
                            e.currentTarget.value = '';
                          }}
                          className="block w-full text-sm"
                        />
                        {newProductImagePreviewUrls.length > 0 ? (
                          <div className="grid grid-cols-5 gap-2">
                            {newProductImagePreviewUrls.map((url, idx) => (
                              <div key={url} className="relative rounded-md border p-1">
                                <img
                                  src={url}
                                  alt={`Nova slika ${idx + 1}`}
                                  className="h-20 w-full rounded object-cover"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute right-1 top-1 h-6 px-2"
                                  onClick={() => removePendingImage(idx)}
                                >
                                  X
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <Card>
                    <CardHeader>
                      <CardTitle>Preview proizvoda</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {newProductImagePreviewUrls[0] ? (
                        <img
                          src={newProductImagePreviewUrls[0]}
                          alt={form.watch('name') || 'Preview'}
                          className="h-56 w-full rounded-md border object-cover"
                        />
                      ) : (
                        <div className="flex h-56 items-center justify-center rounded-md border text-sm text-muted-foreground">
                          Dodajte sliku za preview
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-lg font-semibold">
                          {form.watch('name') || 'Naziv proizvoda'}
                        </p>
                        <p className="text-muted-foreground">
                          {form.watch('description') || 'Opis proizvoda'}
                        </p>
                        <p className="font-medium">
                          €{Number(form.watch('price') || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Kategorija:{' '}
                          {categoryOptions.find((c) => c.id === form.watch('category_id'))?.name ||
                            '(nije odabrana)'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Kolekcija:{' '}
                          {collections.find((c) => c.id === form.watch('collection_id'))?.name ||
                            '(nije odabrana)'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Otkaži
                    </Button>
                  </DialogClose>
                  <Button type="submit">Sačuvaj proizvod</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Proizvodi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">Još nema proizvoda.</p>
            ) : (
              <div className="space-y-2">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      selectedProductId === p.id
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground">€{p.price.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {p.status ?? 'ACTIVE'} {p.gender ? `• ${p.gender}` : ''}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detalji</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedProduct ? (
              <p className="text-sm text-muted-foreground">
                Odaberite proizvod za upravljanje varijantama i slikama.
              </p>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedProduct.name}</h3>
                    <p className="text-muted-foreground">€{selectedProduct.price.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => void onUpdateProduct(selectedProduct.id, { status: 'DRAFT' })}
                    >
                      Postavi nacrt
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => void onDeleteProduct(selectedProduct.id)}
                    >
                      Obriši
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Varijante</h4>
                    <Button variant="outline" onClick={() => void onAddVariant()}>
                      Dodaj varijantu
                    </Button>
                  </div>
                  {selectedProduct.variants?.length ? (
                    <div className="space-y-2">
                      {selectedProduct.variants.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between rounded-md border p-3 text-sm"
                        >
                          <div>
                            <div className="font-medium">
                              {v.color_name} • {v.size}
                            </div>
                            <div className="text-muted-foreground">
                              Zaliha: {v.inventory_qty} {v.is_active ? '' : '• neaktivno'}
                            </div>
                          </div>
                          <Button variant="outline" onClick={() => void onDeleteVariant(v.id)}>
                            Ukloni
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Još nema varijanti. Dodajte barem jednu veličinu/boju.
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">
                      Slike ({selectedProductImageCount}/{MAX_PRODUCT_IMAGES})
                    </h4>
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
                          void onUploadImage(e.target.files);
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                  </div>
                  {selectedProduct.media?.length ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedProduct.media.map((m) => (
                        <div key={m.id} className="space-y-2 rounded-md border p-3 text-sm">
                          <img
                            src={m.url}
                            alt={m.alt_text ?? selectedProduct.name}
                            className="h-36 w-full rounded-md object-cover"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <a
                              href={m.url}
                              target="_blank"
                              rel="noreferrer"
                              className="truncate text-primary underline-offset-4 hover:underline"
                            >
                              Otvori original
                            </a>
                            <Button variant="outline" onClick={() => void onDeleteMedia(m.id)}>
                              Ukloni
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Još nema slika. Otpremite u Supabase Storage.
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Dodaj kategoriju</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={onCreateCategory}>
            <div className="space-y-2">
              <Label>Naziv</Label>
              <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Opis (opciono)</Label>
              <Input
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Slika kategorije (opciono)</Label>
              <input
                type="file"
                accept="image/*"
                aria-label="Otpremi sliku kategorije"
                title="Slika kategorije"
                onChange={(e) => setNewCategoryImage(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
              {newCategoryImage ? (
                <p className="text-xs text-muted-foreground">{newCategoryImage.name}</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full">
              Sačuvaj kategoriju
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateCollectionOpen} onOpenChange={setIsCreateCollectionOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Dodaj kolekciju</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={onCreateCollection}>
            <div className="space-y-2">
              <Label>Naziv</Label>
              <Input
                value={collectionForm.name}
                onChange={(e) =>
                  setCollectionForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                    slug: prev.slug || e.target.value.trim().toLowerCase().replace(/\s+/g, '-'),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={collectionForm.slug}
                onChange={(e) =>
                  setCollectionForm((prev) => ({
                    ...prev,
                    slug: e.target.value.trim().toLowerCase().replace(/\s+/g, '-'),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Opis (opciono)</Label>
              <Input
                value={collectionForm.description}
                onChange={(e) =>
                  setCollectionForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Hero slika (opciono)</Label>
              <input
                type="file"
                accept="image/*"
                aria-label="Otpremi hero sliku kolekcije"
                title="Hero slika kolekcije"
                onChange={(e) => setNewCollectionHeroImage(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
              {newCollectionHeroImage ? (
                <p className="text-xs text-muted-foreground">{newCollectionHeroImage.name}</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full">
              Sačuvaj kolekciju
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
