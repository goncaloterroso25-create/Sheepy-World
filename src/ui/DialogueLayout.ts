/** Mirrored columns leave an untouched 64×72 native portrait, never squeezed. */
export function dialogueLayout(side: 'left' | 'right') {
  const right = side === 'right';
  return {
    portraitX: right ? 578 : 66, portraitY: 289,
    textX: right ? 38 : 118, textY: 244, textWidth: 484,
    choiceX: right ? 280 : 360, choiceWidth: 484, choiceY: 292,
  } as const;
}
