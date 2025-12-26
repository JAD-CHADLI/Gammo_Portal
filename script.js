document.getElementById('y').textContent = new Date().getFullYear();
const root = document.documentElement;
const card = document.getElementById('card');
const glow = document.getElementById('glow');
const links = [...document.querySelectorAll('.btn')];

window.addEventListener('mousemove', (e)=>{
  const x = e.clientX, y = e.clientY;
  root.style.setProperty('--x', x+'px');
  root.style.setProperty('--y', y+'px');

  const r = card.getBoundingClientRect();
  const px = (x - r.left)/r.width - .5;
  const py = (y - r.top)/r.height - .5;

  card.style.setProperty('--ry', (px*6)+'deg');
  card.style.setProperty('--rx', (-py*6)+'deg');

  links.forEach(b=>{
    const br = b.getBoundingClientRect();
    const cx = br.left + br.width/2; const cy = br.top + br.height/2;
    const dx = (x - cx)/br.width; const dy = (y - cy)/br.height;
    const mag = Math.exp(- (dx*dx + dy*dy) * 6);

    b.style.transform = `translate(${dx*8*mag}px, ${dy*8*mag}px)`;
    b.style.background = `linear-gradient(${(px*180+90)}deg, var(--neon), var(--neon-2))`;
  });

  glow.style.transform = `translate(${px*40}px, ${py*30}px)`;
});

window.addEventListener('click', (e)=>{
  const p = document.createElement('span');
  p.className='pulse'; p.style.left=e.clientX+'px'; p.style.top=e.clientY+'px';
  document.body.appendChild(p); setTimeout(()=>p.remove(), 900);
}, {passive:true});

// Intro sequence: hacking console + cosmic portal
(function(){
  const intro = document.getElementById('introOverlay');
  const consoleBody = document.getElementById('consoleBody');
  if (!intro || !consoleBody) return;

  const lines = [
    'INITIALIZING NEON LINK MATRIX...',
    'CONNECTING TO: GAMMO_PORTAL//v1.0',
    'ACCESS LEVEL: COSMIC_BUILDER [GRANTED]',
    'STATUS: ONLINE — WELCOME, TRAVELER'
  ];

  let cancelled = false;

  function typeLine(text, done){
    const line = document.createElement('div');
    line.className = 'console-line';
    consoleBody.appendChild(line);

    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'console-cursor';
    line.appendChild(cursor);

    const speed = 32; // ms per character
    const timer = setInterval(()=>{
      if (cancelled) { clearInterval(timer); return; }
      if (i <= text.length){
        line.textContent = text.slice(0, i);
        line.appendChild(cursor);
        i++;
      } else {
        clearInterval(timer);
        cursor.remove();
        if (typeof done === 'function') setTimeout(done, 140);
      }
    }, speed);
  }

  function runLines(index){
    if (cancelled) return;
    if (index >= lines.length){
      // After last line, trigger portal zoom + reveal
      triggerPortal();
      return;
    }
    typeLine(lines[index], ()=>runLines(index+1));
  }

  function triggerPortal(){
    if (cancelled) return;
    const portalRing = intro.querySelector('.portal-ring');
    const portalInner = intro.querySelector('.portal-inner');

    // Slight delay so the portal animation can breathe
    setTimeout(()=>{
      document.body.classList.add('portal-shake');
      if (portalRing) portalRing.style.animation = 'introPortalZoom 650ms ease-out forwards';
      if (portalInner) portalInner.style.animation = 'introPortalZoom 650ms ease-out forwards';

      setTimeout(()=>{
        intro.classList.add('hidden');
        document.body.classList.remove('portal-shake');
        setTimeout(()=>{
          if (intro && intro.parentNode){
            intro.parentNode.removeChild(intro);
          }
        }, 800);
      }, 520);
    }, 700);
  }

  function skipIntro(){
    if (!intro || cancelled) return;
    cancelled = true;
    intro.classList.add('hidden');
    document.body.classList.remove('portal-shake');
    setTimeout(()=>{
      if (intro && intro.parentNode){
        intro.parentNode.removeChild(intro);
      }
    }, 500);
  }

  // Allow user to skip intro with click or key press
  window.addEventListener('click', skipIntro, { once:true });
  window.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter'){
      skipIntro();
    }
  }, { once:true });

  // Start typing shortly after page load
  window.addEventListener('load', ()=>{
    setTimeout(()=>runLines(0), 220);
  });
})();

// Cursor-following neon particles
(function(){
  let lastX = 0, lastY = 0, lastTime = 0;
  window.addEventListener('mousemove', (e)=>{
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dist = Math.hypot(dx, dy);

    // Light throttle so we don't spawn too many particles
    if (dist < 2 && (now - lastTime) < 20) return;

    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;

    const isAccent = !!e.target.closest('.btn, a, button');
    const count = Math.min(3, 1 + Math.floor(dist/40));

    for (let i = 0; i < count; i++){
      const p = document.createElement('span');
      p.className = 'cursor-particle' + (isAccent ? ' cursor-particle-accent' : '');

      const jitterX = (Math.random() - .5) * 16;
      const jitterY = (Math.random() - .5) * 16;
      const scale = .6 + Math.random() * .7;

      p.style.left = (e.clientX + jitterX) + 'px';
      p.style.top = (e.clientY + jitterY) + 'px';
      p.style.transform = `translate(-50%, -50%) scale(${scale})`;

      document.body.appendChild(p);
      p.addEventListener('animationend', ()=>p.remove());
      // Safety cleanup in case animationend doesn't fire
      setTimeout(()=>p.remove(), 900);
    }
  }, { passive:true });
})();

// Secret Konami code easter egg: hidden chamber + theme
(function(){
  const sequence = [
    'ArrowUp','ArrowUp',
    'ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight',
    'ArrowLeft','ArrowRight',
    'b','a'
  ];
  let buffer = [];

  const panel = document.getElementById('secretPanel');
  const backdrop = document.getElementById('secretBackdrop');
  const closeBtn = document.getElementById('secretClose');

  let audioCtx = null;

  function playSecretSound(){
    try{
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.22);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    }catch(err){
      console && console.warn && console.warn('Audio error', err);
    }
  }

  function openSecret(){
    document.body.classList.add('gammo-easter');
    if (panel){
      panel.classList.add('open');
      panel.setAttribute('aria-hidden','false');
    }
    if (backdrop){
      backdrop.setAttribute('aria-hidden','false');
    }
    playSecretSound();
  }

  function closeSecret(){
    document.body.classList.remove('gammo-easter');
    if (panel){
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden','true');
    }
    if (backdrop){
      backdrop.setAttribute('aria-hidden','true');
    }
  }

  window.addEventListener('keydown', (e)=>{
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    buffer.push(key);
    if (buffer.length > sequence.length){
      buffer.shift();
    }
    for (let i = 0; i < sequence.length; i++){
      const expected = sequence[i];
      const got = buffer[i];
      if (!got || got.toLowerCase() !== expected.toLowerCase()){
        return;
      }
    }
    // If we reach here, sequence matched
    if (document.body.classList.contains('gammo-easter')){
      closeSecret();
    } else {
      openSecret();
    }
    buffer = [];
  });

  if (closeBtn){
    closeBtn.addEventListener('click', closeSecret);
  }
  if (backdrop){
    backdrop.addEventListener('click', closeSecret);
  }
  window.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && document.body.classList.contains('gammo-easter')){
      closeSecret();
    }
  });
})();
