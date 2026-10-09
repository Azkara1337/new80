'use client';
import { useState } from 'react';
import type { GalleryPhoto } from '@/lib/types';
import { Viewer } from './Viewer';

export function Gallery({ photos, slug, name }: { photos: GalleryPhoto[]; slug: string; name: string }) {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-[2px] pt-[2px] md:grid-cols-5">
        {photos.map((p, i) => (
          <button key={p.id} onClick={() => setIndex(i)} aria-label={`Photo ${i + 1}`}
            className="aspect-square overflow-hidden" style={{ background: p.color }}>
            <img
              src={p.thumb} alt="" width={p.width} height={p.height}
              loading={i < 15 ? 'eager' : 'lazy'} fetchPriority={i < 6 ? 'high' : 'auto'} decoding="async"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
      {index !== null && (
        <Viewer photos={photos} index={index} onIndex={setIndex} onClose={() => setIndex(null)} slug={slug} name={name} />
      )}
    </>
  );
}
