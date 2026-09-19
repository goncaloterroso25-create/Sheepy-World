import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
describe('Porto art/content boundary',()=>{
  it('keeps activation, attendance, audio ownership and garden IDs at the existing content seam',()=>{
    const source=readFileSync('src/world/regions/ExpansionContent.ts','utf8');
    expect(source).toContain("state.memoryHasClue('porto-performance','performance-fourth-date')&&state.memoryHasClue('porto-performance','performance-night')");
    expect(source).toContain('attendance>=5200');
    expect(source).toContain("x:762,y:685,inner:110,radius:350,gain:.75,enabled:active");
    for(const id of ['virtudes-bench','virtudes-picnic','virtudes-cof-kiosk'])expect(source).toContain(id);
    for(const file of ['portoStyle','portoUrban','portoGardens','performanceStyle'])
      expect(readFileSync(`src/art/${file}.ts`,'utf8')).not.toMatch(/physics\.|collectFragment\(|restoreMemory\(|setFlag\(/);
  });
});
