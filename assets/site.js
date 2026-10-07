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
      });
    });
    refresh();
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

  document.addEventListener('DOMContentLoaded', function () {
    if (root.classList.contains('locked')) buildGate();
    initChecks(); initCopy(); initOS(); initCountdown(); initReveal();
  });
})();
