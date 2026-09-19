import { expect, it } from 'vitest';
import { choiceSlipLayout } from '../src/ui/DialogueChoiceLayout';

it.each([[24,24], [24,36,24], [36,48,36,36], [48,48,48,48,48]])('fits native wrapped slips without colliding with speech: %s', (...heights) => {
  for (let selected=0; selected<heights.length; selected++) {
    const layout=choiceSlipLayout(heights,selected);
    expect(layout.rows.some(row=>row.index===selected)).toBe(true);
    layout.rows.forEach((row,index)=>{
      expect(Number.isInteger(row.y)).toBe(true);
      expect(row.y).toBeGreaterThanOrEqual(20);
      expect(row.y+row.height).toBeLessThanOrEqual(201);
      if(index)expect(row.y).toBeGreaterThan(layout.rows[index-1]!.y+layout.rows[index-1]!.height);
    });
  }
});
