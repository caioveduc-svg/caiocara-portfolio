(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = preference.matches;
  const items = [], active = new Set();
  let frame = 0;
  // Small original line drawings: idea, ball, broadcast, music, film, people, arrow.
  const icons = [
    '<path d="M9 17c0-3-4-4-4-8a7 7 0 0 1 14 0c0 4-4 5-4 8M9 20h6M10 23h4M12 3v3M8 9l4 3 4-3"/>',
    '<circle cx="12" cy="12" r="10"/><path d="m12 7 5 4-2 6H9l-2-6zM12 7V2M17 11l5-2M15 17l3 3M9 17l-3 3M7 11 2 9"/>',
    '<rect x="2" y="7" width="20" height="15" rx="2"/><path d="m7 2 5 5 5-5M6 12h8M6 16h8M18 12v5"/>',
    '<path d="M9 18V5l12-3v13M9 9l12-3"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="15" rx="3" ry="3"/>',
    '<rect x="2" y="3" width="20" height="18" rx="1"/><path d="m10 8 6 4-6 4zM2 7h4M2 17h4M18 7h4M18 17h4"/>',
    '<circle cx="9" cy="7" r="4"/><path d="M2 22v-4a7 7 0 0 1 14 0v4M17 4a4 4 0 0 1 0 8M19 15a6 6 0 0 1 3 7"/>',
    '<path d="M3 21 21 3M6 3h15v15M3 11v10h10"/>'
  ];
  document.querySelectorAll('.art').forEach((art, i) => {
    const img = art.querySelector('img');
    if (!img || !img.animate) return;
    const stage = document.createElement('div'); stage.className = 'paper-stage';
    img.before(stage); stage.append(img);
    const ball = document.createElement('span'); ball.className = 'paper-ball'; ball.setAttribute('aria-hidden', 'true');
    const sticker = document.createElement('span'); sticker.className = 'paper-sticker'; sticker.setAttribute('aria-hidden', 'true');
    sticker.innerHTML = '<svg viewBox="0 0 24 24">' + icons[i % icons.length] + '</svg>';
    stage.append(ball, sticker);
    // Twelve connected folds share the original cached PNG; no video or GIF download.
    items.push({stage, img, ball, folds:[], sheet:null, progress:0, target:0, done:false});
  });
  const clamp = value => Math.min(1, Math.max(0, value));
  function prepare(item) {
    if (item.sheet || item.done || paused) return;
    const {img, stage} = item;
    const width = img.offsetWidth, height = img.offsetHeight;
    if (!width || !height) return;
    const sheet = document.createElement('div'); sheet.className = 'paper-sheet';
    sheet.setAttribute('aria-hidden', 'true');
    Object.assign(sheet.style, {left:img.offsetLeft+'px',top:img.offsetTop+'px',width:width+'px',height:height+'px'});
    let parent = sheet;
    for (let i=0; i<12; i++) {
      const fold = document.createElement('div'); fold.className = 'paper-fold';
      fold.style.height = height/12+'px';
      const face = document.createElement('div'); face.className = 'paper-face';
      face.style.backgroundImage = `url("${img.src}")`;
      face.style.backgroundSize = `${width}px ${height}px`;
      face.style.backgroundPosition = `0 ${-i*height/12}px`;
      fold.append(face); parent.append(fold); parent = fold;
      item.folds.push(fold);
    }
    stage.append(sheet); item.sheet = sheet; img.style.opacity = '0';
  }
  function finish(item) {
    item.img.style.opacity = ''; item.sheet?.remove(); item.sheet = null; item.folds = [];
    item.ball.style.opacity = '0';
  }
  function draw(item, p) {
    if (!item.sheet) return;
    const opening = clamp((p-.06)/.94);
    item.sheet.style.transform = `translateY(${(1-opening)*22}%) scale(${.48+opening*.52}) rotate(${(1-opening)*-9}deg)`;
    item.sheet.style.opacity = String(clamp(p*8));
    item.ball.style.opacity = String(1-clamp(p*4));
    item.ball.style.transform = `translateY(-65%) scale(${.65+p*2}) rotate(${p*65-25}deg)`;
    item.folds.forEach((fold,i) => {
      const local = clamp((opening-i*.034)/.62);
      const eased = 1-Math.pow(1-local, 2);
      const angle = (1-eased)*(i===0 ? -62 : i%2 ? 146 : -146);
      fold.style.transform = `rotateX(${angle}deg)`;
      fold.firstElementChild.style.filter = `brightness(${1-(1-eased)*(i%2?.38:.13)})`;
      fold.firstElementChild.style.setProperty('--crease', String((1-eased)*.65));
    });
  }
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'motion-toggle';
  document.querySelector('footer').append(toggle);
  let lastTime = 0;
  function render(time) {
    frame = 0;
    const smoothing = 1-Math.exp(-Math.min(40, time-lastTime||16)/150); lastTime = time;
    const height = innerHeight;
    const changes = [...active].map(item => {
      const rect = item.stage.getBoundingClientRect();
      return [item, Math.max(item.target, clamp((height * .98 - rect.top) / (height * .68)))];
    });
    changes.forEach(([item, value]) => {
      item.target = value;
      prepare(item);
      item.progress += (value-item.progress)*smoothing;
      if (Math.abs(value-item.progress)<.001) item.progress = value;
      draw(item,item.progress);
      if (item.progress === 1) {
        finish(item);
        item.done = true; active.delete(item); observer.unobserve(item.stage);
        item.stage.classList.toggle('paper-active', !paused);
      }
    });
    if ([...active].some(item => Math.abs(item.target-item.progress)>.001)) schedule();
  }
  function schedule(){ if (!frame && !paused && !document.hidden) frame = requestAnimationFrame(render); }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {const item = items.find(i => i.stage === entry.target); if(entry.isIntersecting && !item.done) active.add(item); else {active.delete(item); finish(item);}}); schedule();
  }, {rootMargin:'80px 0px'});
  function setPaused(value) {
    paused = value;
    document.documentElement.classList.toggle('motion-paused', paused);
    toggle.textContent = paused ? 'Ativar animações' : 'Pausar animações';
    toggle.setAttribute('aria-pressed', String(paused));
    items.forEach(item => {
      if(paused) {finish(item); item.stage.classList.remove('paper-active');}
    });
    schedule();
  }
  items.forEach(item => observer.observe(item.stage));
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', () => {active.forEach(finish); schedule();}, {passive:true});
  document.addEventListener('visibilitychange', schedule);
  document.querySelector('#viewer')?.addEventListener('close', schedule);
  toggle.addEventListener('click', () => setPaused(!paused));
  preference.addEventListener('change', e => setPaused(e.matches));
  setPaused(paused);
})();
