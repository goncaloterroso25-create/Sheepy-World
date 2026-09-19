/**
 * Sheepy World's controlled master palette.
 *
 * Values are grouped by material so region art can shift emphasis without
 * inventing unrelated colors. Runtime textures should reuse these values or a
 * documented one-off accent from VISUAL_STYLE.md.
 */
export const PALETTE = {
  shadowDeep: 0x21191a,
  shadowWarm: 0x38251f,
  outlineSoft: 0x493029,
  ink: 0x35251f,

  creamLight: 0xffedbd,
  cream: 0xf2d69a,
  paper: 0xe8c987,
  paperShade: 0xc9a66d,
  paperShadow: 0x76513a,

  grassDeep: 0x344b32,
  grassShade: 0x49613a,
  grass: 0x617844,
  grassWarm: 0x77874b,
  grassLight: 0x93a35e,
  dryGrass: 0xa28b55,

  leafRedDeep: 0x71352d,
  leafRed: 0xa94e39,
  leafOrangeDeep: 0x9a552f,
  leafOrange: 0xd47739,
  leafGold: 0xe1a942,
  leafLight: 0xf0c45a,

  soilDeep: 0x65432e,
  soil: 0x8c603e,
  pathShade: 0xa67b50,
  path: 0xc49a64,
  pathLight: 0xd7b47a,

  woodDeep: 0x4a2c25,
  wood: 0x77432b,
  woodWarm: 0xa45e35,
  woodLight: 0xd18443,

  stoneDeep: 0x4e5050,
  stoneShade: 0x6b6a62,
  stone: 0x8b8778,
  stoneLight: 0xb9ad94,
  plaster: 0xd7c7a4,
  plasterLight: 0xeadbb9,

  waterDeep: 0x284b50,
  waterShade: 0x35666a,
  water: 0x4f8580,
  waterLight: 0x85aaa0,
  waterGlint: 0xc3d3ba,

  asphaltDeep: 0x292d30,
  asphalt: 0x3e4445,
  pavementShade: 0x77736a,
  pavement: 0x9b9688,
  roadMarking: 0xdfc979,

  skinShade: 0xc98362,
  skin: 0xe3a179,
  skinLight: 0xf2bd91,
  hairDeep: 0x241c1d,
  hair: 0x3b2927,
  hairLight: 0x624039,
  jetHairDeep: 0x0d1015,
  jetHair: 0x171c24,
  jetHairLight: 0x313946,
  blackCloth: 0x30292d,
  blackClothLight: 0x51454d,
  greyClothDeep: 0x45474c,
  greyCloth: 0x686a70,
  greyClothLight: 0x8b8d91,
  hazelEye: 0xa86f35,
  gummyRed: 0xc44b49,
  hairTieRed: 0xb85a50,
  brownEye: 0x70452d,
  brownHairDeep: 0x493027,
  brownHair: 0x754933,
  brownHairLight: 0xa66b42,
  coolEye: 0x688b88,
  catCoolCoat: 0xe5eae7,
  catCoolShade: 0xc1ccce,
  catGreenEye: 0x7d9e57,
  catCharcoal: 0x444950,
  catBlueEye: 0x9dbac6,
  plumDeep: 0x493044,
  plum: 0x70445d,
  plumLight: 0xa45b75,
  denimDeep: 0x334451,
  denim: 0x4d6574,

  snowShadow: 0xb8c7cb,
  snow: 0xdce3df,
  snowLight: 0xf2f0df,
  winterDeep: 0x40515b,
  winterBlue: 0x647985,
  winterVegetation: 0x526153,
  fog: 0xaab9b9,

  yellowCar: 0xd9aa2f,
  carRed: 0xa94d3e,
  carBlue: 0x557a91,
  carGreen: 0x54705c,
  carCream: 0xcac3aa,

  festivalRed: 0xb74743,
  festivalBlue: 0x486f88,
  festivalGold: 0xe2ad43,
  festivalPurple: 0x76527d,
  warmLight: 0xf3c35c,
  white: 0xffffff,
} as const;

export type PaletteColorName = keyof typeof PALETTE;
