'use client';

import React from 'react';
import type { ProductMedia } from '@/app/types/types';
import { AdminImageFramingEditor } from '@/components/Management/catalog/AdminImageFramingEditor';
import { FramedImage } from '@/components/Management/catalog/FramedImage';
import { Button } from '@/components/ui/button';

type AdminImageGalleryProps = {
  title: string;
  media: ProductMedia[];
  productName: string;
  onRemove: (mediaId: number) => void;
  onMoveMedia: (mediaId: number, direction: 'left' | 'right') => void;
  onSaveFraming: (
    mediaId: number,
    patch: { focal_x: number; focal_y: number; zoom: number }
  ) => void;
};

export function AdminImageGallery({
  title,
  media,
  productName,
  onRemove,
  onMoveMedia,
  onSaveFraming,
}: AdminImageGalleryProps) {
  const [activeMediaId, setActiveMediaId] = React.useState<number | null>(media[0]?.id ?? null);
  const [isMediaSettingsOpen, setIsMediaSettingsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!media.length) {
      setActiveMediaId(null);
      return;
    }
    const stillExists = media.some((item) => item.id === activeMediaId);
    if (!stillExists) setActiveMediaId(media[0].id);
    setIsMediaSettingsOpen(false);
  }, [activeMediaId, media]);

  const activeMedia = media.find((item) => item.id === activeMediaId) ?? media[0];

  if (!media.length) {
    return (
      <p className="text-sm text-muted-foreground">Još nema slika. Otpremite u Supabase Storage.</p>
    );
  }

  return (
    <div className="space-y-3">
      {activeMedia ? (
        <AdminImageFramingEditor
          media={activeMedia}
          productName={productName}
          onSave={(patch) => onSaveFraming(activeMedia.id, patch)}
        />
      ) : null}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {media.map((item) => {
          const active = item.id === activeMedia?.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveMediaId(item.id)}
              aria-label={`Odaberi sliku ${item.id}`}
              title={`Odaberi sliku ${item.id}`}
              className={`rounded-md border p-1 transition-colors ${active ? 'border-primary' : 'border-border'}`}
            >
              <FramedImage
                src={item.url}
                alt={item.alt_text ?? productName}
                framing={item}
                containerClassName="h-16 w-24 rounded"
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
          <Button
            variant="outline"
            onClick={() => setIsMediaSettingsOpen((prev) => !prev)}
            aria-expanded={isMediaSettingsOpen}
          >
            Podešavanja slike
          </Button>
        </div>
      ) : null}
      {activeMedia && isMediaSettingsOpen ? (
        <div className="grid gap-2 rounded-md border bg-muted/30 p-2 sm:grid-cols-3">
          <Button variant="outline" onClick={() => onMoveMedia(activeMedia.id, 'left')}>
            Pomjeri lijevo
          </Button>
          <Button variant="outline" onClick={() => onMoveMedia(activeMedia.id, 'right')}>
            Pomjeri desno
          </Button>
          <Button variant="outline" onClick={() => onRemove(activeMedia.id)}>
            Ukloni
          </Button>
        </div>
      ) : null}
    </div>
  );
}
