import { useId } from "react";

/** Nodo de ruta: punto con aro. */
function Node({ x, y, r = 7, ring = true }: { x: number; y: number; r?: number; ring?: boolean }) {
  return (
    <g>
      {ring ? <circle cx={x} cy={y} r={r + 9} className="fill-aqua-500/15" /> : null}
      <circle cx={x} cy={y} r={r} className="fill-aqua-500 stroke-navy-950" strokeWidth="3" />
    </g>
  );
}

/**
 * Ilustración decorativa del héroe: rutas y nodos sobre una retícula, un
 * paquete y un avión. Las rutas se trazan al cargar; con
 * `prefers-reduced-motion` aparecen ya dibujadas.
 */
export function HeroIllustration({ className }: { className?: string }) {
  const uid = useId();
  const dotsId = `${uid}-dots`;
  const fadeId = `${uid}-fade`;

  return (
    <svg
      viewBox="0 0 560 480"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <pattern id={dotsId} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1.5" className="fill-navy-700" />
        </pattern>
        <radialGradient id={fadeId} cx="50%" cy="50%" r="55%">
          <stop offset="0.55" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`${uid}-mask`}>
          <rect width="560" height="480" fill={`url(#${fadeId})`} />
        </mask>
      </defs>

      <rect width="560" height="480" fill={`url(#${dotsId})`} mask={`url(#${uid}-mask)`} />
      <circle cx="300" cy="230" r="196" className="stroke-navy-700" strokeWidth="1.5" strokeDasharray="3 9" />
      <circle cx="300" cy="230" r="120" className="stroke-navy-700" strokeWidth="1.5" strokeDasharray="3 9" />

      {/* Rutas */}
      <g strokeWidth="3">
        <path
          pathLength="1"
          d="M70 380 C 150 250, 250 340, 330 220"
          className="draw-route stroke-aqua-500"
        />
        <path
          pathLength="1"
          d="M330 220 C 390 130, 470 160, 500 70"
          className="draw-route stroke-aqua-400"
          style={{ animationDelay: "1s" }}
        />
        <path
          pathLength="1"
          d="M70 380 C 190 430, 350 410, 480 300"
          className="draw-route stroke-navy-300"
          style={{ animationDelay: "0.6s" }}
        />
      </g>

      {/* Nodos */}
      <Node x={70} y={380} />
      <Node x={480} y={300} r={6} />
      <Node x={500} y={70} r={6} />

      {/* Paquete isométrico sobre el nodo central */}
      <g transform="translate(330 192)">
        <ellipse cx="0" cy="58" rx="42" ry="9" className="fill-navy-900" />
        <polygon points="0,-6 44,16 0,38 -44,16" className="fill-aqua-100" />
        <polygon points="-44,16 0,38 0,90 -44,68" className="fill-aqua-500" />
        <polygon points="44,16 0,38 0,90 44,68" className="fill-aqua-700" />
        <polygon points="-9,-1 9,-1 53,21 35,21" className="fill-navy-800/20" transform="translate(-22 4) scale(0.98)" />
        <path d="M0 -6 L0 38" className="stroke-navy-800/25" strokeWidth="6" />
        <path d="M-44 16 L0 38 L44 16" className="stroke-navy-800/20" strokeWidth="1.5" />
        <path d="M-30 52 L-16 59" className="stroke-navy-950/40" strokeWidth="3" />
      </g>

      {/* Avión sobre la segunda ruta */}
      <g transform="translate(440 134) rotate(-24) scale(1.15)" className="fill-white">
        <rect x="-26" y="-3.5" width="58" height="7" rx="3.5" />
        <polygon points="8,-3 -10,-30 -17,-30 -6,-3" />
        <polygon points="8,3 -10,30 -17,30 -6,3" />
        <polygon points="-20,-3 -28,-13 -33,-13 -27,-3" />
        <polygon points="-20,3 -28,13 -33,13 -27,3" />
      </g>

      {/* Tarjeta de estados */}
      <g transform="translate(40 60)">
        <rect width="176" height="84" rx="16" className="fill-navy-900 stroke-navy-700" strokeWidth="1.5" />
        <path d="M28 30 H148" className="stroke-navy-700" strokeWidth="3" />
        <path d="M28 30 H88" className="stroke-aqua-500" strokeWidth="3" />
        <circle cx="28" cy="30" r="7" className="fill-aqua-500" />
        <circle cx="88" cy="30" r="7" className="fill-aqua-500" />
        <circle cx="148" cy="30" r="7" className="fill-navy-800 stroke-navy-300" strokeWidth="2" />
        <rect x="24" y="52" width="72" height="8" rx="4" className="fill-navy-700" />
        <rect x="24" y="66" width="44" height="6" rx="3" className="fill-navy-800" />
      </g>
    </svg>
  );
}
