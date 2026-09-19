import Phaser from 'phaser';

export const PIXEL_FONT_KEY = 'sheepy-pixel-ui';
export const PIXEL_BODY_FONT_KEY = 'sheepy-pixel-body';

export const PIXEL_FONT_METRICS = {
  small: { cellWidth: 6, cellHeight: 8, renderSize: 8 },
  body: { cellWidth: 7, cellHeight: 9, renderSize: 9 },
  heading: { cellWidth: 7, cellHeight: 9, renderSize: 18 },
} as const;

const TEXTURE_KEY = `${PIXEL_FONT_KEY}-texture`;
const CELL_WIDTH = 6;
const CELL_HEIGHT = 8;
const CHARS_PER_ROW = 16;

const GLYPHS: Readonly<Record<string, readonly string[]>> = {
  Ç: ['01111', '10000', '10000', '10000', '10000', '01111', '00100', '01000'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  '.': ['00000', '00000', '00000', '00000', '00000', '00110', '00110'],
  ',': ['00000', '00000', '00000', '00000', '00110', '00100', '01000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00010', '00100', '00000', '00100'],
  ':': ['00000', '00110', '00110', '00000', '00110', '00110', '00000'],
  ';': ['00000', '00110', '00110', '00000', '00110', '00100', '01000'],
  "'": ['00100', '00100', '00010', '00000', '00000', '00000', '00000'],
  '"': ['01010', '01010', '00100', '00000', '00000', '00000', '00000'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '(': ['00010', '00100', '01000', '01000', '01000', '00100', '00010'],
  ')': ['01000', '00100', '00010', '00010', '00010', '00100', '01000'],
  '[': ['01110', '01000', '01000', '01000', '01000', '01000', '01110'],
  ']': ['01110', '00010', '00010', '00010', '00010', '00010', '01110'],
  '<': ['00010', '00100', '01000', '10000', '01000', '00100', '00010'],
  '>': ['01000', '00100', '00010', '00001', '00010', '00100', '01000'],
  '_': ['00000', '00000', '00000', '00000', '00000', '00000', '11111'],
  '=': ['00000', '11111', '00000', '11111', '00000', '00000', '00000'],
  '*': ['00000', '10101', '01110', '11111', '01110', '10101', '00000'],
  '#': ['01010', '11111', '01010', '01010', '11111', '01010', '00000'],
  '%': ['11001', '11010', '00100', '01000', '10110', '00110', '00000'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  '@': ['01110', '10001', '10111', '10101', '10111', '10000', '01110'],
};

const LOWERCASE_GLYPHS: Readonly<Record<string, readonly string[]>> = {
  ç: ['00000', '00000', '01111', '10000', '10000', '01111', '00100', '01000'],
  a: ['00000', '00000', '01110', '00001', '01111', '10001', '01111'],
  b: ['10000', '10000', '10110', '11001', '10001', '10001', '11110'],
  c: ['00000', '00000', '01111', '10000', '10000', '10000', '01111'],
  d: ['00001', '00001', '01101', '10011', '10001', '10001', '01111'],
  e: ['00000', '00000', '01110', '10001', '11111', '10000', '01111'],
  f: ['00110', '01001', '01000', '11100', '01000', '01000', '01000'],
  g: ['00000', '01111', '10001', '10001', '01111', '00001', '01110'],
  h: ['10000', '10000', '10110', '11001', '10001', '10001', '10001'],
  i: ['00100', '00000', '01100', '00100', '00100', '00100', '01110'],
  j: ['00010', '00000', '00110', '00010', '00010', '10010', '01100'],
  k: ['10000', '10000', '10010', '10100', '11000', '10100', '10010'],
  l: ['01100', '00100', '00100', '00100', '00100', '00100', '01110'],
  m: ['00000', '00000', '11010', '10101', '10101', '10101', '10101'],
  n: ['00000', '00000', '10110', '11001', '10001', '10001', '10001'],
  o: ['00000', '00000', '01110', '10001', '10001', '10001', '01110'],
  p: ['00000', '00000', '11110', '10001', '11110', '10000', '10000'],
  q: ['00000', '00000', '01111', '10001', '01111', '00001', '00001'],
  r: ['00000', '00000', '10110', '11001', '10000', '10000', '10000'],
  s: ['00000', '00000', '01111', '10000', '01110', '00001', '11110'],
  t: ['01000', '01000', '11100', '01000', '01000', '01001', '00110'],
  u: ['00000', '00000', '10001', '10001', '10001', '10011', '01101'],
  v: ['00000', '00000', '10001', '10001', '10001', '01010', '00100'],
  w: ['00000', '00000', '10001', '10101', '10101', '10101', '01010'],
  x: ['00000', '00000', '10001', '01010', '00100', '01010', '10001'],
  y: ['00000', '00000', '10001', '10001', '01111', '00001', '01110'],
  z: ['00000', '00000', '11111', '00010', '00100', '01000', '11111'],
};

const FONT_CHARACTERS = [
  ...'ÇçÁáÀàÂâÃãÉéÊêÍíÓóÔôÕõÚúÜü',
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ...'abcdefghijklmnopqrstuvwxyz',
  ...'0123456789',
  ...' .,!?;:\'"-+/()[]<>_=*#%&@´',
].join('');

function glyphFor(character: string, preserveCase = false): readonly string[] {
  if(character==='´')return GLYPHS["'"]!;
  const parts = character.normalize('NFD');
  const accent = parts[1];
  if (accent && character !== 'Ç' && character !== 'ç') {
    const base = glyphFor(parts[0]!, preserveCase).slice(0, 7);
    const mark = accent === '\u0303' ? '01010' : accent === '\u0302' ? '01010'
      : accent === '\u0300' ? '01000' : accent === '\u0308' ? '01010' : '00010';
    return [mark, ...base];
  }
  if (preserveCase && LOWERCASE_GLYPHS[character]) return LOWERCASE_GLYPHS[character] ?? [];
  return GLYPHS[character.toUpperCase()] ?? GLYPHS['?'] ?? [];
}

function createFont(
  scene: Phaser.Scene,
  key: string,
  textureKey: string,
  cellWidth: number,
  cellHeight: number,
  preserveCase: boolean,
): void {
  if (scene.cache.bitmapFont.exists(key)) return;
  const rows = Math.ceil(FONT_CHARACTERS.length / CHARS_PER_ROW);
  const graphics = scene.add.graphics();
  graphics.fillStyle(0xffffff, 1);

  [...FONT_CHARACTERS].forEach((character, index) => {
    const cellX = (index % CHARS_PER_ROW) * cellWidth;
    const cellY = Math.floor(index / CHARS_PER_ROW) * cellHeight;
    glyphFor(character, preserveCase).forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        if (pixel === '1') graphics.fillRect(
          cellX + (preserveCase ? 1 : 0) + x,
          cellY + (preserveCase ? 1 : 0) + y,
          1,
          1,
        );
      });
    });
  });

  graphics.generateTexture(textureKey, CHARS_PER_ROW * cellWidth, rows * cellHeight);
  graphics.destroy();
  scene.textures.get(textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);

  const font = Phaser.GameObjects.RetroFont.Parse(scene, {
    image: textureKey,
    'offset.x': 0,
    'offset.y': 0,
    width: cellWidth,
    height: cellHeight,
    chars: FONT_CHARACTERS,
    charsPerRow: CHARS_PER_ROW,
    'spacing.x': 0,
    'spacing.y': 0,
    lineSpacing: preserveCase ? 2 : 1,
  });
  scene.cache.bitmapFont.add(key, font);
}

export function createPixelUiFont(scene: Phaser.Scene): void {
  createFont(scene, PIXEL_FONT_KEY, TEXTURE_KEY, CELL_WIDTH, CELL_HEIGHT, false);
  createFont(scene, PIXEL_BODY_FONT_KEY, `${PIXEL_BODY_FONT_KEY}-texture`, 7, 9, true);
}

export function addPixelText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size = 6,
  tint = 0xffffff,
): Phaser.GameObjects.BitmapText {
  return scene.add.bitmapText(Math.round(x), Math.round(y), PIXEL_FONT_KEY, text, size)
    .setTint(tint);
}

export function addBodyText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  tint = 0xffffff,
): Phaser.GameObjects.BitmapText {
  return scene.add.bitmapText(
    Math.round(x), Math.round(y), PIXEL_BODY_FONT_KEY, text, PIXEL_FONT_METRICS.body.renderSize,
  ).setTint(tint).setLineSpacing(2);
}

export function addSmallText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  tint = 0xffffff,
): Phaser.GameObjects.BitmapText {
  return scene.add.bitmapText(
    Math.round(x), Math.round(y), PIXEL_FONT_KEY, text, PIXEL_FONT_METRICS.small.renderSize,
  ).setTint(tint);
}

export function addHeadingText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  tint = 0xffffff,
): Phaser.GameObjects.BitmapText {
  return scene.add.bitmapText(
    Math.round(x), Math.round(y), PIXEL_BODY_FONT_KEY, text, PIXEL_FONT_METRICS.heading.renderSize,
  ).setTint(tint).setLineSpacing(3);
}
