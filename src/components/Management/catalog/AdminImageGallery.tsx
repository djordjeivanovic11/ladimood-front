import React from 'react';
import type { ProductMedia } from '@/app/types/types';
import { AdminRemoteImage } from '@/components/Management/catalog/AdminRemoteImage';
import { Button } from '@/components/ui/button';

type AdminImageGalleryProps = {
  title: string;
  media: ProductMedia[];
  productName: string;
  onRemove: (mediaId: number) => void;
};

export function AdminImageGallery({ title, media, productName, onRemove }: AdminImageGalleryProps) {
  const [activeMediaId, setActiveMediaId] = React.useState<number | null>(media[0]?.id ?? null);

  React.useEffect(() => {
    if (!media.length) {
      setActiveMediaId(null);
      return;
    }
    const stillExists = media.some((item) => item.id === activeMediaId);
    if (!stillExists) setActiveMediaId(media[0].id);
  }, [activeMediaId, media]);

  const activeMedia = media.find((item) => item.id === activeMediaId) ?? media[0];

  if (!media.length) {
    return (
      <p className="text-sm text-muted-foreground">Još nema slika. Otpremite u Supabase Storage.</p>
    );
  }

  return (
    <div className="space-y-3">
      <AdminRemoteImage
        src={activeMedia?.url}
        alt={activeMedia?.alt_text ?? productName}
        width={1280}
        height={720}
        className="h-64 w-full rounded-lg border object-cover"
        fallbackClassName="h-64 w-full rounded-lg border border-dashed"
      />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {media.map((item) => {
          const active = item.id === activeMedia?.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveMediaId(item.id)}
              className={`rounded-md border p-1 transition-colors ${active ? 'border-primary' : 'border-border'}`}
            >
              <AdminRemoteImage
                src={item.url}
                alt={item.alt_text ?? productName}
                width={200}
                height={120}
                className="h-16 w-24 rounded object-cover"
                fallbackClassName="h-16 w-24 rounded border border-dashed"
              />
            </button>
          );
        })}
      </div>
      {activeMedia ? (
        <div className="flex items-center justify-between gap-2 text-sm">
          <a
            href={activeMedia.url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-primary underline-offset-4 hover:underline"
          >
            {title}
          </a>
          <Button variant="outline" onClick={() => onRemove(activeMedia.id)}>
            Ukloni
          </Button>
        </div>
      ) : null}
    </div>
  );
}
