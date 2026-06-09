/* ============ LIVE CLOCK ============ */
const clk = document.getElementById('clock');
function tick(){
  const d = new Date();
  clk.textContent = [d.getHours(),d.getMinutes(),d.getSeconds()].map(n=>String(n).padStart(2,'0')).join(':');
}
tick(); setInterval(tick,1000);

/* ============ TELEMETRY DATA ============ */
const TELE = {
  all:      {tag:'ALL',  note:'Aggregate signal across <b>15 years</b> of full-stack operations. Three disciplines, one operator.',
             bars:[['Backend Engineering',92],['Frontend / UI',90],['Data & Automation',86],['Server / DevOps',82],['Design Craft',88]]},
  python:   {tag:'PY',   note:'Mission profile: <b>backend + crypto data ops</b>. Async-first, monitored, Linux-native.',
             bars:[['Async I/O (asyncio)',95],['Crypto API Integ.',90],['Data Analysis',88],['Linux Ops',84],['Optimization',86]]},
  php:      {tag:'PHP',  note:'Mission profile: <b>platform engineering</b>. Built ad-tech from zero — billing, hierarchy, stats.',
             bars:[['Backend Services',93],['Ad Platform Build',95],['MySQL',88],['Server Config',82],['Custom APIs',85]]},
  frontend: {tag:'FE',   note:'Mission profile: <b>craft + delivery</b>. Pixel-accurate, cross-browser, design-led.',
             bars:[['HTML / CSS',96],['Photoshop Design',92],['Responsive Layout',94],['JS / jQuery',78],['Client Delivery',90]]}
};

const teleBars = document.getElementById('teleBars');
const teleNote = document.getElementById('teleNote');
const teleTag  = document.getElementById('teleTag');
function renderTele(key){
  const t = TELE[key];
  teleTag.textContent = t.tag;
  teleNote.innerHTML = t.note;
  teleBars.innerHTML = t.bars.map(([n,v])=>`
    <div class="tele-bar">
      <div class="t-top"><span class="t-name">${n}</span><span class="t-val">${v}%</span></div>
      <div class="bar"><div class="fill" data-w="${v}"></div></div>
    </div>`).join('');
  teleBars.querySelectorAll('.fill').forEach(animateBar);
}

/* ============ FILTERS ============ */
const filters = document.getElementById('filters');
const missions = [...document.querySelectorAll('.mission')];
filters.addEventListener('click', e=>{
  const btn = e.target.closest('.filter'); if(!btn) return;
  filters.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.f;
  missions.forEach(m=> m.classList.toggle('dim', f!=='all' && m.dataset.track!==f));
  renderTele(f);
});

/* ============ rAF TWEEN HELPERS (timeline-independent) ============ */
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeOut = p => 1 - Math.pow(1-p, 3);
function tween(dur, cb, done){
  if(REDUCED){ cb(1); if(done) done(); return; }
  const t0 = performance.now();
  (function step(now){
    const p = Math.min((now-t0)/dur, 1);
    cb(p);
    if(p<1) requestAnimationFrame(step); else if(done) done();
  })(performance.now());
}
function animateBar(fill){
  const target = +fill.dataset.w;
  tween(1000, p => { fill.style.width = (easeOut(p)*target) + '%'; });
}
function animateMetrics(){
  document.querySelectorAll('#metricWrap .fill').forEach(animateBar);
}
function animateCounters(){
  document.querySelectorAll('[data-count]').forEach(el=>{
    const target = +el.dataset.count;
    tween(1100, p => { el.textContent = Math.round(easeOut(p)*target); });
  });
}
function revealEl(el, delay){
  if(REDUCED){ el.style.opacity=1; el.style.transform='none'; return; }
  setTimeout(()=>{
    tween(560,
      p => { const e=easeOut(p); el.style.opacity=e; el.style.transform=`translateY(${14*(1-e)}px)`; },
      () => { el.style.opacity='1'; el.style.transform='none'; el.style.willChange='auto'; }
    );
  }, delay||0);
}
function revealAll(){
  document.querySelectorAll('[data-rev]').forEach((el,i)=>revealEl(el, i*110));
}

/* ============ SCAN BUTTON ============ */
const beam = document.getElementById('scanbeam');
document.getElementById('scanBtn').addEventListener('click', ()=>{
  beam.classList.remove('run'); void beam.offsetWidth; beam.classList.add('run');
  animateMetrics();
  renderTele(filters.querySelector('.filter.active').dataset.f);
});

/* ============ BOOT SEQUENCE ============ */
const bootLines = [
  ['m','> initializing kernel ...................','ok','READY'],
  ['m','> mounting /profile/artem_mazur ..........','ok','OK'],
  ['c','> loading identity_module [UID 479789] ...','ok','OK'],
  ['m','> compiling core_metrics .................','ok','6/6'],
  ['c','> indexing tech_matrix ...................','ok','12'],
  ['m','> parsing mission_history ................','ok','3 OPS'],
  ['c','> calibrating telemetry array ............','ok','SYNC'],
  ['m','> establishing comms_link ................','ok','LIVE'],
  ['c','> all systems nominal','',''],
];
const bootlog = document.getElementById('bootlog');
const bootpf  = document.getElementById('bootpf');
const bootEl  = document.getElementById('boot');
let bdone=false;

function finishBoot(){
  if(bdone) return; bdone=true;
  bootEl.classList.add('gone');
  document.body.classList.remove('loading');
  setTimeout(()=>{ bootEl.style.display='none'; }, REDUCED?0:600);
  revealAll();
  animateMetrics();
  animateCounters();
  renderTele('all');
}

function runBoot(){
  let i=0;
  const total=bootLines.length;
  const iv = setInterval(()=>{
    if(i>=total){ clearInterval(iv); setTimeout(finishBoot, 380); return; }
    const [cls,txt,okcls,okv] = bootLines[i];
    const div=document.createElement('div');
    div.innerHTML = `<span class="${cls}">${txt}</span> ${okv?`<span class="${okcls}">[${okv}]</span>`:''}`;
    bootlog.appendChild(div);
    bootpf.style.width = Math.round(((i+1)/total)*100)+'%';
    i++;
  }, 200);
}
document.getElementById('bootskip').addEventListener('click', finishBoot);
window.addEventListener('keydown', e=>{ if(e.key==='Escape') finishBoot(); });

if(REDUCED){
  bootEl.style.display='none'; bdone=true;
  document.body.classList.remove('loading');
  revealAll();
  animateMetrics(); animateCounters(); renderTele('all');
} else {
  runBoot();
}
