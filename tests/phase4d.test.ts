import {describe,expect,it} from 'vitest';
import {CURATED_AUDIO} from '../src/config/audio';
import {MEMORIES} from '../src/data/memories';
import {MENTALIST_INTRO} from '../src/data/namedDialogues';
import {PERSONAL_PHOTOS} from '../src/data/personalPhotos';
import {memoryDiscoveryState} from '../src/ui/CollectionModels';
import {approachDistance} from '../src/systems/InteractionGeometry';
import {selectInteraction} from '../src/systems/InteractionSelection';
import {unseenDialogueChoices} from '../src/systems/DialogueState';
import {GameStateStore} from '../src/systems/GameStateStore';
import {createDefaultSave,SaveRepository,sanitizeSave,SAVE_SCHEMA_VERSION} from '../src/systems/SaveSystem';
import {WORLD_REGIONS} from '../src/world/regions/definitions';
import {MemoryStorage} from './helpers/MemoryStorage';

describe('Phase 4D interaction usability',()=>{
  it('uses proximity first, priority second at equal distance, and facing only as a tie-break',()=>{
    const close={id:'close',distance:9,range:36,priority:0,facingScore:0};
    const important={id:'important',distance:24,range:48,priority:100,facingScore:1};
    expect(selectInteraction([important,close])?.id).toBe('close');
    expect(selectInteraction([{...close,id:'low'},{...close,id:'high',priority:2}])?.id).toBe('high');
    expect(selectInteraction([{...close,id:'away'},{...close,id:'faced',facingScore:1}])?.id).toBe('faced');
  });
  it('keeps the current prompt inside the hysteresis margin but releases it for a clearly closer target',()=>{
    const current={id:'cat',distance:38,range:36,priority:0};
    expect(selectInteraction([current,{id:'table',distance:34,range:36,priority:0}],'cat')?.id).toBe('cat');
    expect(selectInteraction([current,{id:'table',distance:20,range:36,priority:0}],'cat')?.id).toBe('table');
  });
  it('does not require facing or an authored approach side, but walls still occlude',()=>{
    const approach={anchor:{x:50,y:50},radius:36,approachSide:'down' as const,body:{x:40,y:40,width:20,height:10}};
    expect(approachDistance({x:50,y:10},approach,[])).toBe(40);
    expect(approachDistance({x:50,y:10},approach,[{x:42,y:28,width:16,height:4}])).toBe(Infinity);
  });
  it('uses negative priority only for player-bound fallbacks',()=>{
    expect(selectInteraction([{id:'drop',distance:0,range:1,priority:-100},{id:'cat',distance:40,range:44,priority:0}])?.id).toBe('cat');
  });
});

describe('Phase 4D mystery and dialogue state',()=>{
  it('moves UNKNOWN through DISCOVERING and RESONATING before manual RESTORED',()=>{
    const memory=MEMORIES['first-date']!;const repository=new SaveRepository(new MemoryStorage());const state=new GameStateStore(repository);
    expect(memoryDiscoveryState(memory)).toBe('UNKNOWN');
    state.collectFragment(memory.id,memory.fragmentIds[0]!,memory.restoreAt);
    expect(memoryDiscoveryState(memory,state.snapshot.memories[memory.id])).toBe('DISCOVERING');
    for(const clue of memory.fragmentIds.slice(1))state.collectFragment(memory.id,clue,memory.restoreAt);
    expect(memoryDiscoveryState(memory,state.snapshot.memories[memory.id])).toBe('RESONATING');
    expect(state.restoreMemory(memory.id)).toBe(true);
    expect(memoryDiscoveryState(memory,state.snapshot.memories[memory.id])).toBe('RESTORED');
  });
  it('does not expose final first-date or band context in unresolved clue labels',()=>{
    expect(Object.values(MEMORIES['first-date']!.fragmentClues).join(' ')).not.toMatch(/KISS|DATE|MAKING OUT/i);
    expect(Object.values(MEMORIES['porto-performance']!.fragmentClues).join(' ')).not.toMatch(/PERFORMANCE|DATE|PORTO/i);
  });
  it('filters typed choices by persistent flags and stores only meaningful selected flags',()=>{
    const hello=MENTALIST_INTRO.nodes['jane-invitation']!;
    expect(unseenDialogueChoices(MENTALIST_INTRO,hello,undefined,{})).toHaveLength(3);
    expect(hello.choices?.every(choice=>choice.setFlags?.some(change=>change.flag==='mentalist-approach'))).toBe(true);
    const state=new GameStateStore(new SaveRepository(new MemoryStorage()));state.setFlag('mentalist-approach','curious');
    expect(state.snapshot.flags).toEqual({'mentalist-approach':'curious'});
  });
  it('migrates old saves, preserves restored pages, and permits all-clue unresolved pages',()=>{
    const restored=sanitizeSave({...createDefaultSave(),version:7,memories:{'first-date':{foundFragmentIds:[...MEMORIES['first-date']!.fragmentIds],restored:true}}});
    expect(restored.version).toBe(SAVE_SCHEMA_VERSION);expect(restored.memories['first-date']?.restored).toBe(true);
    const resonating=sanitizeSave({...createDefaultSave(),memories:{'first-date':{foundFragmentIds:[...MEMORIES['first-date']!.fragmentIds],restored:false}}});
    expect(resonating.memories['first-date']?.restored).toBe(false);
  });
});

describe('Phase 4D authored content contracts',()=>{
  it('connects an enterable River crime scene reciprocally',()=>{
    expect(WORLD_REGIONS['river-town'].exits.some(exit=>exit.destination.regionId==='river-crime-scene'&&exit.door)).toBe(true);
    expect(WORLD_REGIONS['river-crime-scene'].exits[0]?.destination.regionId).toBe('river-town');
  });
  it('ships only the cleared original score and excludes supplied/private recordings',()=>{
    const urls=Object.fromEntries(CURATED_AUDIO.assets.map(asset=>[asset.key,asset.url]));
    expect(urls).toEqual({'sheepy-world-theme':'/assets/audio/music/sheepy-world-theme.mp3'});
  });
  it('keeps the approved Jerónimo viewer gallery-ready with retained zoom/navigation data',()=>{
    expect(PERSONAL_PHOTOS.jeronimo.gallery).toHaveLength(1);
    expect(PERSONAL_PHOTOS.jeronimo.gallery[0]?.url).toBe('/assets/placeholders/snow-sheep.png');
  });
});
