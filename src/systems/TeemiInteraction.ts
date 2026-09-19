/** Scene-local, harmless pet loop. Nothing here is saved as mood or punishment. */
export class TeemiInteraction {
  stage: 'ready' | 'warning' | 'chomp' | 'resetting' = 'ready';
  perch = 0;
  private until = 0;
  private pets = 0;
  private cycle = 0;
  private safePets = 2;
  pet(now: number): 'pet' | 'chomp' | undefined {
    this.update(now);
    if (this.stage === 'ready') { this.pets++; if (this.pets >= this.safePets) this.stage = 'warning'; return 'pet'; }
    if (this.stage === 'warning') { this.stage = 'chomp'; this.until = now + 220; return 'chomp'; }
  }
  update(now: number): void {
    if (this.stage === 'chomp' && now >= this.until) {
      this.stage = 'resetting'; this.perch = 1 - this.perch; this.until = now + 1500;
    } else if (this.stage === 'resetting' && now >= this.until) {
      this.stage = 'ready'; this.pets = 0; this.cycle++; this.safePets = 2 + this.cycle % 2;
    }
  }
  get available(): boolean { return this.stage === 'ready' || this.stage === 'warning'; }
  get prompt(): string { return this.stage === 'warning' ? 'Pet again' : 'Pet'; }
}
