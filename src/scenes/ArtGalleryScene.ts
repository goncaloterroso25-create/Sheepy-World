import Phaser from 'phaser';
import { developerTextureKey, TOBIAS_SHOULDER_ANCHORS } from '../art/characterTextures';
import { PALETTE } from '../art/palette';
import { GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../config/constants';
import { idleTextureKey, locomotionTextureKey, ponytailTextureKey, type FacingDirection } from '../entities/playerAnimations';
import { LocomotionCycle, STRIDE_FRAMES } from '../systems/LocomotionCycle';
import { MOVEMENT } from '../config/movement';
import { addBodyText, addHeadingText, addPixelText, addSmallText } from '../ui/PixelFont';
import { CAMEO_KEYS, PEOPLE_LOOKS } from '../art/peopleTextures';

type GalleryPanel = 'characters' | 'people' | 'cameos' | 'protagonist' | 'playfulCallback' | 'movement' | 'tobias' | 'cats' | 'cat-markings' | 'ui' | 'winter' | 'jeronimo' | 'architecture' | 'festival';

export class ArtGalleryScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.gallery);
  }

  create(): void {
    if (!import.meta.env.DEV) {
      this.scene.start(SCENE_KEYS.title);
      return;
    }
    this.cameras.main.setRoundPixels(true);
    const panel = (new URLSearchParams(window.location.search).get('panel') ?? 'characters') as GalleryPanel;
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, PALETTE.shadowDeep).setOrigin(0);
    addPixelText(this, 20, 14, 'DEVELOPMENT ART GALLERY', 10, PALETTE.creamLight);
    addPixelText(this, 20, 39, 'PRODUCTION-DIRECTION / DEV ONLY', 6, PALETTE.leafGold);
    this.add.rectangle(20, 55, 600, 2, PALETTE.paperShadow).setOrigin(0);

    if (panel === 'people' || panel === 'cameos') this.drawPeople(panel === 'cameos');
    else if (panel === 'movement') this.drawMovement();
    else if (panel === 'protagonist') this.drawProtagonist();
    else if (panel === 'playfulCallback') this.drawPlayfulCallback();
    else if (panel === 'tobias') this.drawTobiasCompositions();
    else if (panel === 'cats' || panel === 'cat-markings') this.drawCats();
    else if (panel === 'ui') this.drawTypography();
    else if (panel === 'winter') this.drawWinter();
    else if (panel === 'jeronimo') this.drawJerónimo();
    else if (panel === 'architecture') this.drawArchitecture();
    else if (panel === 'festival') this.drawFestivalAndHome();
    else this.drawCharacters();

    addPixelText(this, 620, 342, panel.toUpperCase(), 6, PALETTE.paperShade).setOrigin(1, 0);
  }

  private drawMovement(): void {
    const direction = new URLSearchParams(window.location.search).get('direction');
    const facing: FacingDirection = direction === 'left' || direction === 'up' || direction === 'down' ? direction : 'right';
    addSmallText(this, 32, 72, `WALK / SPRINT - ${facing.toUpperCase()} - FOOT-PLANT FRAMES MARKED`, PALETTE.paper);
    (['walk', 'sprint'] as const).forEach((gait, row) => {
      const y = 138 + row * 125;
      STRIDE_FRAMES.forEach((phase, index) => {
        const x = 95 + index * 100;
        this.add.rectangle(x, y, 86, 86, PALETTE.grassDeep);
        this.add.image(x, y, locomotionTextureKey(facing, phase, gait)).setScale(2);
        addSmallText(this, x, y + 46, phase.startsWith('step') ? 'PLANT' : 'PASS',
          phase.startsWith('step') ? PALETTE.leafGold : PALETTE.paperShade).setOrigin(0.5);
      });
      const animated = this.add.image(526, y, locomotionTextureKey(facing, 'pass-a', gait)).setScale(2);
      const label = addSmallText(this, 526, y + 46, gait.toUpperCase(), PALETTE.paper).setOrigin(0.5);
      const cycle = new LocomotionCycle();
      const animate = (_time: number, delta: number): void => {
        cycle.advance((gait === 'walk' ? MOVEMENT.walkSpeed : MOVEMENT.sprintSpeed) * Math.min(delta, 100) / 1000, gait);
        animated.setTexture(locomotionTextureKey(facing, cycle.frame, gait));
        label.setTint(cycle.frame.startsWith('step') ? PALETTE.leafGold : PALETTE.paper);
      };
      this.events.on(Phaser.Scenes.Events.UPDATE, animate);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.events.off(Phaser.Scenes.Events.UPDATE, animate));
    });
  }

  private drawPeople(cameos:boolean):void {
    const keys=cameos?CAMEO_KEYS:PEOPLE_LOOKS.map(p=>p.id);
    keys.forEach((key,i)=>{
      const x=76+i%6*98,y=160+Math.floor(i/6)*121;
      this.add.rectangle(x,y-15,84,98,PALETTE.grassDeep);
      this.add.image(x,y-16,`${cameos?'cameo':'person'}-${key}-0`).setScale(2);
      addSmallText(this,x,y+37,key,PALETTE.paper).setOrigin(.5);
    });
  }

  private drawCharacters(): void {
    addPixelText(this, 34, 72, 'PROTAGONIST / 24 x 32', 7, PALETTE.paper);
    const directions: readonly FacingDirection[] = ['down', 'up', 'left', 'right'];
    directions.forEach((direction, index) => {
      const x = 57 + index * 68;
      this.add.image(x, 147, 'character-shadow').setScale(1.5);
      this.add.image(x, 122, idleTextureKey(direction)).setScale(2);
      addPixelText(this, x, 164, direction.toUpperCase(), 5, PALETTE.paperShade).setOrigin(0.5);
    });

    addPixelText(this, 344, 72, 'DEVELOPER / 24 x 36', 7, PALETTE.paper);
    directions.forEach((direction, index) => {
      const x = 357 + index * 68;
      this.add.image(x, 147, 'character-shadow').setScale(1.5);
      this.add.image(x, 120, developerTextureKey(direction)).setScale(2);
      addPixelText(this, x, 164, direction.toUpperCase(), 5, PALETTE.paperShade).setOrigin(0.5);
    });

    this.add.rectangle(24, 184, 592, 140, PALETTE.grassDeep).setOrigin(0);
    this.add.image(84, 286, 'tree-0');
    this.add.image(556, 286, 'tree-2');
    this.add.image(226, 277, 'memory-bench');
    this.add.image(342, 290, 'character-shadow');
    this.add.image(342, 274, 'player-right-idle');
    this.add.image(372, 290, 'character-shadow');
    this.add.image(372, 273, developerTextureKey('left'));
    this.add.image(401, 292, 'cat-tobias-sit');
    addPixelText(this, 320, 202, 'HEIGHT / SILHOUETTE / OUTFIT CHECK', 7, PALETTE.creamLight).setOrigin(0.5);
    addPixelText(this, 320, 309, 'WHITE + BLACK / PURPLE + DENIM / DISTINCT FACES', 5, PALETTE.paper)
      .setOrigin(0.5);
  }

  private drawProtagonist(): void {
    addPixelText(this, 32, 72, 'PROTAGONIST / ANATOMY + HAIR PROOF', 8, PALETTE.paper);
    const directions: readonly FacingDirection[] = ['down', 'up', 'left', 'right'];
    directions.forEach((direction, index) => {
      const x = 82 + index * 92;
      this.add.rectangle(x, 151, 72, 126, PALETTE.grassDeep).setStrokeStyle(2, PALETTE.paperShadow);
      this.add.image(x, 184, 'character-shadow').setScale(1.5);
      this.add.image(x, 151, idleTextureKey(direction)).setScale(3);
      addSmallText(this, x, 211, direction, PALETTE.paperShade).setOrigin(0.5);
    });
    addBodyText(this, 462, 91, 'Loose hair', PALETTE.creamLight).setOrigin(0.5);
    this.add.image(485, 150, idleTextureKey('right')).setScale(3);
    addBodyText(this, 567, 91, 'Hair tie', PALETTE.creamLight).setOrigin(0.5);
    this.add.image(567, 150, ponytailTextureKey('right')).setScale(3);
    this.add.rectangle(24, 238, 592, 82, PALETTE.grassDeep).setOrigin(0).setStrokeStyle(2, PALETTE.paperShadow);
    this.add.image(250, 294, 'character-shadow');
    this.add.image(250, 278, idleTextureKey('right'));
    this.add.image(320, 294, 'character-shadow');
    this.add.image(320, 278, idleTextureKey('left'));
    this.add.image(390, 294, 'character-shadow');
    this.add.image(390, 278, ponytailTextureKey('right'));
    addSmallText(this, 320, 308, 'Actual game scale / left-cheek gummy / future hair tie', PALETTE.creamLight).setOrigin(0.5);
  }

  private drawTobiasCompositions(): void {
    addPixelText(this, 32, 76, 'TOBIAS SHOULDER ATTACHMENT PROOF', 8, PALETTE.paper);
    const directions: readonly FacingDirection[] = ['down', 'up', 'left', 'right'];
    directions.forEach((direction, index) => {
      const x = 105 + index * 140;
      const y = 185;
      this.add.rectangle(x, y + 18, 104, 134, index % 2 ? PALETTE.grassShade : PALETTE.grassDeep)
        .setStrokeStyle(2, PALETTE.paperShadow);
      this.add.image(x, y + 45, 'character-shadow');
      this.add.image(x, y + 28, idleTextureKey(direction));
      const anchor = TOBIAS_SHOULDER_ANCHORS[direction];
      this.add.image(x - 12 + anchor.x, y + 12 + anchor.y, 'cat-tobias-shoulder')
        .setFlipX(anchor.flipX ?? false)
        .setDepth(4);
      addPixelText(this, x, y - 28, direction.toUpperCase(), 6, PALETTE.creamLight).setOrigin(0.5);
      addPixelText(this, x, y + 81, `${anchor.x},${anchor.y}`, 6, PALETTE.paperShade).setOrigin(0.5);
    });
    addPixelText(this, 320, 304, 'INTEGER ANCHORS / FACE REMAINS CLEAR / COLLISION UNCHANGED', 6, PALETTE.leafGold)
      .setOrigin(0.5);
  }

  private drawCats(): void {
    addHeadingText(this, 320, 68, 'CAT MARKING REVIEW', PALETTE.paper).setFontSize(14).setOrigin(0.5, 0);
    const cats = [
      { id: 'tobias', name: 'TOBIAS', note: 'Green eyes, all poses\nSmall black chin kept' },
      { id: 'teemi', name: 'TEEMI', note: 'Seated bridge kept\nWhite muzzle stays' },
      { id: 'chicho', name: 'CHICHO / SKY', note: 'Tapered feline face\nNear-white cool coat' },
    ] as const;
    const focus = new URLSearchParams(window.location.search).get('cat');
    const selected = cats.find((cat) => cat.id === focus);
    if (selected) {
      this.add.rectangle(320, 213, 588, 238, PALETTE.grassDeep).setStrokeStyle(2, PALETTE.paperShadow);
      addBodyText(this, 320, 104, selected.name, PALETTE.creamLight).setOrigin(0.5);
      (['front', 'side', 'sit'] as const).forEach((pose, index) => {
        const x = 164 + index * 156;
        addSmallText(this, x, 136, pose.toUpperCase(), PALETTE.paper).setOrigin(0.5);
        this.add.image(x, 191, `cat-${selected.id}-${pose}`).setScale(4);
        this.add.image(x, 258, `cat-${selected.id}-${pose}`);
      });
      addSmallText(this, 320, 278, '4X ABOVE / NATIVE BELOW - NO FILTERING', PALETTE.paperShade).setOrigin(0.5);
      addBodyText(this, 72, 298, selected.note, PALETTE.creamLight);
      const idleX = selected.id === 'tobias' ? 405 : 520;
      this.add.image(idleX, 301, `cat-${selected.id}-idle`).setScale(2);
      addSmallText(this, idleX, 325, 'IDLE', PALETTE.paper).setOrigin(0.5);
      if (selected.id === 'tobias') {
        this.add.image(486, 302, idleTextureKey('right'));
        const anchor = TOBIAS_SHOULDER_ANCHORS.right;
        this.add.image(486 - 12 + anchor.x, 302 - 16 + anchor.y, 'cat-tobias-shoulder');
        this.add.image(544, 298, 'cat-tobias-shoulder').setScale(3);
        addSmallText(this, 518, 322, 'CARRY / CHIN', PALETTE.paper).setOrigin(0.5);
      }
      return;
    }
    cats.forEach((cat, index) => {
      const x = 116 + index * 204;
      this.add.rectangle(x, 213, 184, 238, index === 0 ? PALETTE.plumDeep : PALETTE.grassDeep)
        .setStrokeStyle(2, PALETTE.paperShadow);
      addSmallText(this, x, 108, cat.name, PALETTE.creamLight).setOrigin(0.5);
      (['front', 'side', 'sit', 'idle'] as const).forEach((pose, row) => {
        const y = 139 + row * 45;
        addSmallText(this, x - 82, y - 5, pose.toUpperCase(), PALETTE.paper);
        this.add.image(x + 8, y, `cat-${cat.id}-${pose}`).setScale(2);
        this.add.image(x + 68, y, `cat-${cat.id}-${pose}`);
      });
      addSmallText(this, x - 80, 303, cat.note, PALETTE.creamLight);
    });
  }

  private drawPlayfulCallback(): void {
    addHeadingText(this, 32, 68, 'BLUSH_ACCENT VISIBILITY REVIEW', PALETTE.paper).setFontSize(18);
    const views = [
      { direction: 'down', label: 'FRONT', note: 'Left cheek' },
      { direction: 'right', label: 'LEFT CHEEK', note: 'Screen-right' },
      { direction: 'left', label: 'OTHER SIDE', note: 'No mark here' },
      { direction: 'up', label: 'BACK', note: 'No mark here' },
    ] as const;
    views.forEach((view, index) => {
      const x = 90 + index * 153;
      this.add.rectangle(x, 210, 142, 228, PALETTE.grassDeep);
      addSmallText(this, x, 105, view.label, PALETTE.creamLight).setOrigin(0.5, 0);
      this.add.image(x, 180, idleTextureKey(view.direction)).setScale(3);
      addSmallText(this, x, 235, view.note, PALETTE.paper).setOrigin(0.5, 0);
      this.add.image(x - 27, 287, idleTextureKey(view.direction));
      this.add.image(x + 27, 283, idleTextureKey(view.direction)).setScale(2);
    });
    addSmallText(this, 320, 331, '3X ABOVE / NATIVE + 2X BELOW / MARK ONLY ON EXPOSED CHEEK', PALETTE.paper).setOrigin(0.5, 0);
  }

  private drawTypography(): void {
    addHeadingText(this, 32, 72, 'Readable type', PALETTE.creamLight);
    addBodyText(this, 34, 116, 'Body text keeps mixed case and a calm reading rhythm.', PALETTE.paper).setMaxWidth(560);
    addSmallText(this, 34, 151, 'SMALL LABEL / TAB  SCRAPBOOK / I  BAG', PALETTE.leafGold);
    this.add.rectangle(32, 184, 576, 116, PALETTE.paper).setOrigin(0).setStrokeStyle(3, PALETTE.wood);
    addHeadingText(this, 52, 201, 'Scrapbook', PALETTE.ink);
    addBodyText(this, 52, 238, 'Some pages remember before we do.', PALETTE.woodDeep);
    addSmallText(this, 52, 270, 'Tab or Q to close', PALETTE.leafRedDeep);
    addPixelText(this, 604, 316, 'LEGACY 5x7', 5, PALETTE.paperShadow).setOrigin(1, 0);
  }

  private drawWinter(): void {
    addPixelText(this, 24, 72, 'WINTER OUTFIT / ALL DIRECTIONS / RED TOP CHECK', 7, PALETTE.paper);
    this.add.rectangle(12, 94, 472, 238, PALETTE.winterBlue).setOrigin(0).setStrokeStyle(2,PALETTE.snowShadow);
    this.add.rectangle(12, 252, 472, 80, PALETTE.snow).setOrigin(0);
    const directions:readonly FacingDirection[]=['down','up','left','right'];
    const rows=[
      {label:'IDLE',texture:(direction:FacingDirection)=>idleTextureKey(direction,'snow')},
      {label:'WALK',texture:(direction:FacingDirection)=>locomotionTextureKey(direction,'step-a','walk','loose','snow')},
      {label:'SPRINT',texture:(direction:FacingDirection)=>locomotionTextureKey(direction,'pass-a','sprint','loose','snow')},
    ] as const;
    directions.forEach((direction,column)=>{
      const x=112+column*86;
      addSmallText(this,x,104,direction.toUpperCase(),PALETTE.creamLight).setOrigin(.5);
      rows.forEach((row,index)=>{
        const y=143+index*58;
        this.add.rectangle(x,y,52,48,index%2?0x587488:0x4c697d,.78).setStrokeStyle(1,PALETTE.snowShadow);
        this.add.image(x,y,row.texture(direction)).setScale(1.35);
      });
    });
    rows.forEach((row,index)=>addSmallText(this,22,138+index*58,row.label,PALETTE.winterDeep));
    this.add.rectangle(496,94,132,238,PALETTE.snow,.96).setOrigin(0).setStrokeStyle(2,PALETTE.winterBlue);
    addSmallText(this,562,105,'TOBIAS ANCHOR',PALETTE.winterDeep).setOrigin(.5);
    const anchor=TOBIAS_SHOULDER_ANCHORS.right;
    this.add.image(551,166,idleTextureKey('right','snow')).setScale(2);
    this.add.image(551-24+anchor.x*2,166-32+anchor.y*2,'cat-tobias-shoulder').setScale(2);
    addSmallText(this,562,205,'CARRY SAFE',PALETTE.winterDeep).setOrigin(.5);
    this.add.image(562,264,'jeronimo').setScale(2);
    addSmallText(this,562,308,'JERÓNIMO',PALETTE.winterDeep).setOrigin(.5);
  }

  private drawArchitecture(): void {
    addPixelText(this, 32, 76, 'RIVERSIDE ARCHITECTURE PROOF', 8, PALETTE.paper);
    this.add.rectangle(0, 272, GAME_WIDTH, 88, PALETTE.waterDeep).setOrigin(0);
    this.add.rectangle(0, 280, GAME_WIDTH, 80, PALETTE.water).setOrigin(0);
    this.add.image(305, 300, 'water-ripple').setScale(2);
    this.add.image(510, 329, 'arch-bridge').setScale(1.4);
    this.add.image(68, 123, 'arch-plaster-wall').setScale(2);
    this.add.image(176, 123, 'arch-stone-wall').setScale(2);
    this.add.image(73, 144, 'arch-window');
    this.add.image(137, 144, 'arch-door');
    this.add.image(100, 194, 'arch-balcony');
    this.add.image(122, 91, 'arch-roof-edge').setScale(1.5, 1);
    this.add.image(349, 206, 'tree-2');
    addPixelText(this, 236, 330, 'STONE / PLASTER / TERRACOTTA / COOL WATER', 6, PALETTE.creamLight).setOrigin(0.5);
  }

  private drawJerónimo(): void {
    this.add.rectangle(24, 76, 592, 248, PALETTE.snow).setOrigin(0)
      .setStrokeStyle(3, PALETTE.winterBlue);
    this.add.rectangle(24, 244, 592, 80, PALETTE.snowShadow).setOrigin(0);
    addPixelText(this, 54, 96, 'JERÓNIMO / DISTINCTIVE SNOW FRIEND', 8, PALETTE.winterDeep);
    this.add.image(320, 207, 'jeronimo').setScale(4);
    this.add.image(194, 252, 'winter-shrub').setScale(2);
    this.add.image(458, 252, 'winter-rock').setScale(1.5);
    addPixelText(this, 86, 278, 'WONKY BODY', 6, PALETTE.winterDeep);
    addPixelText(this, 454, 278, 'STICK + FERN ENERGY', 6, PALETTE.winterDeep).setOrigin(0.5);
  }

  private drawFestivalAndHome(): void {
    addPixelText(this, 32, 76, 'OLD-WORLD + HOME MATERIAL PROOFS', 8, PALETTE.paper);
    this.add.rectangle(24, 96, 360, 220, PALETTE.stoneDeep).setOrigin(0);
    for (let y = 96; y < 316; y += 48) {
      for (let x = 24; x < 384; x += 64) this.add.image(x, y, 'arch-stone-wall').setOrigin(0);
    }
    this.add.image(196, 126, 'festival-banner').setScale(1.7);
    this.add.image(170, 245, 'festival-stall').setScale(1.25);
    this.add.image(332, 248, 'festival-target');
    this.add.rectangle(405, 96, 211, 220, PALETTE.shadowWarm).setOrigin(0);
    this.add.image(510, 237, 'home-couch').setScale(1.6);
    this.add.image(437, 183, 'home-lamp');
    this.add.image(570, 213, 'cof-mug').setScale(2);
    addPixelText(this, 510, 125, 'HOME = WARMEST', 7, PALETTE.creamLight).setOrigin(0.5);
  }
}
