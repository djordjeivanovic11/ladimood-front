import axiosInstance from '@/api/axiosInstance';
import type {
  Category,
  Collection,
  Product,
  ProductMedia,
  ProductVariant,
  Gender,
  ProductStatus,
  Size,
} from '@/app/types/types';

export async function adminListProducts(): Promise<Product[]> {
  const res = await axiosInstance.get<Product[]>('/admin/products');
  return res.data;
}

export async function adminCreateProduct(payload: {
  name: string;
  description: string;
  price: number;
  image_url?: string | null;
  slug?: string | null;
  gender?: Gender | null;
  status?: ProductStatus | null;
  category_id?: number | null;
  collection_id?: number | null;
}): Promise<Product> {
  const res = await axiosInstance.post<Product>('/admin/products', payload);
  return res.data;
}

export async function adminUpdateProduct(
  productId: number,
  payload: Partial<{
    name: string;
    description: string;
    price: number;
    image_url: string | null;
    slug: string | null;
    gender: Gender | null;
    status: ProductStatus | null;
    category_id: number | null;
    collection_id: number | null;
  }>
): Promise<Product> {
  const res = await axiosInstance.put<Product>(`/admin/products/${productId}`, payload);
  return res.data;
}

export async function adminDeleteProduct(productId: number): Promise<void> {
  await axiosInstance.delete(`/admin/products/${productId}`);
}

export async function adminAddVariant(
  productId: number,
  payload: {
    sku?: string | null;
    color_name: string;
    color_hex: string;
    size: Size;
    inventory_qty: number;
    is_active: boolean;
    price_override?: number | null;
  }
): Promise<ProductVariant> {
  const res = await axiosInstance.post<ProductVariant>(
    `/admin/products/${productId}/variants`,
    payload
  );
  return res.data;
}

export async function adminUpdateVariant(
  productId: number,
  variantId: number,
  payload: Partial<{
    sku: string | null;
    color_name: string;
    color_hex: string;
    size: Size;
    inventory_qty: number;
    is_active: boolean;
    price_override: number | null;
  }>
): Promise<ProductVariant> {
  const res = await axiosInstance.put<ProductVariant>(
    `/admin/products/${productId}/variants/${variantId}`,
    payload
  );
  return res.data;
}

export async function adminDeleteVariant(productId: number, variantId: number): Promise<void> {
  await axiosInstance.delete(`/admin/products/${productId}/variants/${variantId}`);
}

export async function adminAddMedia(
  productId: number,
  payload: { url: string; alt_text?: string | null; sort_order?: number }
): Promise<ProductMedia> {
  const res = await axiosInstance.post<ProductMedia>(`/admin/products/${productId}/media`, payload);
  return res.data;
}

export async function adminUpdateMedia(
  productId: number,
  mediaId: number,
  payload: Partial<{ url: string; alt_text: string | null; sort_order: number }>
): Promise<ProductMedia> {
  const res = await axiosInstance.put<ProductMedia>(
    `/admin/products/${productId}/media/${mediaId}`,
    payload
  );
  return res.data;
}

export async function adminDeleteMedia(productId: number, mediaId: number): Promise<void> {
  await axiosInstance.delete(`/admin/products/${productId}/media/${mediaId}`);
}

export async function adminListCollections(): Promise<Collection[]> {
  const res = await axiosInstance.get<Collection[]>('/admin/collections');
  return res.data;
}

export async function adminListCategories(): Promise<Category[]> {
  const res = await axiosInstance.get<Category[]>('/admin/categories');
  return res.data;
}

export async function adminCreateCategory(payload: {
  name: string;
  description?: string | null;
  image_url?: string | null;
}): Promise<Category> {
  const res = await axiosInstance.post<Category>('/admin/categories', payload);
  return res.data;
}

export async function adminUpdateCategory(
  categoryId: number,
  payload: Partial<{
    name: string;
    description: string | null;
    image_url: string | null;
  }>
): Promise<Category> {
  const res = await axiosInstance.put<Category>(`/admin/categories/${categoryId}`, payload);
  return res.data;
}

export async function adminDeleteCategory(categoryId: number): Promise<void> {
  await axiosInstance.delete(`/admin/categories/${categoryId}`);
}

export async function adminCreateCollection(payload: {
  name: string;
  slug: string;
  description?: string | null;
  hero_image_url?: string | null;
}): Promise<Collection> {
  const res = await axiosInstance.post<Collection>('/admin/collections', payload);
  return res.data;
}

export async function adminUpdateCollection(
  collectionId: number,
  payload: Partial<{
    name: string;
    slug: string;
    description: string | null;
    hero_image_url: string | null;
  }>
): Promise<Collection> {
  const res = await axiosInstance.put<Collection>(`/admin/collections/${collectionId}`, payload);
  return res.data;
}

export async function adminDeleteCollection(collectionId: number): Promise<void> {
  await axiosInstance.delete(`/admin/collections/${collectionId}`);
}

export async function adminCreateStorageUploadUrl(payload: {
  filename: string;
  product_id?: number;
  collection_id?: number;
  category_id?: number;
}): Promise<{
  bucket: string;
  path: string;
  signed_upload_url: string;
  public_url: string;
}> {
  const res = await axiosInstance.post('/admin/storage/upload-url', payload);
  return res.data;
}
