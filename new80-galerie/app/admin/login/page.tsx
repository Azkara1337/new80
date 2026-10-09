'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { browserClient } from '@/lib/supabase/browser';
import { Logo } from '@/components/Logo';

export default function Login() {
  const router = useRouter();
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setErr('');
    const f = new FormData(e.currentTarget);
    const { error } = await browserClient().auth.signInWithPassword({ email: String(f.get('email')), password: String(f.get('password')) });
    setBusy(false);
    if (error) return setErr('Identifiants incorrects.');
    router.replace('/admin');
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 px-5">
      <div className="flex items-baseline gap-3"><Logo /><span className="text-xs tracking-[0.14em] text-muted uppercase">Admin</span></div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input name="email" type="email" required autoComplete="email" placeholder="E-mail" className="h-12 border border-line bg-transparent px-3.5 outline-none focus:border-ink" />
        <input name="password" type="password" required autoComplete="current-password" placeholder="Mot de passe" className="h-12 border border-line bg-transparent px-3.5 outline-none focus:border-ink" />
        {err && <p className="text-sm text-rouge">{err}</p>}
        <button disabled={busy} className="mt-2 h-12 bg-ink font-semibold text-noir disabled:opacity-50">{busy ? 'Connexion…' : 'Se connecter'}</button>
      </form>
      <p className="text-xs text-faint">Accès réservé à l'équipe. Si tu n'arrives pas à te connecter, demande à l'administrateur de t'ajouter à la liste des comptes autorisés.</p>
    </main>
  );
}
