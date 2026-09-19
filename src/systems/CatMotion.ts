import type { CatDirection, CatPose } from '../art/catSprites';
import { segmentHitsRect } from './InteractionGeometry';
import { contains, type Rect } from '../world/regions/definitions';

export interface CatPoint { x: number; y: number }
export function catStep(from: CatPoint, to: CatPoint, delta: number, speed: number): CatPoint & { moving: boolean; direction: CatDirection } {
  const dx = to.x - from.x, dy = to.y - from.y, distance = Math.hypot(dx, dy);
  const step = Math.min(distance, speed * Math.max(0, Math.min(50, delta)) / 1000);
  return { x: from.x + (distance ? dx / distance * step : 0), y: from.y + (distance ? dy / distance * step : 0),
    moving: distance > .5 && step > 0, direction: Math.abs(dx) > Math.abs(dy) ? dx < 0 ? 'left' : 'right' : dy < 0 ? 'up' : 'down' };
}

/** Cat centers use the existing perch convention: feet are eleven pixels lower. */
export function safeCatSegment(from: CatPoint, to: CatPoint, solids: readonly Rect[], feetOffset = 11): boolean {
  const a = { x: from.x, y: from.y + feetOffset }, b = { x: to.x, y: to.y + feetOffset };
  return !solids.some(r => {
    const padded = { x: r.x - 6, y: r.y - 3, width: r.width + 12, height: r.height + 6 };
    return contains(padded, a) || contains(padded, b) || segmentHitsRect(a, b, padded);
  });
}

/** Timerless, transient local behavior. No persistence, physics body or pathfinding. */
export class CatRoam {
  position: CatPoint;
  direction: CatDirection = 'down';
  pose: CatPose = 'idle';
  private remaining: number;
  private cycle = 0;
  private target?: CatPoint;
  constructor(private home: CatPoint, private readonly solids: readonly Rect[], private readonly seed = 0) {
    this.position = { ...home }; this.remaining = 4200 + seed * 900;
  }
  place(point: CatPoint): void { this.home = { ...point }; this.position = { ...point }; this.hold(); }
  hold(): void { this.target = undefined; this.pose = 'idle'; this.remaining = 4200 + this.seed * 700; }
  update(delta: number, paused: boolean): void {
    if (paused) { if (this.pose === 'walk') this.hold(); return; }
    const dt = Math.max(0, Math.min(50, delta));
    if (this.target) {
      const next = catStep(this.position, this.target, dt, 15 + this.seed * 2);
      this.position = { x: next.x, y: next.y }; this.direction = next.direction; this.pose = 'walk';
      if (Math.hypot(this.position.x - this.target.x, this.position.y - this.target.y) < .5) {
        this.target = undefined; this.pose = this.cycle % 5 === 0 ? 'sleep' : 'sit';
        this.remaining = this.pose === 'sleep' ? 16000 : 6000 + this.seed * 600;
      }
      return;
    }
    this.remaining -= dt;
    if (this.remaining > 0) return;
    this.cycle++;
    // Small loops around an authored perch; furniture/beds simply remain sitting places.
    const offsets = [[-22, 0], [0, 18], [22, 0], [0, -18], [0, 0]] as const;
    const offset = offsets[(this.cycle + this.seed - 1) % offsets.length]!;
    const point = { x: this.home.x + offset[0], y: this.home.y + offset[1] };
    if (safeCatSegment(this.position, point, this.solids) && Math.hypot(point.x - this.position.x, point.y - this.position.y) > 1) this.target = point;
    else { this.pose = this.cycle % 5 === 0 ? 'sleep' : 'sit'; this.remaining = this.pose === 'sleep' ? 16000 : 6200; }
  }
}
