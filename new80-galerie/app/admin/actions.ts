'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { deleteObjects } from '@/lib/r2';
import { slugify } from '@/lib/format';
import type { Couleur } from '@/lib/types';

export async function createSoiree(input: { name: string; date: string; color: Couleur; artist: string }) {
  const { sb } = await requireAdmin();
  const name = input.name.trim();
  if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { error: 'Nom et date obligatoires.' };
  if (!['rouge', 'bleu', 'or', 'blanc'].includes(input.color)) return { error: 'Couleur invalide.' };
  const slug = `${slugify(name)}-${input.date}`;
  const { data, error } = await sb.from('soirees')
    .insert({ name, date: input.date, color: input.color, artist: input.artist.trim() || null, slug })
    .select('id').single();
  if (error) return { error: error.code === '23505' ? 'Une soirée avec ce nom et cette date existe déjà.' : error.message };
  return { id: data.id as string };
}

export async function setCover(id: string, cover: { fullKey: string; thumbKey: string; color: string }) {
  const { sb } = await requireAdmin();
  const { data: old } = await sb.from('soirees').select('cover_key,cover_thumb_key').eq('id', id).single();
  await sb.from('soirees').update({ cover_key: cover.fullKey, cover_thumb_key: cover.thumbKey, cover_color: cover.color }).eq('id', id);
  if (old) await deleteObjects([old.cover_key, old.cover_thumb_key].filter(Boolean) as string[]);
  revalidatePath('/admin');
}

export async function setPublished(id: string, published: boolean) {
  const { sb } = await requireAdmin();
  await sb.from('soirees').update({ published, updated_at: new Date().toISOString() }).eq('id', id);
  revalidatePath(`/admin/soiree/${id}`);
}

export async function deletePhoto(photoId: string) {
  const { sb } = await requireAdmin();
  const { data } = await sb.from('photos').select('thumb_key,full_key,soiree_id').eq('id', photoId).single();
  if (!data) return;
  await sb.from('photos').delete().eq('id', photoId);
  await deleteObjects([data.thumb_key, data.full_key]);
  revalidatePath(`/admin/soiree/${data.soiree_id}`);
}

export async function signOut() {
  const { sb } = await requireAdmin();
  await sb.auth.signOut();
  redirect('/admin/login');
}
