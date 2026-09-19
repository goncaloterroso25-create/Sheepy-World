import type Phaser from 'phaser';
import { PALETTE as P } from '../../art/palette';
import { homeProofFurniture } from '../../art/homeProofFurniture';
import { addHomeProofGround, addHomeProofDressing, addHomeProofCatBed } from '../../art/homeStyleProof';
import { blockers } from './RegionArt';
import { HOME_FURNITURE, HOME_SOLIDS } from './HomeLayout';
import { HOME_FUTURE_HOOKS } from '../../data/homeContent';

export function buildHomeInterior(scene: Phaser.Scene): Phaser.Physics.Arcade.StaticGroup {
  addHomeProofGround(scene);
  HOME_FURNITURE.forEach(f => homeProofFurniture(scene, f));
  addHomeProofDressing(scene);
  scene.add.image(580, 480, 'cof-mug').setDepth(529);
  const small = scene.add.graphics().setDepth(530);
  // Cup hooks, kettle and a short backsplash make the COF corner a preparation spot.
  small.fillStyle(P.woodDeep).fillRect(550, 445, 80, 3);
  for (const x of [565, 588, 611]) small.fillStyle(P.cream).fillRect(x, 449, 8, 9);
  small.fillStyle(P.stoneDeep).fillRect(610, 469, 17, 15).fillRect(624, 472, 5, 4);
  small.fillStyle(P.plaster).fillRect(613, 468, 10, 12);
  // Environmental Naruto-style bowl and exactly one small snack board.
  small.fillStyle(P.plasterLight).fillRect(665, 674, 30, 8);
  small.fillStyle(P.leafGold).fillRect(668, 671, 6, 5).fillRect(677, 672, 5, 4);
  small.fillStyle(P.cream).fillRect(686, 672, 5, 4);
  small.fillStyle(P.grass).fillRect(688, 670, 7, 2);
  small.fillStyle(P.shadowDeep).fillRect(635, 674, 18, 7).fillRect(638, 681, 12, 3);
  small.fillStyle(P.leafOrange).fillRect(635, 670, 18, 4).fillRect(641, 676, 5, 1).fillRect(640, 677, 1, 3).fillRect(641, 680, 5, 1).fillRect(645, 677, 1, 3);
  small.fillStyle(P.creamLight).fillRect(638, 671, 2, 1).fillRect(645, 671, 2, 1).fillRect(650, 671, 1, 1);
  small.setDepth(714);
  const personal = scene.add.graphics().setDepth(234);
  const tie = HOME_FUTURE_HOOKS.hairTie;
  personal.fillStyle(P.hairTieRed).fillRect(tie.x - 3, tie.y - 2, 6, 1).fillRect(tie.x - 4, tie.y - 1, 1, 3)
    .fillRect(tie.x + 3, tie.y - 1, 1, 3).fillRect(tie.x - 3, tie.y + 2, 6, 1);
  addHomeProofCatBed(scene);
  return blockers(scene, HOME_SOLIDS);
}
