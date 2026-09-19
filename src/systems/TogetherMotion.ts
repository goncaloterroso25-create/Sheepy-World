import type { FacingDirection } from '../entities/playerAnimations';
import type { Rect, WorldRegion } from '../world/regions/definitions';

export interface PairPoint { x: number; y: number }
export const pairDistance = (a: PairPoint, b: PairPoint): number => Math.hypot(a.x - b.x, a.y - b.y);
/** Coordinates are feet. The companion is non-physical and never pushes anyone. */
export function pairSafe(p: PairPoint, solids: readonly Rect[], region: WorldRegion): boolean {
  if (p.x < 9 || p.y < 30 || p.x > region.width - 9 || p.y > region.height - 9) return false;
  return ![...solids, ...region.exits.map(e => e.area)].some(r =>
    p.x + 6 > r.x && p.x - 6 < r.x + r.width && p.y > r.y && p.y - 10 < r.y + r.height);
}
export function pairSegmentSafe(a: PairPoint, b: PairPoint, safe: (p: PairPoint) => boolean): boolean {
  const steps = Math.max(1, Math.ceil(pairDistance(a, b) / 2));
  for (let i = 1; i <= steps; i++) if (!safe({ x: a.x + (b.x - a.x) * i / steps, y: a.y + (b.y - a.y) * i / steps })) return false;
  return true;
}
export function handSlot(p: PairPoint, facing: FacingDirection, side: number): PairPoint {
  // Horizontal views are a close diagonal pair: both faces, arms and soles read.
  return facing === 'left' || facing === 'right'
    ? { x: p.x + side * 13, y: p.y + 11 }
    : { x: p.x + side * 19, y: p.y };
}
export function safeJoin(p: PairPoint, facing: FacingDirection, side: number, safe: (p: PairPoint) => boolean): PairPoint | undefined {
  const preferred = handSlot(p, facing, side);
  if (safe(preferred)) return preferred;
  for (const radius of [20, 28, 40, 56, 72]) for (const [dx, dy] of [[side, 0], [-side, 0], [0, 1], [0, -1], [side, 1], [-side, 1]]) {
    const target = { x: p.x + dx! * radius, y: p.y + dy! * radius };
    if (safe(target)) return target;
  }
  return undefined;
}
export class TogetherMotion {
  side = 1;
  position: PairPoint;
  joined = false;
  constructor(start: PairPoint, private readonly safe: (p: PairPoint) => boolean) { this.position = { ...start }; }
  update(player: PairPoint, facing: FacingDirection, ms: number): void {
    let target = handSlot(player, facing, this.side);
    if (!this.safe(target)) {
      const other = handSlot(player, facing, -this.side);
      if (this.safe(other) && pairSegmentSafe(this.position, other, this.safe)) { this.side *= -1; target = other; }
      else {
        const rear = facing === 'up' ? { x: 0, y: 18 } : facing === 'down' ? { x: 0, y: -18 }
          : { x: facing === 'left' ? 18 : -18, y: 0 };
        target = { x: player.x + rear.x, y: player.y + rear.y };
        if (!this.safe(target)) target = player;
      }
    }
    const distance = pairDistance(this.position, target);
    const maxStep = Math.max(0, ms) / 1000 * 230;
    if (distance <= maxStep && pairSegmentSafe(this.position, target, this.safe)) this.position = { ...target };
    else if (distance > .1) {
      const angle = Math.atan2(target.y - this.position.y, target.x - this.position.x);
      const step = Math.min(distance, maxStep);
      for (const turn of [0, .5, -.5, 1, -1, 1.57, -1.57]) {
        const next = { x: this.position.x + Math.cos(angle + turn) * step, y: this.position.y + Math.sin(angle + turn) * step };
        if (pairSegmentSafe(this.position, next, this.safe)) { this.position = next; break; }
      }
    }
    this.joined = pairDistance(this.position, handSlot(player, facing, this.side)) < 1.5;
  }
}
