"use client"
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

export interface MetroHeroProps {
  videoSrc?: string; title?: string; scrollHint?: string; tagline?: string;
  signature?: { name: string; url: string } | false; scrubDistance?: number;
  className?: string; style?: CSSProperties;
}
const DEFAULT_VIDEO = 'https://cdn.21st.dev/assets/mirror/21/21a77eac28eacbb7e142016eefeaa0b4a766619e51113629a3bc6df6af066c0f.mp4';
const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

/** Adapted from the supplied MetroHero: bounded scroll lock, keyboard escape,
 * error/timeout fallback, reduced motion, style restoration and single touch handling. */
export default function MetroHero({videoSrc = DEFAULT_VIDEO, title = 'JEVIN THAKAR',
  scrollHint = 'SCROLL TO EXPLORE', tagline = 'Design. Code. Conversation.',
  signature = {name:'Jevin Thakar',url:'https://github.com/jevin042'},
  scrubDistance = 1600, className = '', style}: MetroHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});
  const [ready,setReady] = useState(false);
  const [fallback,setFallback] = useState(false);
  useEffect(() => {
    const video = videoRef.current, section = sectionRef.current;
    if (!video || !section) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = media.matches, disposed = false, locked = false, y = 0;
    let target = 0, progress = 0, duration = 0, raf = 0, touchY = 0;
    let seeking = false, pending: number | null = null, savedCss = '';
    let failed = false, hasReleased = false;
    const paint = () => {
      const fade = 1 - clamp(progress / .48);
      if (titleRef.current) {
        titleRef.current.style.opacity = String(fade);
        titleRef.current.style.transform = `translateY(${-24*(1-fade)}px)`;
        titleRef.current.style.filter = `blur(${8*(1-fade)}px)`;
      }
      if (taglineRef.current) taglineRef.current.style.opacity = String(clamp((progress-.6)/.3));
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      video.style.transform = `scale(${1+progress*.04})`;
    };
    const release = (exit = false) => {
      if (locked) { document.body.style.cssText = savedCss; locked = false; window.scrollTo(0,y); }
      if (exit) {
        hasReleased = true;
        window.scrollTo({top:section.offsetTop + section.offsetHeight,behavior:'instant'});
      }
    };
    const engage = () => {
      if (locked || reduced || failed || !duration || disposed) return;
      y = window.scrollY; savedCss = document.body.style.cssText; locked = true;
      Object.assign(document.body.style,{position:'fixed',top:`-${y}px`,left:'0',right:'0',width:'100%',overscrollBehavior:'none'});
    };
    const seek = (time: number) => {
      if (seeking) { pending = time; return; }
      if (Math.abs(video.currentTime-time)<.035) return;
      seeking = true;
      try {video.currentTime = Math.min(time,Math.max(0,duration-.02));} catch {seeking = false;}
    };
    const onSeeked = () => {seeking = false; if(pending!==null) {const time=pending;pending=null;seek(time);}};
    const skip = () => {target=progress=1;paint();release(true);};
    skipRef.current = skip;
    const fail = () => {failed=true;setFallback(true);release();};
    const timeout = window.setTimeout(() => {if(!duration) fail();},8000);
    const onLoaded = () => {
      if(disposed || !Number.isFinite(video.duration)) return;
      window.clearTimeout(timeout); duration=video.duration; setReady(true);
      if(reduced) {target=progress=0; seek(duration*.5);}
      else if(!hasReleased && window.scrollY <= section.offsetTop+2) engage();
    };
    const delta = (amount:number) => {
      if(!locked) return false;
      if(target >= .999 && amount>0) {release(true);return true;}
      target=clamp(target+amount/Math.max(300,scrubDistance));return true;
    };
    const wheel = (event:WheelEvent) => {
      const multiplier = event.deltaMode===1 ? 20 : event.deltaMode===2 ? window.innerHeight : 1;
      // Only real scroll input may re-lock; anchor navigation and locator scrolling
      // must never accidentally pin the page during a programmatic transition.
      if(!locked && hasReleased && !failed && !reduced && window.scrollY<section.offsetTop+section.offsetHeight-10 && (event.deltaY<0 || window.scrollY<=section.offsetTop+2)) {
        target=progress=event.deltaY<0?1:0;window.scrollTo(0,section.offsetTop);engage();
      }
      if(delta(event.deltaY*multiplier)) event.preventDefault();
    };
    const touchStart = (event:TouchEvent) => {touchY=event.touches[0]?.clientY ?? 0;};
    const touchMove = (event:TouchEvent) => {
      const next=event.touches[0]?.clientY ?? touchY, amount=touchY-next;touchY=next;
      if(!locked && hasReleased && !failed && !reduced && amount<0) {
        target=progress=1;window.scrollTo(0,section.offsetTop);engage();
      }
      if(delta(amount)) event.preventDefault();
    };
    const keyboard = (event:KeyboardEvent) => {
      if(!locked || (event.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT|BUTTON|A/.test(event.target.tagName))) return;
      if(event.key==='Escape' || event.key==='End') {event.preventDefault();skip();}
      else if(['ArrowDown','PageDown',' ','ArrowUp','PageUp'].includes(event.key)) {
        event.preventDefault();delta(['ArrowUp','PageUp'].includes(event.key)?-220:220);
      }
    };
    const onMotion = () => {reduced=media.matches;if(reduced){release();target=progress=0;paint();}};
    const onNavigate = () => {hasReleased=true;release();};
    const frame = () => {
      if(locked) {progress+=(target-progress)*.18;paint();if(duration)seek(progress*duration);}
      raf=requestAnimationFrame(frame);
    };
    video.addEventListener('loadeddata',onLoaded);video.addEventListener('error',fail);video.addEventListener('seeked',onSeeked);
    window.addEventListener('wheel',wheel,{passive:false});
    section.addEventListener('touchstart',touchStart,{passive:true});section.addEventListener('touchmove',touchMove,{passive:false});
    window.addEventListener('keydown',keyboard);media.addEventListener('change',onMotion);
    window.addEventListener('portfolio:navigate',onNavigate);
    if(video.readyState>=2) onLoaded();
    if(!reduced) {video.play()?.then(() => {if(!disposed)video.pause();}).catch(() => {});}
    raf=requestAnimationFrame(frame);
    return () => {
      disposed=true;window.clearTimeout(timeout);cancelAnimationFrame(raf);release();video.pause();
      video.removeEventListener('loadeddata',onLoaded);video.removeEventListener('error',fail);video.removeEventListener('seeked',onSeeked);
      window.removeEventListener('wheel',wheel);section.removeEventListener('touchstart',touchStart);section.removeEventListener('touchmove',touchMove);
      window.removeEventListener('keydown',keyboard);media.removeEventListener('change',onMotion);
      window.removeEventListener('portfolio:navigate',onNavigate);
    };
  },[scrubDistance,videoSrc]);
  return <section ref={sectionRef} className={`metro-hero ${className}`} style={style} aria-label="Introduction">
    <div className="hero-backdrop" />
    {!fallback && <video ref={videoRef} src={videoSrc} muted playsInline preload="auto" aria-hidden="true" className={ready?'hero-video is-ready':'hero-video'}/>}
    <div className="hero-shade"/>
    <div className="hero-topline"><span>DESIGNER × DEVELOPER</span><span>AHMEDABAD, INDIA</span></div>
    <div ref={titleRef} className="hero-title"><p>INDEPENDENT THINKING. PRACTICAL BUILDING.</p><h1>{title}</h1><span>Web / UI · Full-stack · Conversational AI</span></div>
    <div ref={taglineRef} className="hero-tagline"><p>FROM IDEA TO INTERACTION</p><h2>{tagline}</h2></div>
    <div className="hero-bottom"><span className="hero-hint"><ArrowDown size={16}/>{scrollHint}</span><button onClick={()=>skipRef.current()} className="skip-intro">Explore my work <ArrowUpRight size={17}/></button></div>
    {signature && <a className="hero-signature" href={signature.url} target="_blank" rel="noreferrer">by {signature.name}</a>}
    <div className="hero-progress"><div ref={barRef}/></div>
  </section>;
}
