import { publicClient } from './supabase/public';
import { publicUrl } from './format';
import type { GalleryPhoto, Photo, Soiree } from './types';

export async function getSoireesPubliees(): Promise<Soiree[]> {
  const { data, error } = await publicClient()
    .from('soirees').select('*').eq('published', true).order('date', { ascending: false });
  if (error) throw error;
  return data as Soiree[];
}

export async function getSoiree(slug: string): Promise<Soiree | null> {
  const { data, error } = await publicClient().from('soirees').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data as Soiree | null;
}

export async function getPhotos(soireeId: string): Promise<GalleryPhoto[]> {
  const { data, error } = await publicClient()
    .from('photos').select('id,thumb_key,full_key,width,height,color,position')
    .eq('soiree_id', soireeId).order('position').range(0, 1999);
  if (error) throw error;
  return (data as Photo[]).map((p) => ({
    id: p.id, thumb: publicUrl(p.thumb_key), full: publicUrl(p.full_key), width: p.width, height: p.height, color: p.color,
  }));
}
