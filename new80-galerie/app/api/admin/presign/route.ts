import { getAdmin } from '@/lib/auth';
import { presignPut } from '@/lib/r2';

const UUID = /^[0-9a-f-]{36}$/i;

export async function POST(req: Request) {
  if (!(await getAdmin())) return new Response('Non autorisé', { status: 401 });
  const { soireeId, thumbExt } = await req.json().catch(() => ({}));
  if (!UUID.test(soireeId ?? '') || !['webp', 'jpg'].includes(thumbExt)) return new Response('Requête invalide', { status: 400 });

  const base = `soirees/${soireeId}/${crypto.randomUUID()}`;
  const thumbKey = `${base}-600.${thumbExt}`;
  const fullKey = `${base}-2000.jpg`;
  const [thumbUrl, fullUrl] = await Promise.all([presignPut(thumbKey), presignPut(fullKey)]);
  return Response.json({ thumbKey, fullKey, thumbUrl, fullUrl });
}
