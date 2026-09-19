/** Keep complete, native-size choices above the speech/name frame. */
export function choiceSlipLayout(heights: readonly number[], selected: number) {
  const gap = 4, bottom = 201, top = 20;
  let first = 0, last = heights.length;
  const total = () => heights.slice(first, last).reduce((sum, h) => sum + h + gap, -gap);
  // Defensive presentation window for unusually large authored sets. No text shrinking.
  while (total() > bottom - top && last - first > 1) {
    if (last - 1 > selected) last--; else first++;
  }
  let y = bottom - total();
  const rows = heights.slice(first, last).map((height, offset) => {
    const row = { index: first + offset, y, height }; y += height + gap; return row;
  });
  return { first, last, rows };
}
