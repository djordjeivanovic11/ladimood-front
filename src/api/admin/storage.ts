import axiosInstance from '@/api/axiosInstance';

export type StorageUploadResult = {
  bucket: string;
  path: string;
  signed_upload_url: string;
  public_url: string;
};

export async function adminUploadStorageFile(
  file: File,
  target: {
    product_id?: number;
    collection_id?: number;
    category_id?: number;
  }
): Promise<StorageUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (target.product_id != null) {
    formData.append('product_id', String(target.product_id));
  }
  if (target.collection_id != null) {
    formData.append('collection_id', String(target.collection_id));
  }
  if (target.category_id != null) {
    formData.append('category_id', String(target.category_id));
  }

  const res = await axiosInstance.post<StorageUploadResult>('/admin/storage/upload', formData);
  return res.data;
}
