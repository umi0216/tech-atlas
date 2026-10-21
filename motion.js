/* V2 motion layer. No dependencies, network requests or changes to study data. */
(() => {
  'use strict';
  const root = document.documentElement;
  const toggle = document.querySelector('#motionToggle');
  const hero = document.querySelector('.hero');
  const artwork = document.querySelector('.hero-art');
  const ambient = document.querySelector('.ambient');
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const preferenceKey = 'tech-atlas-motion';
  let preference = null;
  try { preference = localStorage.getItem(preferenceKey); } catch (_) { /* optional */ }
  let enabled = false;
  let heroVisible = true;
  let animationFrame = 0;
  let pointerFrame = 0;
  let scrollFrame = 0;
  let lastPaint = 0;
  let simulationTime = 0;
  let lastTick = 0;
  let canvas = null;
  let context = null;
  let width = 0;
  let height = 0;
  let stars = [];
  let pointerX = 0;
  let pointerY = 0;

  const revealTargets = [
    ...document.querySelectorAll('.hero-copy > *, .stat-card, .page-heading, .domain-shell, .map-reading-guide > p')
  ];
  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' }) : null;

  function prepareReveals() {
    revealTargets.forEach((element, index) => {
      element.classList.add('reveal-item');
      // Short stagger within a group; no long waits when jumping to a section.
      element.style.setProperty('--reveal-delay', `${Math.min(index % 5, 3) * 65}ms`);
      const alreadyOnScreen = element.getBoundingClientRect().top < innerHeight;
      if (!enabled || !revealObserver || (performance.now() > 1200 && alreadyOnScreen)) {
        element.classList.add('is-revealed');
      } else {
        revealObserver.observe(element);
      }
    });
    root.classList.add('motion-ready');
  }

  function showAllContent() {
    revealObserver?.disconnect();
    revealTargets.forEach(element => element.classList.add('is-revealed'));
  }

  function updateScrollProgress() {
    scrollFrame = 0;
    if (!enabled || document.hidden) return;
    const distance = document.documentElement.scrollHeight - innerHeight;
    root.style.setProperty('--reading-progress', distance > 0 ? Math.min(scrollY / distance, 1) : 0);
  }

  function resizeStars() {
    if (!canvas || !context) return;
    const bounds = ambient.getBoundingClientRect();
    width = Math.round(bounds.width);
    height = Math.round(bounds.height);
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = innerWidth < 600 ? 30 : 66;
    // This is decorative starlight, independent of the knowledge graph.
    stars = Array.from({ length: count }, (_, i) => ({
      x: ((i * 0.61803398875 + 0.13) % 1) * width,
      y: ((i * 0.41421356237 + 0.07) % 1) * height,
      radius: i % 7 === 0 ? 1.1 : 0.55,
      phase: i * 1.7,
      speed: 0.28 + (i % 5) * 0.04
    }));
  }

  function ensureCanvas() {
    if (canvas) { resizeStars(); return; }
    canvas = document.createElement('canvas');
    canvas.className = 'ambient-stars';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('role', 'presentation');
    ambient.append(canvas);
    context = canvas.getContext('2d');
    if (context) resizeStars();
  }

  function drawStars(now) {
    animationFrame = 0;
    if (!enabled || !heroVisible || document.hidden || !context) return;
    if (lastTick) simulationTime += Math.min(now - lastTick, 100);
    lastTick = now;
    // Draw at most 30 fps, including on 120/144 Hz screens.
    if (now - lastPaint >= 1000 / 30) {
      lastPaint = now;
      const seconds = simulationTime / 1000;
      context.clearRect(0, 0, width, height);
      for (const star of stars) {
        const x = (star.x + seconds * star.speed) % width;
        const alpha = 0.15 + (Math.sin(seconds * 0.45 + star.phase) + 1) * 0.12;
        context.beginPath();
        context.arc(x, star.y, star.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(193, 202, 243, ${alpha})`;
        context.fill();
      }
      // One quiet shooting star per cycle, limited to the illustration's side.
      const phase = seconds % 15;
      if (phase > 9 && phase < 10.6) {
        const t = (phase - 9) / 1.6;
        const x = width * 0.78 - t * 120;
        const y = height * 0.12 + t * 90;
        const gradient = context.createLinearGradient(x, y, x + 43, y - 31);
        gradient.addColorStop(0, `rgba(201, 189, 255, ${Math.sin(t * Math.PI) * 0.42})`);
        gradient.addColorStop(1, 'rgba(201, 189, 255, 0)');
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 43, y - 31);
        context.strokeStyle = gradient;
        context.lineWidth = 0.8;
        context.stroke();
      }
    }
    animationFrame = requestAnimationFrame(drawStars);
  }

  function resetPointer() {
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    artwork.style.setProperty('--parallax-x', '0px');
    artwork.style.setProperty('--parallax-y', '0px');
  }

  function syncPlayback() {
    const playing = enabled && heroVisible && !document.hidden;
    root.classList.toggle('motion-suspended', !playing);
    root.classList.toggle('motion-page-hidden', document.hidden);
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    lastTick = 0;
    if (playing) {
      ensureCanvas();
      if (context) animationFrame = requestAnimationFrame(drawStars);
    } else {
      resetPointer();
    }
  }

  function applyPreference() {
    // OS reduced-motion always wins, even if this browser previously saved "on".
    enabled = !systemMotion.matches && preference !== 'off';
    root.dataset.motion = enabled ? 'on' : 'off';
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? '关闭动效' : '开启动效');
    toggle.title = systemMotion.matches ? '已遵循系统的减少动态效果设置' : enabled ? '关闭动效' : '开启动效';
    toggle.disabled = systemMotion.matches;
    if (!enabled) showAllContent();
    syncPlayback();
    updateScrollProgress();
    window.dispatchEvent(new CustomEvent('atlas:motionchange', { detail: { enabled } }));
  }

  toggle.addEventListener('click', () => {
    preference = enabled ? 'off' : 'on';
    try { localStorage.setItem(preferenceKey, preference); } catch (_) { /* optional */ }
    applyPreference();
  });
  systemMotion.addEventListener('change', applyPreference);
  document.addEventListener('visibilitychange', () => { syncPlayback(); updateScrollProgress(); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
      syncPlayback();
    }, { rootMargin: '0px' }).observe(hero);
  }
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { if (enabled && !document.hidden) resizeStars(); }).observe(ambient);
  } else {
    window.addEventListener('resize', () => { if (enabled) resizeStars(); }, { passive: true });
  }
  window.addEventListener('scroll', () => {
    if (enabled && !document.hidden && !scrollFrame) scrollFrame = requestAnimationFrame(updateScrollProgress);
  }, { passive: true });
  artwork.addEventListener('pointermove', event => {
    if (!enabled || !heroVisible || !finePointer.matches || document.hidden) return;
    const bounds = artwork.getBoundingClientRect();
    pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
    pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 9;
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      artwork.style.setProperty('--parallax-x', `${pointerX.toFixed(2)}px`);
      artwork.style.setProperty('--parallax-y', `${pointerY.toFixed(2)}px`);
    });
  });
  artwork.addEventListener('pointerleave', resetPointer);

  applyPreference();
  prepareReveals();
})();
