type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({
  compact = false,
  className = ""
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        className="size-10 shrink-0"
        aria-hidden="true"
      >
        <rect width="48" height="48" rx="11" fill="#0a0a0a" stroke="#333" />
        <path
          d="M10 33V15h12c8 0 13 4 13 10s-5 10-13 10h-7"
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m17 29 5-5 5 4 8-10"
          fill="none"
          stroke="#e50914"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="35" cy="18" r="2.4" fill="#ff2432" />
      </svg>
      {compact ? null : (
        <span className="pv-title text-xl tracking-tight sm:text-2xl">
          Poly<span className="text-pv-red">Viewer</span>
        </span>
      )}
    </span>
  );
}
