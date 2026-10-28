import { useEffect, useRef } from "react";

// Ported as-is from forest-panel-prototype.html: layered canvases, live layer, vignette and grain.
// Sized to its container; repaints on resize, pauses when the tab is hidden, static under reduced motion.
const IDS = ["far", "rays", "mid", "mistc", "near", "live"];

function start(root, reduce) {
  const el = Object.fromEntries(IDS.map((id) => [id, root.querySelector(`[data-layer=${id}]`)]));
  const DPR = Math.min(2, devicePixelRatio || 1); let W, H;
  function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function cv(id){const c=el[id];c.width=W*DPR;c.height=H*DPR;const x=c.getContext('2d');x.setTransform(DPR,0,0,DPR,0,0);x.clearRect(0,0,W,H);return x}
  function pine(x,ctx,bx,by,h,w,col){
    ctx.fillStyle=col;ctx.fillRect(bx-w*0.06,by-h,w*0.12,h);
    const tiers=Math.floor(h/22);
    for(let i=0;i<tiers;i++){const t=i/tiers,y=by-h*0.04-(h*0.96)*t,ww=w*(1.05-t*0.9);
      ctx.beginPath();ctx.moveTo(bx,y-30);ctx.lineTo(bx-ww/2,y+6);ctx.quadraticCurveTo(bx,y-2,bx+ww/2,y+6);ctx.closePath();ctx.fill();}
  }
  function trunk(ctx,x,w,col,r){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-w/2,-10);ctx.bezierCurveTo(x-w/2+r()*6,H*0.4,x-w/2-r()*6,H*0.7,x-w*0.6,H+10);ctx.lineTo(x+w*0.6,H+10);ctx.bezierCurveTo(x+w/2+r()*6,H*0.7,x+w/2-r()*6,H*0.4,x+w/2,-10);ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=1;for(let k=0;k<6;k++){const xx=x-w/2+w*(k+0.5)/6+(r()-0.5)*3;ctx.beginPath();ctx.moveTo(xx,0);ctx.lineTo(xx+(r()-0.5)*4,H);ctx.stroke()}}
  function leaf(ctx,px,py,a,len,col){ctx.save();ctx.translate(px,py);ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(len*.3,-len*.25,len*.28,-len*.75,0,-len);ctx.bezierCurveTo(-len*.28,-len*.75,-len*.3,-len*.25,0,0);ctx.fillStyle=col;ctx.fill();ctx.restore()}
  function willow(ctx,r,x,len,dark){let cx=x+(r()-.5)*40,ex=x+(r()-.5)*70;ctx.strokeStyle=dark?'#141a16':'#3a2f25';ctx.lineWidth=dark?1.6:1.1;ctx.beginPath();ctx.moveTo(x,-5);ctx.quadraticCurveTo(cx,len*.5,ex,len);ctx.stroke();
    const n=Math.floor(len/10),cols=dark?['#18211b','#1d2820','#222e25']:['#3E4A37','#4A5641','#56634A','#65734F'];
    for(let i=2;i<=n;i++){const t=i/n,lx=(1-t)*(1-t)*x+2*(1-t)*t*cx+t*t*ex,ly=2*(1-t)*t*(len*.5)+t*t*len;
      for(const s of[-1,1])leaf(ctx,lx,ly,Math.PI+s*(.35+r()*.45),(dark?16:11)+r()*7,cols[(r()*cols.length)|0])}}
  function paint(){
    W=root.clientWidth;H=root.clientHeight;
    let c=cv('far'),r=rng(3);
    for(const [col,base,hmul,alpha] of [['#46564A',H*0.80,0.55,1],['#3A493E',H*0.92,0.7,1]]){
      c.globalAlpha=alpha;for(let x=-40;x<W+40;x+=26+r()*30){pine(null,c,x,base+r()*30,H*hmul*(0.6+r()*0.5),70+r()*50,col)}}
    c.globalAlpha=1;
    c=cv('rays');const g=c.createLinearGradient(0,0,W*0.3,H);g.addColorStop(0,'rgba(240,214,150,.20)');g.addColorStop(1,'rgba(240,214,150,0)');c.fillStyle=g;
    for(const [x0,w0,x1,w1] of [[W*0.18,W*0.08,W*0.55,W*0.22],[W*0.36,W*0.05,W*0.78,W*0.18],[W*0.05,W*0.04,W*0.32,W*0.12]]){c.beginPath();c.moveTo(x0,-10);c.lineTo(x0+w0,-10);c.lineTo(x1+w1,H);c.lineTo(x1,H);c.fill()}
    c=cv('mid');r=rng(9);
    for(let i=0;i<6;i++){const x=(i+0.5)*W/6+(r()-.5)*W/10;trunk(c,x,10+r()*14,['#28342C','#2C392F','#243028'][i%3],r)}
    c=cv('mistc');for(const [y,h,a] of [[H*0.62,H*0.25,.16],[H*0.84,H*0.3,.30],[H*0.38,H*0.18,.07]]){const m=c.createLinearGradient(0,y-h/2,0,y+h/2);m.addColorStop(0,'rgba(201,206,193,0)');m.addColorStop(.5,`rgba(201,206,193,${a})`);m.addColorStop(1,'rgba(201,206,193,0)');c.fillStyle=m;c.fillRect(0,y-h/2,W,h)}
    c=cv('near');r=rng(21);
    trunk(c,W*0.03,W*0.07,'#111813',r);trunk(c,W*0.97,W*0.06,'#111813',r);
    for(const dark of [true,false]){let x=-10;while(x<W+10){const edge=Math.min(x,W-x)/W;const side=edge<.28;if(!side&&r()<.55){x+=30;continue}const len=side?H*(dark?.22:.16)+r()*H*.26:H*(dark?.08:.05)+r()*H*.07;willow(c,r,x,len,dark);x+=(dark?14:22)+r()*26}}
    for(let x=-20;x<W+20;x+=40+r()*30){const h=H*(.08+r()*.07);c.save();c.translate(x,H+6);c.rotate((r()-.5)*.5);for(let k=0;k<9;k++){const t=k/9;for(const s of[-1,1])leaf(c,0,-h*t,s*(1.1-t*.4),h*.28*(1-t*.5),r()<.5?'#1a231d':'#223027')}c.restore()}
  }
  const live=el.live;let lc,parts=[],leaves=[],t0=performance.now(),raf=0;
  function newLeaf(any){const r=Math.random;return{x:r()*W,y:any?r()*H:-20,vy:.35+r()*.4,ph:r()*6,rot:r()*6,vr:(r()-.5)*.02,len:9+r()*7,col:['#9AA38A','#B79B70','#7E8E5E','#C99A4A'][(r()*4)|0]}}
  function init(){live.width=W*DPR;live.height=H*DPR;lc=live.getContext('2d');lc.setTransform(DPR,0,0,DPR,0,0);
    const r=Math.random;parts=Array.from({length:Math.round(W*H/26000)+10},()=>({x:r()*W,y:H*(.35+r()*.6),ph:r()*6.28,sp:.2+r()*.4,s:1.2+r()*1.8}));
    leaves=Array.from({length:6},()=>newLeaf(true))}
  function frame(now){const t=(now-t0)/1000;lc.clearRect(0,0,W,H);
    for(const p of parts){const x=p.x+Math.sin(t*p.sp+p.ph)*14,y=p.y+Math.cos(t*p.sp*.8+p.ph)*10;const a=.35+.65*Math.max(0,Math.sin(t*p.sp*2+p.ph));
      const g=lc.createRadialGradient(x,y,0,x,y,p.s*6);g.addColorStop(0,`rgba(255,226,150,${.55*a})`);g.addColorStop(1,'rgba(255,226,150,0)');lc.fillStyle=g;lc.beginPath();lc.arc(x,y,p.s*6,0,6.28);lc.fill();
      lc.fillStyle=`rgba(255,240,200,${.9*a})`;lc.beginPath();lc.arc(x,y,p.s*.7,0,6.28);lc.fill()}
    for(let i=0;i<leaves.length;i++){const L=leaves[i];L.y+=L.vy;L.ph+=.02;L.rot+=L.vr;const x=L.x+Math.sin(L.ph)*24;
      lc.save();lc.translate(x,L.y);lc.rotate(L.rot+Math.sin(L.ph)*.6);lc.globalAlpha=.75;lc.beginPath();lc.moveTo(0,0);lc.bezierCurveTo(L.len*.3,-L.len*.25,L.len*.28,-L.len*.75,0,-L.len);lc.bezierCurveTo(-L.len*.28,-L.len*.75,-L.len*.3,-L.len*.25,0,0);lc.fillStyle=L.col;lc.fill();lc.restore();
      if(L.y>H+20)leaves[i]=newLeaf(false)}
    lc.globalAlpha=1;
    el.mistc.style.transform=`translateX(${Math.sin(t/14)*18}px)`;
    el.rays.style.opacity=.75+.25*Math.sin(t/5);
    raf=requestAnimationFrame(frame)}
  const run=()=>{cancelAnimationFrame(raf);if(!reduce&&!document.hidden)raf=requestAnimationFrame(frame)};
  // reduced motion: the static scene only, no fireflies or leaves
  function all(){paint();if(!reduce)init();run()}
  all();
  let rt,lw=root.clientWidth,lh=root.clientHeight;
  const ro=new ResizeObserver(()=>{if(root.clientWidth===lw&&root.clientHeight===lh)return;lw=root.clientWidth;lh=root.clientHeight;clearTimeout(rt);rt=setTimeout(all,200)});
  ro.observe(root);
  document.addEventListener('visibilitychange',run);
  return()=>{cancelAnimationFrame(raf);clearTimeout(rt);ro.disconnect();document.removeEventListener('visibilitychange',run)};
}

export function ForestScene({ className = "" }) {
  const ref = useRef(null);
  useEffect(() => start(ref.current, matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  return (
    <div ref={ref} className={`forest-scene ${className}`} aria-hidden data-testid="forest-scene">
      {IDS.map((id) => <canvas key={id} data-layer={id} data-testid={`forest-${id}`} />)}
      <div className="forest-vignette" />
      <div className="forest-grain" />
    </div>
  );
}
