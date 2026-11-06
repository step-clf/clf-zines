// seeded rng
let _s = 7;
function rnd(){ _s = (_s * 16807) % 2147483647; return (_s - 1) / 2147483646; }
function pick(a){ return a[Math.floor(rnd()*a.length)]; }

// Ransom-note letters: <span class="ransom" data-palette="...">TEXT</span>
function ransom(){
  document.querySelectorAll('.ransom').forEach(el=>{
    const txt = el.textContent; el.textContent='';
    const fonts = (el.dataset.fonts||'Bowlby One|Anton|Special Elite|Shrikhand|Permanent Marker').split('|');
    const bgs = (el.dataset.bgs||'#fff|#111|#ff4fa3|#f4ef8a|#fff|#e9e4d8').split('|');
    const size = +(el.dataset.size||90);
    let word=null;
    const newWord=()=>{ word=document.createElement('span'); word.style.display='inline-block'; word.style.whiteSpace='nowrap'; el.appendChild(word); };
    newWord();
    [...txt].forEach(ch=>{
      if(ch===' '){ const s=document.createElement('span'); s.style.display='inline-block'; s.style.width=(size*0.3)+'px'; el.appendChild(s); newWord(); return; }
      if(ch==='|'){ el.appendChild(document.createElement('br')); newWord(); return; }
      const s=document.createElement('span');
      const bg=pick(bgs); const dark = (bg==='#111');
      s.textContent = rnd()>0.5? ch.toUpperCase(): ch.toLowerCase();
      Object.assign(s.style,{display:'inline-block',fontFamily:pick(fonts),fontSize:(size*(0.85+rnd()*0.35))+'px',lineHeight:1,
        background:bg,color: dark? '#fff' : (bg==='#ff4fa3'?'#111':pick(['#111','#111','#ff2e93'])),
        padding:`${4+rnd()*8}px ${6+rnd()*6}px`,margin:'3px 2px',transform:`rotate(${(rnd()-0.5)*14}deg) translateY(${(rnd()-0.5)*10}px)`,
        boxShadow:'2px 3px 0 rgba(0,0,0,.25)'});
      word.appendChild(s);
    });
  });
}

// Wobbly hand-drawn borders: elements with data-rough="rect|ellipse" get an svg drawn behind them
function roughen(){
  document.querySelectorAll('[data-rough]').forEach(el=>{
    const w=el.offsetWidth, h=el.offsetHeight, pad=14;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('width',w+pad*2); svg.setAttribute('height',h+pad*2);
    Object.assign(svg.style,{position:'absolute',left:-pad+'px',top:-pad+'px',pointerEvents:'none',zIndex:el.dataset.z||-1,overflow:'visible'});
    const rc=rough.svg(svg);
    const o={roughness:+(el.dataset.roughness||2.2),bowing:2,stroke:el.dataset.stroke||'#1a1a1a',strokeWidth:+(el.dataset.sw||5),
      fill:el.dataset.fill||undefined,fillStyle:el.dataset.fillstyle||'solid',hachureGap:+(el.dataset.gap||10),fillWeight:+(el.dataset.fw||2),seed:Math.floor(rnd()*1000)};
    if(el.dataset.tail){ // "baseX,baseY,tipX,tipY" relative to element; base sits inside the shape
      const [bx,by,tx,ty]=el.dataset.tail.split(',').map(Number);
      const dx=tx-bx, dy=ty-by, L=Math.hypot(dx,dy)||1, nx=-dy/L*42, ny=dx/L*42;
      const t=rc.polygon([[pad+bx+nx,pad+by+ny],[pad+bx-nx,pad+by-ny],[pad+tx,pad+ty]],{...o,fill:o.fill||'#fff',fillStyle:'solid',seed:o.seed+1});
      svg.appendChild(t);
    }
    const node = el.dataset.rough==='ellipse' ? rc.ellipse(pad+w/2,pad+h/2,w,h,o) : rc.rectangle(pad,pad,w,h,o);
    svg.appendChild(node);
    if(el.dataset.tail){ // cover the tail base with an unstroked fill
      const c = el.dataset.rough==='ellipse' ? rc.ellipse(pad+w/2,pad+h/2,w-14,h-14,{...o,stroke:'none',roughness:0.3}) : rc.rectangle(pad+7,pad+7,w-14,h-14,{...o,stroke:'none',roughness:0.3});
      svg.appendChild(c);
    }
    if(getComputedStyle(el).position==='static') el.style.position='relative';
    el.style.isolation='isolate';
    el.insertBefore(svg, el.firstChild);
  });
}
// Hand-drawn arrows: <svg class="arrow" data-pts="x,y x,y x,y" data-color="#..."> positioned over slide (full size)
function arrows(){
  document.querySelectorAll('svg.arrow').forEach(svg=>{
    const pts=svg.dataset.pts.trim().split(/\s+/).map(p=>p.split(',').map(Number));
    const col=svg.dataset.color||'#3a1650', sw=+(svg.dataset.sw||6);
    const rc=rough.svg(svg); const o={stroke:col,strokeWidth:sw,roughness:1.4,bowing:2,seed:Math.floor(rnd()*1000)};
    svg.appendChild(rc.curve(pts,o));
    const [a,b]=[pts[pts.length-2],pts[pts.length-1]]; const ang=Math.atan2(b[1]-a[1],b[0]-a[0]), L=34;
    [0.5,-0.5].forEach(d=>svg.appendChild(rc.line(b[0],b[1],b[0]-L*Math.cos(ang+d),b[1]-L*Math.sin(ang+d),o)));
  });
}
function go(){ ransom(); roughen(); arrows(); document.body.dataset.ready='1'; }
document.fonts.ready.then(()=>setTimeout(go,50));
