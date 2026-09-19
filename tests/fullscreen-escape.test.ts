import { describe, expect, it, vi } from 'vitest';
import { FullscreenControl } from '../src/systems/Fullscreen';

describe('7C.2 fullscreen Escape ownership',()=>{
  it('never toggles fullscreen from Escape and suppresses only the browser-owned press',async()=>{
    let keydown:(event:{key:string;stopImmediatePropagation:()=>void})=>void=()=>{};
    let changed=()=>{};
    const shell={requestFullscreen:vi.fn()};
    const documentStub={fullscreenElement:{} as object|null,fullscreenEnabled:true,
      querySelector:vi.fn(()=>shell),exitFullscreen:vi.fn().mockResolvedValue(undefined),
      addEventListener:vi.fn((name:string,listener:()=>void)=>{if(name==='fullscreenchange')changed=listener;})};
    const windowStub={addEventListener:vi.fn((name:string,listener:typeof keydown)=>{if(name==='keydown')keydown=listener;})};
    vi.stubGlobal('document',documentStub);vi.stubGlobal('window',windowStub);
    vi.stubGlobal('navigator',{});vi.stubGlobal('localStorage',{setItem:vi.fn()});
    const control=new FullscreenControl();control.install();
    const firstStop=vi.fn();keydown({key:'Escape',stopImmediatePropagation:firstStop});
    expect(firstStop).toHaveBeenCalledOnce();expect(documentStub.exitFullscreen).not.toHaveBeenCalled();
    expect(shell.requestFullscreen).not.toHaveBeenCalled();

    documentStub.fullscreenElement=null;changed();
    const nextStop=vi.fn();keydown({key:'Escape',stopImmediatePropagation:nextStop});
    expect(nextStop).not.toHaveBeenCalled();
  });

  it('still permits explicit Settings toggles and reports their actual state',async()=>{
    let changed=()=>{};
    const documentStub={fullscreenElement:null as object|null,fullscreenEnabled:true,
      querySelector:()=>({requestFullscreen:vi.fn(async()=>{documentStub.fullscreenElement={};changed();})}),
      exitFullscreen:vi.fn(async()=>{documentStub.fullscreenElement=null;changed();}),
      addEventListener:vi.fn((name:string,listener:()=>void)=>{if(name==='fullscreenchange')changed=listener;})};
    vi.stubGlobal('document',documentStub);vi.stubGlobal('window',{addEventListener:vi.fn()});vi.stubGlobal('navigator',{});
    vi.stubGlobal('localStorage',{setItem:vi.fn()});
    const control=new FullscreenControl();control.install();
    await control.toggle();expect(control.active).toBe(true);expect(control.label).toBe('FULLSCREEN: ON');
    await control.toggle();expect(control.active).toBe(false);expect(control.label).toBe('FULLSCREEN: OFF');
    expect(documentStub.exitFullscreen).toHaveBeenCalledOnce();
  });
});
