export interface RankedInteraction { id: string; distance: number; priority: number; range: number; facingScore?: number }
export const INTERACTION_HYSTERESIS_PX = 8;

/**
 * Choose what is physically closest. LOS failures arrive as Infinity, explicit
 * priority settles equal-distance overlaps, and facing is deliberately only a
 * final tie-break. A selected target gets a tiny release margin so the prompt
 * does not flicker at range boundaries.
 */
export function selectInteraction<T extends RankedInteraction>(
  candidates: readonly T[],
  currentId?: string,
  hysteresis = INTERACTION_HYSTERESIS_PX,
): T | undefined {
  const visible = candidates.filter(c => Number.isFinite(c.distance) && c.distance <= c.range);
  const foreground = visible.filter(c => c.priority >= 0);
  const pool = foreground.length > 0 ? foreground : visible;
  const ranked = [...pool].sort((a, b) => a.distance - b.distance
    || b.priority - a.priority
    || (b.facingScore ?? 0) - (a.facingScore ?? 0)
    || a.id.localeCompare(b.id));
  const best = ranked[0];
  if (!currentId) return best;
  const current = candidates.find(c => c.id === currentId);
  if (!current || (foreground.length>0&&current.priority<0) || !Number.isFinite(current.distance) || current.distance > current.range + hysteresis) return best;
  if (!best) return current;
  // A clearly closer object always wins; near-equal candidates keep the old
  // choice unless the authored priority is higher.
  if (best.distance + hysteresis < current.distance) return best;
  if (Math.abs(best.distance - current.distance) <= 3 && best.priority > current.priority) return best;
  return current;
}
