import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { COULEURS } from '@/lib/couleurs';
import { dateCourte } from '@/lib/format';
import type { Soiree } from '@/lib/types';
import { NewSoireeForm } from '@/components/admin/NewSoireeForm';

export default async function AdminHome() {
  const { sb } = await requireAdmin();
  const { data } = await sb.from('soirees').select('*').order('date', { ascending: false });
  const soirees = (data ?? []) as Soiree[];

  return (
    <div className="grid gap-12 pt-8 md:grid-cols-[1fr_360px]">
      <section>
        <h1 className="mb-4 text-xs tracking-[0.14em] text-muted uppercase">Soirées</h1>
        {soirees.length === 0 && <p className="text-muted">Aucune soirée. Crée la première.</p>}
        <ul>
          {soirees.map((s) => (
            <li key={s.id} className="border-t border-line">
              <Link href={`/admin/soiree/${s.id}`} className="flex items-center gap-4 py-3">
                <span className="size-3 flex-none" style={{ background: COULEURS[s.color].hex }} />
                <span className="flex-1 font-title text-xl uppercase">{s.name}</span>
                <span className="text-sm text-muted tabular-nums">{dateCourte(s.date)}</span>
                <span className="w-20 text-right text-sm text-muted tabular-nums">{s.photo_count} ph.</span>
                <span className={`w-20 text-right text-xs font-semibold uppercase ${s.published ? 'text-ink' : 'text-faint'}`}>
                  {s.published ? 'En ligne' : 'Brouillon'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-4 text-xs tracking-[0.14em] text-muted uppercase">Nouvelle soirée</h2>
        <NewSoireeForm />
      </section>
    </div>
  );
}
