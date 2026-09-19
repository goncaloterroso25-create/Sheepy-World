import type Phaser from 'phaser';
import { PALETTE as P } from '../art/palette';
import { UI_COPY } from '../data/uiCopy';
import { BAG_GRID, type BagSelection } from './CollectionModels';
import { addBodyText, addHeadingText, addSmallText } from './PixelFont';
import { leafDoodle, paperButton, steppedPanel, stitches } from './TactileUI';
import { addControlHint, paperControlButton } from './ControllerGlyphs';
import { COLLECTION_MATERIAL as M, collectionFocus, finishSatchel, fitKeepsakeIcon } from './CollectionFinish';

export const BAG_VIEW = { gridX: 76, gridY: 116, cellWidth: 82, cellHeight: 55, slotWidth: 74, slotHeight: 48 } as const;

export function createBagView(scene: Phaser.Scene, model: BagSelection, actions: {
  select: (index: number) => void; scroll: (rows: number) => void; close: () => void;
}): Phaser.GameObjects.Container {
  const root = scene.add.container(0, 0);
  const g = scene.add.graphics();
  root.add(g);
  // A real open organizer: back straps, folded flap, gusset, lining and pockets.
  steppedPanel(g, 144, 27, 98, 55, M.fabricDeep);
  steppedPanel(g, 154, 34, 78, 37, P.shadowDeep);
  g.fillStyle(P.woodDeep).fillRect(68, 50, 17, 253).fillRect(318, 50, 17, 253);
  g.fillStyle(P.shadowDeep, 0.55).fillRect(42, 77, 324, 244);
  steppedPanel(g, 37, 65, 324, 246, M.fabricDeep);
  steppedPanel(g, 46, 61, 306, 243, M.fabric);
  stitches(g, 53, 69, 292, 228);
  steppedPanel(g, 58, 96, 279, 195, M.fabricDeep);
  g.fillStyle(M.fabric).fillRect(62, 100, 270, 186);
  steppedPanel(g, 46, 47, 306, 47, M.fabricLight);
  g.fillStyle(M.fabricDeep).fillRect(50, 87, 298, 6);
  stitches(g, 55, 55, 287, 29);
  steppedPanel(g, 169, 49, 73, 35, M.paperLight, M.pencil);
  root.add(addHeadingText(scene, 184, 55, UI_COPY.bag.title, M.ink));
  // Quiet stitched leaf patch instead of a second oversized bag illustration.
  steppedPanel(g, 65, 58, 22, 22, M.fabricDeep, M.fabricDeep);
  leafDoodle(g, 71, 61, P.leafGold);
  root.add(addSmallText(scene, 74, 102, UI_COPY.bag.pocket, M.paperLight));
  root.add(addSmallText(scene, 323, 102, String(model.items.length).padStart(2, '0'), M.paperLight).setOrigin(1, 0));
  finishSatchel(g);

  for (let slot = 0; slot < BAG_GRID.columns * BAG_GRID.rows; slot++) {
    const x = BAG_VIEW.gridX + (slot % BAG_GRID.columns) * BAG_VIEW.cellWidth;
    const y = BAG_VIEW.gridY + Math.floor(slot / BAG_GRID.columns) * BAG_VIEW.cellHeight;
    const item = model.visible[slot];
    const index = model.firstRow * BAG_GRID.columns + slot;
    const selected = item && index === model.index;
    steppedPanel(g, x, y + 2, BAG_VIEW.slotWidth, BAG_VIEW.slotHeight, M.fabricDeep, M.fabricDeep);
    steppedPanel(g, x, y, BAG_VIEW.slotWidth, BAG_VIEW.slotHeight,
      selected ? M.paperLight : item ? M.paperEdge : M.fabric, selected ? M.tape : M.fabricDeep);
    if (!item) {
      g.fillStyle(M.fabricLight).fillRect(x + 7, y + 39, 60, 1);
      g.fillStyle(M.fabricDeep).fillRect(x + 7, y + 5, 60, 2);
      continue;
    }
    if (selected) {
      collectionFocus(g,x-2,y-2,BAG_VIEW.slotWidth+2,BAG_VIEW.slotHeight+2,M.gold);
      g.fillStyle(M.accent).fillRect(x + 56, y - 2, 10, 8).fillRect(x + 56, y + 6, 4, 2).fillRect(x + 62, y + 6, 4, 2);
    }
    g.fillStyle(M.paperLight,.55).fillRect(x+5,y+4,49,1);
    g.fillStyle(M.pencil,.18).fillRect(x+4,y+43,66,1);
    const iconKey = item.iconKey && scene.textures.exists(item.iconKey) ? item.iconKey : 'artifact';
    g.fillStyle(M.pencil, 0.2).fillRect(x + 28, y + 35, 20, 3);
    const icon = scene.add.image(x + 37, y + 24 - (selected ? 1 : 0), iconKey).setScale(2);
    fitKeepsakeIcon(icon,62,40,2);
    root.add(icon);
    const hit = scene.add.rectangle(x, y, BAG_VIEW.slotWidth, BAG_VIEW.slotHeight, 0, 0).setOrigin(0)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerover', () => icon.setY(y + 23));
    hit.on('pointerout', () => icon.setY(y + 24 - (selected ? 1 : 0)));
    hit.on('pointerdown', () => actions.select(index));
    root.add(hit);
  }

  if (model.maxFirstRow > 0) {
    root.add(paperButton(scene, 59, 278, 25, 'UP', () => actions.scroll(-1), model.firstRow > 0));
    root.add(paperButton(scene, 308, 278, 25, 'DN', () => actions.scroll(1), model.firstRow < model.maxFirstRow));
    root.add(addSmallText(scene, 196, 282,
      `${model.firstRow + 1}-${Math.min(model.totalRows, model.firstRow + BAG_GRID.rows)} / ${model.totalRows} rows`, M.paperLight).setOrigin(0.5, 0));
  } else {
    root.add(addSmallText(scene, 199, 281, model.items.length ? UI_COPY.bag.subtitle : UI_COPY.bag.emptyPocket, M.paperLight).setOrigin(0.5, 0));
  }

  // One attached luggage tag with its own material and clear text hierarchy.
  g.fillStyle(P.shadowDeep, 0.55).fillRect(391, 71, 216, 245);
  steppedPanel(g, 383, 61, 216, 250, M.paper, M.pencil);
  g.fillStyle(M.paperLight).fillRect(390, 67, 202, 2).fillRect(390, 67, 2, 235);
  g.fillStyle(M.paperEdge).fillRect(593, 70, 3, 233).fillRect(390, 303, 204, 4);
  g.fillStyle(M.tape).fillRect(573,82,13,29);
  g.fillStyle(M.paperLight).fillRect(576,83,1,26);
  g.fillStyle(M.paperEdge,.6).fillRect(393,288,2,10).fillRect(579,298,9,1);
  g.fillStyle(M.pencil).fillRect(348, 73, 49, 2).fillRect(395, 69, 2, 7);
  g.fillStyle(M.paperEdge).fillRect(399, 70, 5, 5);
  g.fillStyle(M.ink).fillRect(400, 71, 3, 3);
  const selected = model.selected;
  if (selected) {
    root.add(addSmallText(scene, 491, 78, UI_COPY.bag.keepsake, M.pencil).setOrigin(0.5, 0));
    steppedPanel(g, 459, 95, 64, 62, M.paperLight, M.paperEdge);
    g.fillStyle(M.paperEdge).fillRect(478, 145, 26, 3);
    const icon = selected.iconKey && scene.textures.exists(selected.iconKey) ? selected.iconKey : 'artifact';
    const focusedIcon=scene.add.image(491,125,icon);
    fitKeepsakeIcon(focusedIcon,54,50,3);root.add(focusedIcon);
    const name=addBodyText(scene,404,167,selected.name,M.ink).setMaxWidth(174);
    root.add(name);
    const nameBounds=name.getTextBounds().global;
    const detailY=Math.max(199,Math.ceil(nameBounds.y+nameBounds.height)+13);
    g.fillStyle(M.accent).fillRect(404,detailY-7,22,2);
    g.fillStyle(M.paperEdge).fillRect(430,detailY-6,146,1);
    root.add(addBodyText(scene,404,detailY,selected.description,M.ink).setMaxWidth(174).setLineSpacing(4));
    if (selected.annotation) {
      g.fillStyle(M.paperEdge).fillRect(404, 269, 12, 1);
      root.add(addSmallText(scene, 404, 278, selected.annotation, M.pencil).setMaxWidth(174));
    }
  } else {
    leafDoodle(g, 486, 104, M.fabric);
    root.add(addSmallText(scene, 491, 140, UI_COPY.bag.emptyTag, M.pencil).setOrigin(0.5, 0));
    root.add(addBodyText(scene, 406, 171, UI_COPY.bag.emptyTitle, M.ink).setLineSpacing(5));
    root.add(addBodyText(scene, 406, 227, UI_COPY.bag.emptyDetail, M.pencil).setMaxWidth(174));
    g.fillStyle(M.paperEdge).fillRect(406, 275, 45, 1);
  }
  root.add(addControlHint(scene,'movement',model.maxFirstRow>0?'TO CHOOSE / WHEEL':'TO CHOOSE',45,332,M.paperLight));
  root.add(paperControlButton(scene,479,323,120,'back','CLOSE',actions.close));
  return root;
}
