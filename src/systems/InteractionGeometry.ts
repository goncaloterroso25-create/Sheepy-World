import type { Rect } from '../world/regions/definitions';

export interface Point { x: number; y: number }
export type Facing = 'up' | 'down' | 'left' | 'right';
export interface InteractionApproach {
  anchor: Point;
  radius?: number;
  shape?: Rect;
  preferredFacing?: Facing;
  approachSide?: Facing;
  /** A solid's bounds, used only to enforce the authored side. */
  body?: Rect;
  promptAnchor?: Point;
}

export function nearestPointOnRect(point: Point, rect: Rect): Point {
  return {
    x: Math.max(rect.x, Math.min(point.x, rect.x + rect.width)),
    y: Math.max(rect.y, Math.min(point.y, rect.y + rect.height)),
  };
}

function sameRect(a: Rect, b: Rect): boolean {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

/**
 * A broad target is usable from the nearest visible part of its authored
 * approach shape. Extra edge samples keep one decorative/structural corner
 * from making an otherwise reachable counter, shelf, or stall feel dead.
 */
export function approachSamples(player: Point, approach: InteractionApproach): Point[] {
  if (!approach.shape) return [approach.anchor];
  const r = approach.shape;
  const x0 = r.x; const x1 = r.x + r.width;
  const y0 = r.y; const y1 = r.y + r.height;
  const cx = r.x + r.width / 2; const cy = r.y + r.height / 2;
  const samples = [nearestPointOnRect(player, r), approach.anchor,
    { x: cx, y: y0 }, { x: cx, y: y1 }, { x: x0, y: cy }, { x: x1, y: cy },
    { x: x0, y: y0 }, { x: x1, y: y0 }, { x: x0, y: y1 }, { x: x1, y: y1 }];
  const unique = new Map<string, Point>();
  samples.forEach(sample => unique.set(`${sample.x}:${sample.y}`, sample));
  return [...unique.values()];
}

export function segmentHitsRect(a: Point, b: Point, r: Rect): boolean {
  let near = 0; let far = 1;
  for (const [p, delta, min, max] of [[a.x, b.x - a.x, r.x, r.x + r.width], [a.y, b.y - a.y, r.y, r.y + r.height]]) {
    if (Math.abs(delta!) < 0.00001) { if (p! <= min! || p! >= max!) return false; }
    else {
      const lo = (min! - p!) / delta!; const hi = (max! - p!) / delta!;
      near = Math.max(near, Math.min(lo, hi)); far = Math.min(far, Math.max(lo, hi));
      if (near >= far) return false;
    }
  }
  return far > 0 && near < 1;
}

export function approachDistance(player: Point, approach: InteractionApproach, solids: readonly Rect[] = []): number {
  // Authored sides describe the nicest staging position; they are never an
  // invisible interaction requirement. A target's own solid body is not an
  // occluder, while real walls remain hard line-of-sight blockers.
  const occluders = approach.body ? solids.filter(rect => !sameRect(rect, approach.body!)) : solids;
  const visible = approachSamples(player, approach)
    .filter(sample => !occluders.some(rect => segmentHitsRect(player, sample, rect)));
  return visible.reduce((best, sample) => Math.min(best,
    Math.hypot(player.x - sample.x, player.y - sample.y)), Infinity);
}

export function promptPosition(anchor: Point, player: Point, width: number, solids:readonly Rect[]=[]): Point {
  let x = Math.round(anchor.x); const y = Math.round(anchor.y - 24);
  // Keep the selected tag off the player's head, without putting it across the object.
  if (Math.abs(x - player.x) < width / 2 + 13 && Math.abs(y - (player.y - 25)) < 18) x += Math.ceil(width / 2) + 20;
  const candidates=[{x,y},{x:Math.round(anchor.x)-Math.ceil(width/2)-20,y},
    {x:Math.round(player.x),y:Math.round(player.y+22)},{x:Math.round(player.x),y:Math.round(player.y-53)}];
  return candidates.find(p=>!solids.some(r=>p.x+width/2>r.x&&p.x-width/2<r.x+r.width&&p.y+8>r.y&&p.y-8<r.y+r.height)
    &&!(Math.abs(p.x-player.x)<width/2+12&&Math.abs(p.y-(player.y-25))<18)) ?? candidates[2]!;
}
