import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Credit } from '@/components/Credit';
import { getSoireesPubliees } from '@/lib/data';
import { accent, COULEURS } from '@/lib/couleurs';
import { dateCourte, dateLongue, publicUrl } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Accueil() {
  const soirees = await getSoireesPubliees();
  const [derniere, ...precedentes] = soirees;

  return (
    <main className="mx-auto max-w-5xl pb-[env(safe-area-inset-bottom)]">
      <header className="flex items-center justify-between px-5 pt-[max(20px,env(safe-area-inset-top))] pb-4 md:pt-8">
        <Logo />
        <span className="text-xs tracking-[0.14em] text-muted uppercase">Photos</span>
      </header>

      {!derniere && <p className="px-5 py-20 text-muted">Aucune soirée publiée pour l'instant.</p>}

      {derniere && (
        <Link href={`/soiree/${derniere.slug}`} style={accent(derniere.color)}
          className="flex flex-col gap-3.5 px-4 md:grid md:grid-cols-[1.1fr_1fr] md:items-end md:gap-10">
          <div className="relative aspect-[4/5] w-full" style={{ background: derniere.cover_color ?? '#1a1a1c' }}>
            {derniere.cover_key && (
              <img
                src={publicUrl(derniere.cover_key)}
                srcSet={derniere.cover_thumb_key ? `${publicUrl(derniere.cover_thumb_key)} 600w, ${publicUrl(derniere.cover_key)} 2000w` : undefined}
                sizes="(min-width: 768px) 520px, 100vw"
                alt="" fetchPriority="high" decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <span className="absolute top-3 left-3 bg-[var(--accent)] px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-[var(--accent-ink)] uppercase">
              Dernière soirée
            </span>
          </div>
          <div className="flex flex-col gap-2 px-1">
            <h1 className="font-title text-[52px] leading-[0.95] uppercase md:text-[72px]">{derniere.name}</h1>
            <p className="flex items-center gap-2.5 text-sm text-[#c9c6be]">
              <span>{dateLongue(derniere.date)}</span>
              <span className="size-1 bg-[var(--accent)]" />
              <span>{derniere.photo_count} photos</span>
            </p>
            <span className="mt-1.5 flex h-[52px] items-center justify-center bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)]">
              Voir les photos
            </span>
          </div>
        </Link>
      )}

      {precedentes.length > 0 && (
        <section className="mt-11">
          <h2 className="px-5 pb-3 text-xs tracking-[0.14em] text-muted uppercase">Soirées précédentes</h2>
          <ul>
            {precedentes.map((s) => (
              <li key={s.id} className="border-t border-line">
                <Link href={`/soiree/${s.slug}`} className="flex items-center gap-3.5 px-5 py-2.5">
                  <div className="relative h-[70px] w-14 flex-none border-l-[3px]"
                    style={{ background: s.cover_color ?? '#1a1a1c', borderColor: COULEURS[s.color].hex }}>
                    {s.cover_thumb_key && (
                      <img src={publicUrl(s.cover_thumb_key)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-title text-[22px] leading-[1.05] uppercase">{s.name}</span>
                    <span className="text-[13px] text-muted">{dateCourte(s.date)} · {s.photo_count} photos</span>
                  </div>
                  <span className="text-[22px] text-faint">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-10 border-t border-line px-5 py-10">
        <Credit />
      </footer>
    </main>
  );
}
