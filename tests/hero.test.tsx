// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import MetroHero from '../components/ui/scroll-locked-video-hero';
let reduced=false;
let notify: (entries: Partial<IntersectionObserverEntry>[])=>void;
beforeEach(()=>{
  Object.defineProperty(window,'matchMedia',{writable:true,value:vi.fn(()=>({matches:reduced,addEventListener:vi.fn(),removeEventListener:vi.fn()}))});
  vi.stubGlobal('IntersectionObserver',class {constructor(cb:typeof notify){notify=cb;}observe(){}disconnect(){}});
  vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
  document.body.style.cssText='color: red;';
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();reduced=false;document.body.style.cssText='';});
function load(container:HTMLElement){const video=container.querySelector('video')!;Object.defineProperty(video,'duration',{value:8,configurable:true});fireEvent.loadedData(video);return video;}
describe('native hero playback',()=>{
  it('plays while visible and pauses offscreen',()=>{
    render(<MetroHero/>);notify([{isIntersecting:true}]);expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    notify([{isIntersecting:false}]);expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });
  it('never locks the page or seeks in response to scroll input',()=>{
    const {container,unmount}=render(<MetroHero/>);const video=load(container);notify([{isIntersecting:true}]);
    video.currentTime=2;fireEvent.wheel(window,{deltaY:800});fireEvent.keyDown(window,{key:'ArrowDown'});fireEvent.touchMove(container.querySelector('section')!,{touches:[{clientY:50}]});
    expect(video.currentTime).toBe(2);expect(document.body.style.position).toBe('');unmount();expect(document.body.style.color).toBe('red');
  });
  it('leaves the poster still for reduced motion',()=>{
    reduced=true;render(<MetroHero/>);notify([{isIntersecting:true}]);expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });
  it('keeps navigation usable before loading or after a media error',()=>{
    const scroll=vi.fn();const work=document.createElement('section');work.id='work';work.scrollIntoView=scroll;document.body.append(work);
    const {container}=render(<MetroHero/>);fireEvent.error(container.querySelector('video')!);fireEvent.click(screen.getByRole('button',{name:/Explore my work/}));
    expect(scroll).toHaveBeenCalledWith({behavior:'smooth'});expect(document.body.style.position).toBe('');work.remove();
  });
  it('keeps a manually paused introduction paused after re-entry',()=>{
    const {container}=render(<MetroHero/>);load(container);notify([{isIntersecting:true}]);fireEvent.play(container.querySelector('video')!);
    fireEvent.click(screen.getByRole('button',{name:'Pause introduction'}));vi.mocked(HTMLMediaElement.prototype.play).mockClear();notify([{isIntersecting:false}]);notify([{isIntersecting:true}]);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });
  it('replays only when requested after the sequence ends',()=>{
    const {container}=render(<MetroHero/>);const video=load(container);notify([{isIntersecting:true}]);video.currentTime=8;fireEvent.ended(video);
    fireEvent.click(screen.getByRole('button',{name:'Replay introduction'}));expect(video.currentTime).toBe(0);
  });
});
