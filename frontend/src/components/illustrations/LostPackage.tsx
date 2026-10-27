import { cx } from "../../lib/bem.ts";

/** Ilustración de un paquete extraviado con una ruta punteada. Es decorativa. */
export function LostPackageIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 200"
      aria-hidden="true"
      focusable="false"
      className={cx("lost-package", className)}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="120" cy="172" rx="66" ry="10" className="lost-package__shadow" />
      <path d="M14 168 C 36 146, 50 176, 74 158" className="lost-package__trail" strokeWidth="3" strokeDasharray="2 9" />
      <polygon points="120,62 172,88 120,114 68,88" className="lost-package__box lost-package__box--top" strokeWidth="3" />
      <polygon points="68,88 120,114 120,166 68,140" className="lost-package__box lost-package__box--left" strokeWidth="3" />
      <polygon points="172,88 120,114 120,166 172,140" className="lost-package__box lost-package__box--right" strokeWidth="3" />
      <path d="M94 75 L146 101" className="lost-package__tape" strokeWidth="8" />
      <circle cx="176" cy="48" r="22" className="lost-package__badge" />
      <path
        d="M168.5 42.5 a7.5 7.5 0 1 1 11 6.6 c-2.4 1.3 -3.5 2.5 -3.5 5.4"
        className="lost-package__mark"
        strokeWidth="4"
      />
      <circle cx="176" cy="60.5" r="2.6" className="lost-package__mark-dot" />
      <circle cx="40" cy="70" r="3" className="lost-package__spark lost-package__spark--bright" />
      <circle cx="204" cy="118" r="2.5" className="lost-package__spark lost-package__spark--deep" />
      <circle cx="58" cy="118" r="2" className="lost-package__spark lost-package__spark--faint" />
    </svg>
  );
}
