import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { signOut } from '../actions';
import { Logo } from '@/components/Logo';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin – NEW80', robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div className="mx-auto max-w-5xl px-5 pb-16">
      <header className="flex items-center justify-between border-b border-line py-5">
        <Link href="/admin" className="flex items-baseline gap-3"><Logo className="text-2xl" /><span className="text-xs tracking-[0.14em] text-muted uppercase">Admin</span></Link>
        <form action={signOut} className="flex items-center gap-4 text-sm text-muted">
          <span className="hidden md:inline">{user.email}</span>
          <button className="underline underline-offset-[3px]">Quitter</button>
        </form>
      </header>
      {children}
    </div>
  );
}
