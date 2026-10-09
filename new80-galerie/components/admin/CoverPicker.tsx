'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setCover } from '@/app/admin/actions';
import { processImage } from '@/lib/image';
import { retry, uploadProcessed } from '@/lib/upload';

export function CoverPicker({ soireeId, current }: { soireeId: string; current: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr('');
    try {
      const img = await processImage(file);
      const keys = await retry(() => uploadProcessed(soireeId, img));
      await setCover(soireeId, { ...keys, color: img.color });
      router.refresh();
    } catch {
      setErr("Échec de l'envoi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="relative flex aspect-[4/5] w-full cursor-pointer items-center justify-center border border-line bg-[#141416] text-sm text-muted">
      {current && <img src={current} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      <span className="relative bg-noir px-3 py-2">{busy ? 'Envoi…' : current ? 'Changer' : 'Choisir'}</span>
      {err && <span className="absolute bottom-2 text-rouge">{err}</span>}
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="sr-only" disabled={busy} />
    </label>
  );
}
