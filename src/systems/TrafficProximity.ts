import { WORLD_WIDTH } from '../config/constants';
import type { FeetPosition } from '../world/SurfaceQuery';

// The existing north road, not a new world area or a car-color-dependent emitter.
export const PARK_TRAFFIC_ZONE = { x: 0, y: 0, width: WORLD_WIDTH, height: 96,
  fullDistance: 64, silentDistance: 300, responseMs: 500 } as const;

export function trafficTarget(feet: FeetPosition): number {
  if (!Number.isFinite(feet.x) || !Number.isFinite(feet.y)) return 0;
  const zone = PARK_TRAFFIC_ZONE;
  const dx = Math.max(zone.x - feet.x, 0, feet.x - zone.x - zone.width);
  const dy = Math.max(zone.y - feet.y, 0, feet.y - zone.y - zone.height);
  const distance = Math.hypot(dx, dy);
  const t = Math.max(0, Math.min(1, (distance - zone.fullDistance) / (zone.silentDistance - zone.fullDistance)));
  return 1 - t * t * (3 - 2 * t);
}

/** One lightweight fade envelope: 95% of a target change in 1.5 seconds. */
export class TrafficProximity {
  private value = 0;
  update(feet: FeetPosition, deltaMs: number): number {
    const target = trafficTarget(feet);
    const elapsedMs = Number.isFinite(deltaMs) ? Math.max(0, deltaMs) : 0;
    this.value += (target - this.value) * (1 - Math.exp(-elapsedMs / PARK_TRAFFIC_ZONE.responseMs));
    if (target === 0 && this.value < 0.0005) this.value = 0;
    return this.value;
  }
}
