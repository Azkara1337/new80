const toDate = (d: string) => new Date(`${d}T12:00:00Z`);

/** « Samedi 3 octobre 2026 » */
export function dateLongue(d: string) {
  const s = toDate(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** « 3 octobre 2026 » */
export function dateMoyenne(d: string) {
  return toDate(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
}

/** « 03.10.2026 » */
export function dateCourte(d: string) {
  const [y, m, j] = d.split('-');
  return `${j}.${m}.${y}`;
}

export function slugify(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Les clés de la maquette sont déjà des URL (chemins /photos/…, data:).
export const publicUrl = (key: string) =>
  /^(https?:|data:|blob:|\/)/.test(key) ? key : `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
