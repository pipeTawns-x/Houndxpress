/** Recuadro geográfico del mapa de red: del norte de México al sur de Sudamérica (grados). */
export const MAP_BOUNDS = { lonMin: -124, lonMax: -36, latMax: 36, latMin: -40 } as const;

const UNITS_PER_DEGREE = 10;

/** Ancho y alto del `viewBox` del mapa. */
export const MAP_WIDTH = (MAP_BOUNDS.lonMax - MAP_BOUNDS.lonMin) * UNITS_PER_DEGREE;
export const MAP_HEIGHT = (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin) * UNITS_PER_DEGREE;

export interface Point {
  x: number;
  y: number;
}

/** Proyección equirrectangular: la longitud es lineal en x y la latitud, en y (el norte arriba). */
export function project(lat: number, lon: number): Point {
  return {
    x: (lon - MAP_BOUNDS.lonMin) * UNITS_PER_DEGREE,
    y: (MAP_BOUNDS.latMax - lat) * UNITS_PER_DEGREE,
  };
}

/** Arco curvo (curva de Bézier cuadrática) entre dos puntos, abombado hacia arriba. */
export function arcPath(from: Point, to: Point): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) return `M ${String(from.x)} ${String(from.y)}`;
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  // Perpendicular a la cuerda, orientada hacia arriba para que el arco se curve "sobre" el mapa.
  let px = -dy / length;
  let py = dx / length;
  if (py > 0) {
    px = -px;
    py = -py;
  }
  const bulge = length * 0.24;
  const control = { x: mid.x + px * bulge, y: mid.y + py * bulge };
  return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${control.x.toFixed(1)} ${control.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}
