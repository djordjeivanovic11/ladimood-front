'use client';

import React from 'react';
import { ExternalLink, GripVertical, ImageIcon, Trash2 } from 'lucide-react';
import type { ProductMedia } from '@/app/types/types';
import { AdminImageFramingEditor } from '@/components/Management/catalog/AdminImageFramingEditor';
import { sortProductMediaList } from '@/components/Management/catalog/catalog-image';
import { FramedImage } from '@/components/Management/catalog/FramedImage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AdminImageGalleryProps = {
  title: string;
  media: ProductMedia[];
  productName: string;
  onRemove: (mediaId: number) => void | Promise<void>;
  onReorder: (mediaIds: number[]) => void | Promise<void>;
  onSaveFraming: (
    mediaId: number,
    patch: { focal_x: number; focal_y: number; zoom: number }
  ) => void;
};

function reorderMedia(media: ProductMedia[], fromIndex: number, toIndex: number) {
  const next = [...media];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function AdminImageGallery({
  title,
  media,
  productName,
  onRemove,
  onReorder,
  onSaveFraming,
}: AdminImageGalleryProps) {
  const [orderedMedia, setOrderedMedia] = React.useState(() => sortProductMediaList(media));
  const [activeMediaId, setActiveMediaId] = React.useState<number | null>(media[0]?.id ?? null);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dropIndex, setDropIndex] = React.useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<number | null>(null);
  const [isReordering, setIsReordering] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

  React.useEffect(() => {
    const nextMedia = sortProductMediaList(media);
    setOrderedMedia(nextMedia);
    setPendingDeleteId(null);

    setActiveMediaId((current) => {
      if (!nextMedia.length) return null;
      if (current && nextMedia.some((item) => item.id === current)) return current;
      return nextMedia[0].id;
    });
  }, [media]);

  const activeMedia =
    orderedMedia.find((item) => item.id === activeMediaId) ?? orderedMedia[0] ?? null;

  const persistOrder = async (nextMedia: ProductMedia[]) => {
    const previousMedia = orderedMedia;
    setOrderedMedia(nextMedia);
    setIsReordering(true);

    try {
      await onReorder(nextMedia.map((item) => item.id));
    } catch {
      setOrderedMedia(previousMedia);
    } finally {
      setIsReordering(false);
    }
  };

  const handleDrop = async (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDropIndex(null);
      return;
    }

    const nextMedia = reorderMedia(orderedMedia, draggedIndex, targetIndex);
    setDraggedIndex(null);
    setDropIndex(null);
    await persistOrder(nextMedia);
  };

  const handleRemove = async (mediaId: number) => {
    setIsRemoving(true);
    try {
      await onRemove(mediaId);
      setPendingDeleteId(null);
    } finally {
      setIsRemoving(false);
    }
  };

  if (!orderedMedia.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Još nema slika. Otpremite fotografije proizvoda iznad.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeMedia ? (
        <AdminImageFramingEditor
          media={activeMedia}
          productName={productName}
          onSave={(patch) => onSaveFraming(activeMedia.id, patch)}
        />
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Redoslijed slika</p>
          <p className="text-xs text-muted-foreground">
            {isReordering ? 'Spremanje redoslijeda…' : 'Prevucite za promjenu redoslijeda'}
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {orderedMedia.map((item, index) => {
            const isActive = item.id === activeMedia?.id;
            const isDragging = draggedIndex === index;
            const isDropTarget = dropIndex === index && draggedIndex !== index;
            const isPendingDelete = pendingDeleteId === item.id;

            return (
              <div
                key={item.id}
                draggable={!isReordering && !isRemoving && !isPendingDelete}
                onDragStart={() => setDraggedIndex(index)}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDropIndex(null);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropIndex(index);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  void handleDrop(index);
                }}
                className={cn(
                  'group relative w-28 shrink-0 rounded-xl transition-all',
                  isDragging && 'scale-[0.98] opacity-50',
                  isDropTarget && 'ring-2 ring-primary/40 ring-offset-2'
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveMediaId(item.id);
                    setPendingDeleteId(null);
                  }}
                  className={cn(
                    'relative w-full overflow-hidden rounded-xl border bg-background text-left shadow-sm transition-all hover:shadow-md',
                    isActive
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border hover:border-primary/40'
                  )}
                  aria-label={`Odaberi sliku ${index + 1}`}
                >
                  <FramedImage
                    src={item.url}
                    alt={item.alt_text ?? productName}
                    framing={item}
                    containerClassName="aspect-[4/5] w-full"
                  />

                  <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground shadow-sm">
                    {index === 0 ? 'Naslovna' : `#${index + 1}`}
                  </span>

                  <span
                    className="absolute bottom-2 left-2 flex cursor-grab touch-none items-center rounded-md bg-background/90 p-1 text-muted-foreground shadow-sm active:cursor-grabbing"
                    aria-hidden
                    onClick={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </span>
                </button>

                {isPendingDelete ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/95 p-2 text-center backdrop-blur-sm">
                    <p className="text-xs font-medium">Ukloniti sliku?</p>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2 text-xs"
                        disabled={isRemoving}
                        onClick={() => void handleRemove(item.id)}
                      >
                        Ukloni
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        disabled={isRemoving}
                        onClick={() => setPendingDeleteId(null)}
                      >
                        Otkaži
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-muted-foreground opacity-0 shadow-sm transition-all hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                    aria-label={`Ukloni sliku ${index + 1}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setPendingDeleteId(item.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {activeMedia ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2 text-sm">
          <a
            href={activeMedia.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-0 items-center gap-2 truncate text-primary underline-offset-4 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{title}</span>
          </a>
          <span className="shrink-0 text-xs text-muted-foreground">
            Prva slika se prikazuje u prodavnici
          </span>
        </div>
      ) : null}
    </div>
  );
}
