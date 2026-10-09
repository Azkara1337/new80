import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-start justify-center gap-6 px-5">
      <Logo />
      <p className="text-muted">Cette soirée n'existe pas ou n'est plus en ligne.</p>
      <Link href="/" className="underline underline-offset-[3px]">Voir toutes les soirées</Link>
    </main>
  );
}
