'use client';

import React from 'react';
import {
  adminCreateCategory,
  adminCreateCollection,
  adminDeleteCategory,
  adminDeleteCollection,
  adminListCategories,
  adminListCollections,
  adminListProducts,
  adminUpdateCategory,
  adminUpdateCollection,
} from '@/api/admin/catalog';
import { adminUploadStorageFile } from '@/api/admin/storage';
import type { Category, Collection, Product } from '@/app/types/types';
import { AdminEntityListItem } from '@/components/Management/catalog/AdminEntityListItem';
import { AdminRemoteImage } from '@/components/Management/catalog/AdminRemoteImage';
import { AdminThumbnail } from '@/components/Management/catalog/AdminThumbnail';
import { AssociatedProductsList } from '@/components/Management/catalog/AssociatedProductsList';
import { getApiErrorMessage, toSlug } from '@/components/Management/catalog/catalog-admin-utils';
import {
  getCategoryImageUrl,
  getCollectionHeroUrl,
} from '@/components/Management/catalog/catalog-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

type TaxonomyTab = 'categories' | 'collections';

function productCategoryId(product: Product): number | null {
  const row = product as Product & { category_id?: number | null };
  return row.category_id ?? product.category?.id ?? null;
}

function productCollectionId(product: Product): number | null {
  const row = product as Product & { collection_id?: number | null };
  return row.collection_id ?? product.collection?.id ?? null;
}

type CatalogTaxonomyManagementProps = {
  onOpenProduct?: (productId: number) => void;
};

export default function CatalogTaxonomyManagement({
  onOpenProduct,
}: CatalogTaxonomyManagementProps) {
  const [activeTab, setActiveTab] = React.useState<TaxonomyTab>('categories');
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = React.useState<number | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = React.useState<number | null>(null);

  const [isAddCategoryOpen, setIsAddCategoryOpen] = React.useState(false);
  const [isAddCollectionOpen, setIsAddCollectionOpen] = React.useState(false);

  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryDescription, setNewCategoryDescription] = React.useState('');
  const [newCategoryImage, setNewCategoryImage] = React.useState<File | null>(null);

  const [newCollectionName, setNewCollectionName] = React.useState('');
  const [newCollectionSlug, setNewCollectionSlug] = React.useState('');
  const [newCollectionDescription, setNewCollectionDescription] = React.useState('');
  const [newCollectionHeroImage, setNewCollectionHeroImage] = React.useState<File | null>(null);

  const [editingCategoryId, setEditingCategoryId] = React.useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = React.useState('');
  const [editCategoryDescription, setEditCategoryDescription] = React.useState('');
  const [editCategoryImageFile, setEditCategoryImageFile] = React.useState<File | null>(null);
  const [editCategoryImageUrl, setEditCategoryImageUrl] = React.useState('');

  const [editingCollectionId, setEditingCollectionId] = React.useState<number | null>(null);
  const [editCollectionName, setEditCollectionName] = React.useState('');
  const [editCollectionSlug, setEditCollectionSlug] = React.useState('');
  const [editCollectionDescription, setEditCollectionDescription] = React.useState('');
  const [editCollectionHeroImageUrl, setEditCollectionHeroImageUrl] = React.useState('');
  const [editCollectionHeroImageFile, setEditCollectionHeroImageFile] = React.useState<File | null>(
    null
  );

  const selectedCategory = React.useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  const selectedCollection = React.useMemo(
    () => collections.find((c) => c.id === selectedCollectionId) ?? null,
    [collections, selectedCollectionId]
  );

  const productsByCategoryId = React.useMemo(() => {
    const map = new Map<number, Product[]>();
    for (const product of products) {
      const categoryId = productCategoryId(product);
      if (categoryId == null) continue;
      const list = map.get(categoryId) ?? [];
      list.push(product);
      map.set(categoryId, list);
    }
    return map;
  }, [products]);

  const productsByCollectionId = React.useMemo(() => {
    const map = new Map<number, Product[]>();
    for (const product of products) {
      const collectionId = productCollectionId(product);
      if (collectionId == null) continue;
      const list = map.get(collectionId) ?? [];
      list.push(product);
      map.set(collectionId, list);
    }
    return map;
  }, [products]);

  const selectedCategoryProducts = selectedCategoryId
    ? (productsByCategoryId.get(selectedCategoryId) ?? [])
    : [];

  const selectedCollectionProducts = selectedCollectionId
    ? (productsByCollectionId.get(selectedCollectionId) ?? [])
    : [];

  const refreshData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [categoriesData, collectionsData, productsData] = await Promise.all([
        adminListCategories(),
        adminListCollections(),
        adminListProducts(),
      ]);
      setCategories(categoriesData);
      setCollections(collectionsData);
      setProducts(productsData);

      setSelectedCategoryId((prev) => {
        if (prev && categoriesData.some((c) => c.id === prev)) return prev;
        return categoriesData[0]?.id ?? null;
      });
      setSelectedCollectionId((prev) => {
        if (prev && collectionsData.some((c) => c.id === prev)) return prev;
        return collectionsData[0]?.id ?? null;
      });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Učitavanje taksonomije kataloga nije uspjelo.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const uploadImageToSupabase = async (
    file: File,
    target: { collection_id?: number; category_id?: number }
  ) => {
    const upload = await adminUploadStorageFile(file, target);
    return upload.public_url;
  };

  const resetCategoryCreateForm = () => {
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryImage(null);
  };

  const resetCollectionCreateForm = () => {
    setNewCollectionName('');
    setNewCollectionSlug('');
    setNewCollectionDescription('');
    setNewCollectionHeroImage(null);
  };

  const startCategoryEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditCategoryName(category.name);
    setEditCategoryDescription(category.description ?? '');
    setEditCategoryImageUrl(category.image_url ?? '');
    setEditCategoryImageFile(null);
  };

  const cancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setEditCategoryName('');
    setEditCategoryDescription('');
    setEditCategoryImageFile(null);
    setEditCategoryImageUrl('');
  };

  const startCollectionEdit = (collection: Collection) => {
    setEditingCollectionId(collection.id);
    setEditCollectionName(collection.name);
    setEditCollectionSlug(collection.slug);
    setEditCollectionDescription(collection.description ?? '');
    setEditCollectionHeroImageUrl(collection.hero_image_url ?? '');
    setEditCollectionHeroImageFile(null);
  };

  const cancelCollectionEdit = () => {
    setEditingCollectionId(null);
    setEditCollectionName('');
    setEditCollectionSlug('');
    setEditCollectionDescription('');
    setEditCollectionHeroImageUrl('');
    setEditCollectionHeroImageFile(null);
  };

  const onCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) {
      toast.error('Naziv kategorije je obavezan.');
      return;
    }

    try {
      let created = await adminCreateCategory({
        name,
        description: newCategoryDescription.trim() || null,
      });
      if (newCategoryImage) {
        const imageUrl = await uploadImageToSupabase(newCategoryImage, { category_id: created.id });
        created = await adminUpdateCategory(created.id, { image_url: imageUrl });
      }
      const next = [...categories, created].sort((a, b) => a.name.localeCompare(b.name));
      setCategories(next);
      setSelectedCategoryId(created.id);
      resetCategoryCreateForm();
      setIsAddCategoryOpen(false);
      toast.success('Kategorija je kreirana.');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Kreiranje kategorije nije uspjelo.'));
    }
  };

  const onUpdateCategory = async (categoryId: number) => {
    const name = editCategoryName.trim();
    if (!name) {
      toast.error('Naziv kategorije je obavezan.');
      return;
    }

    try {
      let imageUrl = editCategoryImageUrl.trim() || null;
      if (editCategoryImageFile) {
        imageUrl = await uploadImageToSupabase(editCategoryImageFile, { category_id: categoryId });
      }
      const updated = await adminUpdateCategory(categoryId, {
        name,
        description: editCategoryDescription.trim() || null,
        image_url: imageUrl,
      });
      setCategories((prev) =>
        prev
          .map((category) => (category.id === categoryId ? updated : category))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      cancelCategoryEdit();
      toast.success('Kategorija je ažurirana.');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Ažuriranje kategorije nije uspjelo.'));
    }
  };

  const onDeleteCategory = async (categoryId: number) => {
    if (!confirm('Obrisati ovu kategoriju?')) return;
    try {
      await adminDeleteCategory(categoryId);
      const next = categories.filter((category) => category.id !== categoryId);
      setCategories(next);
      if (editingCategoryId === categoryId) cancelCategoryEdit();
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(next[0]?.id ?? null);
      }
      toast.success('Kategorija je obrisana.');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Brisanje kategorije nije uspjelo.'));
    }
  };

  const onCreateCollection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newCollectionName.trim();
    const slug = (newCollectionSlug || toSlug(name)).trim();
    if (!name || !slug) {
      toast.error('Naziv i slug kolekcije su obavezni.');
      return;
    }

    try {
      let created = await adminCreateCollection({
        name,
        slug,
        description: newCollectionDescription.trim() || null,
      });
      if (newCollectionHeroImage) {
        const heroImageUrl = await uploadImageToSupabase(newCollectionHeroImage, {
          collection_id: created.id,
        });
        created = await adminUpdateCollection(created.id, { hero_image_url: heroImageUrl });
      }
      setCollections((prev) => [created, ...prev]);
      setSelectedCollectionId(created.id);
      resetCollectionCreateForm();
      setIsAddCollectionOpen(false);
      toast.success('Kolekcija je kreirana.');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Kreiranje kolekcije nije uspjelo.'));
    }
  };

  const onUpdateCollection = async (collectionId: number) => {
    const name = editCollectionName.trim();
    const slug = (editCollectionSlug || toSlug(name)).trim();
    if (!name || !slug) {
      toast.error('Naziv i slug kolekcije su obavezni.');
      return;
    }

    try {
      let heroImageUrl = editCollectionHeroImageUrl.trim() || null;
      if (editCollectionHeroImageFile) {
        heroImageUrl = await uploadImageToSupabase(editCollectionHeroImageFile, {
          collection_id: collectionId,
        });
      }
      const updated = await adminUpdateCollection(collectionId, {
        name,
        slug,
        description: editCollectionDescription.trim() || null,
        hero_image_url: heroImageUrl,
      });
      setCollections((prev) => prev.map((item) => (item.id === collectionId ? updated : item)));
      cancelCollectionEdit();
      toast.success('Kolekcija je ažurirana.');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Ažuriranje kolekcije nije uspjelo.'));
    }
  };

  const onDeleteCollection = async (collectionId: number) => {
    if (!confirm('Obrisati ovu kolekciju?')) return;
    try {
      await adminDeleteCollection(collectionId);
      const next = collections.filter((item) => item.id !== collectionId);
      setCollections(next);
      if (editingCollectionId === collectionId) cancelCollectionEdit();
      if (selectedCollectionId === collectionId) {
        setSelectedCollectionId(next[0]?.id ?? null);
      }
      toast.success('Kolekcija je obrisana.');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Brisanje kolekcije nije uspjelo.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Kategorije i kolekcije</h2>
          <p className="text-muted-foreground">
            Upravljajte kategorijama i kolekcijama te pregledajte povezane proizvode.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => void refreshData()}
          disabled={isLoading}
          aria-label="Osvježi"
          title="Osvježi"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TaxonomyTab)}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="categories">Kategorije</TabsTrigger>
          <TabsTrigger value="collections">Kolekcije</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsAddCategoryOpen(true)}
              aria-label="Dodaj kategoriju"
              title="Dodaj kategoriju"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Sve kategorije</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nema kategorija.</p>
                ) : (
                  categories.map((category) => {
                    const count = productsByCategoryId.get(category.id)?.length ?? 0;
                    return (
                      <AdminEntityListItem
                        key={category.id}
                        selected={selectedCategoryId === category.id}
                        onClick={() => {
                          setSelectedCategoryId(category.id);
                          cancelCategoryEdit();
                        }}
                        title={category.name}
                        leading={
                          <AdminThumbnail
                            src={getCategoryImageUrl(category)}
                            alt={category.name}
                            size="md"
                          />
                        }
                        subtitle={category.description?.trim() || 'Bez opisa'}
                        trailing={<Badge variant="secondary">{count}</Badge>}
                      />
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Detalji kategorije</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedCategory ? (
                  <p className="text-sm text-muted-foreground">Odaberite kategoriju sa liste.</p>
                ) : editingCategoryId === selectedCategory.id ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Naziv</Label>
                      <Input
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Opis</Label>
                      <Input
                        value={editCategoryDescription}
                        onChange={(e) => setEditCategoryDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slika</Label>
                      <input
                        type="file"
                        accept="image/*"
                        aria-label="Zamijeni sliku kategorije"
                        title="Zamijeni sliku kategorije"
                        onChange={(e) => setEditCategoryImageFile(e.target.files?.[0] ?? null)}
                        className="block w-full text-sm"
                      />
                      <AdminRemoteImage
                        src={editCategoryImageUrl || null}
                        alt={editCategoryName}
                        width={720}
                        height={200}
                        className="h-24 w-full rounded-md object-cover"
                        fallbackClassName="h-24 w-full rounded-md border border-dashed"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => void onUpdateCategory(selectedCategory.id)}>
                        Sačuvaj
                      </Button>
                      <Button variant="outline" onClick={cancelCategoryEdit}>
                        Otkaži
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                      <AdminRemoteImage
                        src={getCategoryImageUrl(selectedCategory)}
                        alt={selectedCategory.name}
                        width={720}
                        height={300}
                        className="h-36 w-full rounded-lg border object-cover"
                        fallbackClassName="h-36 w-full rounded-lg border border-dashed"
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold">{selectedCategory.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedCategory.description?.trim() || 'Nema opisa'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => startCategoryEdit(selectedCategory)}
                          >
                            Uredi
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => void onDeleteCategory(selectedCategory.id)}
                          >
                            Obriši
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="mb-3 font-semibold">
                        Povezani proizvodi ({selectedCategoryProducts.length})
                      </h4>
                      <AssociatedProductsList
                        products={selectedCategoryProducts}
                        emptyLabel="Nema proizvoda u ovoj kategoriji."
                        onSelectProduct={onOpenProduct}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collections" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsAddCollectionOpen(true)}
              aria-label="Dodaj kolekciju"
              title="Dodaj kolekciju"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Sve kolekcije</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {collections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nema kolekcija.</p>
                ) : (
                  collections.map((collection) => {
                    const count = productsByCollectionId.get(collection.id)?.length ?? 0;
                    return (
                      <AdminEntityListItem
                        key={collection.id}
                        selected={selectedCollectionId === collection.id}
                        onClick={() => {
                          setSelectedCollectionId(collection.id);
                          cancelCollectionEdit();
                        }}
                        title={collection.name}
                        leading={
                          <AdminThumbnail
                            src={getCollectionHeroUrl(collection)}
                            alt={collection.name}
                            size="md"
                          />
                        }
                        subtitle={collection.slug}
                        trailing={<Badge variant="secondary">{count}</Badge>}
                      />
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Detalji kolekcije</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedCollection ? (
                  <p className="text-sm text-muted-foreground">Odaberite kolekciju sa liste.</p>
                ) : editingCollectionId === selectedCollection.id ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Naziv</Label>
                        <Input
                          value={editCollectionName}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEditCollectionName(value);
                            if (!editCollectionSlug.trim()) setEditCollectionSlug(toSlug(value));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input
                          value={editCollectionSlug}
                          onChange={(e) => setEditCollectionSlug(toSlug(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Opis</Label>
                      <Input
                        value={editCollectionDescription}
                        onChange={(e) => setEditCollectionDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hero slika</Label>
                      <input
                        type="file"
                        accept="image/*"
                        aria-label="Zamijeni hero sliku kolekcije"
                        title="Zamijeni hero sliku kolekcije"
                        onChange={(e) =>
                          setEditCollectionHeroImageFile(e.target.files?.[0] ?? null)
                        }
                        className="block w-full text-sm"
                      />
                      <AdminRemoteImage
                        src={editCollectionHeroImageUrl || null}
                        alt={editCollectionName}
                        width={720}
                        height={240}
                        className="h-24 w-full rounded-md object-cover"
                        fallbackClassName="h-24 w-full rounded-md border border-dashed"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => void onUpdateCollection(selectedCollection.id)}>
                        Sačuvaj
                      </Button>
                      <Button variant="outline" onClick={cancelCollectionEdit}>
                        Otkaži
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                      <AdminRemoteImage
                        src={getCollectionHeroUrl(selectedCollection)}
                        alt={selectedCollection.name}
                        width={720}
                        height={300}
                        className="h-36 w-full rounded-lg border object-cover"
                        fallbackClassName="h-36 w-full rounded-lg border border-dashed"
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold">{selectedCollection.name}</h3>
                          <p className="text-xs text-muted-foreground">{selectedCollection.slug}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedCollection.description?.trim() || 'Nema opisa'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => startCollectionEdit(selectedCollection)}
                          >
                            Uredi
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => void onDeleteCollection(selectedCollection.id)}
                          >
                            Obriši
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="mb-3 font-semibold">
                        Povezani proizvodi ({selectedCollectionProducts.length})
                      </h4>
                      <AssociatedProductsList
                        products={selectedCollectionProducts}
                        emptyLabel="Nema proizvoda u ovoj kolekciji."
                        onSelectProduct={onOpenProduct}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Dodaj kategoriju</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={onCreateCategory}>
            <div className="space-y-2">
              <Label htmlFor="modal-category-name">Naziv</Label>
              <Input
                id="modal-category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Haljine"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-category-description">Opis (opciono)</Label>
              <Input
                id="modal-category-description"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Proizvodi grupisani po kategoriji"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-category-image">Slika kategorije (opciono)</Label>
              <input
                id="modal-category-image"
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
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Otkaži
                </Button>
              </DialogClose>
              <Button type="submit">Sačuvaj kategoriju</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddCollectionOpen} onOpenChange={setIsAddCollectionOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Dodaj kolekciju</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={onCreateCollection}>
            <div className="space-y-2">
              <Label htmlFor="modal-collection-name">Naziv</Label>
              <Input
                id="modal-collection-name"
                value={newCollectionName}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewCollectionName(value);
                  if (!newCollectionSlug.trim()) setNewCollectionSlug(toSlug(value));
                }}
                placeholder="Ljetni must-have"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-collection-slug">Slug</Label>
              <Input
                id="modal-collection-slug"
                value={newCollectionSlug}
                onChange={(e) => setNewCollectionSlug(toSlug(e.target.value))}
                placeholder="summer-essentials"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-collection-description">Opis (opciono)</Label>
              <Input
                id="modal-collection-description"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                placeholder="Kratak opis kolekcije"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-collection-hero">Hero slika (opciono)</Label>
              <input
                id="modal-collection-hero"
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
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Otkaži
                </Button>
              </DialogClose>
              <Button type="submit">Sačuvaj kolekciju</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
