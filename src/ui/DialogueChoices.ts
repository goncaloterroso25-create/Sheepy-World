import type Phaser from 'phaser';
import type { DialogueChoice } from '../types/game';
import { addBodyText, addSmallText } from './PixelFont';
import { COLLECTION_MATERIAL as M } from './CollectionFinish';
import { tornPaper } from './TactileUI';
import { choiceSlipLayout } from './DialogueChoiceLayout';

export function createDialogueChoices(scene: Phaser.Scene, choices: readonly DialogueChoice[],
  x: number, width: number, selected: number, focus: (index: number) => void,
  choose: (index: number) => void): Phaser.GameObjects.Container {
  const root = scene.add.container(0, 0).setName('dialogue-choice-slips');
  const labels = choices.map(choice => addBodyText(scene, 0, 0, choice.label, M.ink)
    .setFontSize(7).setMaxWidth(width - 42));
  const layout = choiceSlipLayout(labels.map(label => Math.max(24, Math.ceil(label.height) + 16)), selected);
  const redraws: ((index: number) => void)[] = [];
  labels.forEach((label, index) => {
    const row = layout.rows.find(row => row.index === index);
    if (!row) { label.destroy(); return; }
    const g = scene.add.graphics();
    label.setPosition(x + 28, row.y + 8);
    const number = addSmallText(scene, x + 11, row.y + 8, String(index + 1), M.pencil).setFontSize(6);
    const paint = (selection: number): void => {
      const active = index === selection;
      g.clear().fillStyle(M.cover, .4).fillRect(x + 2, row.y + 2, width, row.height);
      tornPaper(g, x, row.y, width, row.height, active ? M.paperLight : M.paper);
      g.fillStyle(M.paperEdge).fillRect(x + 27, row.y + row.height - 5, width - 40, 1);
      if (active) g.fillStyle(M.accent).fillRect(x + 3, row.y + 8, 2, row.height - 16);
      label.setTint(active ? M.ink : M.pencil);
    };
    redraws.push(paint); paint(selected);
    const hit = scene.add.zone(x + width / 2, row.y + row.height / 2, width, row.height)
      .setInteractive({ useHandCursor: true }).setName(`dialogue-choice-${index}`);
    hit.on('pointerover', () => { focus(index); redraws.forEach(paint => paint(index)); });
    hit.on('pointerdown', () => choose(index));
    root.add([g, number, label, hit]);
  });
  if (layout.first > 0 || layout.last < choices.length) {
    root.add(addSmallText(scene, x, 5, `${layout.first + 1}-${layout.last} / ${choices.length}  ·  UP / DOWN`, M.paperLight).setFontSize(6));
  }
  root.setData('rows', layout.rows.map(row => ({ ...row, x, width })));
  return root;
}
