'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { recount, store } from '@/lib/mock';
import { slugify } from '@/lib/format';
import type { Couleur } from '@/lib/types';

export async function createSoiree(input: { name: string; date: string; color: Couleur; artist: string }) {
  const name = input.name.trim();
  if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { error: 'Nom et date obligatoires.' };
  if (!['rouge', 'bleu', 'or', 'blanc'].includes(input.color)) return { error: 'Couleur invalide.' };
  const slug = `${slugify(name)}-${input.date}`;
  if (store.soirees.some((s) => s.slug === slug)) return { error: 'Une soirée avec ce nom et cette date existe déjà.' };
  const id = crypto.randomUUID();
  store.soirees.push({
    id, slug, name, date: input.date, color: input.color, artist: input.artist.trim() || null,
    cover_key: null, cover_thumb_key: null, cover_color: null, published: false, photo_count: 0,
    updated_at: new Date().toISOString(),
  });
  return { id };
}

export async function setCover(id: string, cover: { fullKey: string; thumbKey: string; color: string }) {
  const s = store.soirees.find((x) => x.id === id);
  if (s) Object.assign(s, { cover_key: cover.fullKey, cover_thumb_key: cover.thumbKey, cover_color: cover.color });
  revalidatePath('/admin');
}

export async function addPhoto(soireeId: string, p: { thumbKey: string; fullKey: string; width: number; height: number; color: string; position: number }) {
  store.photos.push({
    id: crypto.randomUUID(), soiree_id: soireeId, thumb_key: p.thumbKey, full_key: p.fullKey,
    width: p.width, height: p.height, color: p.color, position: p.position,
  });
  recount(soireeId);
}

export async function setPublished(id: string, published: boolean) {
  const s = store.soirees.find((x) => x.id === id);
  if (s) Object.assign(s, { published, updated_at: new Date().toISOString() });
  revalidatePath(`/admin/soiree/${id}`);
}

export async function deletePhoto(photoId: string) {
  const i = store.photos.findIndex((p) => p.id === photoId);
  if (i < 0) return;
  const [p] = store.photos.splice(i, 1);
  recount(p.soiree_id);
  revalidatePath(`/admin/soiree/${p.soiree_id}`);
}

export async function signOut() {
  redirect('/');
}
