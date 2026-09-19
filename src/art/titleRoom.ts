import Phaser from 'phaser';
import type { SaveData } from '../types/game';

export const TITLE_GLASS = { x: 80, y: 26, width: 420, height: 180 };
const C = { ink: 0x292436, wood: 0x654348, edge: 0x9c6958, gold: 0xe8b779, cream: 0xf0dfba };

/** Authored at the game's native pixel resolution, independent of world art. */
export class TitleRoom {
  readonly exterior: Phaser.GameObjects.Container;
  readonly foreground: Phaser.GameObjects.Container;
  readonly mug: Phaser.GameObjects.Container;
  private readonly steam: Phaser.GameObjects.Graphics;
  private readonly curtain: Phaser.GameObjects.Graphics;
  private readonly dust: Phaser.GameObjects.Graphics;
  private nudgeUntil = 0;
  readonly props: string[] = [];

  constructor(private readonly scene: Phaser.Scene, save: Readonly<SaveData>) {
    const g = scene.add.graphics();
    const rect = (x: number, y: number, w: number, h: number, color: number, alpha = 1): void => { g.fillStyle(color, alpha).fillRect(x, y, w, h); };
    rect(0, 0, 640, 360, 0x332d40);
    rect(0, 0, 640, 228, 0x423748);
    for (let x = 12; x < 640; x += 34) { rect(x, 0, 1, 218, 0x67505a, .22); rect(x + 8, 71, 2, 2, 0x937063, .2); }
    rect(0, 216, 640, 8, 0x262334);
    rect(0, 214, 640, 2, 0x785651);
    // Cool evening: broad stepped colour bands, distant rooftops and a quiet road.
    const sky = scene.add.graphics();
    sky.fillStyle(0x596784).fillRect(80, 26, 420, 180);
    sky.fillStyle(0x777e9c).fillRect(80, 79, 420, 60);
    sky.fillStyle(0xa59ba7).fillRect(80, 130, 420, 33);
    sky.fillStyle(0xc2adac).fillRect(80, 151, 420, 17);
    sky.fillStyle(0xb4bec9, .24).fillRect(120, 65, 81, 2).fillRect(128, 63, 46, 2).fillRect(366, 89, 72, 2);
    sky.fillStyle(0xf1e7cf).fillRect(432, 43, 9, 11).fillRect(430, 46, 13, 5);
    sky.fillStyle(0x596784).fillRect(435, 41, 9, 10);
    for (const [x, y] of [[119, 46], [229, 39], [371, 54], [470, 74]] as const) sky.fillStyle(0xd3ced2, .65).fillRect(x, y, 1, 1);
    for (let i = 0; i < 9; i++) {
      const x = 72 + i * 54, y = 142 + (i % 3) * 5;
      sky.fillStyle(i % 2 ? 0x646276 : 0x5b5c70).fillRect(x, y, 46, 27);
      sky.fillStyle(0x4c5067).fillRect(x - 3, y, 52, 3).fillRect(x + 31, y - 6, 4, 6);
      sky.fillStyle(0xe6b88b, .62).fillRect(x + 11, y + 8, 3, 4).fillRect(x + 30, y + 8, 3, 4);
    }
    sky.fillStyle(0x464c60).fillRect(80, 169, 420, 6);
    sky.fillStyle(0x58596a).fillRect(80, 175, 420, 25);
    sky.fillStyle(0x9c9997, .5);
    for (let x = 88; x < 500; x += 45) sky.fillRect(x, 187, 20, 1);
    sky.fillStyle(0x383c50).fillRect(80, 201, 420, 5);
    for (const [x, h] of [[98, 40], [178, 28], [382, 33], [479, 52]] as const) {
      sky.fillStyle(0x343747).fillRect(x, 173 - h, 3, h);
      sky.fillStyle(0x414556).fillRect(x - 9, 148 - h, 20, 27).fillRect(x - 14, 152 - h, 30, 20).fillRect(x - 18, 158 - h, 37, 10);
      sky.fillStyle(0x555064).fillRect(x - 7, 148 - h, 16, 5).fillRect(x - 13, 154 - h, 9, 6).fillRect(x - 17, 162 - h, 9, 5);
      sky.fillStyle(0x363b4e).fillRect(x + 5, 166 - h, 10, 6).fillRect(x - 7, 172 - h, 14, 3);
    }
    this.exterior = scene.add.container(0, 0, [sky]).setDepth(2);
    const mask = scene.make.graphics().fillStyle(0xffffff).fillRect(80, 26, 420, 180);
    const geometry = mask.createGeometryMask();
    this.exterior.setMask(geometry);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { geometry.destroy(); mask.destroy(); });
    const frame = scene.add.graphics().setDepth(5);
    frame.fillStyle(0x252638).fillRect(66, 12, 448, 14).fillRect(66, 206, 448, 16).fillRect(66, 12, 14, 210).fillRect(500, 12, 14, 210);
    frame.fillStyle(C.wood).fillRect(70, 16, 440, 6).fillRect(70, 210, 440, 8).fillRect(70, 20, 6, 193).fillRect(504, 20, 6, 193);
    frame.fillStyle(C.edge).fillRect(74, 22, 428, 2).fillRect(76, 24, 2, 180).fillRect(60, 219, 464, 5);
    frame.fillStyle(0x363344).fillRect(286, 25, 6, 181).fillRect(80, 121, 420, 5);
    frame.fillStyle(0xa18079).fillRect(292, 26, 1, 180).fillRect(80, 125, 420, 1);
    frame.fillStyle(0xf1d6af, .12).fillRect(90, 32, 2, 164).fillRect(94, 32, 1, 80).fillRect(299, 30, 1, 172);
    this.curtain = scene.add.graphics().setDepth(6);
    for (const [x, flip] of [[42, 1], [508, -1]] as const) {
      this.curtain.fillStyle(0x847a8c).fillRect(x, 9, 33, 123).fillRect(x + (flip === 1 ? -3 : 8), 123, 28, 82);
      this.curtain.fillStyle(0x635c73).fillRect(x + 4, 12, 5, 108).fillRect(x + 19, 12, 6, 112);
      this.curtain.fillStyle(0xa89a9f).fillRect(x + 10, 12, 3, 105).fillRect(x + 29, 15, 2, 93);
      this.curtain.fillStyle(C.gold).fillRect(x + 2, 119, 27, 3);
    }
    const desk = scene.add.graphics();
    desk.fillStyle(0x3b2c37).fillRect(0, 244, 640, 116);
    desk.fillStyle(0x946651).fillPoints([{ x: 0, y: 245 }, { x: 640, y: 245 }, { x: 640, y: 335 }, { x: 0, y: 335 }], true);
    desk.fillStyle(0xad795a).fillRect(0, 245, 640, 3);
    desk.fillStyle(0x775044).fillRect(0, 329, 640, 7).fillRect(0, 340, 640, 20);
    desk.fillStyle(0xc39467, .35).fillRect(0, 274, 640, 1).fillRect(0, 306, 640, 1);
    for (let i = 0; i < 23; i++) desk.fillStyle(i % 2 ? 0x65433d : 0xbd895e, .3).fillRect((i * 79) % 610, 252 + (i * 17) % 75, 19 + i % 18, 1);
    // Local lamplight, deliberately not a full-screen orange wash.
    desk.fillStyle(0xf4c981, .12).fillPoints([{ x: 83, y: 192 }, { x: 174, y: 192 }, { x: 266, y: 326 }, { x: 14, y: 326 }], true);
    desk.fillStyle(0xe9b777, .12).fillRect(49, 265, 234, 47);
    this.foreground = scene.add.container(0, 0, [desk]).setDepth(10);
    const props = scene.add.graphics(); this.foreground.add(props);
    props.fillStyle(C.ink).fillRect(104, 207, 7, 54).fillRect(80, 263, 60, 5).fillRect(92, 259, 34, 4);
    props.fillStyle(0xb38c68).fillRect(107, 209, 2, 51).fillRect(87, 263, 44, 2);
    props.fillStyle(0x573f44).fillRect(70, 184, 75, 22).fillRect(80, 170, 54, 15);
    props.fillStyle(0xe7bc80).fillRect(74, 190, 65, 17).fillRect(83, 173, 47, 17);
    props.fillStyle(0xf6d9a0).fillRect(78, 204, 60, 3).fillRect(88, 176, 4, 24);
    // Plant on the sill; leaves are square clusters, not a competing character.
    props.fillStyle(0x372f3f).fillRect(604, 250, 24, 27);
    props.fillStyle(0xaf7867).fillRect(606, 254, 20, 20);
    props.fillStyle(0xd39d7c).fillRect(604, 250, 24, 4).fillRect(608, 257, 2, 15);
    props.fillStyle(0x788571).fillRect(615, 211, 2, 40).fillRect(600, 216, 14, 7).fillRect(618, 226, 18, 8).fillRect(604, 236, 12, 7);
    props.fillStyle(0x9da184).fillRect(607, 216, 7, 3).fillRect(620, 226, 10, 3);
    // A closed notebook and pencil: supporting objects, not menu chrome.
    props.fillStyle(C.ink).fillRect(281, 277, 60, 29);
    props.fillStyle(0x6d7775).fillRect(283, 275, 56, 26);
    props.fillStyle(0xc8b998).fillRect(284, 302, 54, 2);
    props.fillStyle(C.gold).fillRect(293, 286, 29, 2).fillRect(314, 313, 30, 2);
    props.fillStyle(0x493544).fillRect(344, 313, 3, 2);
    const mugArt = scene.add.graphics();
    mugArt.fillStyle(0x593e40, .6).fillRect(-27, 22, 65, 5);
    mugArt.fillStyle(0xb68f72).fillRect(-26, 20, 62, 3);
    mugArt.fillStyle(0xead7b3).fillRect(-23, 17, 54, 4);
    mugArt.fillStyle(0x574147).fillRect(19, -11, 15, 23);
    mugArt.fillStyle(0xe5cb9f).fillRect(20, -9, 11, 19);
    mugArt.fillStyle(0x956751).fillRect(23, -5, 5, 11);
    mugArt.fillStyle(0x574147).fillRect(-23, -20, 45, 37).fillRect(-19, 17, 37, 3);
    mugArt.fillStyle(0xddc69f).fillRect(-21, -16, 41, 30).fillRect(-17, 14, 33, 4);
    mugArt.fillStyle(0xf4e4bf).fillRect(-18, -14, 29, 25).fillRect(-14, 11, 26, 4);
    mugArt.fillStyle(0xb2947c).fillRect(-23, -21, 44, 6);
    mugArt.fillStyle(0xf6e4bd).fillRect(-19, -23, 36, 2).fillRect(-21, -21, 40, 2).fillRect(-19, -17, 36, 2);
    mugArt.fillStyle(0x563b37).fillRect(-17, -21, 32, 4);
    mugArt.fillStyle(0xb88155).fillRect(-15, -20, 14, 1);
    mugArt.fillStyle(0xb67163).fillRect(-6, -5, 4, 3).fillRect(0, -5, 4, 3).fillRect(-6, -2, 10, 3).fillRect(-4, 1, 6, 2).fillRect(-2, 3, 2, 2);
    this.mug = scene.add.container(218, 278, [mugArt]).setName('title-mug');
    this.foreground.add(this.mug);
    const mugHit = scene.add.zone(218, 272, 67, 59).setInteractive({ useHandCursor: true });
    this.foreground.add(mugHit); mugHit.on('pointerdown', () => this.nudge());
    this.steam = scene.add.graphics(); this.foreground.add(this.steam);
    this.dust = scene.add.graphics().setDepth(15);
    this.drawKeepsakes(props, save);
  }

  private drawKeepsakes(g: Phaser.GameObjects.Graphics, save: Readonly<SaveData>): void {
    const restored = (id: string): boolean => save.memories[id]?.restored === true;
    if (restored('first-date')) {
      this.props.push('flower'); g.fillStyle(0x7d8062).fillRect(168, 233, 2, 31);
      g.fillStyle(0xdba3a1).fillRect(163, 227, 12, 6).fillRect(166, 224, 6, 12);
      g.fillStyle(C.gold).fillRect(167, 228, 4, 4);
      g.fillStyle(0x778589).fillRect(163, 250, 12, 17);
    }
    if (restored('porto-performance')) { this.props.push('ticket'); g.fillStyle(0xe1bd90).fillRect(292, 263, 39, 10); g.fillStyle(0xa76c68).fillRect(296, 267, 20, 2).fillRect(324, 264, 1, 8); }
    if (restored('snow-day')) { this.props.push('winter-photo'); g.fillStyle(0xe5dac6).fillRect(19, 256, 26, 27); g.fillStyle(0x98aeb5).fillRect(22, 259, 20, 16); g.fillStyle(0xd9e1db).fillRect(22, 271, 20, 4); }
    if (restored('everyday-us')) { this.props.push('spoon'); g.fillStyle(0xd1c5ad).fillRect(249, 304, 23, 2).fillRect(268, 302, 7, 6); }
    if (restored('adventures')) { this.props.push('souvenir'); g.fillStyle(0xa6a989).fillRect(350, 277, 9, 14); g.fillStyle(0xdfbd7e).fillRect(352, 275, 5, 4); }
  }

  nudge(): void { this.nudgeUntil = this.scene.time.now + 230; }
  update(time: number, reduced: boolean): void {
    this.mug.x = 218 + (time < this.nudgeUntil ? 1 : 0);
    this.curtain.x = reduced ? 0 : Math.round(Math.sin(time / 5300));
    this.steam.clear();
    for (let strand = 0; strand < 2; strand++) {
      for (let i = 0; i < 14; i++) {
        const x = 209 + strand * 11 + Math.round(Math.sin(time / 1700 + i * .48 + strand) * (2 + i / 6));
        this.steam.fillStyle(0xf2dcc0, .33 - i * .016).fillRect(x, 250 - i * 2, 2, 2);
      }
    }
    if (!reduced && Math.floor(time / 1000) % 43 === 23) {
      this.steam.fillStyle(0xf2dcc0, .22).fillRect(215, 217, 2, 2).fillRect(220, 217, 2, 2).fillRect(216, 219, 5, 2).fillRect(218, 221, 1, 1);
    }
    this.dust.clear();
    for (let i = 0; i < 5; i++) this.dust.fillStyle(0xffdf9d, .14).fillRect(60 + i * 34 + (reduced ? 0 : Math.round(Math.sin(time / 5100 + i) * 5)), 213 + i * 14 - (reduced ? 0 : Math.floor(time / 2900 + i) % 8), 1, 1);
  }
}
