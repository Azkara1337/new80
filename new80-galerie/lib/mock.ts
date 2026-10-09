import type { Photo, Soiree } from './types';
import manifest from './photos.json';

// Données fictives en mémoire (maquette, sans base de données).
// Les photos sont servies depuis public/photos/<soirée>/NNN-600.jpg et NNN-2000.jpg.
// Les modifications faites dans l'admin sont perdues au redémarrage du serveur.

type Entry = { n: string; w: number; h: number; c: string };
const PHOTOS = manifest as Record<string, Entry[]>;

const url = (dossier: string, n: string, taille: 600 | 2000) => `/photos/${dossier}/${n}-${taille}.jpg`;

function photos(id: string): Photo[] {
  return PHOTOS[id].map((p, i) => ({
    id: `${id}-${p.n}`, soiree_id: id,
    thumb_key: url(id, p.n, 600), full_key: url(id, p.n, 2000),
    width: p.w, height: p.h, color: p.c, position: i,
  }));
}

function soiree(id: string, name: string, date: string, color: Soiree['color'], artist: string | null): Soiree {
  // Couverture : première photo en portrait, sinon la première.
  const cover = PHOTOS[id].find((p) => p.h > p.w) ?? PHOTOS[id][0];
  return {
    id, slug: `${id}-${date}`, name, date, color, artist,
    cover_key: url(id, cover.n, 2000), cover_thumb_key: url(id, cover.n, 600), cover_color: cover.c,
    published: true, photo_count: PHOTOS[id].length, updated_at: `${date}T23:00:00Z`,
  };
}

type Store = { soirees: Soiree[]; photos: Photo[] };

function seed(): Store {
  const soirees = [
    soiree('pics-02-10', 'NEW80 Friday', '2026-10-02', 'rouge', null),
    soiree('lagui', 'NEW80 x Lagui', '2026-10-03', 'or', 'Lagui'),
    soiree('djaxsparo', 'NEW80 x Djaxsparo', '2026-09-06', 'bleu', 'Djaxsparo'),
  ];
  return { soirees, photos: soirees.flatMap((s) => photos(s.id)) };
}

const g = globalThis as unknown as { __new80?: Store };
export const store: Store = (g.__new80 ??= seed());

export function recount(soireeId: string) {
  const s = store.soirees.find((x) => x.id === soireeId);
  if (s) s.photo_count = store.photos.filter((p) => p.soiree_id === soireeId).length;
}
