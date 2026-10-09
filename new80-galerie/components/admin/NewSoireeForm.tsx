'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSoiree, setCover } from '@/app/admin/actions';
import { COULEURS } from '@/lib/couleurs';
import { processImage } from '@/lib/image';
import { retry, uploadProcessed } from '@/lib/upload';
import type { Couleur } from '@/lib/types';

const input = 'h-12 w-full border border-line bg-transparent px-3.5 outline-none focus:border-ink';

export function NewSoireeForm() {
  const router = useRouter();
  const [color, setColor] = useState<Couleur>('rouge');
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr('');
    const f = new FormData(e.currentTarget);
    const cover = f.get('cover') as File | null;
    setStatus('Création…');
    const res = await createSoiree({ name: String(f.get('name')), date: String(f.get('date')), artist: String(f.get('artist') ?? ''), color });
    if ('error' in res) { setStatus(''); return setErr(res.error!); }
    if (cover && cover.size) {
      try {
        setStatus('Envoi de la couverture…');
        const img = await processImage(cover);
        const keys = await retry(() => uploadProcessed(res.id!, img));
        await setCover(res.id!, { ...keys, color: img.color });
      } catch {
        setErr('Soirée créée, mais la couverture a échoué. Réessaie depuis la page de la soirée.');
      }
    }
    router.push(`/admin/soiree/${res.id}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input name="name" required placeholder="Nom de la soirée" className={input} />
      <input name="date" type="date" required className={`${input} [color-scheme:dark]`} />
      <input name="artist" placeholder="Artiste (si showcase)" className={input} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm text-muted">Couleur</legend>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(COULEURS) as Couleur[]).map((c) => (
            <button type="button" key={c} onClick={() => setColor(c)} aria-pressed={color === c}
              className={`flex h-12 items-end p-2 text-xs font-semibold ${color === c ? 'outline-2 outline-offset-2 outline-ink' : ''}`}
              style={{ background: COULEURS[c].hex, color: COULEURS[c].ink }}>
              {COULEURS[c].label}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-2 text-sm text-muted">
        Photo de couverture
        <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm text-ink file:mr-3 file:h-10 file:border-0 file:bg-line file:px-3 file:text-ink" />
      </label>
      {err && <p className="text-sm text-rouge">{err}</p>}
      <button disabled={!!status} className="mt-2 h-12 bg-ink font-semibold text-noir disabled:opacity-50">{status || 'Créer la soirée'}</button>
    </form>
  );
}
