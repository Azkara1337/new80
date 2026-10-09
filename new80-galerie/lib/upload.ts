'use client';
import type { Processed } from './image';

const toDataUrl = (b: Blob) =>
  new Promise<string>((ok, ko) => {
    const r = new FileReader();
    r.onload = () => ok(r.result as string);
    r.onerror = () => ko(r.error);
    r.readAsDataURL(b);
  });

/** Maquette : pas de stockage R2, la vignette est gardée en data URL (sert aussi de grande version). */
export async function uploadProcessed(_soireeId: string, img: Processed) {
  const thumb = await toDataUrl(img.thumb);
  return { thumbKey: thumb, fullKey: thumb };
}

export async function retry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) { last = e; await new Promise((r) => setTimeout(r, 800 * 2 ** i)); }
  }
  throw last;
}
