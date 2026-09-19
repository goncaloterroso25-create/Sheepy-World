import type Phaser from 'phaser';
import { PALETTE as P } from '../art/palette';
import { UI_COPY } from '../data/uiCopy';
import { FINAL_MEMORY } from '../data/storyCompletion';
import type { MemoryProgress } from '../types/game';
import { memoryDiscoveryState, memoryFragments, type ScrapbookSelection } from './CollectionModels';
import { addBodyText, addHeadingText, addSmallText } from './PixelFont';
import { leafDoodle, paperButton, steppedPanel, tape, tornPaper } from './TactileUI';
import { COLLECTION_MATERIAL as M, collectionFocus, finishBookPaper } from './CollectionFinish';
import { memoryDoodle } from './MemoryDoodles';
import { futurePageTrace, restoredMemoryCount, scrapbookLivingStage } from './LivingScrapbook';
import { SCRAPBOOK_NOTE as N, noteLines, clueCardLabel } from './ScrapbookLayout';
import { paperControlButton } from './ControllerGlyphs';
import { lateMemoryNote } from './MemoryGuidance';

export interface ScrapbookViewOptions {
  awakening?: boolean;
  reducedMotion?: boolean;
  onAwakeningPresented?: () => void;
}

const RESTORED_TONES = {
  'first-date': { paper: 0xe8c595, accent: 0xb65f48, cool: 0x8d654e, photo: 0xb98255 },
  performance: { paper: 0xc6abc7, accent: 0xbb5e6c, cool: 0x62638c, photo: 0x34304d },
  snow: { paper: 0xd7e3e3, accent: 0x6594a4, cool: 0x789dae, photo: 0x9baeb7 },
} as const;

export function createScrapbookView(scene: Phaser.Scene, model: ScrapbookSelection,
  progress: Readonly<Record<string, MemoryProgress>>, actions: {
    turn: (direction: -1 | 1) => void;
    selectFragment: (index:number) => void;
    close: () => void;
  },
  options: ScrapbookViewOptions = {},
): Phaser.GameObjects.Container {
  const root = scene.add.container(0, 0);
  const g = scene.add.graphics();
  root.add(g);
  g.fillStyle(P.shadowDeep, 0.6).fillRect(29, 32, 586, 297);
  steppedPanel(g, 23, 23, 586, 298, M.cover);
  steppedPanel(g, 28, 24, 576, 291, M.coverLight, M.cover);
  // Cover lip and layered fore-edges make the pages a physical spread.
  g.fillStyle(M.paperEdge).fillRect(38, 32, 272, 277).fillRect(325, 32, 270, 277);
  g.fillStyle(M.pencil).fillRect(38, 308, 272, 1).fillRect(325, 308, 270, 1);
  g.fillStyle(M.paper).fillRect(36, 30, 273, 275).fillRect(325, 30, 272, 275);
  g.fillStyle(M.paperLight).fillRect(42, 29, 260, 2).fillRect(332, 29, 258, 2);
  g.fillStyle(M.paperEdge).fillRect(37, 304, 264, 1).fillRect(331, 299, 260, 1);
  g.fillStyle(M.coverLight).fillRect(36, 86, 2, 8).fillRect(594, 239, 3, 7);
  g.fillStyle(M.paperLight).fillRect(42, 30, 2, 264).fillRect(334, 31, 1, 263);
  g.fillStyle(M.paperEdge).fillRect(300, 33, 6, 268).fillRect(326, 33, 7, 268);
  // Binding is deliberately stepped, never rotated/subpixel.
  g.fillStyle(M.cover).fillRect(309, 28, 15, 281);
  for (let y = 48; y <= 283; y += 28) {
    g.fillStyle(M.pencil).fillRect(301, y, 5, 7).fillRect(328, y, 5, 7);
    g.fillStyle(M.ink).fillRect(304, y - 2, 25, 3).fillRect(302, y + 1, 3, 4).fillRect(328, y + 1, 3, 4);
    g.fillStyle(M.paperLight).fillRect(306, y - 2, 19, 1);
  }
  // The book quietly accumulates tiny physical changes as pages restore.
  const restoredCount=restoredMemoryCount(progress);
  const livingStage=scrapbookLivingStage(restoredCount);
  finishBookPaper(g,livingStage);
  const bookmarkLength=30+Math.min(28,restoredCount*9);
  g.fillStyle(restoredCount%2?M.gold:M.accent).fillRect(271, 26, 13, bookmarkLength)
    .fillRect(271, 26+bookmarkLength, 5, 4).fillRect(279, 26+bookmarkLength, 5, 4);
  g.fillStyle(restoredCount>=2?M.accent:M.gold).fillRect(597, 83, 16, 31);
  if(restoredCount>0)g.fillStyle(M.tape).fillRect(44,38,18+Math.min(20,restoredCount*3),4);
  if(restoredCount>1)g.fillStyle(M.paperEdge).fillRect(578,289,13,8).fillRect(584,283,7,7);
  leafDoodle(g, 600, 91, M.cover);
  root.add(addHeadingText(scene, 57, 46, UI_COPY.scrapbook.title, M.ink));
  root.add(addSmallText(scene, 58, 73, UI_COPY.scrapbook.chapter, M.pencil));
  const memory = model.selected;
  if (memory) {
    const fragments = memoryFragments(memory, progress[memory.id]);
    const found = fragments.filter((fragment) => fragment.state !== 'missing');
    const restored = progress[memory.id]?.restored ?? false;
    const tone = memory.theme ? RESTORED_TONES[memory.theme] : undefined;
    const pageAccent = restored && tone ? tone.accent : M.accent;
    const discoveryState = memoryDiscoveryState(memory, progress[memory.id]);
    const hiddenTitle = discoveryState === 'UNKNOWN' ? 'AN UNTITLED MEMORY'
      : discoveryState === 'RESONATING' ? 'SOMETHING IS WAITING...' : 'SOMETHING FAMILIAR...';
    root.add(addBodyText(scene, 58, 104, restored ? memory.title : hiddenTitle, M.ink).setMaxWidth(223));
    root.add(addSmallText(scene, 58, 134, `${found.length} / ${fragments.length} CLUES`, M.pencil).setFontSize(6));
    if (restored) {
      // A warm, imperfect ink stamp: restoration is distinct from collecting paper.
      g.lineStyle(1, M.accent).strokeRect(177, 127, 107, 21).strokeRect(180, 130, 101, 15);
      g.fillStyle(M.paper).fillRect(177, 142, 1, 3).fillRect(259, 127, 4, 1);
      root.add(addSmallText(scene, 230, 133, 'RESTORED', M.accent).setOrigin(.5, 0));
    } else root.add(addSmallText(scene, 282, 134, discoveryState, M.pencil).setFontSize(6).setOrigin(1, 0));
    // A small joined-paper composition; empty areas are ragged silhouettes,
    // inserted pieces share a single doodled trail when the page is restored.
    const count = fragments.length;
    const compact=count>3;
    const columns = compact?2:Math.min(3, Math.max(1, count));
    const rows = Math.ceil(count / columns);
    const cellWidth = Math.floor(222 / columns);
    const cellHeight = compact?37:Math.min(75, Math.floor(112 / Math.max(1, rows)));
    fragments.forEach((fragment, index) => {
      const x = 58 + (index % columns) * cellWidth;
      const y = 159 + Math.floor(index / columns) * cellHeight + (index % 2 ? 4 : 0);
      const w = cellWidth - 5;
      const h = cellHeight - 4;
      const inserted = fragment.state !== 'missing';
      if(compact){
        // Four moments reuse the paper cards in two shallow rows, at native font size.
        tornPaper(g,x,y,w,h,inserted?M.paperLight:M.paper);
        const label=inserted?clueCardLabel(memory.fragmentClues[fragment.id]??UI_COPY.scrapbook.fragmentFound,Math.floor((w-10)/6)):'?';
        root.add(addSmallText(scene,x+5,y+9,label,M.pencil));
        if(inserted){
          if(index===model.fragmentIndex)collectionFocus(g,x-2,y-2,w+2,h+2,pageAccent);
          const hit=scene.add.zone(x+w/2,y+h/2,w,h).setInteractive({useHandCursor:true});
          hit.on('pointerdown',()=>actions.selectFragment(index));root.add(hit);
        }
        return;
      }
      if (inserted) {
        tornPaper(g, x, y, w, h, fragment.state === 'restored' && tone ? tone.paper : M.paperLight);
        tape(g, x + 14, y - 3, Math.min(31, w - 20));
        // Before restoration each card stays muted. Restored pages gain their
        // own authored memory palette without changing any clue or save ID.
        g.fillStyle(fragment.state === 'restored' && tone ? tone.photo : M.tape).fillRect(x + 7, y + 18, w - 14, 22);
        g.fillStyle(M.paperEdge).fillRect(x + 7, y + 36, w - 14, 4);
        if(memory.theme) memoryDoodle(g,x+Math.floor(w/2)-15,y+10,fragment.id,1,{
          restored:fragment.state==='restored',accent:pageAccent,cool:tone?.cool,
        });
        else leafDoodle(g, x + Math.floor(w / 2) - 4, y + 23, pageAccent);
        // RetroFont's native size is its cell width (6), not its height (8).
        // Up to three native-size lines; the facing note holds the full clue.
        const cardLabel=clueCardLabel(memory.fragmentClues[fragment.id]??UI_COPY.scrapbook.fragmentFound,Math.floor((w-9)/6));
        root.add(addSmallText(scene, x + 5, y + 41, cardLabel, M.pencil).setFontSize(6));
        if(index===model.fragmentIndex){
          collectionFocus(g,x-2,y-2,w+2,h+2,pageAccent);
          g.fillStyle(pageAccent).fillRect(x+2,y+h-2,w-4,2);
        }
        const hit=scene.add.zone(x+w/2,y+h/2,w,h).setInteractive({useHandCursor:true});
        hit.on('pointerdown',()=>actions.selectFragment(index));
        root.add(hit);
      } else {
        // Interrupted pencil edges and a bitten-off corner, not a disabled card.
        g.fillStyle(M.paperEdge).fillRect(x + 4, y + 2, 19, 1).fillRect(x + 27, y + 3, w - 34, 1)
          .fillRect(x + 2, y + 5, 1, 18).fillRect(x + 1, y + 28, 1, h - 37)
          .fillRect(x + w - 3, y + 7, 1, 22).fillRect(x + w - 4, y + 34, 1, h - 43)
          .fillRect(x + 7, y + h - 4, w - 23, 1).fillRect(x + w - 16, y + h - 9, 5, 1)
          .fillRect(x + w - 11, y + h - 14, 6, 1);
        root.add(addBodyText(scene, x + Math.floor(w / 2), y + Math.floor(h / 2) - 5, '?', M.pencil).setOrigin(0.5, 0));
      }
    });
    root.add(addBodyText(scene, 60, 239, restored ? memory.restoredText ?? UI_COPY.scrapbook.restored
      : discoveryState === 'RESONATING' ? 'Clues gathered. Not restored yet. Return to where they belong.'
        : discoveryState === 'DISCOVERING' ? 'Clues gathered, but the memory is not whole yet.' : 'No clues gathered yet.', M.pencil).setMaxWidth(215));
    leafDoodle(g, 283, 279, pageAccent);

    // Deliberately empty photograph backing, with actual corner mounts.
    g.fillStyle(M.pencil,.16).fillRect(361,65,211,112);
    tornPaper(g, 360, 62, 207, 109, M.paperLight);
    g.fillStyle(restored&&tone?tone.paper:M.paperEdge).fillRect(365,68,196,87);
    g.fillStyle(M.paperEdge).fillRect(370, 72, 186, 78);
    g.fillStyle(M.paper).fillRect(373, 75, 180, 72);
    const corners = [[369, 71], [548, 71], [369, 141], [548, 141]];
    corners.forEach(([x = 0, y = 0]) => {
      g.fillStyle(M.pencil).fillRect(x, y, 9, 2).fillRect(x, y, 2, 9);
      g.fillStyle(M.paperLight).fillRect(x + 2, y + 2, 5, 1);
    });
    if(restored && memory.theme) {
      g.fillStyle(tone!.photo).fillRect(373,75,180,72);
      if(memory.theme==='first-date') {memoryDoodle(g,390,92,'first-date-bench',2,{restored:true,accent:tone!.accent,cool:tone!.cool});memoryDoodle(g,482,112,'first-date-car',1,{restored:true,accent:tone!.accent,cool:tone!.cool});
        g.fillStyle(tone!.accent).fillRect(464,92,3,3).fillRect(469,92,3,3).fillRect(466,95,4,3);}
      else if(memory.theme==='performance') {memoryDoodle(g,420,81,'performance-venue',2,{restored:true,accent:tone!.accent,cool:tone!.cool});memoryDoodle(g,381,112,'performance-night',1,{restored:true,accent:tone!.accent,cool:tone!.cool});
        for(let i=0;i<7;i++)g.fillStyle(M.gold).fillRect(382+i*24,80+i%2*4,2,2);}
      else memoryDoodle(g,438,84,'snow-memory',2,{restored:true,accent:tone!.accent,cool:tone!.cool});
    }
    if(restored&&memory.id===FINAL_MEMORY){
      // The picnic completes the existing page, never an advance preview of it.
      memoryDoodle(g,413,89,'first-date-bench',2,{restored:true,accent:M.accent,cool:M.pencil});
      g.fillStyle(M.paperLight).fillRect(455,116,50,23);
      g.fillStyle(M.accent).fillRect(460,118,2,19).fillRect(498,118,2,19);
      g.fillStyle(M.pencil).fillRect(468,121,5,5).fillRect(485,124,5,5);
    }
    if (restored) root.add(addSmallText(scene, 463, 155, memory.date ?? (memory.theme==='performance'?'ONE MORE SONG.':memory.theme==='snow'?'JERÓNIMO.':'A LITTLE PIECE OF US.'), M.pencil).setOrigin(0.5, 0));
    else root.add(addBodyText(scene, 463, 101, '?', M.paperEdge).setOrigin(.5));
    tape(g, 438, 58, 42);
    // The note has its own soft torn silhouette, restrained ruling and tape.
    tornPaper(g, N.x, N.y, N.width, N.height);
    g.fillStyle(M.accent,.18).fillRect(N.x+6,N.y+12,1,N.height-20);
    g.fillStyle(M.paperLight).fillRect(N.x+3,N.y+8,1,N.height-17);
    tape(g, 368, 178, 29);
    // A paperclip on the blank outer margin, clear of title and note text.
    g.fillStyle(M.pencil).fillRect(568,179,9,2).fillRect(568,181,2,11).fillRect(575,181,2,11).fillRect(571,191,6,2);
    g.fillStyle(M.paperLight).fillRect(569,180,6,1);
    root.add(addSmallText(scene, N.textX, N.headingY, UI_COPY.scrapbook.notesLabel, M.accent));
    const selectedFound=fragments[model.fragmentIndex]?.state!=='missing'?fragments[model.fragmentIndex]:found[0];
    const selectedDetail=selectedFound?memory.fragmentDetails?.[selectedFound.id]:undefined;
    if(selectedFound){
      const title=addBodyText(scene,N.textX,N.titleY,memory.fragmentClues[selectedFound.id]??'Something familiar',M.ink).setMaxWidth(N.textWidth);
      root.add(title);
      const titleBounds=title.getTextBounds().global;
      const bodyY=Math.max(N.bodyY,Math.ceil(titleBounds.y+titleBounds.height)+9);
      g.fillStyle(M.tape).fillRect(N.textX,bodyY-4,N.textWidth,1);
      const detail = restored
        ? selectedDetail?.restored??memory.restoredText??UI_COPY.scrapbook.restored
        : selectedDetail?.found??'Meaning: still unclear.';
      root.add(addSmallText(scene,N.textX,bodyY,noteLines(detail).join('\n'),M.ink).setLineSpacing(1));
    }else root.add(addBodyText(scene,N.textX,N.titleY,memory.nextHint??UI_COPY.scrapbook.fallbackHint,M.ink).setMaxWidth(N.textWidth));
    if(found.length>1){
      g.fillStyle(M.paperEdge).fillRect(N.textX, 287, N.textWidth, 1);
      root.add(addSmallText(scene,N.textX,N.footerY,'UP / DOWN  SELECT CLUE',M.pencil));
    }
    // The late cheeky marginal note has its own space outside the clue slip.
    if(restored&&livingStage==='PERSONAL')root.add(addSmallText(scene,510,48,'Not bad.',pageAccent));
  }

  // A narrow future leaf is visible only as a trace; it never names or solves
  // content that has not entered the game yet.
  if(model.index===model.count-1){
    const trace=futurePageTrace(livingStage);
    if(trace!=='NONE'){
      g.fillStyle(M.paperEdge).fillRect(592,184,12,79);
      g.fillStyle(M.paper).fillRect(594,186,9,74);
      if(trace==='LEAF')leafDoodle(g,594,218,M.pencil);
      else if(trace==='COFFEE_RING')g.lineStyle(2,M.pencil,.35).strokeCircle(598,222,10);
      else {
        g.fillStyle(M.gold,.45).fillRect(596,199,3,42).fillRect(598,238,5,2);
        g.fillStyle(M.accent,.5).fillRect(594,211,8,3);
      }
    }
  }

  if(options.awakening){
    const movingTape=scene.add.rectangle(56,40,24,4,M.tape).setOrigin(.5);
    const reaction=addSmallText(scene,154,88,'...Did that move?',M.pencil).setAlpha(0);
    root.add([movingTape,reaction]);
    if(options.reducedMotion){
      movingTape.x+=2;reaction.setAlpha(1);
      // Persist only after the line has remained readable long enough to be
      // genuinely presented. State persistence re-renders the open book.
      const presented=scene.time.delayedCall(900,()=>options.onAwakeningPresented?.());
      root.once('destroy',()=>presented.remove(false));
    }else{
      const move=scene.tweens.add({targets:movingTape,x:movingTape.x+4,duration:180,yoyo:true,ease:'Stepped',easeParams:[4]});
      const reveal=scene.time.delayedCall(250,()=>reaction.setAlpha(1));
      const presented=scene.time.delayedCall(1200,()=>options.onAwakeningPresented?.());
      root.once('destroy',()=>{move.stop();reveal.remove(false);presented.remove(false);});
    }
  }
  root.add(paperButton(scene, 38, 326, 26, '<', () => actions.turn(-1), model.index > 0));
  root.add(paperButton(scene, 176, 326, 26, '>', () => actions.turn(1), model.index < model.count - 1));
  root.add(addSmallText(scene, 120, 332,
    `${UI_COPY.scrapbook.pageLabel} ${model.count ? model.index + 1 : 0} / ${model.count}`, M.paperLight).setOrigin(0.5, 0));
  root.add(paperControlButton(scene,467,326,140,'back','CLOSE',actions.close));
  const marginalNote = lateMemoryNote({ memories: progress });
  if (marginalNote) root.add(addSmallText(scene, 220, 325, marginalNote, M.paperLight).setFontSize(6).setLineSpacing(2));
  return root;
}
