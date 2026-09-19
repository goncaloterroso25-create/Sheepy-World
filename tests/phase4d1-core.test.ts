import { describe, expect, it, vi } from 'vitest';

vi.mock('phaser', () => ({
  default: {
    Events: { EventEmitter: class {} },
    Scenes: { Events: { POST_UPDATE: 'postupdate' } },
  },
}));

import {
  MENTALIST_DEDUCTION_DIALOGUE,
  MENTALIST_INTRO,
  MENTALIST_RESOLUTION_DIALOGUE,
} from '../src/data/namedDialogues';
import { MEMORIES } from '../src/data/memories';
import { MEMORY_WORLD_UPDATES } from '../src/data/worldMemoryUpdates';
import {
  PERSONALITY_TENDENCIES,
  derivePersonalityTendencies,
  personalityFlag,
} from '../src/systems/Personality';
import {
  approachDistance,
  approachSamples,
  nearestPointOnRect,
} from '../src/systems/InteractionGeometry';
import { GameStateStore } from '../src/systems/GameStateStore';
import { SaveRepository } from '../src/systems/SaveSystem';
import { ScrapbookSelection } from '../src/ui/CollectionModels';
import {
  SNOW_PLAY_AREAS,
  snowPlayAreaContains,
} from '../src/world/regions/ExpansionContent';
import { mentalistCaseStage } from '../src/world/regions/CrimeSceneContent';
import { MemoryStorage } from './helpers/MemoryStorage';
import { idleTextureKey, locomotionTextureKey } from '../src/entities/playerAnimations';

function restore(state: GameStateStore, memoryId: keyof typeof MEMORIES): void {
  const memory = MEMORIES[memoryId]!;
  for (const fragmentId of memory.fragmentIds) {
    state.collectFragment(memory.id, fragmentId, memory.restoreAt);
  }
  expect(state.restoreMemory(memory.id)).toBe(true);
}

describe('Phase 4D.1 broad interaction geometry', () => {
  it('measures to the nearest part of a broad authored shape rather than only its anchor', () => {
    const player = { x: 110, y: 70 };
    const shape = { x: 100, y: 100, width: 100, height: 40 };
    const approach = { anchor: { x: 180, y: 120 }, shape };

    expect(nearestPointOnRect(player, shape)).toEqual({ x: 110, y: 100 });
    expect(approachSamples(player, approach)[0]).toEqual({ x: 110, y: 100 });
    expect(approachDistance(player, approach)).toBe(30);
  });

  it('uses another visible shape sample when one decorative corner blocks the nearest sample', () => {
    const player = { x: 110, y: 70 };
    const approach = {
      anchor: { x: 180, y: 120 },
      shape: { x: 100, y: 100, width: 100, height: 40 },
    };
    const nearestSampleBlocker = { x: 105, y: 82, width: 10, height: 8 };
    const distance = approachDistance(player, approach, [nearestSampleBlocker]);

    expect(distance).toBeGreaterThan(30);
    expect(distance).toBeLessThan(Infinity);
  });

  it('ignores the target body itself for sight while preserving real wall occlusion', () => {
    const body = { x: 100, y: 100, width: 100, height: 40 };
    const approach = { anchor: { x: 150, y: 120 }, shape: body, body };
    const player = { x: 110, y: 70 };

    expect(approachDistance(player, approach, [body])).toBe(30);
    expect(approachDistance(player, approach, [body, { x: 90, y: 80, width: 120, height: 8 }]))
      .toBe(Infinity);
  });
});

describe('Phase 4D.1 Mentalist case contracts', () => {
  it('always begins with Lisbon warning Protagonist before Jane offers the shared investigation', () => {
    expect(MENTALIST_INTRO.startNodeId).toBe('lisbon-warning');
    const warning = MENTALIST_INTRO.nodes[MENTALIST_INTRO.startNodeId]!;
    expect(warning).toMatchObject({
      speaker: 'Teresa Lisbon',
      lines: ["You shouldn't be here."],
      nextId: 'jane-invitation',
    });
    const invitation = MENTALIST_INTRO.nodes[warning.nextId!]!;
    expect(invitation.speaker).toBe('Patrick Jane');
    expect(invitation.choices).toHaveLength(3);
    expect(invitation.choices?.map(choice => choice.setFlags?.map(change => change.flag)))
      .toEqual([
        ['mentalist-approach', 'personality-sweet'],
        ['mentalist-approach', 'personality-cheeky'],
        ['mentalist-approach', 'personality-chaotic'],
      ]);
  });

  it('keeps two retryable wrong deductions and unlocks the weapon only on the correct answer', () => {
    const summary = MENTALIST_DEDUCTION_DIALOGUE.nodes[MENTALIST_DEDUCTION_DIALOGUE.startNodeId]!;
    const choices = summary.choices ?? [];
    expect(choices).toHaveLength(3);
    const correct = choices.find(choice => choice.id === 'correct-staged');
    expect(correct).toBeDefined();
    if (!correct) return;
    const wrong = choices.filter(choice => choice.id !== 'correct-staged');

    expect(wrong).toHaveLength(2);
    for (const choice of wrong) {
      expect(MENTALIST_DEDUCTION_DIALOGUE.nodes[choice.nextId]?.nextId).toBe(MENTALIST_DEDUCTION_DIALOGUE.startNodeId);
    }
    const authorization = MENTALIST_DEDUCTION_DIALOGUE.nodes[
      MENTALIST_DEDUCTION_DIALOGUE.nodes[correct.nextId]!.nextId!
    ]!;
    expect(authorization.onCompleteEvent).toBe('mentalist-deduction-solved');
  });

  it('preserves the approved joint 2 HOURS exchange exactly and resolves only at its end', () => {
    const handover = MENTALIST_RESOLUTION_DIALOGUE.nodes[MENTALIST_RESOLUTION_DIALOGUE.startNodeId]!;
    const jane = MENTALIST_RESOLUTION_DIALOGUE.nodes[handover.nextId!]!;
    const protagonist = MENTALIST_RESOLUTION_DIALOGUE.nodes[jane.nextId!]!;

    expect(handover.lines).toEqual(["I'm taking this to forensics. Jane, you coming?"]);
    expect(jane.lines).toEqual(["No. I'm going to sleep on my couch. I only got 2 HOURS last night."]);
    expect(protagonist.lines).toEqual(['2 HOURS of sleep? Why did he say it like that? Is that relevant for me?']);
    expect(handover.onCompleteEvent).toBeUndefined();
    expect(jane.onCompleteEvent).toBeUndefined();
    expect(protagonist.onCompleteEvent).toBe('mentalist-case-resolved');
  });

  it('resumes a carried or handed-over knife at the handover after reloading', () => {
    const storage = new MemoryStorage();
    const state = new GameStateStore(new SaveRepository(storage));
    state.completeEncounter('mentalist-honorary');
    for(const clue of ['mentalist-clue-till','mentalist-clue-cabinet','mentalist-clue-blood'])state.completeEncounter(clue);
    state.completeEncounter('mentalist-deduction-solved');
    state.setFlag('mentalist-knife','carried');
    expect(mentalistCaseStage(state.snapshot)).toBe('HANDOVER');

    const reloaded = new GameStateStore(new SaveRepository(storage));
    expect(mentalistCaseStage(reloaded.snapshot)).toBe('HANDOVER');
    reloaded.setFlag('mentalist-knife','handed-over');
    expect(mentalistCaseStage(reloaded.snapshot)).toBe('HANDOVER');
    reloaded.completeEncounter('mentalist-case-resolved');
    expect(mentalistCaseStage(reloaded.snapshot)).toBe('RESOLVED');
  });
});

describe('Phase 4D.1 living scrapbook model', () => {
  it('selects only discovered fragments, cycles them, and preserves selection per page', () => {
    const firstDate = MEMORIES['first-date']!;
    const snow = MEMORIES['snow-day']!;
    const model = new ScrapbookSelection();
    const firstProgress = {
      foundFragmentIds: [firstDate.fragmentIds[1]!, firstDate.fragmentIds[2]!],
      restored: false,
    };
    const snowProgress = { foundFragmentIds: [snow.fragmentIds[0]!], restored: false };
    model.setPages([firstDate, snow]);

    expect(model.selectFragment(0, firstProgress)).toBe(false);
    expect(model.selectFragment(1, firstProgress)).toBe(true);
    expect(model.fragmentIndex).toBe(1);
    expect(model.moveFragment(1, firstProgress)).toBe(true);
    expect(model.fragmentIndex).toBe(2);
    expect(model.moveFragment(1, firstProgress)).toBe(true);
    expect(model.fragmentIndex).toBe(1);

    expect(model.turn(1)).toBe(true);
    expect(model.selectFragment(0, snowProgress)).toBe(false);
    expect(model.turn(-1)).toBe(true);
    expect(model.fragmentIndex).toBe(1);
  });

  it('provides distinct found/restored descriptions and a vague next hint for every core page', () => {
    for (const memory of Object.values(MEMORIES).filter(page => page.kind === 'CORE')) {
      expect(memory.nextHint, memory.id).toBeTruthy();
      expect(memory.fragmentDetails, memory.id).toBeTruthy();
      for (const fragmentId of memory.fragmentIds) {
        const detail = memory.fragmentDetails?.[fragmentId];
        expect(detail?.found, `${memory.id}/${fragmentId}`).toBeTruthy();
        expect(detail?.restored, `${memory.id}/${fragmentId}`).toBeTruthy();
        expect(detail?.found, `${memory.id}/${fragmentId}`).not.toBe(detail?.restored);
      }
    }
  });
});

describe('Phase 4D.1 hidden personality flavor', () => {
  it('derives only true sparse flags in canonical order without a visible score or rank', () => {
    const flags = {
      [personalityFlag('CHAOTIC')]: 'true',
      [personalityFlag('SWEET')]: 'true',
      [personalityFlag('CHEEKY')]: 'false',
      'personality-score': '999',
    };

    expect(PERSONALITY_TENDENCIES).toEqual(['SWEET', 'CHEEKY', 'CHAOTIC']);
    expect(derivePersonalityTendencies(flags)).toEqual(['SWEET', 'CHAOTIC']);
  });
});

describe('Phase 4D.1 order-independent computer memory updates', () => {
  it('queues a memory restored before computer discovery and persists a single read', () => {
    const storage = new MemoryStorage();
    const repository = new SaveRepository(storage);
    const state = new GameStateStore(repository);
    restore(state, 'first-date');

    expect(state.queueComputerMemoryUpdate('first-date')).toBe(false);
    expect(state.discoverMemoryComputer()).toBe(true);
    expect(state.discoverMemoryComputer()).toBe(false);
    expect(state.pendingComputerMemoryId).toBe('first-date');
    expect(state.readComputerMemoryUpdate()).toBe('first-date');
    expect(state.readComputerMemoryUpdate()).toBeUndefined();

    const reloaded = new GameStateStore(repository);
    expect(reloaded.pendingComputerMemoryId).toBeUndefined();
    expect(reloaded.flag('pc-read-first-date')).toBe('true');
  });

  it('holds one unread update at a time, then drains other restored memories without duplication', () => {
    const state = new GameStateStore(new SaveRepository(new MemoryStorage()));
    state.discoverMemoryComputer();
    restore(state, 'snow-day');
    expect(state.queueComputerMemoryUpdate('snow-day')).toBe(true);
    expect(state.queueComputerMemoryUpdate('snow-day')).toBe(false);
    restore(state, 'first-date');
    expect(state.queueComputerMemoryUpdate('first-date')).toBe(false);

    expect(state.readComputerMemoryUpdate()).toBe('snow-day');
    expect(state.pendingComputerMemoryId).toBe('first-date');
    expect(state.readComputerMemoryUpdate()).toBe('first-date');
    expect(state.pendingComputerMemoryId).toBeUndefined();
    expect(state.queueComputerMemoryUpdate('snow-day')).toBe(false);
  });

  it('keeps every authored computer message anonymous and mapped to a unique world effect', () => {
    const updates = Object.values(MEMORY_WORLD_UPDATES);
    expect(updates.map(update => update.memoryId).sort()).toEqual(['first-date', 'porto-performance', 'snow-day']);
    expect(new Set(updates.map(update => update.effectId)).size).toBe(updates.length);
    for (const update of updates) {
      expect(update.computerMessage).not.toMatch(/Protagonist|Gon[cç]alo/i);
    }
  });
});

describe('Phase 4D.1 authored Snow play space', () => {
  it('maps every winter direction and gait to textures that the atlas actually generates', () => {
    for (const direction of ['up', 'down', 'left', 'right'] as const) {
      expect(idleTextureKey(direction, 'snow')).toBe(`player-snow-${direction}-idle`);
      expect(locomotionTextureKey(direction, 'step-a', 'walk', 'loose', 'snow'))
        .toBe(`player-snow-${direction}-step-a`);
      expect(locomotionTextureKey(direction, 'pass-a', 'sprint', 'loose', 'snow'))
        .toBe(`player-snow-sprint-${direction}-pass-a`);
    }
  });

  it('includes the frozen lake and open clearing, including their edges', () => {
    expect(SNOW_PLAY_AREAS).toHaveLength(2);
    for (const area of SNOW_PLAY_AREAS) {
      expect(snowPlayAreaContains({ x: area.x, y: area.y })).toBe(true);
      expect(snowPlayAreaContains({ x: area.x + area.width, y: area.y + area.height })).toBe(true);
      expect(snowPlayAreaContains({ x: area.x + area.width / 2, y: area.y + area.height / 2 })).toBe(true);
    }
  });

  it('does not allow snowballs at the BYD road or cabin woodpile clue', () => {
    expect(snowPlayAreaContains({ x: 601, y: 416 })).toBe(false);
    expect(snowPlayAreaContains({ x: 1064, y: 353 })).toBe(false);
    expect(snowPlayAreaContains({ x: SNOW_PLAY_AREAS[0].x - 1, y: SNOW_PLAY_AREAS[0].y })).toBe(false);
  });
});
