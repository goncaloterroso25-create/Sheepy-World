export interface RectangleLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface YellowCarObservation {
  encounterId: string;
  vehicleBounds: RectangleLike;
  cameraBounds: RectangleLike;
  explorationActive: boolean;
}

export function visibleAreaRatio(vehicle: RectangleLike, camera: RectangleLike): number {
  if (vehicle.width <= 0 || vehicle.height <= 0) return 0;
  const left = Math.max(vehicle.x, camera.x);
  const top = Math.max(vehicle.y, camera.y);
  const right = Math.min(vehicle.x + vehicle.width, camera.x + camera.width);
  const bottom = Math.min(vehicle.y + vehicle.height, camera.y + camera.height);
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);
  return (width * height) / (vehicle.width * vehicle.height);
}

export function isMeaningfullyVisible(
  vehicle: RectangleLike,
  camera: RectangleLike,
  minimumVisibleRatio = 0.62,
): boolean {
  const ratio = visibleAreaRatio(vehicle, camera);
  if (ratio < minimumVisibleRatio) return false;

  const centerX = vehicle.x + vehicle.width / 2;
  const centerY = vehicle.y + vehicle.height / 2;
  const marginX = Math.min(72, Math.max(32, Math.floor(camera.width * 0.1)));
  const marginY = Math.min(40, Math.max(18, Math.floor(camera.height * 0.06)));
  return centerX >= camera.x + marginX
    && centerX <= camera.x + camera.width - marginX
    && centerY >= camera.y + marginY
    && centerY <= camera.y + camera.height - marginY;
}

/**
 * Stable encounter IDs make moving and future parked yellow cars use the same
 * trigger-once rule without coupling visibility to spawning.
 */
export class YellowCarVisibilityGate {
  private readonly observedEncounterIds = new Set<string>();

  observe(observation: YellowCarObservation): boolean {
    if (!observation.explorationActive) return false;
    if (this.observedEncounterIds.has(observation.encounterId)) return false;
    if (!isMeaningfullyVisible(observation.vehicleBounds, observation.cameraBounds)) return false;
    this.observedEncounterIds.add(observation.encounterId);
    return true;
  }

  hasObserved(encounterId: string): boolean {
    return this.observedEncounterIds.has(encounterId);
  }
}
