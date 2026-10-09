import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { accent } from '@/lib/couleurs';
import { dateLongue, publicUrl } from '@/lib/format';
import type { Photo, Soiree } from '@/lib/types';
import { setPublished } from '@/app/admin/actions';
import { Uploader } from '@/components/admin/Uploader';
import { CoverPicker } from '@/components/admin/CoverPicker';
import { PhotoAdminGrid } from '@/components/admin/PhotoAdminGrid';

export default async function AdminSoiree({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireAdmin();
  const { data: s } = await sb.from('soirees').select('*').eq('id', id).maybeSingle<Soiree>();
  if (!s) notFound();
  const { data } = await sb.from('photos').select('*').eq('soiree_id', id).order('position').range(0, 1999);
  const photos = (data ?? []) as Photo[];
  const nextPosition = photos.length ? photos[photos.length - 1].position + 1 : 0;

  return (
    <div style={accent(s.color)} className="flex flex-col gap-10 pt-8">
      <div className="flex flex-col gap-4 bg-[var(--accent)] p-5 text-[var(--accent-ink)] md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          {s.artist && <p className="text-xs font-semibold tracking-[0.14em] uppercase">Showcase · {s.artist}</p>}
          <h1 className="font-title text-5xl leading-[0.95] uppercase">{s.name}</h1>
          <p className="text-sm font-medium">{dateLongue(s.date)} · {s.photo_count} photos · /soiree/{s.slug}</p>
        </div>
        <div className="flex gap-2">
          {s.published && <Link href={`/soiree/${s.slug}`} target="_blank" className="flex h-11 items-center border border-current px-4 text-sm font-semibold hover:text-[var(--accent-ink)]">Voir</Link>}
          <form action={setPublished.bind(null, s.id, !s.published)}>
            <button className="h-11 bg-noir px-4 text-sm font-semibold text-ink">{s.published ? 'Dépublier' : 'Publier'}</button>
          </form>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-[200px_1fr]">
        <div className="flex flex-col gap-3">
          <h2 className="text-xs tracking-[0.14em] text-muted uppercase">Couverture</h2>
          <CoverPicker soireeId={s.id} current={s.cover_thumb_key ? publicUrl(s.cover_thumb_key) : null} />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-xs tracking-[0.14em] text-muted uppercase">Ajouter des photos</h2>
          <Uploader soireeId={s.id} nextPosition={nextPosition} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs tracking-[0.14em] text-muted uppercase">Photos ({photos.length})</h2>
        <PhotoAdminGrid photos={photos.map((p) => ({ id: p.id, thumb: publicUrl(p.thumb_key), color: p.color }))} />
      </section>
    </div>
  );
}
