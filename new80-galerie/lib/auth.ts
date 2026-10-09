import { redirect } from 'next/navigation';
import { serverClient } from './supabase/server';

export async function getAdmin() {
  const sb = await serverClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: ok } = await sb.rpc('is_admin');
  return ok ? { sb, user } : null;
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}
