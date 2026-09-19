import { WORLD_HEIGHT, WORLD_WIDTH } from '../config/constants';
import { isPointOnParkPath, PARK_PATH_CLEARING, PARK_POND_BOUNDS } from './ParkComposition';

export type Surface = 'grass' | 'gravel' | 'dirt' | 'stone' | 'pavement' | 'wood' | 'indoor' | 'road' | 'snow' | 'water' | 'unknown' | 'carpet' | 'tile' | 'silent';
export interface FeetPosition { x: number; y: number }

function isOnClearing(feet: FeetPosition): boolean {
  // The authored clearing is convex; include its boundary as path material.
  const crosses = PARK_PATH_CLEARING.map((point, index) => {
    const next = PARK_PATH_CLEARING[(index + 1) % PARK_PATH_CLEARING.length]!;
    return (next.x - point.x) * (feet.y - point.y) - (next.y - point.y) * (feet.x - point.x);
  });
  return !crosses.some((cross) => cross < 0) || !crosses.some((cross) => cross > 0);
}

export function getParkSurfaceAt(feet: FeetPosition): Surface {
  if (!Number.isFinite(feet.x) || !Number.isFinite(feet.y)
    || feet.x < 0 || feet.x > WORLD_WIDTH || feet.y < 0 || feet.y > WORLD_HEIGHT) return 'unknown';
  if (feet.y < 124) return 'pavement';
  if (feet.x >= 1184 && feet.y >= 598 && feet.y <= 680) return 'stone';
  const waterX = feet.y >= 221 && feet.y < 329 ? [804, 1024] : [812, 1016];
  if (feet.y >= 213 && feet.y < 337 && feet.x >= waterX[0]! && feet.x < waterX[1]!) return 'water';
  const pond = PARK_POND_BOUNDS;
  if (feet.x >= pond.x && feet.x <= pond.x + pond.width
    && feet.y >= pond.y && feet.y <= pond.y + pond.height) return 'stone';
  if (isOnClearing(feet) || isPointOnParkPath(feet, 2)) return 'gravel';
  return 'grass';
}
