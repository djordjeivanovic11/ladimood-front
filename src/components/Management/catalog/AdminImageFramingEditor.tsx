'use client';

import React from 'react';
import type { ProductMedia } from '@/app/types/types';
import { FramedImage } from '@/components/Management/catalog/FramedImage';
import { resolveMediaFraming } from '@/components/Management/catalog/media-frame';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type AdminImageFramingEditorProps = {
  media: ProductMedia;
  productName: string;
  onSave: (patch: { focal_x: number; focal_y: number; zoom: number }) => void;
};

export function AdminImageFramingEditor({
  media,
  productName,
  onSave,
}: AdminImageFramingEditorProps) {
  const initial = resolveMediaFraming(media);
  const [focalX, setFocalX] = React.useState(initial.focalX);
  const [focalY, setFocalY] = React.useState(initial.focalY);
  const [zoom, setZoom] = React.useState(initial.zoom);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const next = resolveMediaFraming(media);
    setFocalX(next.focalX);
    setFocalY(next.focalY);
    setZoom(next.zoom);
  }, [media]);

  const framing = { focal_x: focalX, focal_y: focalY, zoom };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = (event.movementX / rect.width) * 100;
    const deltaY = (event.movementY / rect.height) * 100;
    setFocalX((prev) => Math.min(100, Math.max(0, prev - deltaX)));
    setFocalY((prev) => Math.min(100, Math.max(0, prev - deltaY)));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  const resetFraming = () => {
    setFocalX(50);
    setFocalY(50);
    setZoom(1);
  };

  const hasChanges =
    focalX !== initial.focalX || focalY !== initial.focalY || zoom !== initial.zoom;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Podešavanje prikaza</p>
        <p className="text-xs text-muted-foreground">Povucite sliku za centriranje</p>
      </div>

      <div
        ref={containerRef}
        className={`relative aspect-square w-full max-w-md overflow-hidden rounded-lg border bg-background ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <FramedImage
          src={media.url}
          alt={media.alt_text ?? productName}
          framing={framing}
          containerClassName="h-full w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Zoom ({Math.round(zoom * 100)}%)</Label>
        <input
          type="range"
          min={100}
          max={300}
          step={5}
          value={Math.round(zoom * 100)}
          onChange={(e) => setZoom(Number(e.target.value) / 100)}
          className="w-full"
          aria-label="Zoom slike"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <span>Pozicija X: {Math.round(focalX)}%</span>
        <span>Pozicija Y: {Math.round(focalY)}%</span>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={resetFraming}>
          Resetuj
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!hasChanges}
          onClick={() => onSave({ focal_x: focalX, focal_y: focalY, zoom })}
        >
          Sačuvaj prikaz
        </Button>
      </div>
    </div>
  );
}
