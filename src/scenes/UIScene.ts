import Phaser from 'phaser';
import { InputController } from '../config/controls';
import { togetherUnlocked, togetherEnabled, TOGETHER_PREFERENCE, TOGETHER_RUNTIME } from '../systems/TogetherState';
import type { TogetherWorld } from '../world/regions/TogetherWorld';
import { currentInputPresentation, getControlHint } from '../config/controllerPresentation';
import { fullscreen } from '../systems/Fullscreen';
import { pausePaper } from '../ui/PausePaper';
import { addControlHint, addControlLegend, refreshControlHints } from '../ui/ControllerGlyphs';
import { createObservationNote } from '../ui/ObservationNote';
import { RouteReadyObservation } from '../ui/MemoryGuidance';
import { memoryKeepsakes } from '../ui/MemoryKeepsakes';
import { UI_MATERIAL as M } from '../ui/TactileUI';
import { AUDIO_CONTROLS } from '../config/audio';
import { StaminaMeter } from '../ui/StaminaMeter';
import { GAME_EVENTS, GAME_HEIGHT, GAME_WIDTH, REGISTRY_KEYS, SCENE_KEYS } from '../config/constants';
import { ITEMS, TEST_ITEM_ID } from '../data/items';
import { PARK_KEEPER_DIALOGUE } from '../data/dialogues';
import { MEMORIES } from '../data/memories';
import { FINAL_MEMORY } from '../data/storyCompletion';
import {
  INTERACTION_MODES,
  type DialogueChoice,
  type DialogueDefinition,
  type DialogueNode,
} from '../types/game';
import {
  dialogueStartNode,
  trackedBranchIds,
  unseenDialogueChoices,
} from '../systems/DialogueState';
import type { GameStateStore } from '../systems/GameStateStore';
import { gameEvents } from '../systems/events';
import { addBodyText, addHeadingText, addPixelText, addSmallText } from '../ui/PixelFont';
import { PALETTE } from '../art/palette';
import { createDialogueFrame } from '../ui/DialogueFrame';
import { createDialogueChoices } from '../ui/DialogueChoices';
import { dialogueLayout } from '../ui/DialogueLayout';
import type { YellowCarEvent } from '../systems/AmbientCarSystem';
import {
  CONTROL_TUTORIAL_COPY,
  shouldShowControlTutorial,
} from '../ui/ControlDock';
import { createCompactDock } from '../ui/CompactDockView';

import { BagSelection, inventoryEntries, ScrapbookSelection } from '../ui/CollectionModels';
import { createBagView } from '../ui/BagView';
import { createScrapbookView } from '../ui/ScrapbookView';
import { settlePaper, UI_FEEDBACK_EVENT, type UiFeedback } from '../ui/TactileUI';
import type { CollectionPreview } from '../dev/collectionPreviews';
import { CIPHER_OPEN, PERSONAL_PHOTOS, PHOTO_CLOSED, PHOTO_OPEN, type PersonalPhotoId } from '../data/personalPhotos';
import { createPhotoView } from '../ui/PersonalPhotoView';
import { createCipherView } from '../ui/BedroomCipherView';
import { CIPHER_HINTS } from '../systems/BedroomCipher';
import {
  COMPUTER_OPEN,
  computerTerminalSession,
  type ComputerOpenPayload,
  type ComputerTerminalSession,
} from '../data/computerTerminal';
import { createComputerTerminalView, type ComputerTerminalView } from '../ui/ComputerTerminalView';
import { createFinaleView, ENDING_SETTLE_MS } from '../ui/FinaleView';
import {
  SCRAPBOOK_LIVING_FLAGS,
  autoTurnTarget,
  restoredMemoryCount,
  shouldPlayMovedReaction,
} from '../ui/LivingScrapbook';

type UiMode = 'none' | 'dialogue' | 'scrapbook' | 'inventory' | 'pause' | 'settings' | 'reset-confirm' | 'photo' | 'cipher' | 'computer' | 'memory-reveal' | 'reunion' | 'ending';

interface NotificationPayload {
  title: string;
  detail: string;
}

const CENTER_X = GAME_WIDTH / 2;
const CENTER_Y = GAME_HEIGHT / 2;

export class UIScene extends Phaser.Scene {
  private controls!: InputController;
  private choiceKeys!: Phaser.Input.Keyboard.Key[];
  private state!: GameStateStore;
  private mode: UiMode = 'none';
  private modal?: Phaser.GameObjects.Container;
  private toast?: Phaser.GameObjects.Container;
  private routeObservation!: RouteReadyObservation;
  private routeQuietMs = 0;
  private controlDock?: Phaser.GameObjects.Container;
  private controlTutorial?: Phaser.GameObjects.Container;
  private dialogue?: DialogueDefinition;
  private dialogueNodeId = '';
  private dialogueLine = 0;
  private dialogueChoice = 0;
  private dialogueOpenedAt = 0;
  private pendingCompletionNodeId?: string;
  private unsubscribeState?: () => void;
  private staminaMeter!: StaminaMeter;
  private readonly bagSelection = new BagSelection();
  private readonly scrapbookSelection = new ScrapbookSelection();
  private collectionPreview?: CollectionPreview;
  private photoId?: PersonalPhotoId;
  private photoIndex = 0;
  private cipherShift = 0;
  private cipherHint = 0;
  private pendingMemoryReveal?:string;
  private pendingWorldCue?:NotificationPayload;
  private memoryRevealSkippableAt = 0;
  private memoryRevealToken = 0;
  private computerView?: ComputerTerminalView;
  private computerOpenedAt = 0;
  private scrapbookAwakening = false;
  private scrapbookAutoTurnTarget?: string;
  private scrapbookAutoTurnTimer?: Phaser.Time.TimerEvent;
  private resonancePulseUntil = 0;
  private dockFeedbackPending?: 'book' | 'bag';
  private menuRows: { action: () => void; adjust?: (step:number)=>void; background: Phaser.GameObjects.Rectangle }[] = [];
  private menuSelected = 0;
  private menuStick = 0;
  private dockPresentation = currentInputPresentation();
  private enterKey!: Phaser.Input.Keyboard.Key;
  private pauseHelp?: Phaser.GameObjects.Container;

  constructor() {
    super(SCENE_KEYS.ui);
  }

  create(): void {
    this.state = this.registry.get(REGISTRY_KEYS.state) as GameStateStore;
    this.routeObservation = new RouteReadyObservation(this.state.snapshot);
    this.routeQuietMs = 0;
    this.staminaMeter = new StaminaMeter(this, this.state.movement);
    this.cameras.main.setRoundPixels(true);
    this.controls = new InputController(this);
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input is unavailable.');
    this.enterKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, true);
    const unsubscribeFullscreen = fullscreen.subscribe(() => { if(this.mode==='settings')this.openSettings(this.menuSelected); });
    this.events.once('shutdown',unsubscribeFullscreen);
    this.choiceKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE, true),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO, true),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE, true),
    ];

    gameEvents.on(GAME_EVENTS.dialogueStart, this.startDialogue, this);
    gameEvents.on(GAME_EVENTS.notification, this.showNotification, this);
    gameEvents.on(GAME_EVENTS.yellowCar, this.showPshw, this);
    gameEvents.on(PHOTO_OPEN, this.openPhoto, this);
    gameEvents.on(CIPHER_OPEN, this.openCipher, this);
    gameEvents.on(COMPUTER_OPEN, this.openComputer, this);
    this.game.events.on('memory-restored',this.showMemoryReveal,this);
    gameEvents.on('world-cue',this.showWorldCue,this);
    gameEvents.on('story-ending',this.showEnding,this);
    gameEvents.on('finale-reunion-start',this.beginReunion,this);
    const memoryStamp = (): string => JSON.stringify(this.state.snapshot.memories);
    let previousMemories = memoryStamp(), previousItems = this.state.snapshot.inventory.length;
    this.unsubscribeState = this.state.subscribe(() => {
      this.routeObservation.observe(this.state.snapshot);
      const memories = memoryStamp(), items = this.state.snapshot.inventory.length;
      if (items > previousItems) this.dockFeedbackPending = 'bag';
      else if (memories !== previousMemories) this.dockFeedbackPending = 'book';
      previousMemories = memories; previousItems = items;
      if (this.mode === 'scrapbook' || this.mode === 'inventory') this.renderCollection();
      this.controlDock?.setAlpha(this.dockLearned() ? 0.9 : 1);
      this.controlDock?.getData('refresh')?.();
    });
    this.createControlDock();
    this.input.on('wheel', this.scrollBag, this);
    this.time.delayedCall(900, () => this.maybeShowControlTutorial());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameEvents.off(GAME_EVENTS.dialogueStart, this.startDialogue, this);
      gameEvents.off(GAME_EVENTS.notification, this.showNotification, this);
      gameEvents.off(GAME_EVENTS.yellowCar, this.showPshw, this);
      gameEvents.off(PHOTO_OPEN, this.openPhoto, this);
      gameEvents.off(CIPHER_OPEN, this.openCipher, this);
      gameEvents.off(COMPUTER_OPEN, this.openComputer, this);
      this.game.events.off('memory-restored',this.showMemoryReveal,this);
      gameEvents.off('world-cue',this.showWorldCue,this);
      gameEvents.off('story-ending',this.showEnding,this);
      gameEvents.off('finale-reunion-start',this.beginReunion,this);
      this.unsubscribeState?.();
      this.input.off('wheel', this.scrollBag, this);
    });

    if (import.meta.env.DEV) {
      const dev = window.__SHEEPY_DEV__;
      if (dev) {
        // Collection views have a nested root; QA must measure their actual text too.
        const modalTexts = (root?: Phaser.GameObjects.Container): Phaser.GameObjects.BitmapText[] =>
          root?.list.flatMap(child => child instanceof Phaser.GameObjects.BitmapText ? [child]
            : child instanceof Phaser.GameObjects.Container ? modalTexts(child) : []) ?? [];
        dev.getUiState = () => ({
          mode: this.mode,
          toastText: this.toast?.list
            .filter((child) => child instanceof Phaser.GameObjects.BitmapText)
            .map((child) => (child as Phaser.GameObjects.BitmapText).text) ?? [],
          textBounds: modalTexts(this.modal).map(text=>{
            const bounds=text.getBounds();
            return {text:text.text,x:bounds.x,y:bounds.y,width:bounds.width,height:bounds.height};
          }),
          bag: { count: this.bagSelection.items.length, index: this.bagSelection.index,
            firstRow: this.bagSelection.firstRow, selected: this.bagSelection.selected,
            visible: this.bagSelection.visible.map((item) => item.id) },
          scrapbook: { index: this.scrapbookSelection.index, count: this.scrapbookSelection.count,
            selected: this.scrapbookSelection.selected?.id, fragmentIndex:this.scrapbookSelection.fragmentIndex },
          computer: this.computerView ? { page: this.computerView.page, typing: this.computerView.typing } : undefined,
        });
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { delete dev.getUiState; });
      }
      const preview = new URLSearchParams(window.location.search).get('preview');
      this.time.delayedCall(150, () => {
        if (preview === 'scrapbook' || preview === 'bag' || preview === 'inventory') {
          void import('../dev/collectionPreviews').then(({ collectionPreview }) => {
            if (!this.scene.isActive()) return;
            this.collectionPreview = collectionPreview(new URLSearchParams(window.location.search));
            if (preview === 'scrapbook') this.openScrapbook();
            else this.openInventory();
          });
          return;
        }
        if (preview === 'dialogue') this.startDialogue(PARK_KEEPER_DIALOGUE);
        if (preview === 'memory-reveal') this.showMemoryReveal(
          new URLSearchParams(window.location.search).get('memory') ?? 'first-date',
        );
        if (preview === 'computer') this.openComputer({ session: computerTerminalSession(
          this.state.snapshot,
          this.state.pendingComputerMemoryId,
          !this.state.computerDiscovered,
        ) });
        if (preview === 'pause') this.openPause();
        if (preview === 'tutorial') this.maybeShowControlTutorial(true);
      });
    }
  }

  update(_time: number, delta: number): void {
    // Let closeModal's existing 120ms queued world cue arrive before claiming the note slot.
    const quiet = this.mode === 'none' && !this.toast && !this.pendingWorldCue && !this.state.movement.locked;
    this.routeQuietMs = quiet ? this.routeQuietMs + Math.min(delta, 100) : 0;
    const routeNote = this.routeObservation.take(this.routeQuietMs >= 200);
    if (routeNote) this.showNotification(routeNote);
    this.controls.pollPresentation();
    if (this.mode === 'none' && this.dockFeedbackPending) {
      this.pulseScrapbookDock(this.dockFeedbackPending);
      this.dockFeedbackPending = undefined;
    }
    const presentation=currentInputPresentation();
    if(this.dockPresentation!==presentation) {
      this.dockPresentation=presentation;this.controlDock?.getData('refresh')?.();
      if(this.mode==='dialogue')this.renderDialogue();
      else if(this.mode==='pause')this.renderPauseHelp();
      else refreshControlHints(this.modal);
    }
    this.staminaMeter.update(delta, this.mode !== 'none' || this.state.movement.locked);
    const close = this.controls.justClosed();
    const pause = this.controls.justPaused();
    const scrapbook = this.controls.justScrapbook();
    const inventory = this.controls.justInventory();
    const interact = this.controls.justInteracted();
    const together = this.controls.justTogether();
    const enter = this.controls.justPressed(this.enterKey);
    const choices = this.choiceKeys.map((key) => this.controls.justPressed(key));
    // Always consume navigation edges, even outside collections: no stale presses.
    const directions = (['left', 'right', 'up', 'down'] as const)
      .filter(direction=>this.controls.justDirection(direction));
    if(this.mode==='reunion')return;
    const pair=this.registry.get(TOGETHER_RUNTIME) as TogetherWorld | undefined;
    // Consume this edge here: Q/Circle must never both leave an activity and open Pause.
    if(this.mode==='none' && close && pair?.back())return;
    if (pause) {
      if (this.mode === 'none') this.openPause();
      else if (this.mode === 'pause') this.closeModal();
      else if (this.mode === 'settings' || this.mode === 'reset-confirm') this.openPause();
      return;
    }
    if (close) {
      this.handleEscape();
      return;
    }
    if(this.mode==='none') {
      if(together && !interact && pair?.action())return;
      if(pair?.busy)return;
    }
    if(['pause','settings','reset-confirm'].includes(this.mode)) {
      const stick=this.input.gamepad?.getPad(0)?.leftStick.y??0;
      const vertical=Math.abs(stick)>.55?Math.sign(stick):0;
      const step=directions.includes('up')?-1:directions.includes('down')?1:vertical!==this.menuStick?vertical:0;
      this.menuStick=vertical;
      if(step) { this.menuSelected=Phaser.Math.Wrap(this.menuSelected+step,0,this.menuRows.length);this.paintMenuSelection(); }
      const adjust=Number(directions.includes('right'))-Number(directions.includes('left'));
      if(adjust)this.menuRows[this.menuSelected]?.adjust?.(adjust);
      else if(enter||interact)this.menuRows[this.menuSelected]?.action();
      return;
    }

    if (this.mode === 'dialogue') {
      const node = this.currentDialogueNode();
      if (node && this.availableChoices(node).length > 0 && this.dialogueLine >= node.lines.length - 1) {
        const count=this.availableChoices(node).length;
        const step=Number(directions.includes('down'))-Number(directions.includes('up'));
        if(step){this.dialogueChoice=(this.dialogueChoice+step+count)%count;this.renderDialogue();}
        const number=choices.findIndex(Boolean);
        if(number>=0)this.choose(number);
        else if(interact&&this.time.now-this.dialogueOpenedAt>120)this.choose(this.dialogueChoice);
        return;
      }
      if (interact && this.time.now - this.dialogueOpenedAt > 120) {
        this.advanceDialogue();
      }
      return;
    }

    if(this.mode==='ending'){
      if(interact&&this.time.now>=this.memoryRevealSkippableAt)this.closeModal();
      return;
    }
    if(this.mode==='memory-reveal'){
      if(interact&&this.time.now>=this.memoryRevealSkippableAt)this.closeModal();
      return;
    }

    if(this.mode==='computer'){
      if(interact&&this.time.now-this.computerOpenedAt>150)this.computerView?.advance();
      return;
    }

    if (this.mode === 'photo') {
      directions.forEach(direction=>{if(direction==='left')this.shiftPhoto(-1);if(direction==='right')this.shiftPhoto(1);});
      if (interact && this.time.now - this.dialogueOpenedAt > 150) this.closeModal();
      return;
    }
    if (this.mode === 'cipher') {
      directions.forEach(d => { if (d === 'left' || d === 'right') this.shiftCipher(d === 'left' ? -1 : 1); });
      if (choices[0]) { this.cipherHint = Math.min(CIPHER_HINTS.length - 1, this.cipherHint+1); this.renderCipher(); }
      if (choices[1]) this.submitCipher();
      return;
    }

    if (scrapbook) {
      if (this.mode === 'scrapbook') this.closeModal();
      else if (this.mode === 'none') this.openScrapbook();
      return;
    }
    if (inventory) {
      if (this.mode === 'inventory') this.closeModal();
      else if (this.mode === 'none') this.openInventory();
      return;
    }
    directions.forEach((direction) => {
      if (this.mode === 'inventory' && this.bagSelection.move(direction)) {
        this.collectionFeedback('item-select');
        this.renderCollection();
      } else if (this.mode === 'scrapbook') {
        if (direction === 'left' || direction === 'right') this.turnPage(direction === 'left' ? -1 : 1);
        else {
          const progress=(this.collectionPreview?.progress??this.state.snapshot.memories)[this.scrapbookSelection.selected?.id??''];
          if(this.scrapbookSelection.moveFragment(direction==='up'?-1:1,progress)){
            this.collectionFeedback('select');this.renderCollection();
          }
        }
      }
    });
  }

  private startDialogue(dialogue: DialogueDefinition): void {
    if (this.mode !== 'none') return;
    const interactionId = dialogue.interaction.id;
    const startNodeId = dialogueStartNode(dialogue, this.state.interactionProgress(interactionId));
    if (!startNodeId) {
      if (!this.state.isInteractionExhausted(interactionId)) this.state.exhaustInteraction(interactionId);
      return;
    }
    this.dialogue = dialogue;
    this.dialogueOpenedAt = this.time.now;
    this.pendingCompletionNodeId = undefined;
    this.mode = 'dialogue';
    this.controlDock?.setVisible(false);
    this.controlTutorial?.destroy(true);
    this.controlTutorial = undefined;
    this.setWorldBlocking(true);
    this.enterDialogueNode(startNodeId);
  }

  private currentDialogueNode(): DialogueNode | undefined {
    return this.dialogue?.nodes[this.dialogueNodeId];
  }

  private advanceDialogue(): void {
    const node = this.currentDialogueNode();
    if (!node) return this.finishDialogue();
    if (this.dialogueLine < node.lines.length - 1) {
      this.dialogueLine += 1;
      this.renderDialogue();
      return;
    }
    if (this.availableChoices(node).length > 0) return;
    if (node.nextId) {
      this.emitNodeCompletion(node);
      this.enterDialogueNode(node.nextId);
      return;
    }
    if (this.pendingCompletionNodeId) {
      this.emitNodeCompletion(node);
      const nextNodeId = this.pendingCompletionNodeId;
      this.pendingCompletionNodeId = undefined;
      this.enterDialogueNode(nextNodeId);
      return;
    }
    this.finishDialogue();
  }

  private choose(index: number): void {
    const node = this.currentDialogueNode();
    if (!node || !this.dialogue) return;
    const choice = this.availableChoices(node)[index];
    if (!choice) return;
    if (choice.setFlag) this.state.setFlag(choice.setFlag.flag, choice.setFlag.value);
    choice.setFlags?.forEach(({ flag, value }) => this.state.setFlag(flag, value));
    const interaction = this.dialogue.interaction;
    if (
      interaction.mode === INTERACTION_MODES.branchExhaustible
      && interaction.branchNodeId === node.id
    ) {
      const progress = this.state.markDialogueBranchSeen(
        interaction.id,
        choice.id,
        trackedBranchIds(this.dialogue),
      );
      if (progress.exhausted) this.pendingCompletionNodeId = interaction.completionNodeId;
    }
    this.enterDialogueNode(choice.nextId);
  }

  private finishDialogue(): void {
    const node = this.currentDialogueNode();
    if (node) this.emitNodeCompletion(node);
    if (this.dialogue?.interaction.mode === INTERACTION_MODES.oneShot) {
      this.state.exhaustInteraction(this.dialogue.interaction.id);
    }
    this.dialogue = undefined;
    this.closeModal();
  }

  private emitNodeCompletion(node: DialogueNode): void {
    if (node.onCompleteEvent) gameEvents.emit(node.onCompleteEvent);
  }

  private enterDialogueNode(nodeId: string): void {
    this.dialogueNodeId = nodeId;
    this.dialogueLine = 0;
    this.dialogueChoice = 0;
    const event = this.currentDialogueNode()?.onEnterEvent;
    // Build the caption and portrait first; the authored sound begins against
    // the exact node the player can now see rather than the line after it.
    this.renderDialogue();
    if (event && this.dialogueNodeId === nodeId) gameEvents.emit(event);
  }

  private availableChoices(node: DialogueNode): readonly DialogueChoice[] {
    if (!this.dialogue) return [];
    return unseenDialogueChoices(
      this.dialogue,
      node,
      this.state.interactionProgress(this.dialogue.interaction.id),
      this.state.snapshot.flags,
    );
  }

  private renderDialogue(): void {
    this.modal?.destroy(true);
    const node = this.currentDialogueNode();
    if (!node) return this.finishDialogue();

    const portraitSide = node.portraitSide ?? 'left';
    const layout = dialogueLayout(portraitSide);
    const portraitKey = node.portraitKey ?? this.dialogue?.portraitKey;
    const frame = createDialogueFrame(this, portraitSide, node.speaker, portraitKey);
    const line = addBodyText(this, layout.textX, layout.textY, node.lines[this.dialogueLine] ?? '', 0x55434b)
      .setMaxWidth(layout.textWidth);
    const availableChoices = this.availableChoices(node);
    const choosing=availableChoices.length>0&&this.dialogueLine>=node.lines.length-1;
    const hint = choosing
      ? addControlLegend(this, [[['movement','CHOOSE'],['confirm','CONFIRM']]], layout.textX, 334, layout.textWidth, M.pencil)
      : addControlHint(this, 'interact', '>', GAME_WIDTH - 24, 334, M.pencil, 'right');
    this.modal = this.add.container(0, 0, [frame, line, hint]).setDepth(10000);

    if (availableChoices.length > 0 && this.dialogueLine >= node.lines.length - 1) {
      this.modal.add(createDialogueChoices(this, availableChoices, layout.textX, layout.choiceWidth,
        this.dialogueChoice, index => { this.dialogueChoice = index; }, index => this.choose(index)));
    }
  }

  private openScrapbook(): void {
    if (!this.collectionPreview) this.state.markTutorialSystemOpened('scrapbook');
    const memories=this.collectionPreview?.memories??Object.values(MEMORIES).filter(memory=>memory.kind==='CORE');
    const progress=this.collectionPreview?.progress??this.state.snapshot.memories;
    this.scrapbookSelection.setPages(memories);
    if(!this.collectionPreview){
      const restoredCount=restoredMemoryCount(progress);
      this.scrapbookAwakening=shouldPlayMovedReaction(restoredCount,this.state.snapshot.flags);
      const fallback=[...memories].reverse().find(memory=>progress[memory.id]?.restored
        &&memory.id!==this.scrapbookSelection.selected?.id)?.id;
      const flags=this.state.flag(SCRAPBOOK_LIVING_FLAGS.latestRestored)?this.state.snapshot.flags:{
        ...this.state.snapshot.flags,[SCRAPBOOK_LIVING_FLAGS.latestRestored]:fallback??'',
      };
      this.scrapbookAutoTurnTarget=autoTurnTarget(restoredCount,flags,this.scrapbookSelection.selected?.id);
    }
    this.replaceModal('scrapbook');
    this.renderCollection(true);
    this.collectionFeedback('open');
    if(this.scrapbookAutoTurnTarget){
      const target=this.scrapbookAutoTurnTarget;
      this.scrapbookAutoTurnTarget=undefined;
      this.scrapbookAutoTurnTimer=this.time.delayedCall(520,()=>{
        if(this.mode!=='scrapbook'||!this.scrapbookSelection.selectPage(target))return;
        this.collectionFeedback('page-turn');
        this.renderCollection(true);
        this.state.setFlag(SCRAPBOOK_LIVING_FLAGS.autoTurnSeen,'true');
      });
    }
  }

  private openPhoto(id: PersonalPhotoId): void {
    if (this.mode !== 'none' || !Object.hasOwn(PERSONAL_PHOTOS, id)) return;
    this.replaceModal('photo'); this.photoId = id; this.photoIndex=0; this.dialogueOpenedAt = this.time.now;
    this.renderPhoto();
    this.setWorldBlocking(true);
  }

  private renderPhoto():void {
    if(!this.photoId)return;
    this.modal?.destroy(true);
    this.modal=createPhotoView(this,this.photoId,this.photoIndex,{close:()=>this.closeModal(),previous:()=>this.shiftPhoto(-1),next:()=>this.shiftPhoto(1)}).setDepth(10000);
  }

  private shiftPhoto(step:-1|1):void {
    if(!this.photoId)return;
    const definition=PERSONAL_PHOTOS[this.photoId];
    const count='gallery' in definition?definition.gallery.length:1;
    const next=Math.max(0,Math.min(count-1,this.photoIndex+step));
    if(next===this.photoIndex)return;this.photoIndex=next;this.renderPhoto();
  }

  private openCipher(): void {
    if (this.mode !== 'none') return;
    this.replaceModal('cipher'); this.renderCipher(); this.setWorldBlocking(true);
  }

  private openComputer(payload: ComputerOpenPayload): void {
    if (this.mode !== 'none') return;
    this.replaceModal('computer');
    this.computerOpenedAt = this.time.now;
    this.computerView = createComputerTerminalView(this, payload.session, {
      close: () => this.closeModal(),
      complete: () => this.completeComputerSession(payload.session),
    });
    this.modal = this.computerView.root.setDepth(10000);
    this.setWorldBlocking(true);
  }

  private completeComputerSession(session: ComputerTerminalSession): void {
    if (session.kind === 'UPDATE' && session.memoryId) {
      this.state.readComputerMemoryUpdate(session.memoryId);
    }
    if (session.kind === 'CIPHER') {
      this.modal?.destroy(true);
      this.modal = undefined;
      this.computerView = undefined;
      this.mode = 'none';
      this.openCipher();
      return;
    }
    this.closeModal();
  }

  private beginReunion():void {
    this.pendingWorldCue=undefined;this.replaceModal('reunion');this.setWorldBlocking(true);
  }

  private showEnding():void {
    if(this.state.flag('year-one-complete')!=='true')return;
    this.replaceModal('ending');this.setWorldBlocking(true);
    this.memoryRevealSkippableAt=this.time.now+ENDING_SETTLE_MS;
    this.modal=createFinaleView(this,this.state.snapshot.settings.reducedCameraMotion);
  }

  private showMemoryReveal(memoryId:string):void {
    if(this.mode!=='none'){this.pendingMemoryReveal=memoryId;return;}
    const memory=MEMORIES[memoryId];if(!memory)return;
    this.replaceModal('memory-reveal');this.dialogueOpenedAt=this.time.now;this.setWorldBlocking(true);
    const seen=this.state.flag(`memory-reveal-seen:${memoryId}`)==='true';
    const token=++this.memoryRevealToken;
    this.memoryRevealSkippableAt=this.time.now+(seen?260:3400);
    const dim=this.add.rectangle(320,180,640,360,0x17131f,.94).setInteractive();
    const glow=this.add.rectangle(320,180,574,252,0xd6a56c,.13).setStrokeStyle(2,0xf1d49a,.65);
    const shadow=this.add.rectangle(324,185,484,206,0x251c28,.55);
    const pieceSpecs=[
      {x:200,y:130,startX:54,startY:48,color:0xead9ba},
      {x:440,y:130,startX:586,startY:54,color:0xf0dfc0},
      {x:200,y:231,startX:66,startY:318,color:0xe4cfac},
      {x:440,y:231,startX:578,startY:312,color:0xead7b5},
    ];
    const pieces=pieceSpecs.map((spec,index)=>this.add.rectangle(
      seen?spec.x:spec.startX,seen?spec.y:spec.startY,238,99,spec.color,
    ).setStrokeStyle(1,index%2?0xc39b70:0xb88966).setAlpha(seen?1:.12));
    const seam=this.add.graphics().setAlpha(seen?1:0);
    seam.lineStyle(1,0xb88966,.6).lineBetween(320,82,320,279).lineBetween(82,180,558,180);
    for(let i=0;i<12;i++)seam.fillStyle(i%2?0xf4e6c9:0xdabf91,.8).fillRect(91+i*40,91+(i%3)*3,26,2);
    const heading=addHeadingText(this,320,104,'MEMORY RESTORED',0x7c3f4d).setOrigin(.5).setAlpha(seen?1:0);
    const title=addBodyText(this,320,137,memory.title,0x322735).setOrigin(.5).setMaxWidth(408).setAlpha(seen?1:0);
    const date=addSmallText(this,320,156,memory.date??'A PAGE REMEMBERED',0x936454).setOrigin(.5).setAlpha(seen?1:0);
    const illustration=this.add.graphics().setAlpha(seen?1:0);
    if(memory.theme==='first-date'){
      illustration.fillStyle(0xb95c68,1).fillCircle(143,204,12).fillCircle(161,204,12).fillTriangle(132,207,172,207,152,231);
      illustration.fillStyle(0xf0dfc0,1).fillRect(149,202,6,19);
    }else if(memory.theme==='performance'){
      illustration.fillStyle(0x72504a,1).fillRect(135,194,5,34).fillRect(151,185,5,43).fillRect(167,200,5,28);
      illustration.fillStyle(0xc87862,1).fillCircle(137,230,7).fillCircle(153,230,7).fillCircle(169,230,7);
    }else if(memory.theme==='snow'){
      illustration.fillStyle(0xf4eee2,1).fillCircle(152,196,13).fillCircle(152,222,18);
      illustration.fillStyle(0x322735,1).fillRect(147,191,3,3).fillRect(156,191,3,3);
      illustration.fillStyle(0xb95c68,1).fillRect(135,205,34,5);
    }else if(memoryId==='everyday-us'){
      illustration.fillStyle(0x72504a).fillRect(125,205,60,29);
      illustration.fillStyle(0xb95c68).fillRect(127,200,56,12).fillRect(127,217,56,9);
      illustration.fillStyle(0xf4eee2).fillRect(157,207,16,10);
      for(const x of [131,144])illustration.fillStyle(0xe9d7b5).fillRect(x,189,9,10);
      illustration.fillStyle(0xd6a56c).fillEllipse(170,193,19,7);
    }else if(memoryId===FINAL_MEMORY){
      // The two torn keepsake halves share a blanket only after restoration.
      illustration.fillStyle(0xd5b88e).fillRect(127,190,53,42);
      illustration.fillStyle(0xf4eee2).fillRect(129,192,49,38);
      illustration.fillStyle(0xb95c68).fillRect(134,192,2,38).fillRect(171,192,2,38);
      for(const x of [142,161]){
        illustration.fillStyle(0x72504a).fillRect(x,207,8,10);
        illustration.fillStyle(0xe9d7b5).fillRect(x+8,209,3,5);
      }
    }else{
      illustration.fillStyle(0x72504a).fillRect(129,188,46,47);
      illustration.fillStyle(0xf4eee2).fillRect(132,191,18,40).fillRect(154,191,18,40);
      illustration.fillStyle(0xb95c68).fillRect(158,197,9,2).fillRect(137,218,9,2);
    }
    const copy=addBodyText(this,196,183,memory.restoredText??'The pieces finally know where they belong.',0x72504a)
      .setMaxWidth(340).setAlpha(seen?1:0);
    let revealReady=seen;
    const hint=addSmallText(this,320,266,'',0x7c3f4d).setOrigin(.5).setAlpha(seen?1:0);
    const refreshHint=():void=>{hint.setText(revealReady?`${getControlHint('back')}  CLOSE · A restored page is waiting in your Scrapbook.`:'THE PAGE IS REMEMBERING…');};
    this.modal=this.add.container(0,0,[dim,glow,shadow,...pieces,seam,heading,title,date,illustration,copy,hint]).setDepth(10000);
    this.modal.setData('refreshInputPresentation',refreshHint);refreshHint();
    if(seen)return;
    this.tweens.add({targets:glow,alpha:{from:.04,to:.2},duration:3200,yoyo:true,repeat:-1,ease:'Stepped',easeParams:[5]});
    pieces.forEach((piece,index)=>this.tweens.add({
      targets:piece,x:pieceSpecs[index]!.x,y:pieceSpecs[index]!.y,alpha:1,
      delay:180+index*520,duration:620,ease:'Cubic.out',
    }));
    this.tweens.add({targets:seam,alpha:1,delay:2260,duration:280,ease:'Stepped',easeParams:[4]});
    this.tweens.add({targets:heading,alpha:1,y:{from:109,to:104},delay:2380,duration:300,ease:'Stepped',easeParams:[5]});
    this.tweens.add({targets:[title,date,illustration],alpha:1,delay:2700,duration:320,ease:'Stepped',easeParams:[5]});
    this.tweens.add({targets:copy,alpha:1,delay:2960,duration:300,ease:'Stepped',easeParams:[5]});
    this.time.delayedCall(3260,()=>{
      if(token!==this.memoryRevealToken||this.mode!=='memory-reveal')return;
      revealReady=true;refreshHint();hint.setAlpha(1);
      this.state.setFlag(`memory-reveal-seen:${memoryId}`,'true');
    });
  }

  private showWorldCue(payload:NotificationPayload):void {
    if(this.mode!=='none'){this.pendingWorldCue=payload;return;}
    this.showNotification(payload);
  }

  private shiftCipher(step: number): void {
    this.cipherShift = (this.cipherShift + step + 26) % 26; this.renderCipher();
  }

  private submitCipher(): void {
    if (this.cipherShift === 3) this.state.completeEncounter('bedroom-cipher-solved');
    else this.cipherHint = Math.min(CIPHER_HINTS.length - 1, this.cipherHint+1);
    this.renderCipher();
  }

  private renderCipher(): void {
    this.modal?.destroy(true);
    this.modal = createCipherView(this, this.cipherShift, this.cipherHint, this.state.snapshot.encounters.includes('bedroom-cipher-solved'), {
      shift: step => this.shiftCipher(step), submit: () => this.submitCipher(), close: () => this.closeModal(),
      hint: () => { this.cipherHint = Math.min(CIPHER_HINTS.length - 1, this.cipherHint+1); this.renderCipher(); },
    }).setDepth(10000);
  }

  private openInventory(): void {
    if (!this.collectionPreview) this.state.markTutorialSystemOpened('bag');
    this.replaceModal('inventory');
    this.renderCollection(true);
    this.collectionFeedback('open');
  }

  private renderCollection(settle = false): void {
    this.modal?.destroy(true);
    const dimmer = this.add.rectangle(CENTER_X, CENTER_Y, GAME_WIDTH, GAME_HEIGHT, PALETTE.shadowDeep, 0.84)
      .setInteractive();
    this.modal = this.add.container(0, 0, [dimmer]).setDepth(10000);
    let content: Phaser.GameObjects.Container;
    if (this.mode === 'inventory') {
      this.bagSelection.setItems(this.collectionPreview?.items ?? inventoryEntries(this.state.snapshot.inventory.filter(id => id !== TEST_ITEM_ID), ITEMS));
      content = createBagView(this, this.bagSelection, {
        close: () => this.closeModal(),
        select: (index) => {
          if (!this.bagSelection.select(index)) return;
          this.collectionFeedback('item-select');
          this.renderCollection();
        },
        scroll: (rows) => this.changeBagRow(rows),
      });
    } else {
      this.scrapbookSelection.setPages(this.collectionPreview?.memories ?? Object.values(MEMORIES).filter(m => m.kind === 'CORE'));
      content = createScrapbookView(this, this.scrapbookSelection,
        this.collectionPreview?.progress ?? this.state.snapshot.memories, {
          close: () => this.closeModal(),
          turn: (direction) => this.turnPage(direction),
          selectFragment:(index)=>{
            const progress=(this.collectionPreview?.progress??this.state.snapshot.memories)[this.scrapbookSelection.selected?.id??''];
            if(this.scrapbookSelection.selectFragment(index,progress)){
              this.collectionFeedback('select');this.renderCollection();
            }
          },
        },{
          awakening:this.scrapbookAwakening,
          reducedMotion:this.state.snapshot.settings.reducedCameraMotion,
          onAwakeningPresented:()=>this.state.setFlag(SCRAPBOOK_LIVING_FLAGS.movedReactionSeen,'true'),
        });
      this.scrapbookAwakening=false;
    }
    this.modal.add(content);
    refreshControlHints(this.modal);
    if (settle) settlePaper(this, content, this.state.snapshot.settings.reducedCameraMotion);
    this.setWorldBlocking(true);
  }

  private changeBagRow(rows: number): void {
    if (!this.bagSelection.scroll(rows)) return;
    this.collectionFeedback('select');
    this.renderCollection();
  }

  private scrollBag(_pointer: Phaser.Input.Pointer, _objects: Phaser.GameObjects.GameObject[],
    _dx: number, dy: number): void {
    if (this.mode === 'inventory' && dy !== 0) this.changeBagRow(Math.sign(dy));
  }

  private turnPage(direction: -1 | 1): void {
    if (!this.scrapbookSelection.turn(direction)) return;
    this.collectionFeedback('page-turn');
    this.renderCollection(true);
  }

  private collectionFeedback(action: UiFeedback): void {
    this.game.events.emit(UI_FEEDBACK_EVENT, { action, surface: this.mode });
  }

  private paperMenu(mode: UiMode, title: string, height = 246, selected = 0): void {
    this.replaceModal(mode, true); this.menuRows=[];this.menuSelected=selected;this.menuStick=0;
    this.modal=pausePaper(this,title,memoryKeepsakes(this.state.snapshot),height);
    this.setWorldBlocking(true);
    if(!this.state.snapshot.settings.reducedCameraMotion) {
      this.modal.setAlpha(.3);
      this.tweens.add({targets:this.modal,alpha:1,duration:160});
    }
  }

  private paperRow(y: number, label: string, action: () => void, danger = false, adjust?: (step:number)=>void): void {
    const index=this.menuRows.length;
    const bg=this.add.rectangle(320,y,216,23,M.paperLight,.25).setInteractive({useHandCursor:true});
    const text=addSmallText(this,320,y,label,danger?M.accent:M.ink).setOrigin(.5);
    text.setFontSize(this.cache.bitmapFont.get(text.font).data.size);
    bg.on('pointerover',()=>{this.menuSelected=index;this.paintMenuSelection();});
    bg.on('pointerdown',()=>{this.menuSelected=index;action();});
    this.modal?.add([bg,text]);this.menuRows.push({action,adjust,background:bg});
    if(adjust) for(const [x,step,symbol] of [[225,-1,'-'],[415,1,'+']] as const) {
      const hit=this.add.zone(x,y,22,23).setInteractive({useHandCursor:true});
      hit.on('pointerdown',()=>{this.menuSelected=index;adjust(step);});
      this.modal?.add([addSmallText(this,x,y,symbol,M.ink).setOrigin(.5),hit]);
    }
    this.paintMenuSelection();
  }

  private paintMenuSelection(): void {
    this.menuRows.forEach((row,i)=>row.background.setFillStyle(i===this.menuSelected?M.paperEdge:M.paperLight,i===this.menuSelected?.85:.25)
      .setStrokeStyle(1,M.pencil,i===this.menuSelected?.65:0));
  }

  private openPause(selected = 0): void {
    const unlocked=togetherUnlocked(this.state.snapshot),offset=unlocked?20:0;
    this.paperMenu('pause','PAUSED',unlocked?276:246,selected);
    this.paperRow(126-offset,'RESUME',()=>this.closeModal());
    this.paperRow(155-offset,'SETTINGS',()=>this.openSettings());
    this.paperRow(184-offset,'RETURN TO TITLE',()=>this.returnToTitle());
    if(unlocked)this.paperRow(193,`EXPLORE TOGETHER: ${togetherEnabled(this.state.snapshot)?'ON':'OFF'}`,()=>{
      this.state.setFlag(TOGETHER_PREFERENCE,togetherEnabled(this.state.snapshot)?'off':'on');this.openPause(3);
    });
    this.modal?.add(this.add.rectangle(320,210,158,1,M.pencil,.35));
    this.paperRow(232,'START OVER...',()=>this.openResetConfirmation(),true);
    this.renderPauseHelp();
  }

  private renderPauseHelp():void {
    this.pauseHelp?.destroy(true);
    this.pauseHelp=addControlLegend(this,[
      [['movement','MOVE'],['interact','INTERACT'],['sprint','SPRINT']],
      currentInputPresentation()==='keyboard-mouse'
        ? [['scrapbook','BOOK'],['bag','BAG'],['back','PAUSE / BACK']]
        : [['scrapbook','BOOK'],['bag','BAG'],['pause','PAUSE'],['back','BACK']],
    ],199,257,242,M.ink);
    this.modal?.add(this.pauseHelp);refreshControlHints(this.pauseHelp);
  }

  private openSettings(selected = 0): void {
    this.paperMenu('settings','A LITTLE BALANCE',302,selected);
    AUDIO_CONTROLS.forEach(({label,setting},index)=>{
      const change=(step:number):void=>{this.state.setVolume(setting,Math.round((this.state.snapshot.settings[setting]+step*.1)*100)/100);this.openSettings(index);};
      this.paperRow(91+index*22,`${label}  ${Math.round(this.state.snapshot.settings[setting]*100)}%`,()=>change(1),false,change);
    });
    this.paperRow(231,fullscreen.label,()=>{void fullscreen.toggle();});
    this.paperRow(261,'BACK',()=>this.openPause(1));
    if(fullscreen.message)this.modal?.add(addSmallText(this,320,282,fullscreen.message,M.pencil).setOrigin(.5));
    this.modal?.add(addControlHint(this,'back','BACK',320,311,M.pencil,'center'));
  }

  private openResetConfirmation(): void {
    this.paperMenu('reset-confirm','START OVER?',202);
    this.modal?.add(addSmallText(this,320,142,'YOUR CURRENT JOURNEY WILL BE REPLACED.\nTHIS CANNOT BE UNDONE.',M.ink).setOrigin(.5).setCenterAlign());
    this.paperRow(190,'CANCEL',()=>this.openPause(3));
    this.paperRow(224,'START OVER',()=>{this.state.reset();this.returnToTitle();},true);
  }

  private returnToTitle(): void {
    this.closeModal();
    this.scene.stop(SCENE_KEYS.park);
    this.scene.start(SCENE_KEYS.title);
  }

  private replaceModal(mode: UiMode, parkAlreadyPaused = false): void {
    this.modal?.destroy(true);
    this.pauseHelp=undefined;
    this.toast?.destroy(true);
    this.toast = undefined;
    this.mode = mode;
    this.controlDock?.setVisible(false);
    this.controlTutorial?.destroy(true);
    this.controlTutorial = undefined;
    if (parkAlreadyPaused && !this.scene.isPaused(SCENE_KEYS.park)) this.scene.pause(SCENE_KEYS.park);
  }

  private closeModal(): void {
    const closedPhoto = this.photoId;
    this.photoId = undefined;
    this.scrapbookAutoTurnTimer?.remove(false);
    this.scrapbookAutoTurnTimer=undefined;
    if (this.mode === 'inventory' || this.mode === 'scrapbook') this.collectionFeedback('close');
    const closingMemoryReveal=this.mode==='memory-reveal';
    const wasPaused = ['pause', 'settings', 'reset-confirm'].includes(this.mode);
    this.modal?.destroy(true);
    this.modal = undefined;
    this.pauseHelp=undefined;
    this.mode = 'none';
    this.computerView=undefined;
    if(closingMemoryReveal)this.memoryRevealToken+=1;
    this.dialogue = undefined;
    if (wasPaused && this.scene.isPaused(SCENE_KEYS.park)) this.scene.resume(SCENE_KEYS.park);
    this.setWorldBlocking(false);
    this.controlDock?.setVisible(true).setAlpha(this.dockLearned() ? 0.9 : 1);
    if (closedPhoto) gameEvents.emit(PHOTO_CLOSED, closedPhoto);
    if(this.pendingMemoryReveal){const pending=this.pendingMemoryReveal;this.pendingMemoryReveal=undefined;this.time.delayedCall(80,()=>this.showMemoryReveal(pending));}
    else if(this.pendingWorldCue){const pending=this.pendingWorldCue;this.pendingWorldCue=undefined;this.time.delayedCall(120,()=>this.showNotification(pending));}
  }

  private dockLearned(): boolean {
    const tutorial = this.state.snapshot.tutorials;
    return tutorial.scrapbookOpened && tutorial.bagOpened;
  }

  private createControlDock(): void {
    this.controlDock = createCompactDock(this, {
      scrapbook: () => { if (this.mode === 'none') this.openScrapbook(); },
      bag: () => { if (this.mode === 'none') this.openInventory(); },
    }, () => this.state.snapshot).setDepth(9000).setAlpha(this.dockLearned() ? 0.9 : 1);
  }

  private pulseScrapbookDock(surface: 'book' | 'bag'): void {
    if(this.state.snapshot.settings.reducedCameraMotion)return;
    if(this.mode!=='none'||!this.controlDock||this.time.now<this.resonancePulseUntil)return;
    this.resonancePulseUntil=this.time.now+4800;
    const dock=this.controlDock;
    const baseY=dock.y;
    dock.setY(baseY-1);
    const warmPixel=this.add.rectangle(surface==='book'?563:616,332,3,3,0xffd39a).setDepth(9002).setAlpha(.95);
    const settle=this.time.delayedCall(110,()=>{if(dock.scene)dock.setY(baseY);});
    const fade=this.tweens.add({targets:warmPixel,alpha:0,y:'-=2',duration:520,ease:'Stepped',easeParams:[4],
      onComplete:()=>warmPixel.destroy()});
    warmPixel.once('destroy',()=>{settle.remove(false);fade.stop();if(dock.scene)dock.setY(baseY);});
  }

  private maybeShowControlTutorial(force = false): void {
    if (this.collectionPreview) return;
    const alreadyShown = this.state.snapshot.tutorials.controlDockSeen;
    if (!shouldShowControlTutorial(force ? false : alreadyShown, this.mode === 'none')) return;
    this.state.markControlDockSeen();
    const shadow = this.add.rectangle(499, 307, 250, 40, PALETTE.shadowDeep, 0.48);
    const backing = this.add.rectangle(496, 304, 250, 40, PALETTE.creamLight, 1)
      .setStrokeStyle(2, PALETTE.leafRedDeep);
    const copy = addBodyText(this, 381, 292, CONTROL_TUTORIAL_COPY, PALETTE.ink).setMaxWidth(230);
    const pointer = this.add.triangle(496, 327, 0, 0, 12, 0, 6, 7, PALETTE.creamLight, 1)
      .setStrokeStyle(1, PALETTE.leafRedDeep);
    this.controlTutorial = this.add.container(0, -8, [shadow, backing, copy, pointer]).setDepth(9500);
    this.tweens.add({
      targets: this.controlTutorial,
      y: 0,
      duration: 180,
      ease: 'Stepped',
      easeParams: [3],
      hold: 3_400,
      yoyo: true,
      onComplete: () => {
        this.controlTutorial?.destroy(true);
        this.controlTutorial = undefined;
      },
    });
  }

  private handleEscape(): void {
    if (this.mode === 'none') return this.openPause();
    if (this.mode === 'settings' || this.mode === 'reset-confirm') return this.openPause();
    if((this.mode==='memory-reveal'||this.mode==='ending')&&this.time.now<this.memoryRevealSkippableAt)return;
    this.closeModal();
  }

  private setWorldBlocking(blocking: boolean): void {
    gameEvents.emit(GAME_EVENTS.uiBlockingChanged, blocking);
  }

  private showNotification(payload: NotificationPayload): void {
    if (this.mode !== 'none') return;
    this.toast?.destroy(true);
    const note=createObservationNote(this,payload,this.state.snapshot.settings.reducedCameraMotion);
    this.toast=note;
    note.once('destroy',()=>{if(this.toast===note)this.toast=undefined;});
  }

  private showPshw(event?: YellowCarEvent): void {
    const x = Phaser.Math.Clamp(Math.round(event?.worldX ?? CENTER_X), 80, GAME_WIDTH - 80);
    const burst = this.add.star(x, 72, 8, 25, 43, PALETTE.creamLight, 1)
      .setStrokeStyle(3, PALETTE.soilDeep)
      .setDepth(12999);
    const text = addPixelText(this, x, 66, 'PSHW!', 18, PALETTE.soilDeep)
      .setOrigin(0.5)
      .setDepth(13000);
    this.tweens.add({
      targets: [burst, text],
      y: '-=14',
      alpha: 0,
      duration: 410,
      ease: 'Stepped',
      easeParams: [5],
      onComplete: () => {
        burst.destroy();
        text.destroy();
      },
    });
  }
}
