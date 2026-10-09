'use client';
import type { Processed } from './image';

async function put(url: string, body: Blob, type: string) {
  const r = await fetch(url, {
    method: 'PUT',
    body,
    headers: { 'content-type': type, 'cache-control': 'public, max-age=31536000, immutable' },
  });
  if (!r.ok) throw new Error(`Envoi R2 refusé (${r.status})`);
}

/** Demande deux URL signées puis envoie vignette + grande version directement vers R2. */
export async function uploadProcessed(soireeId: string, img: Processed) {
  const res = await fetch('/api/admin/presign', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ soireeId, thumbExt: img.thumbExt }),
  });
  if (!res.ok) throw new Error(`Signature refusée (${res.status})`);
  const { thumbKey, fullKey, thumbUrl, fullUrl } = await res.json();
  await Promise.all([put(thumbUrl, img.thumb, img.thumbType), put(fullUrl, img.full, 'image/jpeg')]);
  return { thumbKey: thumbKey as string, fullKey: fullKey as string };
}

export async function retry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) { last = e; await new Promise((r) => setTimeout(r, 800 * 2 ** i)); }
  }
  throw last;
}
