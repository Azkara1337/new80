import { store } from './mock';
import { publicUrl } from './format';
import type { GalleryPhoto, Soiree } from './types';

const parDate = (a: Soiree, b: Soiree) => b.date.localeCompare(a.date);

export async function getSoireesPubliees(): Promise<Soiree[]> {
  return store.soirees.filter((s) => s.published).sort(parDate);
}

export async function getToutesSoirees(): Promise<Soiree[]> {
  return [...store.soirees].sort(parDate);
}

export async function getSoiree(slug: string): Promise<Soiree | null> {
  return store.soirees.find((s) => s.slug === slug) ?? null;
}

export async function getSoireeById(id: string): Promise<Soiree | null> {
  return store.soirees.find((s) => s.id === id) ?? null;
}

export async function getRawPhotos(soireeId: string) {
  return store.photos.filter((p) => p.soiree_id === soireeId).sort((a, b) => a.position - b.position);
}

export async function getPhotos(soireeId: string): Promise<GalleryPhoto[]> {
  return (await getRawPhotos(soireeId)).map((p) => ({
    id: p.id, thumb: publicUrl(p.thumb_key), full: publicUrl(p.full_key), width: p.width, height: p.height, color: p.color,
  }));
}
