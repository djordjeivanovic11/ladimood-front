'use client';

import React from 'react';
import axios from 'axios';
import {
  adminCreateCategory,
  adminCreateCollection,
  adminCreateStorageUploadUrl,
  adminDeleteCategory,
  adminDeleteCollection,
  adminListCategories,
  adminListCollections,
  adminUpdateCategory,
  adminUpdateCollection,
} from '@/api/admin/catalog';
import type { Category, Collection } from '@/app/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

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

export default function CatalogTaxonomyManagement() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryDescription, setNewCategoryDescription] = React.useState('');
  const [newCategoryImage, setNewCategoryImage] = React.useState<File | null>(null);
  const [editingCategoryId, setEditingCategoryId] = React.useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = React.useState('');
  const [editCategoryDescription, setEditCategoryDescription] = React.useState('');
  const [editCategoryImageFile, setEditCategoryImageFile] = React.useState<File | null>(null);
  const [editCategoryImageUrl, setEditCategoryImageUrl] = React.useState('');

  const [newName, setNewName] = React.useState('');
  const [newSlug, setNewSlug] = React.useState('');
  const [newDescription, setNewDescription] = React.useState('');
  const [newHeroImageFile, setNewHeroImageFile] = React.useState<File | null>(null);

  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editSlug, setEditSlug] = React.useState('');
  const [editDescription, setEditDescription] = React.useState('');
  const [editHeroImageUrl, setEditHeroImageUrl] = React.useState('');
  const [editHeroImageFile, setEditHeroImageFile] = React.useState<File | null>(null);

  const refreshData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [categoriesData, collectionsData] = await Promise.all([
        adminListCategories(),
        adminListCollections(),
      ]);
      setCategories(categoriesData);
      setCollections(collectionsData);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Učitavanje taksonomije kataloga nije uspjelo.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const resetCreateForm = () => {
    setNewName('');
    setNewSlug('');
    setNewDescription('');
    setNewHeroImageFile(null);
  };

  const resetCategoryCreateForm = () => {
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryImage(null);
  };

  const uploadImageToSupabase = async (
    file: File,
    target: { collection_id?: number; category_id?: number }
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
    if (!uploadRes.ok) throw new Error('Supabase upload failed');
    return upload.public_url;
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
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      resetCategoryCreateForm();
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
      setCategories((prev) => prev.filter((category) => category.id !== categoryId));
      if (editingCategoryId === categoryId) cancelCategoryEdit();
      toast.success('Kategorija je obrisana.');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Brisanje kategorije nije uspjelo.'));
    }
  };

  const startEdit = (collection: Collection) => {
    setEditingId(collection.id);
    setEditName(collection.name);
    setEditSlug(collection.slug);
    setEditDescription(collection.description ?? '');
    setEditHeroImageUrl(collection.hero_image_url ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditSlug('');
    setEditDescription('');
    setEditHeroImageUrl('');
    setEditHeroImageFile(null);
  };

  const onCreateCollection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newName.trim();
    const slug = (newSlug || toSlug(name)).trim();
    if (!name || !slug) {
      toast.error('Naziv i slug kolekcije su obavezni.');
      return;
    }

    try {
      let created = await adminCreateCollection({
        name,
        slug,
        description: newDescription.trim() || null,
      });
      if (newHeroImageFile) {
        const heroImageUrl = await uploadImageToSupabase(newHeroImageFile, {
          collection_id: created.id,
        });
        created = await adminUpdateCollection(created.id, { hero_image_url: heroImageUrl });
      }
      setCollections((prev) => [created, ...prev]);
      resetCreateForm();
      toast.success('Kolekcija je kreirana.');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Kreiranje kolekcije nije uspjelo.'));
    }
  };

  const onUpdateCollection = async (collectionId: number) => {
    const name = editName.trim();
    const slug = (editSlug || toSlug(name)).trim();
    if (!name || !slug) {
      toast.error('Naziv i slug kolekcije su obavezni.');
      return;
    }

    try {
      let heroImageUrl = editHeroImageUrl.trim() || null;
      if (editHeroImageFile) {
        heroImageUrl = await uploadImageToSupabase(editHeroImageFile, {
          collection_id: collectionId,
        });
      }
      const updated = await adminUpdateCollection(collectionId, {
        name,
        slug,
        description: editDescription.trim() || null,
        hero_image_url: heroImageUrl,
      });
      setCollections((prev) => prev.map((item) => (item.id === collectionId ? updated : item)));
      cancelEdit();
      toast.success('Kolekcija je ažurirana.');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Ažuriranje kolekcije nije uspjelo.'));
    }
  };

  const onDeleteCollection = async (collectionId: number) => {
    if (!confirm('Obrisati ovu kolekciju?')) return;
    try {
      await adminDeleteCollection(collectionId);
      setCollections((prev) => prev.filter((item) => item.id !== collectionId));
      if (editingId === collectionId) cancelEdit();
      toast.success('Kolekcija je obrisana.');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Brisanje kolekcije nije uspjelo.'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Kategorije i kolekcije</h2>
        <p className="text-muted-foreground">
          Pregledajte kategorije proizvoda i upravljajte strukturom kolekcija u katalogu.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kategorije</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form className="space-y-3" onSubmit={onCreateCategory}>
              <div className="space-y-2">
                <Label htmlFor="category-name">Naziv</Label>
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Haljine"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description">Opis (opciono)</Label>
                <Input
                  id="category-description"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Proizvodi grupisani po kategoriji"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-image">Slika kategorije (opciono)</Label>
                <input
                  id="category-image"
                  type="file"
                  accept="image/*"
                  aria-label="Otpremi sliku kategorije"
                  title="Slika kategorije"
                  onChange={(e) => setNewCategoryImage(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm"
                />
              </div>
              <Button type="submit" className="w-full">
                Dodaj kategoriju
              </Button>
            </form>

            <Separator />

            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nema pronađenih kategorija.</p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => {
                  const isEditingCategory = editingCategoryId === category.id;
                  return (
                    <div key={category.id} className="rounded-md border p-3">
                      {!isEditingCategory ? (
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium">{category.name}</p>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startCategoryEdit(category)}
                              >
                                Uredi
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => void onDeleteCategory(category.id)}
                              >
                                Obriši
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {category.description?.trim() || 'Nema opisa'}
                          </p>
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt={category.name}
                              className="h-24 w-full rounded-md object-cover"
                            />
                          ) : null}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                          />
                          <Input
                            value={editCategoryDescription}
                            onChange={(e) => setEditCategoryDescription(e.target.value)}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            aria-label="Zamijeni sliku kategorije"
                            title="Zamijeni sliku kategorije"
                            onChange={(e) => setEditCategoryImageFile(e.target.files?.[0] ?? null)}
                            className="block w-full text-sm"
                          />
                          {editCategoryImageUrl ? (
                            <img
                              src={editCategoryImageUrl}
                              alt={editCategoryName}
                              className="h-20 w-full rounded-md object-cover"
                            />
                          ) : null}
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => void onUpdateCategory(category.id)}>
                              Sačuvaj
                            </Button>
                            <Button variant="outline" size="sm" onClick={cancelCategoryEdit}>
                              Otkaži
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kreiraj kolekciju</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onCreateCollection}>
              <div className="space-y-2">
                <Label htmlFor="collection-name">Naziv</Label>
                <Input
                  id="collection-name"
                  value={newName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewName(value);
                    if (!newSlug.trim()) setNewSlug(toSlug(value));
                  }}
                  placeholder="Ljetni must-have"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collection-slug">Slug</Label>
                <Input
                  id="collection-slug"
                  value={newSlug}
                  onChange={(e) => setNewSlug(toSlug(e.target.value))}
                  placeholder="summer-essentials"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collection-description">Opis (opciono)</Label>
                <Input
                  id="collection-description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Kratak opis kolekcije"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collection-hero">Hero slika (opciono)</Label>
                <input
                  id="collection-hero"
                  type="file"
                  accept="image/*"
                  aria-label="Otpremi hero sliku kolekcije"
                  title="Hero slika kolekcije"
                  onChange={(e) => setNewHeroImageFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm"
                />
              </div>
              <Button type="submit" className="w-full">
                Dodaj kolekciju
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Kolekcije</CardTitle>
          <Button variant="outline" onClick={() => void refreshData()} disabled={isLoading}>
            Osvježi
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {collections.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nema pronađenih kolekcija.</p>
          ) : (
            collections.map((collection) => {
              const isEditing = editingId === collection.id;
              return (
                <div key={collection.id} className="rounded-md border p-4">
                  {!isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{collection.name}</p>
                          <p className="text-xs text-muted-foreground">{collection.slug}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => startEdit(collection)}>
                            Uredi
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => void onDeleteCollection(collection.id)}
                          >
                            Obriši
                          </Button>
                        </div>
                      </div>
                      {collection.description ? (
                        <p className="text-sm text-muted-foreground">{collection.description}</p>
                      ) : null}
                      {collection.hero_image_url ? (
                        <a
                          href={collection.hero_image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary underline-offset-4 hover:underline"
                        >
                          {collection.hero_image_url}
                        </a>
                      ) : null}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Naziv</Label>
                          <Input
                            value={editName}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditName(value);
                              if (!editSlug.trim()) setEditSlug(toSlug(value));
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Slug</Label>
                          <Input
                            value={editSlug}
                            onChange={(e) => setEditSlug(toSlug(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Opis</Label>
                        <Input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Zamijeni hero sliku (opciono)</Label>
                        <input
                          type="file"
                          accept="image/*"
                          aria-label="Zamijeni hero sliku kolekcije"
                          title="Zamijeni hero sliku kolekcije"
                          onChange={(e) => setEditHeroImageFile(e.target.files?.[0] ?? null)}
                          className="block w-full text-sm"
                        />
                        {editHeroImageUrl ? (
                          <img
                            src={editHeroImageUrl}
                            alt={editName}
                            className="h-24 w-full rounded-md object-cover"
                          />
                        ) : (
                          <p className="text-xs text-muted-foreground">Nema trenutne hero slike.</p>
                        )}
                      </div>
                      <Separator />
                      <div className="flex gap-2">
                        <Button onClick={() => void onUpdateCollection(collection.id)}>
                          Sačuvaj
                        </Button>
                        <Button variant="outline" onClick={cancelEdit}>
                          Otkaži
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
