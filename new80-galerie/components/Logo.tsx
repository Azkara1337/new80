// Emplacement logo. Quand le fichier officiel arrive : le déposer dans /public/logo.svg et passer LOGO_SRC à '/logo.svg'.
const LOGO_SRC: string | null = null;

export function Logo({ className = 'text-[30px]' }: { className?: string }) {
  if (LOGO_SRC) return <img src={LOGO_SRC} alt="NEW80" className="h-7 w-auto" />;
  return <span className={`font-title leading-none tracking-[0.02em] whitespace-nowrap ${className}`}>NEW80</span>;
}
