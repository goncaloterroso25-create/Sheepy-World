import type Phaser from 'phaser';
import { PALETTE } from './palette';
import { createPixelTexture } from './textureFactory';

type AutumnTreePalette = readonly [number, number, number, number];

function drawAutumnTree(
  graphics: Phaser.GameObjects.Graphics,
  colors: AutumnTreePalette,
  variant: number,
): void {
  const lean = variant % 2 === 0 ? 0 : 2;
  graphics.fillStyle(PALETTE.shadowDeep, 0.28).fillRect(17, 67, 34, 5).fillRect(23, 64, 22, 8);
  graphics.fillStyle(PALETTE.woodDeep)
    .fillRect(27 + lean, 38, 12, 31)
    .fillRect(21 + lean, 47, 8, 7)
    .fillRect(36 + lean, 44, 9, 7);
  graphics.fillStyle(PALETTE.wood)
    .fillRect(30 + lean, 39, 7, 29)
    .fillRect(24 + lean, 47, 7, 4)
    .fillRect(36 + lean, 45, 6, 4);
  graphics.fillStyle(PALETTE.woodLight)
    .fillRect(32 + lean, 43, 2, 19)
    .fillRect(27 + lean, 48, 3, 2);

  graphics.fillStyle(colors[0])
    .fillRect(23 + lean, 3, 18, 6)
    .fillRect(15 + lean, 7, 34, 7)
    .fillRect(9, 13, 46, 9)
    .fillRect(4, 21, 55, 14)
    .fillRect(8, 35, 48, 12)
    .fillRect(16 + lean, 47, 34, 9);
  graphics.fillStyle(colors[1])
    .fillRect(18 + lean, 8, 20, 6)
    .fillRect(8, 18, 21, 13)
    .fillRect(32, 14, 23, 16)
    .fillRect(18, 33, 28, 13)
    .fillRect(6, 29, 10, 7)
    .fillRect(46, 31, 11, 8);
  graphics.fillStyle(colors[2])
    .fillRect(22, 7, 14, 6)
    .fillRect(13, 15, 11, 7)
    .fillRect(39, 12, 10, 7)
    .fillRect(25 + lean, 22, 16, 10)
    .fillRect(11, 36, 12, 7)
    .fillRect(37, 35, 14, 8);
  graphics.fillStyle(colors[3])
    .fillRect(26, 7, 7, 4)
    .fillRect(16, 18, 6, 4)
    .fillRect(42, 17, 7, 4)
    .fillRect(29, 26, 7, 5)
    .fillRect(19, 39, 8, 4);
  graphics.fillStyle(PALETTE.leafRedDeep)
    .fillRect(8, 27, 5, 4)
    .fillRect(48, 25, 5, 4)
    .fillRect(28, 47, 6, 4);
}

function drawCar(graphics: Phaser.GameObjects.Graphics, body: number, compact: boolean): void {
  const bodyX = compact ? 5 : 3;
  const bodyWidth = compact ? 34 : 40;
  graphics.fillStyle(PALETTE.shadowDeep).fillRect(7, 15, 8, 5).fillRect(31, 15, 8, 5);
  graphics.fillStyle(0x17191a).fillRect(9, 16, 4, 4).fillRect(33, 16, 4, 4);
  graphics.fillStyle(PALETTE.outlineSoft)
    .fillRect(bodyX, 8, bodyWidth, 8)
    .fillRect(compact ? 12 : 11, 3, compact ? 22 : 26, 6);
  graphics.fillStyle(body)
    .fillRect(bodyX + 2, 7, bodyWidth - 3, 7)
    .fillRect(compact ? 13 : 12, 2, compact ? 20 : 24, 6)
    .fillRect(bodyX + 5, 5, bodyWidth - 10, 6);
  graphics.fillStyle(PALETTE.waterLight)
    .fillRect(compact ? 15 : 14, 3, 7, 4)
    .fillRect(compact ? 24 : 24, 3, compact ? 8 : 10, 4);
  graphics.fillStyle(PALETTE.waterDeep).fillRect(22, 3, 2, 5);
  graphics.fillStyle(PALETTE.creamLight).fillRect(bodyX + bodyWidth - 2, 9, 3, 3);
  graphics.fillStyle(PALETTE.carRed).fillRect(bodyX, 9, 2, 3);
  graphics.fillStyle(PALETTE.creamLight, 0.65).fillRect(bodyX + 7, 8, bodyWidth - 15, 1);
}

function createTerrainAndProps(scene: Phaser.Scene): void {
  const treePalettes: readonly AutumnTreePalette[] = [
    [PALETTE.leafRedDeep, PALETTE.leafRed, PALETTE.leafOrange, PALETTE.leafGold],
    [PALETTE.leafOrangeDeep, PALETTE.leafOrange, PALETTE.leafGold, PALETTE.leafLight],
    [PALETTE.grassDeep, PALETTE.grassWarm, PALETTE.leafGold, PALETTE.leafLight],
    [PALETTE.leafRedDeep, PALETTE.leafOrangeDeep, PALETTE.leafOrange, PALETTE.leafLight],
  ];
  treePalettes.forEach((palette, index) => createPixelTexture(scene, `tree-${index}`, 64, 76, (g) => {
    drawAutumnTree(g, palette, index);
  }));

  createPixelTexture(scene, 'sapling', 30, 38, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.25).fillRect(6, 34, 21, 3);
    g.fillStyle(PALETTE.woodDeep).fillRect(14, 17, 5, 18);
    g.fillStyle(PALETTE.wood).fillRect(16, 18, 2, 15);
    g.fillStyle(PALETTE.leafOrangeDeep)
      .fillRect(7, 6, 17, 6).fillRect(4, 12, 24, 10).fillRect(9, 22, 15, 4);
    g.fillStyle(PALETTE.leafOrange).fillRect(9, 7, 12, 6).fillRect(6, 14, 10, 7);
    g.fillStyle(PALETTE.leafGold).fillRect(16, 12, 9, 7).fillRect(11, 19, 8, 4);
  });

  const shrubColors = [PALETTE.grassDeep, PALETTE.leafOrangeDeep, PALETTE.leafRedDeep];
  shrubColors.forEach((color, index) => createPixelTexture(scene, `shrub-${index}`, 28, 20, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.2).fillRect(3, 16, 23, 3);
    g.fillStyle(PALETTE.grassDeep).fillRect(4, 8, 21, 9).fillRect(8, 4, 13, 5);
    g.fillStyle(color).fillRect(6, 7, 8, 7).fillRect(15, 5, 8, 9).fillRect(10, 3, 6, 5);
    g.fillStyle(index === 0 ? PALETTE.grassLight : PALETTE.leafGold)
      .fillRect(8, 6, 4, 3).fillRect(17, 7, 4, 3).fillRect(12, 11, 5, 3);
  }));

  createPixelTexture(scene, 'grass-tuft', 10, 9, (g) => {
    g.fillStyle(PALETTE.grassDeep).fillRect(4, 3, 2, 6).fillRect(1, 5, 2, 4).fillRect(7, 4, 2, 5);
    g.fillStyle(PALETTE.grassLight).fillRect(5, 1, 1, 6).fillRect(2, 3, 1, 4).fillRect(8, 2, 1, 5);
  });
  createPixelTexture(scene, 'flower-patch', 12, 9, (g) => {
    g.fillStyle(PALETTE.grassDeep).fillRect(2, 5, 8, 4);
    g.fillStyle(PALETTE.creamLight).fillRect(2, 3, 3, 3).fillRect(8, 2, 3, 3);
    g.fillStyle(PALETTE.leafGold).fillRect(3, 4, 1, 1).fillRect(9, 3, 1, 1);
  });
  createPixelTexture(scene, 'rock-small', 14, 10, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.22).fillRect(2, 7, 11, 3);
    g.fillStyle(PALETTE.stoneDeep).fillRect(2, 4, 11, 4).fillRect(5, 2, 6, 3);
    g.fillStyle(PALETTE.stone).fillRect(4, 3, 6, 4);
    g.fillStyle(PALETTE.stoneLight).fillRect(5, 3, 4, 2);
  });
  createPixelTexture(scene, 'leaf-pile', 22, 10, (g) => {
    g.fillStyle(PALETTE.leafRedDeep).fillRect(1, 6, 20, 3).fillRect(5, 3, 12, 4);
    g.fillStyle(PALETTE.leafOrange).fillRect(3, 5, 7, 3).fillRect(12, 4, 7, 3);
    g.fillStyle(PALETTE.leafGold).fillRect(7, 3, 5, 3).fillRect(15, 6, 4, 2);
  });
  createPixelTexture(scene, 'leaf-speck', 7, 5, (g) => {
    g.fillStyle(PALETTE.white).fillRect(0, 2, 5, 2).fillRect(3, 1, 4, 2).fillRect(3, 3, 1, 2);
  });
  createPixelTexture(scene, 'bench', 56, 28, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.25).fillRect(3, 24, 50, 3);
    g.fillStyle(PALETTE.shadowDeep).fillRect(5, 5, 46, 5).fillRect(7, 15, 42, 6);
    g.fillStyle(PALETTE.woodDeep).fillRect(7, 4, 42, 4).fillRect(9, 14, 38, 5);
    g.fillStyle(PALETTE.woodWarm).fillRect(9, 4, 37, 2).fillRect(11, 14, 33, 2);
    g.fillStyle(PALETTE.woodLight).fillRect(13, 5, 9, 1).fillRect(30, 15, 8, 1);
    g.fillStyle(PALETTE.stoneDeep).fillRect(10, 20, 5, 7).fillRect(41, 20, 5, 7);
    g.fillStyle(PALETTE.stone).fillRect(11, 20, 3, 4).fillRect(42, 20, 3, 4);
    g.fillStyle(PALETTE.woodDeep).fillRect(6, 9, 3, 9).fillRect(47, 9, 3, 9);
  });
  createPixelTexture(scene, 'memory-bench', 60, 30, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.3).fillRect(3, 26, 54, 3);
    g.fillStyle(PALETTE.shadowDeep)
      .fillRect(5, 5, 50, 6).fillRect(7, 16, 46, 6)
      .fillRect(5, 8, 4, 11).fillRect(51, 8, 4, 11);
    g.fillStyle(PALETTE.woodDeep).fillRect(7, 4, 46, 5).fillRect(9, 15, 42, 5);
    g.fillStyle(PALETTE.woodWarm).fillRect(9, 4, 41, 3).fillRect(11, 15, 37, 2);
    g.fillStyle(PALETTE.woodLight)
      .fillRect(12, 5, 12, 1).fillRect(34, 16, 10, 1)
      .fillRect(7, 3, 5, 2).fillRect(48, 3, 5, 2);
    g.fillStyle(PALETTE.stoneDeep).fillRect(11, 21, 5, 8).fillRect(44, 21, 5, 8);
    g.fillStyle(PALETTE.stone).fillRect(12, 21, 3, 5).fillRect(45, 21, 3, 5);
    // A small carved heart and two brass pins make the memory bench findable
    // without turning it into a theme-park prop.
    g.fillStyle(PALETTE.leafGold).fillRect(28, 5, 2, 2).fillRect(31, 5, 2, 2).fillRect(29, 7, 3, 2);
    g.fillStyle(PALETTE.cream).fillRect(8, 6, 1, 1).fillRect(51, 6, 1, 1);
  });
  createPixelTexture(scene, 'fence', 48, 24, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.2).fillRect(0, 21, 48, 3);
    g.fillStyle(PALETTE.woodDeep).fillRect(3, 2, 5, 21).fillRect(40, 2, 5, 21)
      .fillRect(0, 7, 48, 5).fillRect(0, 16, 48, 4);
    g.fillStyle(PALETTE.woodWarm).fillRect(4, 3, 2, 17).fillRect(41, 3, 2, 17)
      .fillRect(1, 8, 45, 2).fillRect(1, 17, 45, 1);
  });
  createPixelTexture(scene, 'park-lamp', 18, 52, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.22).fillRect(2, 48, 14, 3);
    g.fillStyle(PALETTE.shadowDeep).fillRect(7, 14, 5, 35).fillRect(4, 46, 11, 4);
    g.fillStyle(PALETTE.stoneDeep).fillRect(8, 15, 2, 30);
    g.fillStyle(PALETTE.outlineSoft).fillRect(3, 4, 12, 12).fillRect(6, 1, 6, 4);
    g.fillStyle(PALETTE.creamLight).fillRect(5, 6, 8, 7);
    g.fillStyle(PALETTE.warmLight).fillRect(7, 7, 4, 5);
  });
  createPixelTexture(scene, 'park-sign', 34, 34, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.22).fillRect(5, 31, 24, 3);
    g.fillStyle(PALETTE.woodDeep).fillRect(14, 14, 6, 18);
    g.fillStyle(PALETTE.outlineSoft).fillRect(2, 2, 30, 15);
    g.fillStyle(PALETTE.paperShade).fillRect(4, 4, 26, 11);
    g.fillStyle(PALETTE.leafRed).fillRect(7, 7, 20, 2);
    g.fillStyle(PALETTE.ink).fillRect(7, 11, 13, 1);
  });
  createPixelTexture(scene, 'character-shadow', 22, 8, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.34).fillRect(3, 2, 16, 4).fillRect(6, 1, 10, 6);
  });
  createPixelTexture(scene, 'cat-shadow', 18, 6, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.3).fillRect(2, 2, 14, 3).fillRect(5, 1, 8, 5);
  });
  createPixelTexture(scene, 'water-ripple', 24, 7, (g) => {
    g.fillStyle(PALETTE.waterGlint).fillRect(4, 1, 16, 1).fillRect(0, 4, 9, 1).fillRect(14, 5, 10, 1);
    g.fillStyle(PALETTE.waterLight).fillRect(8, 3, 10, 1);
  });
  createPixelTexture(scene, 'pond-reeds', 14, 18, (g) => {
    g.fillStyle(PALETTE.soilDeep).fillRect(1, 15, 12, 3);
    g.fillStyle(PALETTE.grassDeep)
      .fillRect(2, 7, 2, 10).fillRect(6, 3, 2, 14).fillRect(10, 6, 2, 11);
    g.fillStyle(PALETTE.grassLight)
      .fillRect(3, 5, 1, 9).fillRect(7, 1, 1, 12).fillRect(11, 4, 1, 10);
    g.fillStyle(PALETTE.woodWarm)
      .fillRect(2, 3, 2, 4).fillRect(6, 0, 2, 4).fillRect(10, 2, 2, 4);
  });
  createPixelTexture(scene, 'bird', 12, 9, (g) => {
    g.fillStyle(PALETTE.shadowDeep).fillRect(4, 3, 5, 4).fillRect(8, 2, 3, 2).fillRect(2, 5, 3, 2);
    g.fillStyle(PALETTE.stoneLight).fillRect(5, 3, 3, 2);
    g.fillStyle(PALETTE.leafGold).fillRect(10, 3, 2, 1);
  });
}

function createCars(scene: Phaser.Scene): void {
  const colors = {
    red: PALETTE.carRed,
    blue: PALETTE.carBlue,
    green: PALETTE.carGreen,
    cream: PALETTE.carCream,
    yellow: PALETTE.yellowCar,
  } as const;
  Object.entries(colors).forEach(([name, color], index) => {
    createPixelTexture(scene, `car-${name}`, 48, 20, (g) => drawCar(g, color, index % 2 === 0));
  });
}

function createHomeProof(scene: Phaser.Scene): void {
  createPixelTexture(scene, 'home-couch', 72, 42, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.25).fillRect(3, 38, 66, 4);
    g.fillStyle(PALETTE.plumDeep).fillRect(4, 13, 64, 25).fillRect(8, 7, 56, 12);
    g.fillStyle(PALETTE.plum).fillRect(7, 14, 58, 20).fillRect(11, 9, 50, 10);
    g.fillStyle(PALETTE.plumLight).fillRect(10, 15, 21, 4).fillRect(40, 15, 21, 4);
    g.fillStyle(PALETTE.cream).fillRect(12, 13, 15, 11);
    g.fillStyle(PALETTE.leafGold).fillRect(15, 16, 9, 5);
    g.fillStyle(PALETTE.woodDeep).fillRect(9, 35, 6, 6).fillRect(57, 35, 6, 6);
  });
  createPixelTexture(scene, 'cof-mug', 18, 18, (g) => {
    g.fillStyle(PALETTE.shadowDeep).fillRect(3, 5, 11, 11).fillRect(13, 7, 4, 6);
    g.fillStyle(PALETTE.cream).fillRect(4, 4, 9, 10).fillRect(13, 8, 3, 4);
    g.fillStyle(PALETTE.plum).fillRect(6, 8, 5, 3);
    g.fillStyle(PALETTE.shadowWarm).fillRect(5, 5, 7, 2);
    g.fillStyle(PALETTE.fog).fillRect(7, 0, 1, 4).fillRect(10, 1, 1, 3);
  });
  createPixelTexture(scene, 'home-lamp', 28, 48, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.2).fillRect(3, 44, 22, 4);
    g.fillStyle(PALETTE.woodDeep).fillRect(12, 21, 5, 24).fillRect(8, 42, 13, 4);
    g.fillStyle(PALETTE.leafGold).fillRect(5, 5, 18, 17).fillRect(8, 2, 12, 5);
    g.fillStyle(PALETTE.creamLight).fillRect(8, 7, 12, 11);
    g.fillStyle(PALETTE.warmLight).fillRect(11, 9, 6, 8);
  });
}

function createArchitectureProof(scene: Phaser.Scene): void {
  createPixelTexture(scene, 'arch-stone-wall', 64, 48, (g) => {
    g.fillStyle(PALETTE.stoneDeep).fillRect(0, 0, 64, 48);
    g.fillStyle(PALETTE.stone).fillRect(2, 2, 19, 12).fillRect(23, 2, 26, 12).fillRect(51, 2, 11, 12)
      .fillRect(2, 16, 28, 13).fillRect(32, 16, 30, 13).fillRect(2, 31, 17, 15)
      .fillRect(21, 31, 24, 15).fillRect(47, 31, 15, 15);
    g.fillStyle(PALETTE.stoneLight).fillRect(4, 3, 15, 2).fillRect(25, 3, 20, 2)
      .fillRect(4, 17, 22, 2).fillRect(34, 17, 24, 2).fillRect(23, 32, 18, 2);
  });
  createPixelTexture(scene, 'arch-plaster-wall', 64, 48, (g) => {
    g.fillStyle(PALETTE.plaster).fillRect(0, 0, 64, 48);
    g.fillStyle(PALETTE.plasterLight).fillRect(3, 3, 58, 3).fillRect(7, 15, 31, 2);
    g.fillStyle(PALETTE.paperShade).fillRect(0, 42, 64, 6).fillRect(49, 8, 2, 23);
    g.fillStyle(PALETTE.stoneShade).fillRect(3, 40, 9, 2).fillRect(27, 43, 14, 2);
  });
  createPixelTexture(scene, 'arch-window', 28, 40, (g) => {
    g.fillStyle(PALETTE.outlineSoft).fillRect(2, 2, 24, 36);
    g.fillStyle(PALETTE.waterDeep).fillRect(5, 5, 18, 27);
    g.fillStyle(PALETTE.waterLight).fillRect(6, 6, 7, 12).fillRect(15, 6, 7, 12);
    g.fillStyle(PALETTE.shadowDeep).fillRect(13, 4, 2, 29).fillRect(4, 19, 20, 2);
    g.fillStyle(PALETTE.stoneLight).fillRect(0, 35, 28, 5).fillRect(3, 1, 22, 3);
  });
  createPixelTexture(scene, 'arch-door', 32, 48, (g) => {
    g.fillStyle(PALETTE.stoneDeep).fillRect(1, 1, 30, 47);
    g.fillStyle(PALETTE.woodDeep).fillRect(5, 5, 22, 43);
    g.fillStyle(PALETTE.wood).fillRect(7, 7, 18, 39);
    g.fillStyle(PALETTE.woodLight).fillRect(9, 9, 3, 35).fillRect(19, 9, 3, 35);
    g.fillStyle(PALETTE.festivalGold).fillRect(21, 26, 3, 3);
  });
  createPixelTexture(scene, 'arch-balcony', 64, 28, (g) => {
    g.fillStyle(PALETTE.stoneLight).fillRect(0, 0, 64, 6).fillRect(3, 23, 58, 5);
    g.fillStyle(PALETTE.stoneDeep).fillRect(2, 6, 4, 18).fillRect(58, 6, 4, 18);
    for (let x = 10; x < 58; x += 10) g.fillRect(x, 7, 3, 16);
    g.fillRect(4, 10, 56, 3);
  });
  createPixelTexture(scene, 'arch-roof-edge', 80, 24, (g) => {
    g.fillStyle(PALETTE.shadowDeep).fillRect(0, 18, 80, 6);
    g.fillStyle(PALETTE.leafRedDeep).fillRect(0, 11, 80, 9);
    g.fillStyle(PALETTE.leafOrangeDeep).fillRect(2, 7, 76, 8);
    for (let x = 4; x < 78; x += 10) g.fillStyle(PALETTE.woodLight).fillRect(x, 7, 6, 3);
  });
  createPixelTexture(scene, 'arch-bridge', 120, 58, (g) => {
    g.fillStyle(PALETTE.stoneDeep).fillRect(0, 9, 120, 49);
    g.fillStyle(PALETTE.stone).fillRect(0, 4, 120, 15).fillRect(4, 19, 112, 8)
      .fillRect(0, 27, 26, 31).fillRect(94, 27, 26, 31);
    g.fillStyle(PALETTE.stoneLight).fillRect(0, 4, 120, 4).fillRect(6, 20, 108, 3);
    g.fillStyle(PALETTE.waterDeep).fillRect(26, 27, 68, 31);
    g.fillStyle(PALETTE.water).fillRect(31, 34, 58, 24).fillRect(39, 29, 42, 6);
    g.fillStyle(PALETTE.waterGlint).fillRect(38, 41, 19, 2).fillRect(64, 50, 20, 2);
  });
}

function createWinterProof(scene: Phaser.Scene): void {
  createPixelTexture(scene, 'winter-ground', 64, 48, (g) => {
    g.fillStyle(PALETTE.snowShadow).fillRect(0, 0, 64, 48);
    g.fillStyle(PALETTE.snow).fillRect(0, 0, 64, 42).fillRect(5, 42, 50, 4);
    g.fillStyle(PALETTE.snowLight).fillRect(3, 3, 28, 3).fillRect(36, 13, 21, 2)
      .fillRect(14, 29, 34, 3);
    g.fillStyle(PALETTE.winterVegetation).fillRect(7, 40, 3, 5).fillRect(53, 38, 2, 7);
  });
  createPixelTexture(scene, 'winter-shrub', 32, 24, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.2).fillRect(3, 20, 26, 3);
    g.fillStyle(PALETTE.winterVegetation).fillRect(5, 10, 22, 11).fillRect(10, 6, 12, 6);
    g.fillStyle(PALETTE.snow).fillRect(5, 8, 11, 5).fillRect(14, 5, 10, 6).fillRect(18, 12, 9, 4);
    g.fillStyle(PALETTE.snowLight).fillRect(8, 7, 7, 3).fillRect(16, 4, 6, 3);
  });
  createPixelTexture(scene, 'winter-pine', 56, 82, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.2).fillRect(10, 77, 36, 4);
    g.fillStyle(PALETTE.woodDeep).fillRect(25, 56, 7, 22);
    g.fillStyle(PALETTE.winterDeep).fillRect(23, 4, 10, 12).fillRect(17, 13, 22, 14)
      .fillRect(11, 25, 34, 17).fillRect(5, 40, 46, 22);
    g.fillStyle(PALETTE.winterVegetation).fillRect(24, 6, 7, 9).fillRect(19, 15, 16, 10)
      .fillRect(14, 27, 26, 13).fillRect(9, 43, 36, 16);
    g.fillStyle(PALETTE.snow).fillRect(22, 10, 13, 5).fillRect(15, 22, 25, 6)
      .fillRect(9, 37, 37, 7).fillRect(5, 54, 46, 8);
    g.fillStyle(PALETTE.snowLight).fillRect(24, 9, 8, 3).fillRect(18, 21, 16, 3)
      .fillRect(13, 36, 24, 3);
  });
  createPixelTexture(scene, 'winter-rock', 42, 28, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.2).fillRect(3, 24, 36, 4);
    g.fillStyle(PALETTE.winterDeep).fillRect(4, 13, 34, 12).fillRect(10, 7, 23, 8);
    g.fillStyle(PALETTE.winterBlue).fillRect(8, 12, 26, 10).fillRect(13, 8, 16, 6);
    g.fillStyle(PALETTE.snow).fillRect(8, 8, 25, 6).fillRect(13, 5, 15, 4);
    g.fillStyle(PALETTE.snowLight).fillRect(15, 5, 10, 2);
  });
  createPixelTexture(scene, 'fog-bank', 128, 32, (g) => {
    g.fillStyle(PALETTE.fog, 0.46).fillRect(0, 10, 128, 17).fillRect(18, 5, 45, 9)
      .fillRect(71, 2, 39, 11).fillRect(40, 26, 73, 5);
  });
  createPixelTexture(scene, 'snow-particle', 5, 5, (g) => {
    g.fillStyle(PALETTE.snowLight).fillRect(2, 0, 1, 5).fillRect(0, 2, 5, 1);
  });
  createPixelTexture(scene, 'jeronimo', 32, 42, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.22).fillRect(4, 38, 24, 4);
    g.fillStyle(PALETTE.snowShadow).fillRect(7, 22, 20, 17).fillRect(9, 10, 16, 15);
    g.fillStyle(PALETTE.snow).fillRect(8, 20, 19, 17).fillRect(10, 8, 15, 16);
    g.fillStyle(PALETTE.snowLight).fillRect(11, 9, 10, 7).fillRect(11, 21, 11, 8);
    g.fillStyle(PALETTE.shadowWarm).fillRect(14, 13, 2, 2).fillRect(21, 14, 2, 2)
      .fillRect(18, 17, 2, 2).fillRect(17, 28, 2, 2);
    g.fillStyle(PALETTE.leafOrangeDeep).fillRect(6, 7, 3, 15).fillRect(3, 8, 5, 2)
      .fillRect(24, 10, 6, 2).fillRect(27, 7, 2, 7)
      .fillRect(1, 24, 8, 2).fillRect(24, 25, 8, 2);
    g.fillStyle(PALETTE.leafRedDeep).fillRect(5, 5, 4, 4).fillRect(25, 6, 3, 4);
  });
}

function createFestivalProof(scene: Phaser.Scene): void {
  createPixelTexture(scene, 'festival-stall', 96, 70, (g) => {
    g.fillStyle(PALETTE.shadowDeep, 0.25).fillRect(4, 65, 88, 5);
    g.fillStyle(PALETTE.woodDeep).fillRect(8, 20, 6, 46).fillRect(82, 20, 6, 46)
      .fillRect(8, 50, 80, 8);
    g.fillStyle(PALETTE.wood).fillRect(10, 22, 3, 40).fillRect(83, 22, 3, 40)
      .fillRect(11, 51, 74, 4);
    g.fillStyle(PALETTE.paperShade).fillRect(5, 10, 86, 16);
    for (let x = 5; x < 91; x += 20) {
      g.fillStyle((x / 20) % 2 < 1 ? PALETTE.festivalRed : PALETTE.cream)
        .fillRect(x, 10, 10, 18);
    }
    g.fillStyle(PALETTE.shadowWarm).fillRect(20, 35, 56, 15);
    g.fillStyle(PALETTE.festivalGold).fillRect(26, 39, 10, 8).fillRect(44, 37, 9, 10)
      .fillRect(61, 40, 9, 7);
  });
  createPixelTexture(scene, 'festival-banner', 64, 34, (g) => {
    g.fillStyle(PALETTE.woodDeep).fillRect(1, 0, 3, 34).fillRect(60, 0, 3, 34);
    const colors = [PALETTE.festivalRed, PALETTE.festivalGold, PALETTE.festivalBlue, PALETTE.festivalPurple];
    colors.forEach((color, index) => {
      const x = 7 + index * 14;
      g.fillStyle(color).fillRect(x, 4, 10, 13).fillRect(x + 2, 17, 6, 5);
    });
    g.fillStyle(PALETTE.creamLight).fillRect(4, 3, 56, 2);
  });
  createPixelTexture(scene, 'festival-target', 38, 50, (g) => {
    g.fillStyle(PALETTE.woodDeep).fillRect(8, 42, 22, 5).fillRect(17, 31, 5, 16);
    g.fillStyle(PALETTE.cream).fillRect(3, 2, 32, 32);
    g.fillStyle(PALETTE.festivalRed).fillRect(7, 6, 24, 24);
    g.fillStyle(PALETTE.cream).fillRect(12, 11, 14, 14);
    g.fillStyle(PALETTE.festivalBlue).fillRect(16, 15, 6, 6);
  });
}

function createEffects(scene: Phaser.Scene): void {
  createPixelTexture(scene, 'pshw-impact', 28, 24, (g) => {
    g.fillStyle(PALETTE.shadowWarm).fillRect(12, 0, 4, 7).fillRect(12, 17, 4, 7)
      .fillRect(0, 10, 8, 4).fillRect(20, 10, 8, 4)
      .fillRect(4, 3, 5, 5).fillRect(19, 3, 5, 5)
      .fillRect(4, 16, 5, 5).fillRect(19, 16, 5, 5);
    g.fillStyle(PALETTE.festivalGold).fillRect(9, 6, 10, 12).fillRect(6, 9, 16, 6);
    g.fillStyle(PALETTE.creamLight).fillRect(12, 8, 4, 8).fillRect(10, 10, 8, 4);
  });
  createPixelTexture(scene, 'heart-spark', 12, 12, (g) => {
    g.fillStyle(PALETTE.plumDeep).fillRect(1, 3, 10, 5).fillRect(3, 8, 6, 2).fillRect(5, 10, 2, 2);
    g.fillStyle(PALETTE.plumLight).fillRect(2, 2, 3, 5).fillRect(7, 2, 3, 5).fillRect(4, 4, 4, 5);
  });
  createPixelTexture(scene, 'music-note', 10, 14, (g) => {
    g.fillStyle(PALETTE.festivalPurple).fillRect(6, 1, 2, 10).fillRect(3, 3, 5, 2)
      .fillRect(1, 9, 5, 4);
  });
  createPixelTexture(scene, 'collision', 2, 2, (g) => {
    g.fillStyle(PALETTE.ink).fillRect(0, 0, 2, 2);
  });
  createPixelTexture(scene, 'fragment', 16, 16, (g) => {
    g.fillStyle(PALETTE.soilDeep).fillRect(7, 1, 2, 14).fillRect(1, 7, 14, 2);
    g.fillStyle(PALETTE.leafGold).fillRect(5, 3, 6, 10).fillRect(3, 5, 10, 6);
    g.fillStyle(PALETTE.creamLight).fillRect(7, 3, 2, 8).fillRect(5, 7, 6, 2);
  });
  createPixelTexture(scene, 'artifact', 16, 16, (g) => {
    g.fillStyle(PALETTE.woodDeep).fillRect(6, 1, 5, 2).fillRect(4, 4, 9, 8).fillRect(3, 10, 11, 3);
    g.fillStyle(PALETTE.leafGold).fillRect(7, 2, 3, 2).fillRect(5, 5, 7, 6).fillRect(4, 10, 9, 2);
    g.fillStyle(PALETTE.creamLight).fillRect(7, 4, 3, 6).fillRect(5, 9, 7, 2);
  });
}

export function createWorldTextures(scene: Phaser.Scene): void {
  createTerrainAndProps(scene);
  createCars(scene);
  createHomeProof(scene);
  createArchitectureProof(scene);
  createWinterProof(scene);
  createFestivalProof(scene);
  createEffects(scene);
}
