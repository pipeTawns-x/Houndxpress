/** Ilustración de un paquete extraviado con una ruta punteada. Es decorativa. */
export function LostPackageIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 200"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="120" cy="172" rx="66" ry="10" className="fill-line" />
      <path d="M14 168 C 36 146, 50 176, 74 158" className="stroke-edge" strokeWidth="3" strokeDasharray="2 9" />
      <polygon points="120,62 172,88 120,114 68,88" className="fill-aqua-100 stroke-navy-800" strokeWidth="3" />
      <polygon points="68,88 120,114 120,166 68,140" className="fill-aqua-500 stroke-navy-800" strokeWidth="3" />
      <polygon points="172,88 120,114 120,166 172,140" className="fill-aqua-700 stroke-navy-800" strokeWidth="3" />
      <path d="M94 75 L146 101" className="stroke-navy-800/30" strokeWidth="8" />
      <circle cx="176" cy="48" r="22" className="fill-navy-800" />
      <path
        d="M168.5 42.5 a7.5 7.5 0 1 1 11 6.6 c-2.4 1.3 -3.5 2.5 -3.5 5.4"
        className="stroke-white"
        strokeWidth="4"
      />
      <circle cx="176" cy="60.5" r="2.6" className="fill-white" />
      <circle cx="40" cy="70" r="3" className="fill-aqua-500" />
      <circle cx="204" cy="118" r="2.5" className="fill-aqua-700" />
      <circle cx="58" cy="118" r="2" className="fill-navy-300" />
    </svg>
  );
}
