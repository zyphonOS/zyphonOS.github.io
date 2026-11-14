/* AOSI measurement — first-party, no cookies, no PII, no third-party script.
 *
 * HONEST STATE: the sink is UNCONFIGURED. While it is null this file records events to
 * window.__aosi_events and SENDS NOTHING. It never pretends to transmit.
 * window.aosi.status() returns 'UNCONFIGURED' or 'LIVE' so any check can prove which.
 *
 * No cookies. No localStorage. No fingerprinting. No raw referrer — only direct/internal/external.
 * Consequence, stated plainly: without persistence there is NO cross-visit identity, so this
 * cannot measure returning visitors or retention by person. It measures behaviour per visit only.
 */
(function () {
  'use strict';

  var CONFIG = {
    site: 'aosi',
    brand: (document.body && document.body.getAttribute('data-brand')) || 'ecosystem',
    sink: null,           /* e.g. { url: 'https://collector.example/collect' } */
    debug: false
  };

  var events = [];
  var sent = 0;
  var failed = 0;
  var seen = Object.create(null);
  var t0 = Date.now();

  function bucketWidth(w) {
    if (w < 480) return 'xs';
    if (w < 768) return 'sm';
    if (w < 1024) return 'md';
    if (w < 1440) return 'lg';
    return 'xl';
  }

  function refBucket() {
    var r = document.referrer;
    if (!r) return 'direct';
    try {
      return new URL(r).hostname === location.hostname ? 'internal' : 'external';
    } catch (e) {
      return 'unknown';
    }
  }

  function once(key) {
    if (seen[key]) return false;
    seen[key] = 1;
    return true;
  }

  function track(name, props) {
    if (!name) return;
    var e = {
      n: name,
      t: Date.now(),
      p: location.pathname,
      b: CONFIG.brand,
      s: CONFIG.site,
      v: bucketWidth(window.innerWidth),
      r: refBucket(),
      d: props || {}
    };
    events.push(e);
    if (CONFIG.debug && window.console) window.console.log('[aosi]', name, e.d);

    if (!CONFIG.sink) return;   /* UNCONFIGURED — record locally, transmit nothing */

    try {
      var body = JSON.stringify(e);
      if (navigator.sendBeacon) {
        if (navigator.sendBeacon(CONFIG.sink.url, new Blob([body], { type: 'application/json' }))) sent++;
        else failed++;
      } else {
        fetch(CONFIG.sink.url, {
          method: 'POST', body: body, keepalive: true,
          headers: { 'Content-Type': 'application/json' }
        }).then(function () { sent++; }).catch(function () { failed++; });
      }
    } catch (err) {
      failed++;
    }
  }

  /* ---- view ---- */
  track('page_view');

  /* ---- scroll depth: 25 / 50 / 75 / 100, each once ---- */
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (max <= 0) { if (once('d100')) track('scroll_depth', { pct: 100 }); return; }
    var pct = Math.round(((h.scrollTop || document.body.scrollTop) / max) * 100);
    [25, 50, 75, 100].forEach(function (m) {
      if (pct >= m && once('d' + m)) track('scroll_depth', { pct: m });
    });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });

  /* ---- dwell milestones ---- */
  [15, 60].forEach(function (s) {
    window.setTimeout(function () { track('dwell', { seconds: s }); }, s * 1000);
  });

  /* ---- tagged interactions: <a data-track="label"> or <button data-track="label"> ---- */
  document.addEventListener('click', function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest('[data-track]') : null;
    if (!el) return;
    track('cta_click', {
      label: el.getAttribute('data-track'),
      href: el.getAttribute('href') || null
    });
  }, true);

  /* ---- exit, with dwell ---- */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && once('exit')) {
      track('exit', { ms: Date.now() - t0 });
    }
  });

  window.aosi = {
    track: track,
    events: function () { return events.slice(); },
    status: function () {
      return CONFIG.sink ? 'LIVE' : 'UNCONFIGURED';
    },
    counters: function () { return { queued: events.length, sent: sent, failed: failed }; },
    config: CONFIG
  };
})();
