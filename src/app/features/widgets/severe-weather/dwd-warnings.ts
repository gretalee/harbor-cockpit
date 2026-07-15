import { DwdWarning, DwdWarningRegion } from './dwd-warnings-api.service';

function isPointInRing(lon: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function isPointInPolygon(
  lon: number,
  lat: number,
  geometry: DwdWarningRegion['polygonGeometry'],
): boolean {
  if (!geometry) {
    return false;
  }
  const polygons =
    geometry.type === 'Polygon'
      ? [geometry.coordinates as number[][][]]
      : (geometry.coordinates as number[][][][]);
  return polygons.some(([outerRing, ...holes]) => {
    if (!outerRing || !isPointInRing(lon, lat, outerRing)) {
      return false;
    }
    return !holes.some((hole) => isPointInRing(lon, lat, hole));
  });
}

/** Returns every warning whose affected area covers the given point, ordered as received. */
export function findWarningsForPoint(
  warnings: DwdWarning[],
  lat: number,
  lon: number,
): DwdWarning[] {
  return warnings.filter((warning) =>
    warning.regions.some((region) => isPointInPolygon(lon, lat, region.polygonGeometry)),
  );
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Wetterwarnung',
  2: 'Markante Wetterwarnung',
  3: 'Unwetterwarnung',
  4: 'Extreme Unwetterwarnung',
};

const LEVEL_COLOR_CLASSES: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-orange-100 text-orange-800',
  3: 'bg-red-100 text-red-800',
  4: 'bg-purple-100 text-purple-800',
};

export function warningLevelLabel(level: number): string {
  return LEVEL_LABELS[level] ?? 'Warnung';
}

export function warningLevelColorClass(level: number): string {
  return LEVEL_COLOR_CLASSES[level] ?? 'bg-gray-100 text-gray-700';
}
