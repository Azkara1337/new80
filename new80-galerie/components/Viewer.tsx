'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GalleryPhoto } from '@/lib/types';

type Props = {
  photos: GalleryPhoto[]; index: number; slug: string; name: string;
  onIndex: (i: number) => void; onClose: () => void;
};

const SWIPE_X = 60;
const SWIPE_DOWN = 110;

export function Viewer({ photos, index, onIndex, onClose, slug, name }: Props) {
  const p = photos[index];
  const [drag, setDrag] = useState({ dx: 0, dy: 0, live: false });
  const [toast, setToast] = useState('');
  const g = useRef<{ x: number; y: number; axis: 'x' | 'y' | null } | null>(null);
  const blobs = useRef(new Map<string, Blob>());

  const go = useCallback((d: number) => {
    const n = index + d;
    if (n >= 0 && n < photos.length) onIndex(n);
  }, [index, photos.length, onIndex]);

  // Bouton retour Android / navigateur = fermer
  const close = useCallback(() => history.back(), []);
  useEffect(() => {
    history.pushState({ viewer: true }, '');
    const pop = () => onClose();
    addEventListener('popstate', pop);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { removeEventListener('popstate', pop); document.body.style.overflow = prev; };
  }, [onClose]);

  // Clavier (desktop)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'Escape') close();
    };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [go, close]);

  // Précharge les voisines + récupère le fichier courant à l'avance
  // (iOS exige que navigator.share soit appelé juste après le tap, sans attente réseau).
  useEffect(() => {
    [index + 1, index - 1, index + 2].forEach((i) => {
      if (photos[i]) { const im = new Image(); im.src = photos[i].full; }
    });
    const ctrl = new AbortController();
    if (!blobs.current.has(p.id)) {
      fetch(p.full, { signal: ctrl.signal }).then((r) => r.ok ? r.blob() : null).then((b) => {
        if (!b) return;
        blobs.current.set(p.id, b);
        if (blobs.current.size > 4) blobs.current.delete(blobs.current.keys().next().value!);
      }).catch(() => {});
    }
    return () => ctrl.abort();
  }, [index, p, photos]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600); };

  async function save() {
    const filename = `NEW80-${slug}-${String(index + 1).padStart(3, '0')}.jpg`;
    let blob = blobs.current.get(p.id);
    try {
      if (!blob) blob = await (await fetch(p.full)).blob();
    } catch {
      window.open(p.full, '_blank');
      return;
    }
    const file = new File([blob], filename, { type: 'image/jpeg' });
    const mobile = matchMedia('(pointer: coarse)').matches;
    if (mobile && navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file] }); return; }
      catch (e) { if ((e as Error).name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    flash('Photo téléchargée');
  }

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    g.current = { x: e.clientX, y: e.clientY, axis: null };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = g.current; if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (!s.axis && Math.hypot(dx, dy) > 8) s.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (s.axis === 'x') setDrag({ dx, dy: 0, live: true });
    if (s.axis === 'y') setDrag({ dx: 0, dy: Math.max(0, dy), live: true });
  };
  const onUp = () => {
    const s = g.current; g.current = null; if (!s) return;
    if (s.axis === 'x' && Math.abs(drag.dx) > SWIPE_X) go(drag.dx < 0 ? 1 : -1);
    else if (s.axis === 'y' && drag.dy > SWIPE_DOWN) { close(); return; }
    setDrag({ dx: 0, dy: 0, live: false });
  };

  const prog = Math.min(1, drag.dy / 300);
  const ratio = p.width / p.height;

  return (
    <div
      role="dialog" aria-modal="true" aria-label={`Photo ${index + 1} sur ${photos.length}`}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      className="fixed inset-0 z-50 flex touch-none flex-col select-none"
      style={{ background: `rgba(0,0,0,${1 - prog * 0.85})` }}
    >
      <div className="flex items-center justify-between px-2 pt-[max(8px,env(safe-area-inset-top))]" style={{ opacity: 1 - prog * 1.6 }}>
        <button onClick={close} aria-label="Fermer" className="flex size-11 items-center justify-center text-xl">✕</button>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-semibold tabular-nums">{index + 1} / {photos.length}</span>
          <span className="text-[11px] tracking-[0.12em] text-muted uppercase">{name}</span>
        </div>
        <div className="size-11" />
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <button onClick={() => go(-1)} aria-label="Précédente" className="absolute left-2 z-10 hidden size-11 text-2xl md:block">‹</button>
        <div
          className="relative max-h-full max-w-full"
          style={{
            aspectRatio: `${p.width} / ${p.height}`,
            width: `min(100%, calc((100dvh - 190px) * ${ratio}))`,
            background: p.color,
            transform: `translate(${drag.dx}px, ${drag.dy}px) scale(${1 - prog * 0.25})`,
            transition: drag.live ? 'none' : 'transform 180ms ease-out',
          }}
        >
          <img key={p.id + 't'} src={p.thumb} alt="" className="absolute inset-0 h-full w-full object-contain" />
          <img key={p.id} src={p.full} alt={`Photo ${index + 1}, ${name}`} decoding="async" draggable={false}
            className="absolute inset-0 h-full w-full object-contain" />
        </div>
        <button onClick={() => go(1)} aria-label="Suivante" className="absolute right-2 z-10 hidden size-11 text-2xl md:block">›</button>
      </div>

      <div className="flex flex-col gap-2.5 px-4 pt-3 pb-[max(24px,env(safe-area-inset-bottom))] md:mx-auto md:w-[420px]" style={{ opacity: 1 - prog * 1.6 }}>
        <button onClick={save} className="flex h-[54px] items-center justify-center bg-[var(--accent)] text-base font-semibold text-[var(--accent-ink)]">
          Enregistrer
        </button>
        <p className="text-center text-xs text-faint md:hidden">Glisse vers le bas pour fermer</p>
      </div>

      {toast && <div className="absolute inset-x-4 top-24 bg-ink px-4 py-3.5 text-[13px] font-medium text-noir">{toast}</div>}
    </div>
  );
}
