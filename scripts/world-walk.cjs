/* Test-side pathfinding over read-only runtime geometry. Movement remains real keyboard input. */
const assert = require('node:assert/strict');
const STEP = 8;
function route(world, target) {
  const width = Math.ceil(world.width / STEP), height = Math.ceil(world.height / STEP);
  // Body half-size plus the real-input waypoint stopping tolerance.
  const blocked = (x, y) => x < 8 || y < 8 || x > world.width - 8 || y > world.height - 8 || world.geometry.some(r =>
    x >= r.x - 11 && x < r.x + r.width + 11 && y >= r.y - 11 && y < r.y + r.height + 11);
  const start = Math.round(world.x / STEP) + Math.round((world.y + 11) / STEP) * width;
  const goalX = target.x, goalY = target.y + 11;
  const queue = new Int32Array(width * height), previous = new Int32Array(width * height).fill(-2);
  let head = 0, tail = 0, finish = -1, closest = Infinity;
  queue[tail++] = start; previous[start] = -1;
  while (head < tail) {
    const cell = queue[head++], cx = cell % width, cy = Math.floor(cell / width);
    const distance = Math.hypot(cx * STEP - goalX, cy * STEP - goalY);
    if (distance < closest) { closest = distance; finish = cell; }
    if (distance < 5) break;
    for (const [x, y] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      const next = x + y * width;
      if (previous[next] !== -2 || blocked(x * STEP, y * STEP)) continue;
      previous[next] = cell; queue[tail++] = next;
    }
  }
  assert(closest < 24, `No walkable route near ${JSON.stringify(target)} (closest ${closest})`);
  const points = [];
  for (let cell = finish; cell >= 0; cell = previous[cell]) points.push({ x: cell % width * STEP, y: Math.floor(cell / width) * STEP - 11 });
  points.reverse();
  // Keyboard diagonals run at 45 degrees, not toward an arbitrary waypoint angle.
  // Preserve every cardinal turn so the test never cuts an unplanned stall corner.
  const simplified = [];
  for (let i = 0; i < points.length - 1;) {
    let end = i + 1;
    const dx = points[end].x - points[i].x, dy = points[end].y - points[i].y;
    while (end + 1 < points.length && points[end + 1].x - points[end].x === dx && points[end + 1].y - points[end].y === dy) end++;
    simplified.push(points[end]); i = end;
  }
  return simplified;
}
async function walk(page, x, y, sprint = false) {
  const world = () => page.evaluate(() => window.__SHEEPY_DEV__?.getWorld?.());
  const start = await world(), points = route(start, { x, y }), held = new Set();
  try {
    if (sprint) await page.keyboard.down('ShiftLeft');
    for (const p of points) {
      let stagnant = 0, last = await world();
      for (let n = 0; n < 1800; n++) {
        const w = await world(); if (!w || w.regionId !== start.regionId || w.transition) return;
        if (Math.abs(w.x - p.x) < 4 && Math.abs(w.y - p.y) < 4) break;
        const wanted = new Set();
        if (Math.abs(w.x - p.x) >= 3) wanted.add(w.x < p.x ? 'KeyD' : 'KeyA');
        if (Math.abs(w.y - p.y) >= 3) wanted.add(w.y < p.y ? 'KeyS' : 'KeyW');
        for (const k of held) if (!wanted.has(k)) { await page.keyboard.up(k); held.delete(k); }
        for (const k of wanted) if (!held.has(k)) { await page.keyboard.down(k); held.add(k); }
        await page.waitForTimeout(45);
        const next = await world(); if (!next || next.regionId !== start.regionId || next.transition) return;
        stagnant = Math.hypot(next.x - last.x, next.y - last.y) < .2 ? stagnant + 1 : 0;
        assert(stagnant < 35, `Collision stall ${start.regionId}: ${next.x},${next.y} toward ${p.x},${p.y}`);
        assert(n < 1799, 'Walking timeout'); last = next;
      }
    }
  } finally {
    for (const k of held) await page.keyboard.up(k);
    if (sprint) await page.keyboard.up('ShiftLeft');
    await page.waitForTimeout(200);
  }
}
module.exports = { walk, route };
