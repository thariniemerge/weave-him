import { useEffect, useRef, useState } from "react";
import { holdMusic, isMuted } from "../../lib/sound";
import { maxDpr, onFrame } from "../../lib/perf";
import "./intro.css";

// Painting, particles and sound ported as-is from weave-him-intro-prototype.html
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const LEAF=['#3E4A37','#4A5641','#56634A','#65734F','#7E8E5E','#9AA38A'];
const DEEP=['#26302A','#2E3A30','#34402F'];
const DPR=maxDpr;
function setup(c,W,H){const d=DPR();c.width=Math.round(W*d);c.height=Math.round(H*d);const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,W,H);return x}

function leaf(x,ctx,px,py,ang,len,wid,col,rib){
  ctx.save();ctx.translate(px,py);ctx.rotate(ang);
  ctx.beginPath();ctx.moveTo(0,0);
  ctx.bezierCurveTo(wid,-len*.25,wid*.9,-len*.75,0,-len);
  ctx.bezierCurveTo(-wid*.9,-len*.75,-wid,-len*.25,0,0);
  ctx.fillStyle=col;ctx.fill();
  if(rib){ctx.strokeStyle='rgba(230,225,200,.28)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(0,-1);ctx.lineTo(0,-len*.9);ctx.stroke();}
  ctx.restore();
}
function flower(ctx,px,py,r,rand){
  const pal=rand()<.55?['#EDE5D6','#D9CBB4']:['#D7A9A3','#B9817E'];
  ctx.save();ctx.translate(px,py);ctx.rotate(rand()*6);
  for(let i=0;i<5;i++){ctx.rotate(Math.PI*2/5);ctx.beginPath();ctx.ellipse(0,-r*.62,r*.42,r*.62,0,0,Math.PI*2);
    const g=ctx.createLinearGradient(0,0,0,-r*1.2);g.addColorStop(0,pal[1]);g.addColorStop(1,pal[0]);ctx.fillStyle=g;ctx.fill();}
  ctx.beginPath();ctx.arc(0,0,r*.28,0,Math.PI*2);ctx.fillStyle='#C99A4A';ctx.fill();
  ctx.restore();
}
function berries(ctx,px,py,rand){for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(px+(rand()-.5)*8,py+(rand()-.5)*8,2.4+rand()*1.4,0,Math.PI*2);ctx.fillStyle=rand()<.5?'#6B2E36':'#8A3B47';ctx.fill()}}

function branch(ctx,rand,x,y,a,len,w,depth,dark){
  const bend=(rand()-.5)*.6, cxp=x+Math.cos(a+bend)*len*.5, cyp=y+Math.sin(a+bend)*len*.5;
  const ex=x+Math.cos(a)*len, ey=y+Math.sin(a)*len;
  ctx.strokeStyle=dark?'#1A1F1A':'#3B2E24';ctx.lineWidth=w;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(cxp,cyp,ex,ey);ctx.stroke();
  const steps=Math.max(3,Math.floor(len/(dark?13:11)));
  for(let i=1;i<=steps;i++){
    const t=i/steps, px=(1-t)*(1-t)*x+2*(1-t)*t*cxp+t*t*ex, py=(1-t)*(1-t)*y+2*(1-t)*t*cyp+t*t*ey;
    for(const s of [-1,1]){
      const ll=(dark?26:16)+rand()*(dark?18:14)*(depth>2?.8:1), ang=a+s*(0.45+rand()*.75)+Math.PI/2;
      const col=dark?DEEP[(rand()*DEEP.length)|0]:LEAF[(rand()*LEAF.length)|0];
      leaf(null,ctx,px,py,ang+(rand()-.5)*.5,ll,ll*.32,col,!dark);
    }
  }
  if(depth>0){
    const kids=2+(rand()<.4?1:0);
    for(let k=0;k<kids;k++) branch(ctx,rand,ex,ey,a+(rand()-.5)*1.3,len*(.62+rand()*.18),Math.max(1,w*.66),depth-1,dark);
  }else if(!dark){
    if(rand()<.55) flower(ctx,ex,ey,7+rand()*6,rand); else if(rand()<.4) berries(ctx,ex,ey,rand);
  }
}
function willow(ctx,rand,x,len,dark){
  let px=x,py=-10;const sway=(rand()-.5)*60;
  ctx.strokeStyle=dark?'#1A1F1A':'#4A3A2E';ctx.lineWidth=dark?2.2:1.4;ctx.beginPath();ctx.moveTo(px,py);
  const cx=x+sway*.5, ex=x+sway, ey=len;ctx.quadraticCurveTo(cx,len*.5,ex,ey);ctx.stroke();
  const n=Math.floor(len/9);
  for(let i=2;i<=n;i++){const t=i/n, lx=(1-t)*(1-t)*x+2*(1-t)*t*cx+t*t*ex, ly=(1-t)*(1-t)*py+2*(1-t)*t*(len*.5)+t*t*ey;
    for(const s of [-1,1]){const ll=(dark?20:13)+rand()*10;leaf(null,ctx,lx,ly,Math.PI+s*(0.35+rand()*.5),ll,ll*.24,dark?DEEP[(rand()*3)|0]:LEAF[(rand()*LEAF.length)|0],false)}}
  if(!dark&&rand()<.35) flower(ctx,ex,ey,5+rand()*4,rand);
}

function paint(cv){
  const W=innerWidth,H=innerHeight;
  const span=Math.min(W*.62, 520+W*.12);
  let ctx=setup(cv.L,W,H), r=rng(11);
  for(const dark of [true,false]){
    const n=Math.ceil(H/(dark?120:150))+2;
    for(let i=0;i<n;i++){const y=-60+i*(H+120)/(n-1)+(r()-.5)*40;
      branch(ctx,r,-20,y,(r()-.5)*.7,span*(dark?.42:.36),dark?9:7,dark?4:4,dark);}
  }
  ctx=setup(cv.R,W,H);r=rng(29);
  ctx.save();ctx.translate(W,0);ctx.scale(-1,1);
  for(const dark of [true,false]){
    const n=Math.ceil(H/(dark?120:150))+2;
    for(let i=0;i<n;i++){const y=-60+i*(H+120)/(n-1)+(r()-.5)*40;
      branch(ctx,r,-20,y,(r()-.5)*.7,span*(dark?.42:.36),dark?9:7,4,dark);}
  }
  ctx.restore();
  ctx=setup(cv.T,W,H);r=rng(5);
  for(const dark of [true,false]){
    let x=-20;while(x<W+20){const long=r()<.22;willow(ctx,r,x,H*(dark?.3:.18)+r()*H*(long?.5:.26),dark);x+=(dark?12:18)+r()*(dark?22:34)}
  }
  ctx=setup(cv.B,W,H);r=rng(41);
  for(let x=-30;x<W+30;x+=70){branch(ctx,r,x+(r()-.5)*30,H+20,-Math.PI/2+(r()-.5)*.8,H*.22+r()*H*.1,6,3,true)}
  for(let x=-10;x<W+30;x+=90){branch(ctx,r,x+(r()-.5)*30,H+20,-Math.PI/2+(r()-.5)*.9,H*.17+r()*H*.08,4,3,false)}
}

/* falling leaves + petals */
function burst(fx,state){
  const W=innerWidth,H=innerHeight,d=DPR(),fctx=fx.getContext('2d');
  fx.width=W*d;fx.height=H*d;fctx.setTransform(d,0,0,d,0,0);
  const r=Math.random,parts=[];
  const N=Math.round(Math.min(150,(W*H)/9000));
  for(let i=0;i<N;i++){
    const petal=i%3===0, x=W*(.15+r()*.7), y=H*(.05+r()*.8), dir=x<W/2?-1:1;
    parts.push({x,y,vx:dir*(1.2+r()*3.2)+(r()-.5),vy:-1.5+r()*1.5,rot:r()*6,vr:(r()-.5)*.18,life:0,max:110+r()*80,
      len:petal?7+r()*4:14+r()*12,col:petal?(r()<.5?'#EDE5D6':'#D7A9A3'):LEAF[(r()*LEAF.length)|0],petal,ph:r()*6});
  }
  const tick=()=>{
    fctx.clearRect(0,0,W,H);let alive=0;
    for(const p of parts){if(p.life>p.max)continue;alive++;p.life++;
      p.vy+=.045;p.vx*=.992;p.x+=p.vx+Math.sin(p.life*.06+p.ph)*.9;p.y+=p.vy;p.rot+=p.vr;
      const a=Math.min(1,(p.max-p.life)/40);fctx.globalAlpha=a;
      fctx.save();fctx.translate(p.x,p.y);fctx.rotate(p.rot);
      if(p.petal){fctx.beginPath();fctx.ellipse(0,0,p.len*.45,p.len*.75,0,0,Math.PI*2);fctx.fillStyle=p.col;fctx.fill()}
      else{fctx.beginPath();fctx.moveTo(0,0);fctx.bezierCurveTo(p.len*.32,-p.len*.25,p.len*.3,-p.len*.75,0,-p.len);fctx.bezierCurveTo(-p.len*.3,-p.len*.75,-p.len*.32,-p.len*.25,0,0);fctx.fillStyle=p.col;fctx.fill()}
      fctx.restore();}
    fctx.globalAlpha=1;
    if(!alive){state.stop?.();state.stop=null;fctx.clearRect(0,0,W,H)}
  };
  state.stop?.();state.stop=onFrame(tick);
}

/* sound: soft leaf rustle + small harp shimmer, started by the tap */
function sound(){
  try{
    const ac=new (window.AudioContext||window.webkitAudioContext)();const t=ac.currentTime;
    const len=ac.sampleRate*1.8,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++){const e=Math.sin(Math.PI*i/len);d[i]=(Math.random()*2-1)*e*(0.6+0.4*Math.sin(i/900)*Math.sin(i/2300))}
    const src=ac.createBufferSource();src.buffer=buf;const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=2600;bp.Q.value=.7;
    const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=900;const g=ac.createGain();g.gain.value=.18;
    src.connect(bp).connect(hp).connect(g).connect(ac.destination);src.start(t);
    [587.33,739.99,880,1174.66,1479.98].forEach((f,i)=>{const o=ac.createOscillator(),og=ac.createGain();o.type='sine';o.frequency.value=f;
      og.gain.setValueAtTime(0,t+.45+i*.11);og.gain.linearRampToValueAtTime(.05,t+.47+i*.11);og.gain.exponentialRampToValueAtTime(.0001,t+2.4+i*.11);
      o.connect(og).connect(ac.destination);o.start(t+.45+i*.11);o.stop(t+2.6+i*.11)});
    setTimeout(()=>ac.close(),3500);
  }catch(e){}
}

// Shown once per fresh page load that lands on the home page
export const introWanted = () => window.location.pathname === "/";
const MUSIC_AFTER = 1400; // just after the harp shimmer
const REMOVE_AFTER = 3400, REMOVE_AFTER_REDUCED = 700;

// Waits for the real Welcome screen (fonts + its images) so it comes forward complete
const welcomeReady = (stage) => Promise.race([
  Promise.all([document.fonts.ready, ...[...(stage?.querySelectorAll("img") || [])].map((i) => i.decode().catch(() => {}))]),
  new Promise((r) => setTimeout(r, 4000)),
]);

export function IntroVeil({ stageRef, onOpen, onDone }) {
  const cv = { L: useRef(null), R: useRef(null), T: useRef(null), B: useRef(null) };
  const fx = useRef(null), btn = useRef(null), fxState = useRef({ stop: null });
  const [open, setOpen] = useState(false);
  const opening = useRef(false);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvases = () => ({ L: cv.L.current, R: cv.R.current, T: cv.T.current, B: cv.B.current });

  useEffect(() => {
    holdMusic(true);
    paint(canvases());
    btn.current?.focus({ preventScroll: true });
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const st = fxState.current;
    let rt;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { if (!opening.current) paint(canvases()); }, 200); };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(rt); document.body.style.overflow = prev; st.stop?.(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const enter = () => {
    if (opening.current) return;
    opening.current = true;
    if (!isMuted()) sound();
    welcomeReady(stageRef.current).then(() => {
      setOpen(true); onOpen();
      if (!reduce) burst(fx.current, fxState.current);
      document.body.style.overflow = "";
      setTimeout(() => holdMusic(false), MUSIC_AFTER);
      setTimeout(() => document.querySelector("[data-testid=commission-button]")?.focus({ preventScroll: true }), 1800);
      setTimeout(onDone, reduce ? REMOVE_AFTER_REDUCED : REMOVE_AFTER);
    });
  };

  return (
    <div className={`iv${open ? " is-open" : ""}`} data-testid="intro-veil">
      <button ref={btn} className="iv-veil" type="button" aria-label="Enter Weave Him" onClick={enter} data-testid="intro-veil-enter">
        <div className="iv-backdrop" />
        <div className="iv-shaft" />
        <div className="iv-layer iv-B"><div className="iv-sway"><canvas ref={cv.B} /></div></div>
        <div className="iv-layer iv-L"><div className="iv-sway"><canvas ref={cv.L} /></div></div>
        <div className="iv-layer iv-R"><div className="iv-sway r"><canvas ref={cv.R} /></div></div>
        <div className="iv-layer iv-T"><div className="iv-sway t"><canvas ref={cv.T} /></div></div>
        <div className="iv-mist" />
        <div className="iv-tagwrap" aria-hidden="true">
          <div className="iv-twine" />
          <div className="iv-plaque">
            <div className="iv-seal">w</div>
            <b>weave him</b>
            <span className="iv-pulse">tap to enter</span>
          </div>
        </div>
      </button>
      <canvas ref={fx} className="iv-fx" />
    </div>
  );
}
