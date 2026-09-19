import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as TactileUI from '../src/ui/TactileUI';

const harness = vi.hoisted(() => ({
  bag: vi.fn(), book: vi.fn(), feedback: vi.fn(),
}));
vi.mock('phaser', () => ({ default: { Scene: class {} } }));
vi.mock('../src/config/controls', () => ({ InputController: class {} }));
vi.mock('../src/ui/PixelFont', () => ({
  addBodyText: vi.fn(), addHeadingText: vi.fn(), addPixelText: vi.fn(), addSmallText: vi.fn(),
}));
vi.mock('../src/ui/BagView', () => ({ createBagView: harness.bag }));
vi.mock('../src/ui/ScrapbookView', () => ({ createScrapbookView: harness.book }));
vi.mock('../src/ui/CompactDockView', () => ({ createCompactDock: vi.fn() }));
vi.mock('../src/ui/TactileUI', async importOriginal => ({ ...await importOriginal<typeof TactileUI>(), settlePaper: vi.fn() }));
vi.mock('../src/systems/events', () => ({ gameEvents: { emit: harness.feedback } }));

import { UIScene } from '../src/scenes/UIScene';
import { GameStateStore } from '../src/systems/GameStateStore';
import { SaveRepository } from '../src/systems/SaveSystem';
import { MemoryStorage } from './helpers/MemoryStorage';
import { collectionPreview } from '../src/dev/collectionPreviews';
import { TEST_ITEM_ID } from '../src/data/items';
import { RouteReadyObservation } from '../src/ui/MemoryGuidance';

interface UiHarness {
  mode: string;
  openInventory: () => void;
  openScrapbook: () => void;
  closeModal: () => void;
  update: (time: number, delta: number) => void;
  changeBagRow: (rows: number) => void;
}

function object() {
  const node = { destroy: vi.fn(), add: vi.fn(), setDepth: vi.fn(), setInteractive: vi.fn(),
    setVisible: vi.fn(), setAlpha: vi.fn() };
  Object.values(node).forEach(fn => fn.mockReturnValue(node));
  return Object.assign(node, { getData: vi.fn(() => undefined) });
}

function setup(preview = false) {
  const storage = new MemoryStorage();
  const state = new GameStateStore(new SaveRepository(storage));
  const presses = new Set<string>();
  const scene = new UIScene();
  Object.assign(scene, {
    state, choiceKeys: [], staminaMeter: { update: vi.fn() }, controlDock: object(),
    routeObservation: new RouteReadyObservation(state.snapshot), registry: { get: vi.fn() },
    game: { events: { emit: harness.feedback } },
    scene: { isPaused: () => false },
    add: { rectangle: object, container: object },
    controls: { close: 'esc', scrapbook: 'tab', inventory: 'i',
      pollPresentation: vi.fn(), justPaused: () => false, justTogether: () => false,
      left: ['left'], right: ['right'], up: ['up'], down: ['down'],
      justPressed: (key: string) => presses.delete(key), justInteracted: () => false,
      justClosed: () => presses.delete('esc'), justScrapbook: () => presses.delete('tab'),
      justInventory: () => presses.delete('i'),
      justDirection: (direction: string) => presses.delete(direction) },
    collectionPreview: preview ? collectionPreview(new URLSearchParams('state=scroll&pages=3')) : undefined,
  });
  harness.bag.mockImplementation(() => object());
  harness.book.mockImplementation(() => object());
  const ui = scene as unknown as UiHarness;
  return { ui, state, storage, press: (key: string) => { presses.add(key); ui.update(0, 16); } };
}

beforeEach(() => vi.clearAllMocks());

describe('collection scene integration (behavior, not decorative pixels)', () => {
  it('emits exactly one open/close per transition, not per render, navigation, or repeated close', () => {
    const { ui, press } = setup(true);
    for (let i = 0; i < 6; i++) {
      press('i'); press('down'); ui.changeBagRow(1); press('esc'); ui.closeModal();
    }
    const lifecycle = harness.feedback.mock.calls.filter(([event, payload]) => event === 'collection-ui-feedback' && ['open', 'close'].includes(payload.action));
    expect(lifecycle.map(([,payload]) => payload.action)).toEqual(Array.from({ length: 6 }, () => ['open', 'close']).flat());
  });
  it('opens/closes both collections with their keys and Escape, preserving tutorial saves', () => {
    const { ui, state, storage, press } = setup();
    state.addArtifact(TEST_ITEM_ID);
    state.addArtifact('half-glasses');
    press('i'); expect(ui.mode).toBe('inventory');
    expect(harness.bag.mock.calls.at(-1)?.[1].selected.name).toBe('Half Glasses');
    expect(harness.bag.mock.calls.at(-1)?.[1].items.some((i:{id:string})=>i.id===TEST_ITEM_ID)).toBe(false);
    press('i'); expect(ui.mode).toBe('none');
    press('tab'); expect(ui.mode).toBe('scrapbook');
    press('esc'); expect(ui.mode).toBe('none');
    const loaded = new GameStateStore(new SaveRepository(storage));
    expect(loaded.snapshot.tutorials).toMatchObject({ bagOpened: true, scrapbookOpened: true });
    expect(loaded.snapshot.inventory).toEqual([TEST_ITEM_ID,'half-glasses']);
    expect(harness.feedback).toHaveBeenCalledWith('collection-ui-feedback', { action: 'close', surface: 'scrapbook' });
  });

  it('re-renders selected details after pointer, keyboard and row navigation without saving fixtures', () => {
    const { ui, state, press } = setup(true);
    press('i');
    const actions = harness.bag.mock.calls.at(-1)?.[2];
    actions.select(2);
    expect(harness.bag.mock.calls.at(-1)?.[1].selected.description).toContain('object 3');
    press('down'); expect(harness.bag.mock.calls.at(-1)?.[1].index).toBe(5);
    ui.changeBagRow(99);
    expect(harness.bag.mock.calls.at(-1)?.[1].firstRow).toBe(5);
    expect(state.snapshot.inventory).toEqual([]);
    expect(state.snapshot.tutorials.bagOpened).toBe(false);
    harness.bag.mock.calls.at(-1)?.[2].close();
    expect(ui.mode).toBe('none');
  });

  it('turns future pages by keys and pointer, and supports closing the page button', () => {
    const { ui, press } = setup(true);
    press('tab'); press('right');
    expect(harness.book.mock.calls.at(-1)?.[1].index).toBe(1);
    harness.book.mock.calls.at(-1)?.[3].turn(1);
    expect(harness.book.mock.calls.at(-1)?.[1].index).toBe(2);
    press('right'); expect(harness.book.mock.calls.at(-1)?.[1].index).toBe(2);
    harness.book.mock.calls.at(-1)?.[3].close();
    expect(ui.mode).toBe('none');
  });

  it('consumes navigation outside modals so opening a bag cannot replay stale input', () => {
    const { press } = setup(true);
    press('down'); press('right'); press('i');
    expect(harness.bag.mock.calls.at(-1)?.[1].index).toBe(0);
    press('tab'); // Do not open a second collection through the active modal.
    expect(harness.book).not.toHaveBeenCalled();
  });
});
