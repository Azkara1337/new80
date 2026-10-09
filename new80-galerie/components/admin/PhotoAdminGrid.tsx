'use client';
import { useState, useTransition } from 'react';
import { deletePhoto } from '@/app/admin/actions';

export function PhotoAdminGrid({ photos }: { photos: { id: string; thumb: string; color: string }[] }) {
  const [pending, start] = useTransition();
  const [gone, setGone] = useState<Set<string>>(new Set());

  function remove(id: string, n: number) {
    if (!confirm(`Supprimer définitivement la photo ${n} ?`)) return;
    setGone((s) => new Set(s).add(id));
    start(() => deletePhoto(id));
  }

  if (!photos.length) return <p className="text-muted">Aucune photo pour l'instant.</p>;

  return (
    <div className="grid grid-cols-3 gap-[2px] md:grid-cols-6">
      {photos.filter((p) => !gone.has(p.id)).map((p) => {
        const n = photos.indexOf(p) + 1;
        return (
          <div key={p.id} className="group relative aspect-square" style={{ background: p.color }}>
            <img src={p.thumb} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <span className="absolute top-1 left-1 bg-noir px-1.5 text-[11px] tabular-nums">{n}</span>
            <button onClick={() => remove(p.id, n)} disabled={pending} aria-label={`Supprimer la photo ${n}`}
              className="absolute right-1 bottom-1 bg-noir px-2 py-1 text-xs font-semibold text-rouge md:opacity-0 md:group-hover:opacity-100">
              Supprimer
            </button>
          </div>
        );
      })}
    </div>
  );
}
