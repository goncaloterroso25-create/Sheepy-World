import Phaser from 'phaser';
import { AUTUMN as PALETTE, createAutumnProofTextures, drawAutumnMeadow, drawAutumnDressing } from '../art/autumnStyleProof';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../config/constants';
import {
  PARK_BENCHES,
  PARK_DECOR,
  PARK_FENCES,
  PARK_PATH_JUNCTION,
  PARK_PATH_CLEARING,
  PARK_PATHS,
  PARK_SHRUBS,
  PARK_TREES,
  type TreePlacement,
} from './ParkComposition';

export interface ParkObjects {
  obstacles: Phaser.Physics.Arcade.StaticGroup;
  bench: Phaser.Physics.Arcade.Sprite;
  npc: Phaser.Physics.Arcade.Sprite;
  fragment: Phaser.GameObjects.Image;
  artifact: Phaser.GameObjects.Image;
  details: Readonly<{
    lamp: Phaser.GameObjects.Components.Transform & { active: boolean };
    sign: Phaser.GameObjects.Components.Transform & { active: boolean };
    flowers: Phaser.GameObjects.Components.Transform & { active: boolean };
    bush: Phaser.GameObjects.Components.Transform & { active: boolean };
    waterEdge: Phaser.GameObjects.Components.Transform & { active: boolean };
  }>;
}

function drawRoad(ground: Phaser.GameObjects.Graphics): void {
  ground.fillStyle(PALETTE.asphaltDeep).fillRect(0, 0, WORLD_WIDTH, 98);
  ground.fillStyle(PALETTE.asphalt).fillRect(0, 4, WORLD_WIDTH, 88);
  ground.fillStyle(0x353a3b).fillRect(0, 46, WORLD_WIDTH, 4);
  ground.fillStyle(PALETTE.roadMarking);
  for (let x = 10; x < WORLD_WIDTH; x += 72) ground.fillRect(x, 47, 38, 2);
  ground.fillStyle(PALETTE.pavementShade).fillRect(0, 96, WORLD_WIDTH, 9);
  ground.fillStyle(PALETTE.pavement).fillRect(0, 105, WORLD_WIDTH, 19);
  ground.fillStyle(PALETTE.stoneLight).fillRect(0, 105, WORLD_WIDTH, 3);
  ground.fillStyle(PALETTE.stoneShade);
  for (let x = 16; x < WORLD_WIDTH; x += 48) {
    ground.fillRect(x, 112, 2, 12).fillRect(x + 19, 107, 1, 17);
  }
  ground.fillStyle(PALETTE.asphaltDeep);
  for (let x = 92; x < WORLD_WIDTH; x += 280) {
    ground.fillRect(x, 101, 24, 4);
    for (let grateX = x + 2; grateX < x + 22; grateX += 4) ground.fillRect(grateX, 99, 2, 6);
  }
  // A shallow roadside pull-off makes the parked cars belong to the road.
  ground.fillStyle(PALETTE.asphaltDeep).fillRect(342, 88, 204, 73);
  ground.fillStyle(PALETTE.asphalt).fillRect(347, 91, 194, 65);
  ground.fillStyle(PALETTE.pavementShade).fillRect(342, 156, 204, 7);
  ground.fillStyle(PALETTE.stoneLight).fillRect(347, 156, 194, 2);
  ground.fillStyle(PALETTE.roadMarking).fillRect(405, 151, 25, 2).fillRect(463, 151, 25, 2);
}

function strokePathLayer(
  ground: Phaser.GameObjects.Graphics,
  points: readonly { x: number; y: number }[],
  width: number,
  color: number,
  alpha = 1,
  offsetX = 0,
): void {
  ground.lineStyle(width, color, alpha).beginPath();
  ground.moveTo((points[0]?.x ?? 0) + offsetX, points[0]?.y ?? 0);
  points.slice(1).forEach((point) => ground.lineTo(point.x + offsetX, point.y));
  ground.strokePath();
}

function drawPaths(ground: Phaser.GameObjects.Graphics): void {
  // Each material layer is painted across every branch before the next layer.
  // That removes the dark overlap scars created by drawing complete paths one
  // at a time and makes the shared junction read as one authored clearing.
  PARK_PATHS.forEach((path) => strokePathLayer(
    ground, path.points, path.outerWidth, PALETTE.pathShade,
  ));
  ground.fillStyle(PALETTE.pathShade).fillPoints(
    PARK_PATH_CLEARING.map(({ x, y }) => new Phaser.Geom.Point(x, y)), true,
  );
  PARK_PATHS.forEach((path) => strokePathLayer(
    ground, path.points, path.outerWidth - 10, PALETTE.path,
  ));
  ground.fillStyle(PALETTE.path).fillPoints([
    new Phaser.Geom.Point(PARK_PATH_JUNCTION.x - 37, PARK_PATH_JUNCTION.y - 20),
    new Phaser.Geom.Point(PARK_PATH_JUNCTION.x - 19, PARK_PATH_JUNCTION.y - 34),
    new Phaser.Geom.Point(PARK_PATH_JUNCTION.x + 24, PARK_PATH_JUNCTION.y - 30),
    new Phaser.Geom.Point(PARK_PATH_JUNCTION.x + 37, PARK_PATH_JUNCTION.y - 7),
    new Phaser.Geom.Point(PARK_PATH_JUNCTION.x + 29, PARK_PATH_JUNCTION.y + 28),
    new Phaser.Geom.Point(PARK_PATH_JUNCTION.x - 24, PARK_PATH_JUNCTION.y + 32),
  ], true);
  // Broken gravel flecks below replace road-like continuous highlights.

  // Repaint the authored clearing after branch highlights. The path edges
  // still meet, but their offset highlight strokes cannot cross the hub like
  // lane markings or imply a paved four-way road.
  ground.fillStyle(PALETTE.path).fillPoints([
    new Phaser.Geom.Point(PARK_PATH_JUNCTION.x - 37, PARK_PATH_JUNCTION.y - 20),
    new Phaser.Geom.Point(PARK_PATH_JUNCTION.x - 19, PARK_PATH_JUNCTION.y - 34),
    new Phaser.Geom.Point(PARK_PATH_JUNCTION.x + 24, PARK_PATH_JUNCTION.y - 30),
    new Phaser.Geom.Point(PARK_PATH_JUNCTION.x + 37, PARK_PATH_JUNCTION.y - 7),
    new Phaser.Geom.Point(PARK_PATH_JUNCTION.x + 29, PARK_PATH_JUNCTION.y + 28),
    new Phaser.Geom.Point(PARK_PATH_JUNCTION.x - 24, PARK_PATH_JUNCTION.y + 32),
  ], true);
  ground.fillStyle(PALETTE.pathLight, 0.42)
    .fillRect(PARK_PATH_JUNCTION.x - 21, PARK_PATH_JUNCTION.y - 13, 9, 2)
    .fillRect(PARK_PATH_JUNCTION.x + 9, PARK_PATH_JUNCTION.y + 13, 7, 2);
  ground.fillStyle(PALETTE.soilDeep, 0.32)
    .fillRect(PARK_PATH_JUNCTION.x + 18, PARK_PATH_JUNCTION.y - 8, 6, 2)
    .fillRect(PARK_PATH_JUNCTION.x - 12, PARK_PATH_JUNCTION.y + 18, 5, 2);

  ground.fillStyle(PALETTE.soilDeep, 0.42)
    .fillRect(362, 178, 8, 3).fillRect(420, 259, 13, 3)
    .fillRect(530, 339, 7, 3).fillRect(620, 467, 12, 3)
    .fillRect(610, 612, 8, 4).fillRect(258, 355, 12, 3)
    .fillRect(742, 405, 8, 3).fillRect(954, 493, 13, 3);
  ground.fillStyle(PALETTE.stoneLight, 0.55)
    .fillRect(401, 224, 4, 3).fillRect(481, 309, 5, 3)
    .fillRect(597, 411, 4, 3).fillRect(208, 398, 5, 3)
    .fillRect(843, 449, 5, 3);
}

function drawPond(ground: Phaser.GameObjects.Graphics): void {
  // Stepped banks keep the pond from reading as a rectangular pool while
  // retaining simple collision geometry beneath the authored silhouette.
  ground.fillStyle(PALETTE.soilDeep)
    .fillRect(804, 190, 204, 7)
    .fillRect(792, 197, 228, 8)
    .fillRect(780, 205, 252, 140)
    .fillRect(792, 345, 228, 8);
  ground.fillStyle(PALETTE.stoneShade)
    .fillRect(804, 198, 204, 7)
    .fillRect(792, 205, 228, 132)
    .fillRect(804, 337, 204, 8);
  ground.fillStyle(PALETTE.waterDeep)
    .fillRect(812, 213, 204, 8)
    .fillRect(804, 221, 220, 108)
    .fillRect(812, 329, 204, 8);
  ground.fillStyle(PALETTE.water)
    .fillRect(820, 221, 188, 7)
    .fillRect(812, 228, 204, 94)
    .fillRect(820, 322, 188, 7);
  ground.fillStyle(PALETTE.waterShade).fillRect(812, 228, 204, 7).fillRect(820, 322, 188, 7);
  ground.fillStyle(PALETTE.waterLight)
    .fillRect(832, 245, 42, 3).fillRect(916, 276, 58, 2).fillRect(850, 308, 31, 2);
  ground.fillStyle(PALETTE.waterGlint)
    .fillRect(841, 244, 22, 1).fillRect(930, 275, 30, 1).fillRect(857, 307, 17, 1);
  ground.fillStyle(PALETTE.grassShade)
    .fillRect(780, 197, 44, 16).fillRect(1004, 197, 36, 16)
    .fillRect(780, 337, 54, 16).fillRect(996, 337, 44, 16);
  ground.fillStyle(PALETTE.stoneLight);
  for (let x = 816; x < 1016; x += 28) ground.fillRect(x, 205, 18, 4);
  ground.fillStyle(PALETTE.pathShade).fillRect(782, 344, 266, 12);
  ground.fillStyle(PALETTE.pathLight).fillRect(790, 344, 250, 4);
}

function createTree(
  scene: Phaser.Scene,
  obstacles: Phaser.Physics.Arcade.StaticGroup,
  placement: TreePlacement,
): void {
  const [x, y, variant] = placement;
  const shadow = scene.add.image(x, y + 30, 'character-shadow')
    .setScale(2, 1)
    .setAlpha(0.55)
    .setDepth(y - 4);
  shadow.setTint(PALETTE.shadowDeep);
  const tree = obstacles.create(x, y, `autumn-tree-${variant}`) as Phaser.Physics.Arcade.Sprite;
  tree.setDepth(y + 26).refreshBody();
  const body = tree.body as Phaser.Physics.Arcade.StaticBody;
  body.setSize(18, 12).setOffset(23, 60);
}

function addAmbientMotion(scene: Phaser.Scene): void {
  const leaves: readonly [number, number, number][] = [
    [320, 222, 0], [522, 306, 1], [694, 260, 0], [1116, 342, 1],
    [246, 526, 1], [770, 570, 0], [1000, 548, 1], [514, 684, 0],
  ];
  leaves.forEach(([x, y, variant], index) => {
    const leaf = scene.add.image(x, y, 'leaf-speck')
      .setTint(variant ? PALETTE.leafGold : PALETTE.leafOrange)
      .setAlpha(0.72)
      .setDepth(y + 40);
    scene.tweens.add({
      targets: leaf,
      x: x + 13,
      y: y + 8,
      duration: 2100 + index * 230,
      repeat: -1,
      yoyo: true,
      ease: 'Stepped',
      easeParams: [5],
    });
  });
  [
    [858, 250], [948, 286], [884, 318],
  ].forEach(([x, y], index) => {
    const ripple = scene.add.image(x ?? 0, y ?? 0, 'water-ripple').setDepth((y ?? 0) + 1).setAlpha(0.25);
    scene.tweens.add({
      targets: ripple,
      alpha: 0.85,
      duration: 1500 + index * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Stepped',
      easeParams: [4],
    });
  });
}

export function buildPark(scene: Phaser.Scene): ParkObjects {
  createAutumnProofTextures(scene);
  const ground = scene.add.graphics().setDepth(-100);
  ground.fillStyle(PALETTE.grass).fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  drawAutumnMeadow(ground);
  drawRoad(ground);
  drawPaths(ground);
  drawPond(ground);
  drawAutumnDressing(ground);

  const obstacles = scene.physics.add.staticGroup();
  const curb = obstacles.create(WORLD_WIDTH / 2, 112, 'collision') as Phaser.Physics.Arcade.Sprite;
  curb.setDisplaySize(WORLD_WIDTH, 8).setAlpha(0).refreshBody();
  PARK_TREES.forEach((placement) => createTree(scene, obstacles, placement));

  PARK_SHRUBS.forEach(([x, y, key]) => {
    scene.add.image(x, y, `autumn-${key}`).setDepth(y + 8);
  });
  PARK_DECOR.forEach(([x, y, key]) => {
    scene.add.image(x, y, key === 'leaf-pile' ? 'autumn-leaf-pile' : key).setDepth(y + 2);
  });

  const pondCollider = obstacles.create(914, 274, 'collision') as Phaser.Physics.Arcade.Sprite;
  pondCollider.setDisplaySize(220, 124).setAlpha(0).refreshBody();

  // The interactive bench is deliberately unique and faces the pond from a
  // quiet patch of grass. Its placement is part of the memory's visual story.
  const memoryBenchPlacement = PARK_BENCHES.find((placement) => placement.id === 'memory-bench');
  if (!memoryBenchPlacement) throw new Error('Memory bench placement is missing.');
  const bench = obstacles.create(
    memoryBenchPlacement.x,
    memoryBenchPlacement.y,
    `autumn-${memoryBenchPlacement.texture}`,
  ) as Phaser.Physics.Arcade.Sprite;
  bench.setDepth(memoryBenchPlacement.y + 15).refreshBody();
  (bench.body as Phaser.Physics.Arcade.StaticBody).setSize(50, 11).setOffset(5, 16);
  scene.add.image(memoryBenchPlacement.x - 34, memoryBenchPlacement.y + 15, 'autumn-leaf-pile')
    .setDepth(memoryBenchPlacement.y + 16);
  scene.add.image(memoryBenchPlacement.x + 34, memoryBenchPlacement.y + 13, 'flower-patch')
    .setDepth(memoryBenchPlacement.y + 16);

  // A single ordinary bench rests beside the western footpath. Repeating the
  // special bench elsewhere would weaken its identity.
  const westBenchPlacement = PARK_BENCHES.find((placement) => placement.id === 'west-path-bench');
  if (!westBenchPlacement) throw new Error('West path bench placement is missing.');
  const pathBench = obstacles.create(
    westBenchPlacement.x,
    westBenchPlacement.y,
    `autumn-${westBenchPlacement.texture}`,
  ) as Phaser.Physics.Arcade.Sprite;
  pathBench.setDepth(westBenchPlacement.y + 15).refreshBody();
  (pathBench.body as Phaser.Physics.Arcade.StaticBody).setSize(46, 11).setOffset(5, 14);

  // Rails explain risky edges: a short guard beside the pond and a continuous
  // boundary between the road approach and the park proper.
  PARK_FENCES.forEach((placement) => scene.add.image(placement.x, placement.y, 'fence')
    .setAngle(placement.angle)
    .setDepth(placement.y + 12));
  const lamp = scene.add.image(820, 386, 'park-lamp').setDepth(410);
  scene.add.image(218, 398, 'park-lamp').setDepth(422);
  const sign = scene.add.image(430, 151, 'park-sign').setDepth(170);
  const flowers = scene.add.image(850, 392, 'flower-patch').setDepth(394);
  const bush = scene.add.image(754, 366, 'autumn-shrub-2').setDepth(377);
  scene.add.image(1048, 344, 'autumn-shrub-0').setDepth(355);
  scene.add.image(1024, 236, 'pond-reeds').setDepth(246);
  scene.add.image(1022, 324, 'pond-reeds').setFlipX(true).setDepth(335);
  scene.add.image(1018, 366, 'grass-tuft').setDepth(368);
  scene.add.image(796, 364, 'rock-small').setDepth(369);
  const waterEdge = scene.add.image(794, 296, 'water-ripple').setAlpha(0.01).setDepth(297);
  const bird = scene.add.image(816, 374, 'bird').setDepth(376);
  scene.tweens.add({ targets: bird, y: 372, duration: 1200, yoyo: true, repeat: -1, ease: 'Stepped' });

  const npcShadow = scene.add.image(505, 303, 'character-shadow').setDepth(294);
  npcShadow.setTint(PALETTE.shadowDeep);
  const npc = obstacles.create(505, 287, 'npc-wanderer') as Phaser.Physics.Arcade.Sprite;
  npc.setDepth(304).refreshBody();
  (npc.body as Phaser.Physics.Arcade.StaticBody).setSize(12, 8).setOffset(6, 22);

  const fragment = scene.add.image(1110, 470, 'fragment').setDepth(470);
  scene.tweens.add({
    targets: fragment,
    y: fragment.y - 3,
    yoyo: true,
    repeat: -1,
    duration: 850,
    ease: 'Stepped',
    easeParams: [3],
  });

  const artifact = scene.add.image(190, 545, 'artifact').setDepth(545);
  scene.tweens.add({ targets: artifact, alpha: 0.62, yoyo: true, repeat: -1, duration: 700 });

  addAmbientMotion(scene);

  return {
    obstacles,
    bench,
    npc,
    fragment,
    artifact,
    details: { lamp, sign, flowers, bush, waterEdge },
  };
}
