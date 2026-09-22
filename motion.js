/* A lightweight, original motion layer. No animation frameworks or external services.
   Native scrolling stays native; canvas rendering sleeps when offscreen or hidden. */
(() => {
  'use strict';
  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const motionAllowed = () => !reduce.matches && !html.classList.contains('motion-paused');
  html.classList.add('motion-enhanced');
  if (motionAllowed()) html.classList.add('entrance-ready');

  // Keep the animation switch in reach, not buried below the fold.
  const motionControl = document.querySelector('.motion-toggle');
  if (motionControl) {
    motionControl.classList.add('motion-switch');
    document.querySelector('.nav-actions').prepend(motionControl);
    const respectSystem = () => {
      motionControl.disabled = reduce.matches;
      motionControl.title = reduce.matches ? 'Reduced motion is enabled in your device settings' : 'Pause or enable decorative animations';
      if (reduce.matches) {
        motionControl.textContent = 'Motion: reduced';
        motionControl.setAttribute('aria-pressed', 'false');
        motionControl.setAttribute('aria-label', 'Animations reduced by your device settings');
      }
    };
    respectSystem();
    reduce.addEventListener('change', respectSystem);
  }

  const progress = document.querySelector('.reading-progress > span');
  const manifesto = document.querySelector('.manifesto');
  const storyLines = [...document.querySelectorAll('.ink-line')];
  const heroArt = document.querySelector('.hero-art');
  const heroSerif = document.querySelector('.hero h1 .serif-word');
  const heroFirstLine = document.querySelector('.hero-line:first-child > span');

  setTimeout(() => {
    document.querySelectorAll('.hero-line').forEach(el => { el.style.overflow = 'visible'; });
  }, 1400);

  let scrollPending = false;
  function updateScroll() {
    scrollPending = false;
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${range > 0 ? clamp(scrollY / range, 0, 1) : 0})`;
    if (!motionAllowed()) return;

    if (scrollY < 800) {
      const heroPhase = clamp(scrollY / 450, 0, 1);
      if (heroSerif) {
        heroSerif.style.setProperty('--scroll-shift-x', `${heroPhase * 38}px`);
        heroSerif.style.setProperty('--scroll-tracking', `${-2.5 + heroPhase * 2.2}px`);
        heroSerif.style.setProperty('--scroll-opacity', `${1 - heroPhase * 0.35}`);
      }
      if (heroFirstLine) {
        heroFirstLine.style.transform = `translate3d(${-heroPhase * 16}px, 0, 0)`;
      }
    }

    const r = manifesto.getBoundingClientRect();
    const phase = clamp((innerHeight * .91 - r.top) / (innerHeight * .6 + r.height * .1), 0, 1);
    storyLines.forEach((line, i) => line.style.setProperty('--ink-fill', `${clamp((phase - i * .2) * 1.7, 0, 1) * 100}%`));
    manifesto.style.setProperty('--story-turn', `${phase * 150}deg`);
    manifesto.style.setProperty('--story-arrow', `${(1 - phase) * -24}deg`);
    const heroRect = heroArt.getBoundingClientRect();
    if (heroRect.bottom > 0) heroArt.style.setProperty('--grid-shift', `${clamp(scrollY * .07, 0, 50)}px`);
  }
  function scheduleScroll() { if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); } }
  addEventListener('scroll', scheduleScroll, { passive: true });
  addEventListener('resize', scheduleScroll, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(scheduleScroll).observe(document.body);
  updateScroll();

  const halo = document.querySelector('.pointer-halo');
  let cursorX = 0, cursorY = 0, pointerPending = false;
  const paintPointer = () => {
    pointerPending = false;
    halo.style.transform = `translate3d(${cursorX}px,${cursorY}px,0) translate(-50%,-50%)`;
  };
  document.addEventListener('pointermove', e => {
    if (!fine.matches || !motionAllowed() || e.pointerType === 'touch') return;
    cursorX = e.clientX; cursorY = e.clientY;
    halo.classList.toggle('is-visible', !document.querySelector('dialog[open]'));
    if (!pointerPending) { pointerPending = true; requestAnimationFrame(paintPointer); }
  }, { passive: true });
  document.addEventListener('pointerover', e => {
    if (!fine.matches || !motionAllowed()) return;
    const visual = e.target.closest('.project-visual');
    const repo = e.target.closest('.repo-row');
    halo.classList.toggle('is-viewing', Boolean(visual || repo));
    halo.classList.toggle('is-link', !visual && !repo && Boolean(e.target.closest('a,button,summary')));
    halo.textContent = visual ? 'VIEW' : repo ? 'CODE' : '';
  }, { passive: true });
  document.addEventListener('pointerleave', () => halo.classList.remove('is-visible'));
  document.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') halo.classList.remove('is-visible'); });

  document.querySelectorAll('.hero-buttons .button,.contact-circle').forEach(button => {
    button.addEventListener('pointermove', e => {
      if (!fine.matches || !motionAllowed() || e.pointerType === 'touch') return;
      const r = button.getBoundingClientRect();
      button.style.translate = `${clamp((e.clientX - r.left - r.width / 2) * .12, -9, 9)}px ${clamp((e.clientY - r.top - r.height / 2) * .18, -7, 7)}px`;
    }, { passive: true });
    button.addEventListener('pointerleave', () => { button.style.translate = '0px 0px'; });
  });
  document.querySelectorAll('.project-visual,.toolkit-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      if (!fine.matches || !motionAllowed() || e.pointerType === 'touch') return;
      const r = card.getBoundingClientRect();
      const x = clamp((e.clientX - r.left) / r.width, 0, 1), y = clamp((e.clientY - r.top) / r.height, 0, 1);
      card.style.setProperty('--shine-x', `${x * 100}%`);
      card.style.setProperty('--shine-y', `${y * 100}%`);
      card.style.setProperty('--tilt-x', `${(y - .5) * -5}deg`);
      card.style.setProperty('--tilt-y', `${(x - .5) * 5}deg`);
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });

  // A parametric (2,3) torus-knot sculpture, shaded and projected in Canvas 2D.
  // The geometry is authored here; no models, images, or code are taken from the reference.
  const canvas = document.querySelector('#kinetic-canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return; // The CSS orbital artwork remains as the fallback.
  const TAU = Math.PI * 2;
  const compact = matchMedia('(max-width: 620px)').matches;
  const rings = compact ? 112 : 168, sides = compact ? 14 : 22, tube = .32;
  const points = [], faces = [];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const normalize = a => { const length = Math.hypot(...a) || 1; return a.map(v => v / length); };
  const center = t => [(1.9 + .67 * Math.cos(3 * t)) * Math.cos(2 * t), (1.9 + .67 * Math.cos(3 * t)) * Math.sin(2 * t), .83 * Math.sin(3 * t)];
  for (let i = 0; i < rings; i++) {
    const t = i / rings * TAU, c = center(t), next = center(t + .001), prev = center(t - .001);
    const tangent = normalize(next.map((v, j) => v - prev[j]));
    const normal = normalize(cross(tangent, [0, 0, 1]));
    const binormal = normalize(cross(tangent, normal));
    for (let j = 0; j < sides; j++) {
      const v = j / sides * TAU;
      const n = normal.map((q, k) => q * Math.cos(v) + binormal[k] * Math.sin(v));
      points.push({ p: c.map((q, k) => q + n[k] * tube), n });
    }
  }
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < sides; j++) {
      const ids = [i * sides + j, ((i + 1) % rings) * sides + j, ((i + 1) % rings) * sides + (j + 1) % sides, i * sides + (j + 1) % sides];
      const n = normalize([0, 1, 2].map(k => ids.reduce((sum, id) => sum + points[id].n[k], 0) / 4));
      // One warm chartreuse ribbon dissolves into a lavender-metal body.
      const blend = Math.pow(Math.max(0, Math.sin(i / rings * TAU + .65)), 5);
      const purple = [179, 159, 228], lime = [208, 244, 117];
      const base = purple.map((v, k) => v * (1 - blend) + lime[k] * blend);
      faces.push({ ids, n, base });
    }
  }
  let width = 1, height = 1, dpr = 1, phase = .3;
  let pointer = { x: 0, y: 0 }, eased = { x: 0, y: 0 };
  let visible = true, running = false, frame = 0, last = 0;
  let lightTheme = html.dataset.theme === 'light';
  function rotation(x, y, z) {
    const cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z);
    return v => {
      const y1 = v[1] * cx - v[2] * sx, z1 = v[1] * sx + v[2] * cx;
      const x2 = v[0] * cy + z1 * sy, z2 = -v[0] * sy + z1 * cy;
      return [x2 * cz - y1 * sz, x2 * sz + y1 * cz, z2];
    };
  }
  const lamp = normalize([-.5, -.8, 1.2]);
  const halfway = normalize([lamp[0], lamp[1], lamp[2] + 1]);
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const turn = rotation(-.65 + Math.sin(phase * .37) * .2 + eased.y * .27, phase * .3 + eased.x * .45, -.30 + Math.sin(phase * .22) * .14);
    const scale = Math.min(width * .88, height * 1.13);
    const transformed = points.map(({ p }) => {
      const v = turn(p), projection = scale / (7.7 - v[2]);
      return { x: width * .5 + v[0] * projection, y: height * .47 + v[1] * projection, z: v[2] };
    });
    const ordered = faces.map(face => ({ face, depth: face.ids.reduce((s, id) => s + transformed[id].z, 0) / 4 })).sort((a, b) => a.depth - b.depth);
    const shadow = ctx.createRadialGradient(width * .5, height * .88, 3, width * .5, height * .88, width * .29);
    shadow.addColorStop(0, lightTheme ? 'rgba(60,40,86,.16)' : 'rgba(0,0,0,.3)');
    shadow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.translate(0, height * .7); ctx.scale(1, .23);
    ctx.fillStyle = shadow; ctx.fillRect(0, 0, width, height * 2); ctx.restore();
    for (const { face } of ordered) {
      const n = turn(face.n);
      const diffuse = Math.max(0, n[0] * lamp[0] + n[1] * lamp[1] + n[2] * lamp[2]);
      const specular = Math.pow(Math.max(0, n[0] * halfway[0] + n[1] * halfway[1] + n[2] * halfway[2]), 30);
      const rim = Math.pow(1 - Math.abs(n[2]), 3) * .18;
      const shade = .26 + diffuse * .70 + rim;
      const rgb = face.base.map(v => Math.min(255, Math.round(v * shade + specular * 91)));
      ctx.beginPath();
      face.ids.forEach((id, i) => { const p = transformed[id]; if (!i) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
      ctx.closePath();
      ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = .6;
      ctx.fill(); ctx.stroke();
    }
  }
  function tick(now) {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    // Keep decorative rendering bounded to 30fps, including high-refresh-rate displays.
    if (now - last < 33.3) return;
    const dt = last ? Math.min((now - last) / 1000, .07) : .033;
    last = now;
    phase += dt * .43;
    eased.x += (pointer.x - eased.x) * .065;
    eased.y += (pointer.y - eased.y) * .065;
    draw();
  }
  function sync() {
    const shouldRun = visible && !document.hidden && motionAllowed();
    if (shouldRun && !running) { running = true; last = 0; frame = requestAnimationFrame(tick); }
    else if (!shouldRun && running) { running = false; cancelAnimationFrame(frame); }
    if (!running && visible && !document.hidden) draw();
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    dpr = Math.min(devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    draw();
  }
  heroArt.addEventListener('pointermove', e => {
    if (!fine.matches || !motionAllowed() || e.pointerType === 'touch') return;
    const r = heroArt.getBoundingClientRect();
    pointer = { x: clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1), y: clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1) };
    heroArt.style.setProperty('--art-x', `${pointer.x * 12}px`);
    heroArt.style.setProperty('--art-y', `${pointer.y * 10}px`);
    heroArt.style.setProperty('--card-x', `${pointer.x * -6}px`);
    heroArt.style.setProperty('--card-y', `${pointer.y * -5}px`);
  }, { passive: true });
  heroArt.addEventListener('pointerleave', () => {
    pointer = { x: 0, y: 0 };
    ['--art-x','--art-y','--card-x','--card-y'].forEach(key => heroArt.style.setProperty(key, '0px'));
  });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else addEventListener('resize', resize, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .01 }).observe(heroArt);
  new MutationObserver(() => { lightTheme = html.dataset.theme === 'light'; sync(); scheduleScroll(); }).observe(html, { attributes: true, attributeFilter: ['class', 'data-theme'] });
  reduce.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  resize();
  heroArt.classList.add('kinetic-ready');
  sync();
})();
