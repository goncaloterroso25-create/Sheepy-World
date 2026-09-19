import { getParkSurfaceAt, type FeetPosition, type Surface } from '../SurfaceQuery';
import { contains, WORLD_REGIONS, type RegionId } from './definitions';
import { RIVER_PAVING, RIVER_WATER, VILA_PAVING, VILA_ROADS } from './layouts';
import { FESTIVAL_PAVING } from './FestivalLayout';
import { FOREST_PATHS, FOREST_WATER, PORTO_PATHS, GONCALO_ROOMS } from './ExpansionLayout';

export function regionSurfaceAt(id: RegionId, feet: FeetPosition): Surface {
  const region = WORLD_REGIONS[id];
  if (!Number.isFinite(feet.x) || !Number.isFinite(feet.y)
    || !contains({ x: 0, y: 0, width: region.width, height: region.height }, feet)) return 'unknown';
  if (id === 'autumn-parklands') return getParkSurfaceAt(feet);
  if (id === 'final-park') return feet.x>270&&feet.x<370?'gravel':'grass';
  if (id === 'home-interior') {
    if (contains({ x: 420, y: 80, width: 204, height: 264 }, feet) || contains({ x: 538, y: 466, width: 320, height: 143 }, feet)) return 'tile';
    if (contains({ x: 212, y: 545, width: 196, height: 180 }, feet)) return 'carpet';
    return 'wood';
  }
  if (id === 'goncalo-home') {
    if (contains(GONCALO_ROOMS.kitchen, feet)) return 'tile';
    if (contains({ x: 758, y: 177, width: 233, height: 167 }, feet) || contains({ x: 230, y: 125, width: 70, height: 220 }, feet)) return 'carpet';
    return 'wood';
  }
  if (id === 'snow-highlands') return 'snow';
  if (id === 'porto') return feet.y > 1080 && feet.y < 1118 ? 'road' : PORTO_PATHS.some(r => contains(r, feet)) ? 'stone' : 'grass';
  if (id === 'old-world-festival' && feet.y > 1408) {
    if (FOREST_WATER.some(r => contains(r, feet))) return 'water';
    if (feet.y > 1732 && feet.y < 1820 && feet.x > 618 && feet.x < 790) return 'wood';
    return FOREST_PATHS.some(r => contains(r, feet)) ? 'gravel' : 'grass';
  }
  if (id === 'river-town' && RIVER_WATER.some(r => contains(r, feet))) return 'water';
  if (id === 'vila-meow' && VILA_ROADS.some(r => contains(r, feet))) return 'road';
  const paving = id === 'river-town' ? RIVER_PAVING : id === 'old-world-festival' ? FESTIVAL_PAVING : VILA_PAVING;
  return paving.some(r => contains(r, feet)) ? 'stone' : id === 'old-world-festival' ? 'unknown' : 'grass';
}
