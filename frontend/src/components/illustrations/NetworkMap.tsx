import { useId } from "react";
import { NETWORK_NODES, NETWORK_ROUTES } from "../../content/coverage.ts";
import type { NetworkNode } from "../../content/coverage.ts";
import { MAP_HEIGHT as HEIGHT, MAP_WIDTH as WIDTH, arcPath, project } from "../../lib/projection.ts";

const SIDE_CLASSES: Record<NetworkNode["side"], string> = {
  left: "-translate-x-full -translate-y-1/2 pr-2.5",
  right: "-translate-y-1/2 pl-2.5",
  top: "-translate-x-1/2 -translate-y-full pb-2",
  bottom: "-translate-x-1/2 pt-2",
};

/**
 * Mapa de la red: retícula de puntos y nodos en las coordenadas reales de cada
 * ciudad (proyección equirrectangular) unidos por arcos desde Miami y Laredo.
 * Las etiquetas son HTML para que conserven su tamaño legible en móvil.
 */
export function NetworkMap({ className }: { className?: string }) {
  const uid = useId();
  const dotsId = `${uid}-dots`;
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const points = new Map(NETWORK_NODES.map((node) => [node.id, project(node.lat, node.lon)]));

  return (
    <figure
      className={[
        "on-dark relative m-0 overflow-hidden rounded-3xl bg-navy-950 ring-1 ring-navy-700",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative m-2 sm:m-3" style={{ aspectRatio: `${String(WIDTH)} / ${String(HEIGHT)}` }}>
        <svg
          viewBox={`0 0 ${String(WIDTH)} ${String(HEIGHT)}`}
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descId}
          className="absolute inset-0 size-full"
        >
          <title id={titleId}>Mapa de la red de Hound Express</title>
          <desc id={descId}>
            Diez ciudades unidas por rutas: los hubs de Laredo y Miami, cuatro ciudades de México y cuatro de
            Sudamérica.
          </desc>
          <defs>
            <pattern id={dotsId} width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1.4" className="fill-navy-700" />
            </pattern>
            <radialGradient id={`${uid}-glow`} cx="30%" cy="20%" r="70%">
              <stop offset="0" stopColor="#4cbed8" stopOpacity="0.16" />
              <stop offset="1" stopColor="#4cbed8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={WIDTH} height={HEIGHT} fill={`url(#${dotsId})`} />
          <rect width={WIDTH} height={HEIGHT} fill={`url(#${uid}-glow)`} />

          <g fill="none" strokeLinecap="round">
            {NETWORK_ROUTES.map(([fromId, toId]) => {
              const from = points.get(fromId);
              const to = points.get(toId);
              if (!from || !to) return null;
              return (
                <path
                  key={`${fromId}-${toId}`}
                  d={arcPath(from, to)}
                  className="animate-route-flow stroke-aqua-500"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  opacity="0.85"
                />
              );
            })}
          </g>

          {NETWORK_NODES.map((node) => {
            const point = points.get(node.id);
            if (!point) return null;
            const radius = node.primary ? 9 : 6;
            return (
              <g key={node.id}>
                {node.primary ? (
                  <circle cx={point.x} cy={point.y} r={radius + 8} className="fill-aqua-500/20" />
                ) : null}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={radius}
                  className={node.kind === "latam" ? "fill-navy-950 stroke-aqua-400" : "fill-aqua-500 stroke-navy-950"}
                  strokeWidth={node.kind === "latam" ? 3 : 2.5}
                />
              </g>
            );
          })}
        </svg>

        {NETWORK_NODES.map((node) => {
          const point = points.get(node.id);
          if (!point || node.label === null) return null;
          return (
            <span
              key={node.id}
              aria-hidden="true"
              className={[
                "absolute font-sans text-[11px] leading-none font-semibold whitespace-nowrap text-white [text-shadow:0_0_4px_var(--color-navy-950),0_0_8px_var(--color-navy-950)] sm:text-sm",
                SIDE_CLASSES[node.side],
                node.minor ? "hidden sm:block" : "",
              ].join(" ")}
              style={{ left: `${String((point.x / WIDTH) * 100)}%`, top: `${String((point.y / HEIGHT) * 100)}%` }}
            >
              {node.label}
            </span>
          );
        })}
      </div>

      <figcaption className="sr-only">
        Ciudades de la red de Hound Express:
        <ul>
          {NETWORK_NODES.map((node) => (
            <li key={node.id}>
              {node.name}: {node.role}.
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
