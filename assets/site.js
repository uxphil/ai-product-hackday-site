/* Small, dependency-free helpers. No tracking, no network requests.
   Progress ticks are saved only in this browser (localStorage). */
(function () {
  'use strict';

  /* ---------- password gate (deterrent only: the check runs in the browser) ---------- */
  var GATE_HASH = 8532355685889679; // hash of the shared password; see site/README.md to change
  var GATE_KEY = 'hackday-unlocked';
  function hash(s) {
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  function store(kind, key, val) {
    try {
      var s = window[kind];
      if (val === undefined) return s.getItem(key);
      s.setItem(key, val);
    } catch (e) { return null; }
  }
  var root = document.documentElement;
  var STYLE_KEY = 'hackday-style';
  if (store('localStorage', STYLE_KEY) === 'clean') root.setAttribute('data-style', 'clean');
  if (GATE_HASH && store('sessionStorage', GATE_KEY) !== '1') root.classList.add('locked');

  function buildGate() {
    var gate = document.createElement('div');
    gate.className = 'gate';
    gate.innerHTML =
      '<form novalidate>' +
      '<h1 style="font-size:1.4rem;margin-top:0">AI Enabled Product Hackathon</h1>' +
      '<p>This preview is for invited participants. Enter the password you were given.</p>' +
      '<label for="gate-pw"><strong>Password</strong></label>' +
      '<input id="gate-pw" type="password" autocomplete="off" autofocus>' +
      '<p class="err" role="alert"></p>' +
      '<button class="btn" type="submit">Open the site</button>' +
      '</form>';
    document.body.appendChild(gate);
    var form = gate.querySelector('form');
    var input = gate.querySelector('input');
    var err = gate.querySelector('.err');
    input.focus();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (hash(input.value.trim().toLowerCase()) === GATE_HASH) {
        store('sessionStorage', GATE_KEY, '1');
        root.classList.remove('locked');
        gate.remove();
      } else {
        err.textContent = 'That password did not match. Please try again.';
        input.select();
      }
    });
  }

  /* ---------- progress ticks ---------- */
  var PKEY = 'hackday-progress';
  function readProgress() {
    try { return JSON.parse(store('localStorage', PKEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function writeProgress(p) { store('localStorage', PKEY, JSON.stringify(p)); }

  function initChecks() {
    var boxes = document.querySelectorAll('input[type="checkbox"][data-key]');
    if (!boxes.length) return;
    var saved = readProgress();
    var bar = document.querySelector('[data-progress]');
    var ready = document.querySelector('[data-ready]');
    function refresh() {
      var total = boxes.length, done = 0;
      boxes.forEach(function (b) {
        if (b.checked) done++;
        var li = b.closest('li');
        if (li && li.parentElement.classList.contains('steps')) li.classList.toggle('is-done', b.checked);
      });
      if (bar) {
        bar.querySelector('progress').value = done;
        bar.querySelector('progress').max = total;
        bar.querySelector('[data-count]').textContent = done + ' of ' + total + ' done';
      }
      if (ready) {
        ready.hidden = done < total;
        // finishing a warm-up route also ticks the "warm-up" step on the Get ready page
        var key = ready.dataset.completes;
        if (key) {
          var p = readProgress();
          if (done === total) p[key] = 1; else delete p[key];
          writeProgress(p);
        }
      }
    }
    boxes.forEach(function (b) {
      b.checked = !!saved[b.dataset.key];
      b.addEventListener('change', function () {
        var p = readProgress();
        if (b.checked) p[b.dataset.key] = 1; else delete p[b.dataset.key];
        writeProgress(p);
        refresh();
        if (b.checked) {
          var li = b.closest('li');
          if (li) {
            li.classList.remove('celebrate');
            void li.offsetWidth; // restart the animation if ticked again
            li.classList.add('celebrate');
            li.addEventListener('animationend', function () { li.classList.remove('celebrate'); }, { once: true });
          }
          var all = true;
          boxes.forEach(function (x) { if (!x.checked) all = false; });
          if (all) finale();
        }
      });
    });
    refresh();
  }

  /* ---------- finale: two confetti bursts and a lightbox that fades away (or "Let's go!") ---------- */
  var TROPHY = '<svg class="trophy" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2"/><path d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2"/>' +
    '<path d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3"/><path d="M4 22h16"/>' +
    '<path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/>' +
    '<path d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3"/></svg>';

  function finale() {
    if (document.querySelector('.lightbox')) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var opener = document.activeElement;
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML = '<div class="lightbox-card" role="dialog" aria-modal="true" aria-labelledby="lb-title">' +
      TROPHY + '<h2 id="lb-title">Well done, you’re ready for the hack!</h2>' +
      '<p>Your warm-up is done. See you on 28 October.</p>' +
      '<button type="button" class="btn">Let’s go!</button></div>';
    document.body.appendChild(box);
    var btn = box.querySelector('button');
    btn.focus();
    var closed = false, timer;
    function close() {
      if (closed) return;
      closed = true;
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      box.classList.add('leaving');
      setTimeout(function () { box.remove(); if (opener && opener.focus) opener.focus(); }, reduce ? 0 : 500);
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { e.preventDefault(); btn.focus(); } // single control: keep focus inside the dialog
    }
    btn.addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', onKey);
    timer = setTimeout(close, 9000);
    if (!reduce) confetti();
  }

  function confetti() {
    var canvas = document.createElement('canvas');
    canvas.className = 'confetti';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1, W, H;
    function size() { W = window.innerWidth; H = window.innerHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size();
    var cs = getComputedStyle(root);
    var colours = [cs.getPropertyValue('--accent').trim() || '#4d6b35', '#f4c542', '#ef6f6c', '#5aa9e6', '#b48ef0', '#ffffff'];
    var scale = Math.max(.75, Math.min(1.4, H / 800));
    var parts = [], BURSTS = [0, 1700], DURATION = 6200;
    // four cannons, one per corner, all firing together. Angles are in degrees, 0 = right, positive = downwards.
    var CANNONS = [
      { x: .05, y: 1.02, min: -75, max: -48 },  // bottom left, up and inwards
      { x: .95, y: 1.02, min: -132, max: -105 }, // bottom right
      { x: .05, y: -.02, min: 15, max: 50 },     // top left, down and inwards
      { x: .95, y: -.02, min: 130, max: 165 }    // top right
    ];
    function burst() {
      CANNONS.forEach(function (c) {
        for (var i = 0; i < 48; i++) {
          var angle = (c.min + Math.random() * (c.max - c.min)) * Math.PI / 180;
          var speed = (12 + Math.random() * 12) * scale;
          var big = 11 + Math.random() * 12; // noticeably bigger pieces
          parts.push({
            x: W * c.x, y: H * c.y,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            w: big, h: big * (.45 + Math.random() * .35), round: Math.random() < .25,
            rot: Math.random() * 6.28, vr: (Math.random() - .5) * .3,
            c: colours[Math.floor(Math.random() * colours.length)]
          });
        }
      });
    }
    BURSTS.forEach(function (ms) { setTimeout(burst, ms); });
    var start = null;
    function frame(t) {
      if (start === null) start = t;
      var el = t - start;
      ctx.clearRect(0, 0, W, H);
      var fade = el > DURATION - 1000 ? Math.max(0, (DURATION - el) / 1000) : 1;
      parts.forEach(function (p) {
        p.vy += .34; p.vx *= .99; p.vy *= .993;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2.4, 0, 6.283); ctx.fill(); }
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (el < DURATION) requestAnimationFrame(frame); else canvas.remove();
    }
    requestAnimationFrame(frame);
  }

  /* ---------- copy buttons ---------- */
  function initCopy() {
    document.querySelectorAll('button.copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.getElementById(btn.dataset.copy);
        if (!target) return;
        var text = target.innerText;
        function ok() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy'; }, 1800); }
        function fallback() {
          var range = document.createRange(); range.selectNodeContents(target);
          var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
          btn.textContent = 'Press Ctrl/Cmd+C';
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(ok, fallback);
        } else fallback();
      });
    });
  }

  /* ---------- Mac / Windows switch (both are shown if JavaScript is off) ---------- */
  function initOS() {
    var sw = document.querySelector('[data-os-switch]');
    if (!sw) return;
    var blocks = document.querySelectorAll('[data-os]');
    var choice = store('localStorage', 'hackday-os');
    if (choice !== 'mac' && choice !== 'win') {
      choice = /Mac/i.test(navigator.platform || navigator.userAgent) ? 'mac' : 'win';
    }
    function set(c) {
      blocks.forEach(function (b) { b.hidden = b.dataset.os !== c; });
      sw.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.set === c)); });
      store('localStorage', 'hackday-os', c);
    }
    sw.hidden = false;
    sw.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.set); }); });
    set(choice);
  }

  /* ---------- countdown (computed in the browser, nothing is sent anywhere) ---------- */
  function initCountdown() {
    document.querySelectorAll('[data-countdown]').forEach(function (el) {
      var target = new Date(el.dataset.countdown + 'T00:00:00');
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var days = Math.round((target - today) / 86400000);
      var out = el.querySelector('[data-days]');
      if (!out) return;
      if (days > 1) out.innerHTML = '<strong>' + days + ' days</strong> to go';
      else if (days === 1) out.innerHTML = '<strong>Tomorrow</strong>';
      else if (days === 0) out.innerHTML = '<strong>Today</strong>';
      else el.hidden = true;
    });
  }

  /* ---------- gentle reveal on scroll (skipped when reduced motion is requested) ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach(function (i) { i.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (i) { io.observe(i); });
  }

  /* ---------- theme toggle (bottom left): sage (default) or clean ---------- */
  function initTheme() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.innerHTML = '<span>Clean theme</span><span class="track" aria-hidden="true"></span>';
    function sync() { btn.setAttribute('aria-pressed', String(root.getAttribute('data-style') === 'clean')); }
    btn.addEventListener('click', function () {
      var clean = root.getAttribute('data-style') === 'clean';
      if (clean) root.removeAttribute('data-style'); else root.setAttribute('data-style', 'clean');
      store('localStorage', STYLE_KEY, clean ? 'sage' : 'clean');
      sync();
    });
    sync();
    document.body.appendChild(btn);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (root.classList.contains('locked')) buildGate();
    initTheme();
    initChecks(); initCopy(); initOS(); initCountdown(); initReveal();
  });
})();
