// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import MetroHero from '../components/ui/scroll-locked-video-hero';
let reduced = false;
beforeEach(()=>{
  vi.useFakeTimers();
  Object.defineProperty(window,'matchMedia',{writable:true,value:vi.fn(()=>({matches:reduced,addEventListener:vi.fn(),removeEventListener:vi.fn()}))});
  Object.defineProperty(window,'scrollTo',{writable:true,value:vi.fn()});
  vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
  document.body.style.cssText='color: red;';
});
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();reduced=false;document.body.style.cssText='';});
function load(container:HTMLElement) {
  const video=container.querySelector('video')!;
  Object.defineProperty(video,'duration',{value:10,configurable:true});fireEvent.loadedData(video);return video;
}
describe('hero navigation safety',()=>{
  it('releases at the end so visitors can reach the portfolio',()=>{
    const {container}=render(<MetroHero scrubDistance={300}/>);load(container);
    expect(document.body.style.position).toBe('fixed');
    fireEvent.wheel(window,{deltaY:400});fireEvent.wheel(window,{deltaY:100});
    expect(document.body.style.position).toBe('');expect(document.body.style.color).toBe('red');expect(window.scrollTo).toHaveBeenCalled();
  });
  it('allows skipping before media has loaded',()=>{
    render(<MetroHero/>);fireEvent.click(screen.getByRole('button',{name:/Explore my work/}));
    expect(document.body.style.position).toBe('');expect(window.scrollTo).toHaveBeenCalled();
  });
  it('releases on navigation and Escape',()=>{
    const {container}=render(<MetroHero/>);load(container);
    fireEvent.keyDown(window,{key:'Escape'});expect(document.body.style.position).toBe('');
    expect(window.scrollTo).toHaveBeenCalled();
  });
  it('does not lock for reduced motion',()=>{
    reduced=true;const {container}=render(<MetroHero/>);load(container);expect(document.body.style.position).toBe('');
  });
  it('releases on a media error and restores existing body styles on unmount',()=>{
    const {container,unmount}=render(<MetroHero/>);const video=load(container);
    fireEvent.error(video);expect(document.body.style.position).toBe('');expect(document.body.style.color).toBe('red');
    unmount();expect(document.body.style.color).toBe('red');
  });
  it('provides a fallback when loading times out',()=>{
    const {container}=render(<MetroHero/>);vi.advanceTimersByTime(8001);
    expect(document.body.style.position).toBe('');expect(screen.getByRole('button',{name:/Explore my work/})).toBeTruthy();
    expect(container.querySelector('.hero-backdrop')).toBeTruthy();
  });
  it('navigation releases the body without overwriting pre-existing styles',()=>{
    const {container,unmount}=render(<MetroHero/>);load(container);fireEvent(window,new Event('portfolio:navigate'));
    expect(document.body.style.position).toBe('');unmount();expect(document.body.style.color).toBe('red');
  });
  it('does not re-lock on programmatic scrolling after navigation',()=>{
    const {container}=render(<MetroHero/>);load(container);fireEvent(window,new Event('portfolio:navigate'));fireEvent.scroll(window);
    expect(document.body.style.position).toBe('');
  });
  it('resets the introduction when returning home',()=>{
    const {container}=render(<MetroHero/>);load(container);fireEvent.click(screen.getByRole('button',{name:/Explore my work/}));
    fireEvent(window,new CustomEvent('portfolio:navigate',{detail:{id:'home'}}));
    expect((container.querySelector('.hero-title') as HTMLElement).style.opacity).toBe('1');
  });
});
