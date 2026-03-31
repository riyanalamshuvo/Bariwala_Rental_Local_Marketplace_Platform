import Link from 'next/link';

interface BrandLogoProps {
  href?: string;
  compact?: boolean;
  className?: string;
}

export default function BrandLogo({ href = '/', compact = false, className = '' }: BrandLogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`.trim()}>
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 shadow-sm ring-1 ring-indigo-200/70">
        <svg viewBox="0 0 32 32" aria-hidden="true" className="h-5 w-5 text-white">
          <path fill="currentColor" d="M16 5 6 13v13a1 1 0 0 0 1 1h7v-7h4v7h7a1 1 0 0 0 1-1V13L16 5Zm0 3.1 7.6 6.1V25H20v-7a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v7H8.4V14.2L16 8.1Z" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-500">Bariwala</span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">Rental & Market</span>
        </span>
      )}
    </span>
  );

  return (
    <Link href={href} aria-label="Bariwala home" className="inline-flex items-center">
      {content}
    </Link>
  );
}
