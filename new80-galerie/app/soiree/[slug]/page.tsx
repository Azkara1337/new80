import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Credit } from '@/components/Credit';
import { Gallery } from '@/components/Gallery';
import { getPhotos, getSoiree } from '@/lib/data';
import { accent } from '@/lib/couleurs';
import { dateLongue, dateMoyenne, publicUrl } from '@/lib/format';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getSoiree((await params).slug);
  if (!s || !s.published) return { title: 'Soirée introuvable – NEW80' };
  const title = `Photos ${s.name} – NEW80 – ${dateMoyenne(s.date)}`;
  const description = `${s.photo_count} photos${s.artist ? ` · Showcase ${s.artist}` : ''}. Retrouve et enregistre les tiennes.`;
  const images = s.cover_key ? [{ url: publicUrl(s.cover_key) }] : undefined;
  return {
    title, description,
    alternates: { canonical: `/soiree/${s.slug}` },
    openGraph: { title, description, images, url: `/soiree/${s.slug}` },
    twitter: { card: 'summary_large_image', title, description, images: images?.map((i) => i.url) },
  };
}

export default async function SoireePage({ params }: Props) {
  const s = await getSoiree((await params).slug);
  if (!s || !s.published) notFound();
  const photos = await getPhotos(s.id);
  const mail = process.env.NEXT_PUBLIC_REMOVAL_EMAIL ?? '';
  const sujet = encodeURIComponent(`Demande de retrait d'une photo – ${s.name} (${dateMoyenne(s.date)})`);
  const corps = encodeURIComponent('Bonjour,\n\nJe souhaite le retrait de la photo suivante (numéro affiché dans la visionneuse ou lien) :\n\n');

  return (
    <main style={accent(s.color)} className="pb-[env(safe-area-inset-bottom)]">
      <header className="bg-[var(--accent)] text-[var(--accent-ink)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 pt-[max(12px,env(safe-area-inset-top))] pb-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex h-11 items-center gap-2 text-sm font-medium hover:text-[var(--accent-ink)]">← Soirées</Link>
            <Logo className="text-xl" />
          </div>
          <div className="flex flex-col gap-2.5">
            {s.artist && <p className="text-xs font-semibold tracking-[0.14em] uppercase">Showcase · {s.artist}</p>}
            <h1 className="font-title text-[60px] leading-[0.92] uppercase md:text-[88px]">{s.name}</h1>
            <p className="text-sm font-medium">{dateLongue(s.date)} · {s.photo_count} photos</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl">
        <Gallery photos={photos} slug={s.slug} name={s.name} />
        <footer className="flex flex-col gap-3.5 px-5 pt-9 pb-10">
          <a href={`mailto:${mail}?subject=${sujet}&body=${corps}`}
            className="text-[13px] text-muted underline underline-offset-[3px]">
            Demander le retrait d'une photo
          </a>
          <Credit />
        </footer>
      </div>
    </main>
  );
}
