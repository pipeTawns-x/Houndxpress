import { useId } from "react";
import { NETWORK_NODES, NETWORK_ROUTES } from "../../content/coverage.ts";
import { bem, cx } from "../../lib/bem.ts";
import { MAP_HEIGHT as HEIGHT, MAP_WIDTH as WIDTH, arcPath, project } from "../../lib/projection.ts";

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
    <figure className={cx("network-map", className)}>
      <div className="network-map__stage" style={{ aspectRatio: `${String(WIDTH)} / ${String(HEIGHT)}` }}>
        <svg
          viewBox={`0 0 ${String(WIDTH)} ${String(HEIGHT)}`}
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descId}
          className="network-map__svg"
        >
          <title id={titleId}>Mapa de la red de Hound Express</title>
          <desc id={descId}>
            Diez ciudades unidas por rutas: los hubs de Laredo y Miami, cuatro ciudades de México y cuatro de
            Sudamérica.
          </desc>
          <defs>
            <pattern id={dotsId} width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1.4" className="network-map__dot" />
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
                  className="network-map__route"
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
                  <circle cx={point.x} cy={point.y} r={radius + 8} className="network-map__node-halo" />
                ) : null}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={radius}
                  className={bem("network-map__node", { latam: node.kind === "latam" })}
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
              className={bem("network-map__label", node.side, { minor: node.minor })}
              style={{ left: `${String((point.x / WIDTH) * 100)}%`, top: `${String((point.y / HEIGHT) * 100)}%` }}
            >
              {node.label}
            </span>
          );
        })}
      </div>

      <figcaption className="visually-hidden">
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
