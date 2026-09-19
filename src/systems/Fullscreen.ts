/** One browser-owned fullscreen state shared by both Settings surfaces. */
export class FullscreenControl {
  private installed = false;
  private pending = false;
  private readonly listeners = new Set<() => void>();
  message = '';
  get active(): boolean { return !!document.fullscreenElement; }
  get supported(): boolean { return !!document.fullscreenEnabled && !!document.querySelector<HTMLElement>('#game-shell')?.requestFullscreen; }
  get label(): string { return this.supported ? `FULLSCREEN: ${this.active ? 'ON' : 'OFF'}` : 'FULLSCREEN: UNAVAILABLE'; }
  subscribe(listener: () => void): () => void { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
  private changed = (): void => {
    try { localStorage.setItem('sheepy-world.fullscreen-preference', String(this.active)); } catch { /* Storage is optional. */ }
    this.listeners.forEach(listener => listener());
  };
  install(): void {
    if (this.installed) return;
    this.installed = true;
    document.addEventListener('fullscreenchange', this.changed);
    window.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (!this.active) return;
      // The browser owns raw Escape in fullscreen. Keep that physical press out
      // of Phaser; Q and controller inputs remain the reliable game controls.
      event.stopImmediatePropagation();
    }, true);
  }
  async toggle(): Promise<void> {
    if (!this.supported || this.pending) return;
    this.pending = true; this.message = '';
    try {
      if (this.active) await document.exitFullscreen();
      else await document.querySelector<HTMLElement>('#game-shell')!.requestFullscreen();
    } catch { this.message = 'USE A CLICK OR KEY TO CHANGE DISPLAY'; }
    finally { this.pending = false; this.listeners.forEach(listener => listener()); }
  }
}
export const fullscreen = new FullscreenControl();
