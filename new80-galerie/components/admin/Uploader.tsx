'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { browserClient } from '@/lib/supabase/browser';
import { processImage } from '@/lib/image';
import { retry, uploadProcessed } from '@/lib/upload';

type Item = { file: File; position: number; status: 'attente' | 'envoi' | 'ok' | 'erreur'; error?: string };
const CONCURRENCE = 3;
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

export function Uploader({ soireeId, nextPosition }: { soireeId: string; nextPosition: number }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const pos = useRef(nextPosition);
  const itemsRef = useRef<Item[]>([]);

  const update = (i: number, patch: Partial<Item>) => {
    itemsRef.current = itemsRef.current.map((it, j) => (j === i ? { ...it, ...patch } : it));
    setItems(itemsRef.current);
  };

  function add(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => ACCEPT.includes(f.type))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    const fresh = list.map((file) => ({ file, position: pos.current++, status: 'attente' as const }));
    itemsRef.current = [...itemsRef.current, ...fresh];
    setItems(itemsRef.current);
    run();
  }

  async function one(i: number) {
    const it = itemsRef.current[i];
    update(i, { status: 'envoi', error: undefined });
    try {
      const img = await processImage(it.file);
      const keys = await retry(() => uploadProcessed(soireeId, img));
      await retry(async () => {
        const { error } = await browserClient().from('photos').insert({
          soiree_id: soireeId, thumb_key: keys.thumbKey, full_key: keys.fullKey,
          width: img.width, height: img.height, color: img.color, position: it.position,
        });
        if (error) throw error;
      });
      update(i, { status: 'ok' });
    } catch (e) {
      update(i, { status: 'erreur', error: (e as Error).message });
    }
  }

  async function run() {
    if (running) return;
    setRunning(true);
    const worker = async () => {
      for (;;) {
        const i = itemsRef.current.findIndex((it) => it.status === 'attente');
        if (i < 0) return;
        await one(i);
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCE }, worker));
    setRunning(false);
    router.refresh();
  }

  function retryFailed() {
    itemsRef.current = itemsRef.current.map((it) => (it.status === 'erreur' ? { ...it, status: 'attente' } : it));
    setItems(itemsRef.current);
    run();
  }

  const total = items.length;
  const done = items.filter((i) => i.status === 'ok').length;
  const failed = items.filter((i) => i.status === 'erreur');

  return (
    <div className="flex flex-col gap-4">
      <label
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
        className={`flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed p-6 text-center ${over ? 'border-ink bg-[#141416]' : 'border-[#3a3a3e]'}`}
      >
        <span className="font-semibold">Glisse les photos ici</span>
        <span className="text-sm text-muted">ou clique pour choisir · JPEG, PNG, WebP · compressées dans le navigateur avant envoi</span>
        <input type="file" multiple accept={ACCEPT.join(',')} className="sr-only" onChange={(e) => e.target.files && add(e.target.files)} />
      </label>

      {total > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm tabular-nums">
            <span>{done} / {total} envoyées</span>
            {running && <span className="text-muted">Ne ferme pas cette page…</span>}
          </div>
          <div className="h-1.5 w-full bg-line">
            <div className="h-full bg-[var(--accent)]" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          {failed.length > 0 && !running && (
            <div className="flex flex-col gap-2 pt-2">
              <p className="text-sm text-rouge">{failed.length} photo(s) en échec : {failed.slice(0, 3).map((f) => f.file.name).join(', ')}{failed.length > 3 ? '…' : ''}</p>
              <button onClick={retryFailed} className="h-11 self-start bg-ink px-4 text-sm font-semibold text-noir">Relancer les échecs</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
