import { describe, expect, it } from 'vitest';
import {
  MENTALIST_INTRO,
  MENTALIST_LISBOOOON_CALLBACK,
  MENTALIST_LISBOOOON_EVENT,
  MENTALIST_LISBOOOON_V2_FLAG,
} from '../src/data/namedDialogues';
import { RESTORED_JERONIMO_INTERACTION } from '../src/data/snowContent';
import { approachDistance } from '../src/systems/InteractionGeometry';

describe('Phase 4D.2.1 Jeronimo landmark hotfix', () => {
  it('uses the exact broad authored runtime contract from natural bonnet positions', () => {
    const target = RESTORED_JERONIMO_INTERACTION;
    expect(target).toMatchObject({ id: 'jeronimo-gallery', prompt: 'REMEMBER', priority: 35 });
    const naturalFeet = [
      { x: 603, y: 470 },
      { x: 530, y: 430 },
      { x: 675, y: 430 },
      { x: 603, y: 372 },
      { x: 565, y: 465 },
    ];
    for (const feet of naturalFeet) {
      expect(approachDistance(feet, target.approach), JSON.stringify(feet))
        .toBeLessThanOrEqual(target.approach.radius);
    }
    expect(target.approach.shape.width).toBeGreaterThan(100);
    expect(target.approach.shape.height).toBeGreaterThan(60);
  });
});

describe('Phase 4D.2.1 authored LISBOOOON moment', () => {
  it('renders Jane and the caption at node entry, then gives Lisbon the following beat', () => {
    const voiceNode = MENTALIST_INTRO.nodes.lisboooon!;
    expect(voiceNode).toMatchObject({
      speaker: 'Patrick Jane',
      portraitKey: 'portrait-jane-amused',
      lines: ['LISBOOOOON!'],
      onEnterEvent: MENTALIST_LISBOOOON_EVENT,
      nextId: 'lisbon-dont',
    });
    expect(voiceNode.onCompleteEvent).toBeUndefined();
    expect(MENTALIST_INTRO.nodes['lisbon-dont']).toMatchObject({
      speaker: 'Teresa Lisbon', lines: ["Don't."], nextId: 'honorary',
    });
  });

  it('keeps the schema-8 retry guard independent from the unreliable legacy encounter', () => {
    expect(MENTALIST_LISBOOOON_V2_FLAG).toBe('mentalist-lisboooon-v2-played');
    expect(MENTALIST_LISBOOOON_V2_FLAG).not.toBe('mentalist-lisboooon-heard');
    expect(MENTALIST_LISBOOOON_CALLBACK.nodes.lisboooon).toMatchObject({
      lines: ['LISBOOOOON!'], onEnterEvent: MENTALIST_LISBOOOON_EVENT,
    });
    expect(MENTALIST_LISBOOOON_CALLBACK.interaction.mode).toBe('REPEATABLE');
  });
});
