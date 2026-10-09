import type { MetadataRoute } from 'next';
import { getSoireesPubliees } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const soirees = await getSoireesPubliees();
  return [
    { url: `${base}/`, lastModified: soirees[0]?.updated_at ?? new Date(), changeFrequency: 'weekly', priority: 1 },
    ...soirees.map((s) => ({ url: `${base}/soiree/${s.slug}`, lastModified: s.updated_at, changeFrequency: 'monthly' as const, priority: 0.8 })),
  ];
}
