'use client';

import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Resolver, useForm } from 'react-hook-form';
import { Size } from '@/app/types/types';
import type { Collection, Gender, Product, ProductStatus } from '@/app/types/types';
import {
  adminAddMedia,
  adminAddVariant,
  adminCloudinarySignature,
  adminCreateProduct,
  adminDeleteMedia,
  adminDeleteProduct,
  adminDeleteVariant,
  adminListCollections,
  adminListProducts,
  adminUpdateProduct,
} from '@/api/admin/catalog';
import { useCategoriesQuery } from '@/hooks/queries/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
      z.number().nullable()
    )
    .optional()
    .nullable(),
  collection_id: z
    .preprocess(
      (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
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

const genderOptions: Gender[] = ['WOMEN', 'MEN', 'UNISEX'];
const statusOptions: ProductStatus[] = ['ACTIVE', 'DRAFT', 'ARCHIVED'];

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
  const { data: categories = [] } = useCategoriesQuery();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductForm>,
    defaultValues: {
      status: 'ACTIVE',
      gender: 'UNISEX',
    },
  });

  const refresh = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([adminListProducts(), adminListCollections()]);
      setProducts(p);
      setCollections(c);
      if (!selectedProductId && p.length) setSelectedProductId(p[0].id);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load catalog data.');
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
      toast.success('Product created.');
      setProducts((prev) => [created, ...prev]);
      setSelectedProductId(created.id);
      form.reset();
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Failed to create product.'));
    }
  };

  const onUpdateProduct = async (productId: number, patch: Partial<ProductForm>) => {
    try {
      const updated = await adminUpdateProduct(productId, patch);
      toast.success('Product updated.');
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updated } : p)));
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Failed to update product.'));
    }
  };

  const onDeleteProduct = async (productId: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await adminDeleteProduct(productId);
      toast.success('Product deleted.');
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setSelectedProductId((prev) => {
        if (prev !== productId) return prev;
        const next = products.find((p) => p.id !== productId);
        return next?.id ?? null;
      });
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Failed to delete product.'));
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
      toast.success('Variant added.');
      await refresh();
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Failed to add variant.'));
    }
  };

  const onDeleteVariant = async (variantId: number) => {
    if (!selectedProduct) return;
    try {
      await adminDeleteVariant(selectedProduct.id, variantId);
      toast.success('Variant deleted.');
      await refresh();
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Failed to delete variant.'));
    }
  };

  const onUploadImage = async (file: File) => {
    if (!selectedProduct) return;
    try {
      const sig = await adminCloudinarySignature({ folder: 'ladimood/products' });
      const url = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.api_key);
      formData.append('timestamp', String(sig.timestamp));
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);

      const res = await fetch(url, { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Cloudinary upload failed');

      await adminAddMedia(selectedProduct.id, {
        url: json.secure_url,
        alt_text: selectedProduct.name,
        sort_order: 0,
      });
      toast.success('Image uploaded.');
      await refresh();
    } catch (e: unknown) {
      console.error(e);
      toast.error(getApiErrorMessage(e, 'Image upload failed (Cloudinary not configured?).'));
    }
  };

  const onDeleteMedia = async (mediaId: number) => {
    if (!selectedProduct) return;
    try {
      await adminDeleteMedia(selectedProduct.id, mediaId);
      toast.success('Image removed.');
      await refresh();
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Failed to remove image.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Catalog</h2>
          <p className="text-muted-foreground">
            Products, variants (sizes/colors), inventory, images, collections.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void refresh()} disabled={loading}>
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add product</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>New product</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onCreateProduct)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Name</Label>
                    <Input {...form.register('name')} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Description</Label>
                    <Input {...form.register('description')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (€)</Label>
                    <Input type="number" step="0.01" {...form.register('price')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (optional)</Label>
                    <Input {...form.register('slug')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
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
                    <Label>Category</Label>
                    <Select
                      value={form.watch('category_id') ? String(form.watch('category_id')) : ''}
                      onValueChange={(v) => form.setValue('category_id', v ? Number(v) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="(optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">(none)</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Collection</Label>
                    <Select
                      value={form.watch('collection_id') ? String(form.watch('collection_id')) : ''}
                      onValueChange={(v) => form.setValue('collection_id', v ? Number(v) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="(optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">(none)</SelectItem>
                        {collections.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Create
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products yet.</p>
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
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedProduct ? (
              <p className="text-sm text-muted-foreground">
                Select a product to manage variants and images.
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
                      Set Draft
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => void onDeleteProduct(selectedProduct.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Variants</h4>
                    <Button variant="outline" onClick={() => void onAddVariant()}>
                      Add variant
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
                              Stock: {v.inventory_qty} {v.is_active ? '' : '• inactive'}
                            </div>
                          </div>
                          <Button variant="outline" onClick={() => void onDeleteVariant(v.id)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No variants yet. Add at least one size/color.
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Images</h4>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void onUploadImage(file);
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                  </div>
                  {selectedProduct.media?.length ? (
                    <div className="space-y-2">
                      {selectedProduct.media.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
                        >
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate text-primary underline-offset-4 hover:underline"
                          >
                            {m.url}
                          </a>
                          <Button variant="outline" onClick={() => void onDeleteMedia(m.id)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No images yet. Upload via Cloudinary (requires backend Cloudinary env vars).
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
