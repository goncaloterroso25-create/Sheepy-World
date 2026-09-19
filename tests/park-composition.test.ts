import { describe, expect, it } from 'vitest';
import {
  PARK_BENCHES,
  PARK_FENCES,
  PARK_PATH_JUNCTION,
  PARK_PATHS,
  PARK_POND_BOUNDS,
  PARK_TREES,
  isGrassPlacement,
  isPointOnParkPath,
} from '../src/world/ParkComposition';

describe('authored park composition', () => {
  it('keeps every tree trunk on grass with clearance from routes and water', () => {
    const invalidTrees = PARK_TREES.filter(([x, y]) => !isGrassPlacement({ x, y }, 12));
    expect(invalidTrees).toEqual([]);
  });

  it('recognizes the authored route centre lines', () => {
    expect(isPointOnParkPath({ x: 384, y: 120 })).toBe(true);
    expect(isPointOnParkPath({ x: 630, y: 486 })).toBe(true);
    expect(isPointOnParkPath({ x: 790, y: 427 })).toBe(true);
  });

  it('joins every branch at one deliberate clearing and carries exits beyond the world edge', () => {
    expect(PARK_PATHS.slice(2).every((path) => path.points.some((point) => point === PARK_PATH_JUNCTION))).toBe(true);
    // New local connectors join existing routes, not a second central clearing.
    expect(PARK_PATHS[0]!.points.at(-1)).toEqual({x:255,y:357});
    expect(PARK_PATHS[1]!.points[0]).toEqual({x:612,y:674});
    const endpoints = PARK_PATHS.slice(3).map((path) => path.points.at(-1));
    expect(endpoints[0]?.x).toBeLessThan(0);
    expect(endpoints[1]?.x).toBeGreaterThan(1280);
    expect(PARK_PATHS[2]?.points.at(-1)?.y).toBeGreaterThan(760);
  });

  it('reserves the pond and road edge as non-grass placement zones', () => {
    expect(isGrassPlacement({
      x: PARK_POND_BOUNDS.x + PARK_POND_BOUNDS.width / 2,
      y: PARK_POND_BOUNDS.y + PARK_POND_BOUNDS.height / 2,
    })).toBe(false);
    expect(isGrassPlacement({ x: 100, y: 110 })).toBe(false);
  });

  it('gives each bench one authored purpose and a distinct memory treatment', () => {
    expect(PARK_BENCHES.map((bench) => bench.purpose)).toEqual(['pond-view', 'path-rest']);
    const memoryBench = PARK_BENCHES.find((bench) => bench.id === 'memory-bench');
    expect(memoryBench?.texture).toBe('memory-bench');
    expect(memoryBench && isGrassPlacement(memoryBench)).toBe(true);
    expect(memoryBench?.x).toBeGreaterThan(PARK_POND_BOUNDS.x);
    expect(memoryBench?.x).toBeLessThan(PARK_POND_BOUNDS.x + PARK_POND_BOUNDS.width);
    expect(memoryBench?.y).toBeGreaterThan(PARK_POND_BOUNDS.y + PARK_POND_BOUNDS.height);
  });

  it('uses fence runs only for continuous pond and road boundaries', () => {
    const pondGuards = PARK_FENCES.filter((fence) => fence.purpose === 'pond-guard');
    const roadBoundary = PARK_FENCES.filter((fence) => fence.purpose === 'road-boundary');
    expect(pondGuards).toHaveLength(3);
    expect(pondGuards.every((fence) => fence.angle === 90 && fence.x === 770)).toBe(true);
    expect(roadBoundary).toHaveLength(3);
    expect(roadBoundary.every((fence) => fence.angle === 0 && fence.y === 142)).toBe(true);
  });
});
