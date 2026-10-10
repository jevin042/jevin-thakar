"use client"
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowUpRight, Pause, Play, RotateCcw } from 'lucide-react';

export interface MetroHeroProps {
  videoSrc?: string; title?: string; scrollHint?: string; tagline?: string;
  signature?: { name: string; url: string } | false;
  /** Retained for compatibility; the introduction now uses native playback. */
  scrubDistance?: number; className?: string; style?: CSSProperties;
}
const BASE = import.meta.env.BASE_URL;

/** Native decoding keeps the train sequence smooth without intercepting scrolling. */
export default function MetroHero({videoSrc = `${BASE}media/train-intro.mp4`, title = 'JEVIN THAKAR',
  scrollHint = 'SCROLL TO EXPLORE', tagline = 'Design. Code. Conversation.',
  signature = {name:'Jevin Thakar',url:'https://github.com/jevin042'}, className = '', style}: MetroHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready,setReady] = useState(false);
  const [playing,setPlaying] = useState(false);
  const [ended,setEnded] = useState(false);
  const [failed,setFailed] = useState(false);
  const [progress,setProgress] = useState(0);
  const [reduced,setReduced] = useState(false);
  useEffect(() => {
    const video = videoRef.current, section = sectionRef.current;
    if (!video || !section) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false, userPaused = false, disposed = false;
    const sync = () => {
      if (visible && !motion.matches && !document.hidden && !userPaused && !video.ended) {
        video.play()?.catch(() => {});
      } else video.pause();
    };
    const onMotion = () => {setReduced(motion.matches);sync();};
    const onToggle = (e:Event) => {userPaused = (e as CustomEvent<{pause:boolean}>).detail.pause;sync();};
    const onReplay = () => {userPaused=false;video.currentTime=0;setEnded(false);sync();};
    const onNavigate = (e:Event) => {
      if ((e as CustomEvent<{id?:string}>).detail?.id === 'home' && video.ended) onReplay();
    };
    const observer = new IntersectionObserver(entries => {
      visible=entries[0]?.isIntersecting ?? false;sync();
    },{threshold:.15});
    observer.observe(section);
    const onReady = () => {if(!disposed){setReady(true);sync();}};
    video.addEventListener('loadeddata',onReady);
    section.addEventListener('hero:toggle',onToggle);
    section.addEventListener('hero:replay',onReplay);
    motion.addEventListener('change',onMotion);
    document.addEventListener('visibilitychange',sync);
    window.addEventListener('portfolio:navigate',onNavigate);
    setReduced(motion.matches);
    if(video.readyState>=2) onReady();
    return () => {
      disposed=true;observer.disconnect();video.pause();
      video.removeEventListener('loadeddata',onReady);
      section.removeEventListener('hero:toggle',onToggle);section.removeEventListener('hero:replay',onReplay);
      motion.removeEventListener('change',onMotion);document.removeEventListener('visibilitychange',sync);
      window.removeEventListener('portfolio:navigate',onNavigate);
    };
  },[videoSrc]);
  const explore = () => {
    window.dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{id:'work'}}));
    document.getElementById('work')?.scrollIntoView({behavior:reduced?'instant':'smooth'});
    history.replaceState(null,'','#work');
  };
  return <section ref={sectionRef} className={`metro-hero ${className}`} style={style} aria-label="Introduction">
    <div className="hero-backdrop" style={{backgroundImage:`url(${BASE}media/train-poster.jpg)`}}/>
    <video ref={videoRef} src={videoSrc} poster={`${BASE}media/train-poster.jpg`} muted playsInline preload="metadata" aria-hidden="true"
      className={ready&&!failed?'hero-video is-ready':'hero-video'} onError={()=>setFailed(true)}
      onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>{setEnded(true);setPlaying(false);}}
      onTimeUpdate={e=>{const v=e.currentTarget;if(Number.isFinite(v.duration)&&v.duration>0)setProgress(v.currentTime/v.duration);}}/>
    <div className="hero-shade"/>
    <div className="hero-topline"><span>DESIGNER × DEVELOPER</span><span>AHMEDABAD, INDIA</span></div>
    <div className="hero-title"><p>INDEPENDENT THINKING. PRACTICAL BUILDING.</p><h1>{title}</h1><span>Web / UI · Full-stack · Conversational AI</span></div>
    <div className="hero-bottom"><span className="hero-hint"><ArrowDown size={16}/>{scrollHint}</span><div className="hero-actions">
      {ready&&!failed&&!reduced&&<button className="video-control" aria-label={ended?'Replay introduction':playing?'Pause introduction':'Play introduction'} onClick={()=>sectionRef.current?.dispatchEvent(new CustomEvent(ended?'hero:replay':'hero:toggle',{detail:{pause:playing}}))}>{ended?<RotateCcw size={16}/>:playing?<Pause size={16}/>:<Play size={16}/>}</button>}
      <button onClick={explore} className="skip-intro">Explore my work <ArrowUpRight size={17}/></button></div></div>
    {signature && <a className="hero-signature" href={signature.url} target="_blank" rel="noreferrer">{tagline} / {signature.name}</a>}
    <div className="hero-progress"><div style={{transform:`scaleX(${progress})`}}/></div>
  </section>;
}
