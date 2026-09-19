import type { InteractionProgress, SaveData } from '../types/game';
import type { SaveRepository } from './SaveSystem';
import { MovementState } from './MovementState';
import type { VolumeSetting } from '../config/audio';
import { sanitizeWorldLocation, type WorldLocation } from '../world/regions/definitions';
import { catPerch, tobiasPerch } from '../data/cats';
import { MEMORIES } from '../data/memories';
import { FINAL_MEMORY, STORY_FLAGS, finalGateOpen } from '../data/storyCompletion';
import { COMPUTER_MEMORY_ORDER, MEMORY_WORLD_UPDATES } from '../data/worldMemoryUpdates';

type StateListener = (state: Readonly<SaveData>) => void;

export class GameStateStore {
  readonly movement = new MovementState();
  private data: SaveData;
  private readonly listeners = new Set<StateListener>();
  private chichoSession = { mode:'ground' as 'ground'|'carried'|'going-to-food'|'eating', x:1040, y:700, until:0 };

  get chicho(): Readonly<typeof this.chichoSession> { return this.chichoSession; }
  updateChicho(change: Partial<typeof this.chichoSession>): void { this.chichoSession={...this.chichoSession,...change}; }
  resetChicho(): void { this.chichoSession={mode:'ground',x:1040,y:700,until:0}; }

  constructor(private readonly repository: SaveRepository) {
    this.data = repository.load();
  }

  get snapshot(): Readonly<SaveData> {
    return this.data;
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  arriveAt(location: WorldLocation): void {
    this.data.worldLocation = sanitizeWorldLocation(location);
    const id = this.data.worldLocation.regionId;
    if (!this.data.discoveredLocations.includes(id)) this.data.discoveredLocations.push(id);
    this.persist();
  }

  carryTobias(): boolean {
    if (tobiasPerch(this.data.cats)?.regionId !== this.data.worldLocation.regionId) return false;
    this.data.cats.tobias = 'carried';
    delete this.data.cats.tobiasPerch;
    this.persist();
    return true;
  }

  settleTobias(): boolean {
    if (this.data.cats.tobias !== 'carried' || this.data.worldLocation.regionId !== 'home-interior') return false;
    return this.setDownTobias('home-bed');
  }

  setDownTobias(perchId: string): boolean {
    const perch = catPerch(perchId);
    if (this.data.cats.tobias !== 'carried' || perch?.regionId !== this.data.worldLocation.regionId) return false;
    this.data.cats = perchId === 'home-bed' ? { tobias: 'home', teemi: 'home' }
      : { tobias: 'perched', tobiasPerch: perchId, teemi: 'home' };
    this.persist();
    return true;
  }

  setVolume(setting: VolumeSetting, value: number): void {
    if (!Number.isFinite(value)) return;
    this.data.settings[setting] = Math.min(1, Math.max(0, value));
    this.persist();
  }

  collectFragment(memoryId: string, fragmentId: string, _restoreAt: number): boolean {
    void _restoreAt; // Legacy call-site argument; authored definitions own the threshold.
    const definition = MEMORIES[memoryId];
    if (definition?.kind === 'CORE' && !definition.fragmentIds.includes(fragmentId)) return false;
    const progress = this.data.memories[memoryId] ?? { foundFragmentIds: [], restored: false };
    if (progress.foundFragmentIds.includes(fragmentId)) return false;

    const foundFragmentIds = [...progress.foundFragmentIds, fragmentId];
    this.data.memories[memoryId] = {
      foundFragmentIds,
      restored: progress.restored,
    };
    this.persist();
    return true;
  }

  restoreMemory(memoryId: string): boolean {
    const definition = MEMORIES[memoryId];
    const progress = this.data.memories[memoryId];
    if (!definition || !progress || progress.restored
      || !definition.fragmentIds.every(id => progress.foundFragmentIds.includes(id))) return false;
    this.data.memories[memoryId] = { ...progress, restored: true };
    this.persist();
    return true;
  }

  memoryHasClue(memoryId: string, fragmentId: string): boolean {
    return this.data.memories[memoryId]?.foundFragmentIds.includes(fragmentId) === true;
  }

  get finalRouteReady(): boolean { return finalGateOpen(this.data); }

  acknowledgeFinalAuthor(): boolean {
    if(this.data.worldLocation.regionId!=='final-park'||!this.data.memories[FINAL_MEMORY]?.restored)return false;
    return this.setFlag(STORY_FLAGS.author,'true');
  }

  completeStory(): boolean {
    if(this.data.worldLocation.regionId!=='final-park'||!this.data.memories[FINAL_MEMORY]?.restored
      ||this.flag(STORY_FLAGS.author)!=='true')return false;
    return this.setFlag(STORY_FLAGS.complete,'true');
  }

  setFlag(flag: string, value: string): boolean {
    if (this.data.flags[flag] === value) return false;
    this.data.flags = { ...this.data.flags, [flag]: value };
    this.persist();
    return true;
  }

  flag(flag: string): string | undefined { return this.data.flags[flag]; }

  get pendingComputerMemoryId(): string | undefined {
    const id=this.data.flags['pc-unread'];
    return id && id !== 'none' && Object.hasOwn(MEMORY_WORLD_UPDATES,id)
      && this.data.memories[id]?.restored === true
      && this.data.flags[`pc-read-${id}`] !== 'true' ? id : undefined;
  }

  get computerDiscovered(): boolean { return this.data.flags['pc-discovered'] === 'true'; }

  get computerReadCount(): number {
    return COMPUTER_MEMORY_ORDER.filter(id => this.data.flags[`pc-read-${id}`] === 'true').length;
  }

  discoverMemoryComputer(): boolean {
    const discovered=this.data.flags['pc-discovered'] === 'true';
    if(!discovered)this.data.flags={...this.data.flags,'pc-discovered':'true'};
    const before=this.pendingComputerMemoryId;
    this.queueNextComputerUpdate();
    if(!discovered||before!==this.pendingComputerMemoryId)this.persist();
    return !discovered;
  }

  queueComputerMemoryUpdate(memoryId:string): boolean {
    if (this.data.flags['pc-discovered'] !== 'true' || !Object.hasOwn(MEMORY_WORLD_UPDATES,memoryId)
      || this.data.memories[memoryId]?.restored !== true
      || this.data.flags[`pc-read-${memoryId}`] === 'true' || this.pendingComputerMemoryId) return false;
    this.data.flags={...this.data.flags,'pc-unread':memoryId};
    this.persist();
    return true;
  }

  readComputerMemoryUpdate(expectedMemoryId?: string): string | undefined {
    const current=this.pendingComputerMemoryId;
    if (!current || (expectedMemoryId !== undefined && current !== expectedMemoryId)) return;
    this.data.flags={...this.data.flags,[`pc-read-${current}`]:'true','pc-unread':'none'};
    this.queueNextComputerUpdate();
    this.persist();
    return current;
  }

  addArtifact(itemId: string): boolean {
    if (this.data.inventory.includes(itemId)) return false;
    this.data.inventory = [...this.data.inventory, itemId];
    this.persist();
    return true;
  }

  completeEncounter(id: string): boolean {
    if (this.data.encounters.includes(id)) return false;
    this.data.encounters.push(id); this.persist(); return true;
  }

  unlockAchievement(id: string): boolean {
    if (this.data.achievements.includes(id)) return false;
    this.data.achievements.push(id); this.persist(); return true;
  }

  incrementYellowCars(): number {
    this.data.counters.yellowCars += 1;
    this.persist();
    return this.data.counters.yellowCars;
  }

  markControlDockSeen(): void {
    if (this.data.tutorials.controlDockSeen) return;
    this.data.tutorials.controlDockSeen = true;
    this.persist();
  }

  markTutorialSystemOpened(system: 'scrapbook' | 'bag'): void {
    const key = system === 'scrapbook' ? 'scrapbookOpened' : 'bagOpened';
    if (this.data.tutorials[key]) return;
    this.data.tutorials[key] = true;
    this.persist();
  }

  interactionProgress(interactionId: string): Readonly<InteractionProgress> | undefined {
    return this.data.interactions[interactionId];
  }

  isInteractionExhausted(interactionId: string): boolean {
    return this.data.interactions[interactionId]?.exhausted === true;
  }

  markDialogueBranchSeen(
    interactionId: string,
    branchId: string,
    allBranchIds: readonly string[],
  ): Readonly<InteractionProgress> {
    const current = this.data.interactions[interactionId] ?? {
      seenBranchIds: [],
      exhausted: false,
    };
    const seenBranchIds = current.seenBranchIds.includes(branchId)
      ? current.seenBranchIds
      : [...current.seenBranchIds, branchId];
    const exhausted = allBranchIds.length > 0
      && allBranchIds.every((id) => seenBranchIds.includes(id));

    if (seenBranchIds === current.seenBranchIds && exhausted === current.exhausted) return current;
    const progress = { seenBranchIds, exhausted };
    this.data.interactions[interactionId] = progress;
    this.persist();
    return progress;
  }

  exhaustInteraction(interactionId: string): void {
    const current = this.data.interactions[interactionId] ?? { seenBranchIds: [], exhausted: false };
    if (current.exhausted) return;
    this.data.interactions[interactionId] = { ...current, exhausted: true };
    this.persist();
  }

  reset(): void {
    this.movement.reset();
    this.data = this.repository.reset();
    this.emit();
  }

  private queueNextComputerUpdate(): void {
    if (this.pendingComputerMemoryId) return;
    const next=COMPUTER_MEMORY_ORDER.find(memoryId=>
      this.data.memories[memoryId]?.restored===true&&this.data.flags[`pc-read-${memoryId}`]!=='true');
    if(next)this.data.flags={...this.data.flags,'pc-unread':next};
  }

  private persist(): void {
    this.repository.save(this.data);
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener(this.data));
  }
}
