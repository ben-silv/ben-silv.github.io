/* ===========================================================================
   app.js — the only JavaScript on the site.

   Everything here is about touch. Things a visitor can put a pointer on move
   on springs, never on fixed-length animations, for one reason: a spring can
   be grabbed mid-flight and sent somewhere else, and it carries on from where
   it actually is, at the speed it was actually going. A timed animation can
   only finish or jump.

     1. Springs, and the two bits of gesture maths they need.
     2. Every control answers on pointer-down, with a light under the pointer.
     3. The masthead's edge, for browsers without scroll timelines.
     4. One highlight gliding down the list of sections on Home.
     5. The corner "At a glance" button, which opens the summary panel.
     6. Photographs, which open out of the page and can be flicked shut.
     7. The optional effects (see FX in tools/render.py).

   Copy is never written here. The sheet reads the same strings the pages were
   generated from, embedded as JSON by tools/render.py. Without JavaScript the
   corner button is a link to the same summary at the foot of the page.
   =========================================================================== */

(function () {
  'use strict';

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function still() { return motionQuery.matches; }

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---- 1. springs -------------------------------------------------------
     Described the way Apple describes them, by two numbers a designer can
     reason about rather than mass, stiffness and damping:
       damping   1 settles without overshoot; below 1 it overshoots, lower
                 is bouncier
       response  roughly how long, in seconds, it takes to get there
     A spring has no duration. Changing its target mid-flight keeps its
     position and velocity, which is the whole point.                     */

  var active = new Set();
  var pending = new Set();
  var frame = 0;
  var lastTime = 0;

  function Spring(opts) {
    this.value = opts.value || 0;
    this.target = this.value;
    this.velocity = 0;
    this.damping = opts.damping == null ? 1 : opts.damping;
    this.response = opts.response || 0.4;
    this.precision = opts.precision || 0.01;
    this.onUpdate = opts.onUpdate || null;
    this.onRest = opts.onRest || null;
  }

  /* Head for `target` from wherever the value is now. Pass the gesture's
     velocity to carry it straight into the motion. */
  Spring.prototype.to = function (target, opts) {
    opts = opts || {};
    if (opts.velocity != null) this.velocity = opts.velocity;
    if (opts.damping != null) this.damping = opts.damping;
    if (opts.response != null) this.response = opts.response;
    this.target = target;
    if (still()) {
      this.value = target;
      this.velocity = 0;
      active.delete(this);
      if (this.onUpdate) this.onUpdate();
      if (this.onRest) this.onRest();
      return this;
    }
    active.add(this);
    kick();
    return this;
  };

  /* Put the value somewhere directly, as a finger does. No animation, and the
     screen is updated now rather than next frame: the fastest path from a
     pointer event to pixels is the one with nothing in it. */
  Spring.prototype.set = function (value) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
    active.delete(this);
    if (this.onUpdate) this.onUpdate();
    return this;
  };

  Spring.prototype.moving = function () { return active.has(this); };

  Spring.prototype.step = function (dt) {
    var w = 2 * Math.PI / this.response;
    var k = w * w;
    var c = 2 * this.damping * w;
    var n = Math.ceil(dt * 240);
    var h = dt / n;
    for (var i = 0; i < n; i++) {
      var a = -k * (this.value - this.target) - c * this.velocity;
      this.velocity += a * h;
      this.value += this.velocity * h;
    }
    if (Math.abs(this.value - this.target) < this.precision &&
        Math.abs(this.velocity) < this.precision * 10) {
      this.value = this.target;
      this.velocity = 0;
      return true;
    }
    return false;
  };

  function tick(now) {
    frame = 0;
    var dt = clamp((now - lastTime) / 1000, 0.001, 0.064);
    lastTime = now;
    var rested = [];
    active.forEach(function (s) {
      if (s.step(dt)) { active.delete(s); rested.push(s); }
      if (s.onUpdate) pending.add(s.onUpdate);
    });
    // Several springs often drive one element; draw it once per frame.
    var draws = Array.from(pending);
    pending.clear();
    draws.forEach(function (fn) { fn(); });
    rested.forEach(function (s) { if (s.onRest) s.onRest(); });
    if (active.size) frame = requestAnimationFrame(tick);
  }

  function kick() {
    if (frame) return;
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  }

  /* Velocity from the last tenth of a second of pointer positions. A finger
     that stopped before it let go has no velocity, whatever came before. */
  function Tracker() { this.samples = []; }
  Tracker.prototype.add = function (x, y, t) {
    var s = this.samples;
    s.push({ x: x, y: y, t: t });
    while (s.length > 2 && t - s[0].t > 100) s.shift();
  };
  Tracker.prototype.velocity = function () {
    var s = this.samples;
    if (s.length < 2) return { x: 0, y: 0 };
    var a = s[0], b = s[s.length - 1];
    var dt = (b.t - a.t) / 1000;
    if (dt <= 0 || performance.now() - b.t > 80) return { x: 0, y: 0 };
    return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt };
  };

  /* Where a flick would come to rest if nothing stopped it — the same
     exponential deceleration a scroll view uses. Targets are chosen from
     this, not from where the pointer happened to let go. */
  function project(velocity, rate) {
    rate = rate || 0.998;
    return (velocity / 1000) * rate / (1 - rate);
  }

  /* Past an edge, follow less and less: there is nothing more here, but the
     page has not frozen. */
  function rubberband(over, size) {
    var c = 0.55;
    return (over * size * c) / (size + c * Math.abs(over));
  }

  /* Whether an optional effect is switched on. See FX in tools/render.py. */
  function fx(name) {
    return (' ' + (document.documentElement.getAttribute('data-fx') || '') + ' ').indexOf(' ' + name + ' ') > -1;
  }

  /* A tap of vibration, for the moments something snaps into place. */
  function buzz(ms) {
    if (!fx('haptics') || still() || !navigator.vibrate) return;
    try { navigator.vibrate(ms || 8); } catch (e) {}
  }

  var CLOSE_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">' +
    '<path d="M7 7l10 10"></path><path d="M17 7 7 17"></path></svg>';

  var root = document.documentElement;
  var page = document.querySelector('.page');
  var opener = document.querySelector('[data-glance-open]');

  /* Locking the page while something is open over it. */
  var locks = 0;
  function lockScroll(on) {
    locks += on ? 1 : -1;
    document.body.style.overflow = locks > 0 ? 'hidden' : '';
  }

  /* ---- 2. the press ------------------------------------------------------
     The feedback is in CSS (motion.css), on :active, so it lands the moment
     the pointer goes down. This only tells each control where the pointer is
     so the light can sit under it. iOS will not apply :active at all unless
     something is listening for touches, hence the empty listener.          */

  var PRESSABLE = '.btn, .theme';

  function trackLight(event) {
    var el = event.target.closest ? event.target.closest(PRESSABLE) : null;
    if (!el) return;
    var box = el.getBoundingClientRect();
    el.style.setProperty('--px', ((event.clientX - box.left) / box.width) * 100 + '%');
    el.style.setProperty('--py', ((event.clientY - box.top) / box.height) * 100 + '%');
  }
  document.addEventListener('pointermove', trackLight, { passive: true });
  document.addEventListener('pointerdown', trackLight, { passive: true });
  document.addEventListener('touchstart', function () {}, { passive: true });

  /* ---- 3. the masthead's edge ------------------------------------------ */

  var masthead = document.querySelector('.masthead');
  if (masthead && !(window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()'))) {
    var under = function () {
      if (window.scrollY > 4) masthead.setAttribute('data-under', '');
      else masthead.removeAttribute('data-under');
    };
    window.addEventListener('scroll', under, { passive: true });
    under();
  }

  /* ---- 4. the gliding highlight ----------------------------------------- */

  var doors = document.querySelector('.doors');
  if (doors) {
    var glow = document.createElement('span');
    glow.className = 'doors__glow';
    glow.setAttribute('aria-hidden', 'true');
    doors.insertBefore(glow, doors.firstChild);

    var drawGlow = function () {
      glow.style.transform = 'translateY(' + glowY.value + 'px)';
      glow.style.height = glowH.value + 'px';
      glow.style.opacity = clamp(glowO.value, 0, 1);
    };
    var glowY = new Spring({ response: 0.32, damping: 0.86, precision: 0.1, onUpdate: drawGlow });
    var glowH = new Spring({ response: 0.32, damping: 0.86, precision: 0.1, onUpdate: drawGlow });
    var glowO = new Spring({ response: 0.22, precision: 0.005, onUpdate: drawGlow });

    var showGlow = function (door) {
      // Arriving from nowhere it appears in place; only between rows does it travel.
      if (glowO.value < 0.05) {
        glowY.set(door.offsetTop);
        glowH.set(door.offsetHeight);
      } else {
        glowY.to(door.offsetTop);
        glowH.to(door.offsetHeight);
      }
      glowO.to(1);
    };

    doors.addEventListener('pointerover', function (event) {
      if (event.pointerType !== 'mouse') return;
      var door = event.target.closest('.door');
      if (door) showGlow(door);
    });
    doors.addEventListener('pointerleave', function () {
      if (!doors.contains(document.activeElement)) glowO.to(0);
    });
    doors.addEventListener('focusin', function (event) {
      var door = event.target.closest('.door');
      if (door) showGlow(door);
    });
    doors.addEventListener('focusout', function (event) {
      if (!doors.contains(event.relatedTarget)) glowO.to(0);
    });
  }

  /* ---- 5. the summary panel ---------------------------------------------
     The corner "At a glance" link becomes an overlay panel (React). Without
     JavaScript the same link jumps to the same summary, rendered inline at
     the foot of every page. Nothing is lost, it just doesn't animate.     */

  function readData() {
    var node = document.getElementById('glance-data');
    if (!node) return null;
    try {
      return JSON.parse(node.textContent);
    } catch (err) {
      return null;
    }
  }

  var data = readData();
  var mount = document.getElementById('glance-root');

  if (data && opener && mount && window.React && window.ReactDOM) {
    root.setAttribute('data-glance', 'overlay');
    startPanel();
  }

  function startPanel() {
    var React = window.React;
    var h = React.createElement;

    function CloseIcon() {
      return h('svg', {
        width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round',
        'aria-hidden': 'true'
      }, h('path', { d: 'M7 7l10 10' }), h('path', { d: 'M17 7 7 17' }));
    }

    function Column(props) {
      var col = props.col;
      var className = 'glance__col' + (col.accent ? ' glance__col--' + col.accent : '');
      return h('section', { className: className },
        h('h3', null, col.heading),
        h('div', { className: 'glance__items' },
          col.items.map(function (item, i) {
            return h('div', { key: i },
              h('strong', { dangerouslySetInnerHTML: { __html: item.head } }),
              h('span', { dangerouslySetInnerHTML: { __html: item.body } })
            );
          })
        ),
        col.link ? h('a', { className: 'glance__more', href: col.link.href }, col.link.label) : null
      );
    }

    function Panel(props) {
      var closing = props.closing;
      var sheet = React.useRef(null);
      var closeBtn = React.useRef(null);

      /* The button is the hinge. Before the first paint, measure where it sits
         what size it is next to the panel, and hand both to CSS — the panel then
         starts as that exact rectangle, in that exact spot, and grows out of it,
         wherever the button sits on this page and at this width. Measuring
         has to happen before the opening animation is switched on, or the rect
         comes back already scaled down. */
      React.useLayoutEffect(function () {
        var el = sheet.current;
        if (!el) return;
        var from = opener.getBoundingClientRect();
        var to = el.getBoundingClientRect();
        var sx = Math.max(0.04, from.width / to.width);
        var sy = Math.max(0.04, from.height / to.height);
        /* Scaling about a point leaves that point still. Put it here and the
           shrunk panel lands exactly on the button rather than merely near it:
           solve P + s(0 - P) = offset for P. */
        el.style.setProperty('--door-x', (from.left - to.left) / (1 - sx) + 'px');
        el.style.setProperty('--door-y', (from.top - to.top) / (1 - sy) + 'px');
        el.style.setProperty('--door-sx', sx);
        el.style.setProperty('--door-sy', sy);
        el.setAttribute('data-door', 'open');
      }, []);

      React.useEffect(function () {
        if (closeBtn.current) closeBtn.current.focus();

        /* The corner button steps aside while the panel it turned into is open. */
        root.setAttribute('data-glance-state', 'open');

        function onKey(event) {
          if (event.key === 'Escape') {
            event.preventDefault();
            props.onRequestClose();
            return;
          }
          if (event.key !== 'Tab' || !sheet.current) return;
          var focusable = sheet.current.querySelectorAll('a[href], button:not([disabled])');
          if (!focusable.length) return;
          var first = focusable[0];
          var last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }

        document.addEventListener('keydown', onKey);
        lockScroll(true);
        return function () {
          document.removeEventListener('keydown', onKey);
          lockScroll(false);
          root.removeAttribute('data-glance-state');
        };
      }, []);

      return h('div', {
        className: 'glance-overlay',
        'data-closing': closing ? 'true' : 'false'
      },
        h('button', {
          type: 'button',
          className: 'glance-scrim',
          'aria-label': 'Close the summary',
          onClick: props.onRequestClose
        }),
        h('div', {
          className: 'glance glance-sheet',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': 'glance-overlay-title',
          ref: sheet
        },
          h('div', { className: 'glance__head' },
            h('div', null,
              h('h2', { className: 'glance__title', id: 'glance-overlay-title' }, data.heading),
              h('p', { className: 'glance__lead' }, data.lead)
            ),
            h('button', {
              type: 'button',
              className: 'glance__close',
              'aria-label': 'Close the summary',
              onClick: props.onRequestClose,
              ref: closeBtn
            }, h(CloseIcon))
          ),
          h('div', { className: 'glance__grid' },
            data.columns.map(function (col, i) { return h(Column, { key: i, col: col }); })
          ),
          h('div', { className: 'glance__foot' },
            h('p', null,
              data.footerNote + ' ',
              h('a', { className: 'mark', href: 'mailto:' + data.email }, data.email)
            ),
            h('div', { className: 'actions' },
              data.actions.map(function (action, i) {
                return h('a', {
                  key: i,
                  className: 'btn ' + (action.primary ? 'btn--primary' : 'btn--on-dark'),
                  href: action.href
                }, action.label);
              })
            )
          )
        )
      );
    }

    function App() {
      var state = React.useState({ open: false, closing: false });
      var view = state[0];
      var setView = state[1];

      React.useEffect(function () {
        function onOpen(event) {
          event.preventDefault();
          setView({ open: true, closing: false });
        }
        opener.addEventListener('click', onOpen);
        return function () { opener.removeEventListener('click', onOpen); };
      }, []);

      function requestClose() {
        if (still()) {
          setView({ open: false, closing: false });
          opener.focus();
          return;
        }
        setView({ open: true, closing: true });
        window.setTimeout(function () {
          setView({ open: false, closing: false });
          opener.focus();
        }, 260);
      }

      if (!view.open) return null;
      return h(Panel, { closing: view.closing, onRequestClose: requestClose });
    }

    if (window.ReactDOM.createRoot) {
      window.ReactDOM.createRoot(mount).render(h(App));
    } else {
      window.ReactDOM.render(h(App), mount);
    }
  }

  /* ---- 6. photographs ---------------------------------------------------
     Open one and it grows out of the page from exactly where it sat — the
     cropped square opening out into the whole picture — and the page darkens
     behind it. Drag it anywhere: it follows, shrinks a little, and the dark
     thins out as it goes. Throw it and it flies back into its slot, carrying
     the throw; let go gently and it settles back to the middle. X and Y are
     separate springs, so a diagonal throw lands true.                     */

  var photos = document.querySelectorAll('.shot img, .versus img');
  if (photos.length) startPhotos(photos);

  function startPhotos(list) {
    var view = null;

    var grow = new Spring({ response: 0.45, precision: 0.0005, onUpdate: drawPhoto, onRest: photoSettled });
    var px = new Spring({ response: 0.35, damping: 0.85, precision: 0.1, onUpdate: drawPhoto, onRest: photoSettled });
    var py = new Spring({ response: 0.35, damping: 0.85, precision: 0.1, onUpdate: drawPhoto, onRest: photoSettled });

    // Where in the picture the thumbnail's crop sits, as fractions.
    function crop(img) {
      var pos = getComputedStyle(img).objectPosition.split(' ');
      function part(v) { return /%$/.test(v) ? clamp(parseFloat(v) / 100, 0, 1) : 0.5; }
      return { x: part(pos[0] || '50%'), y: part(pos[1] || '50%') };
    }

    function fit(img) {
      var vw = root.clientWidth, vh = window.innerHeight;
      var m = vw <= 900 ? 16 : 56;
      var nw = img.naturalWidth || img.width, nh = img.naturalHeight || img.height;
      var s = Math.min((vw - 2 * m) / nw, (vh - 2 * m) / nh, 1.6);
      var w = nw * s, hgt = nh * s;
      return { left: (vw - w) / 2, top: (vh - hgt) / 2, width: w, height: hgt };
    }

    function drawPhoto() {
      if (!view) return;
      var p = Math.max(grow.value, 0);
      var q = clamp(grow.value, 0, 1);
      var src = view.from, end = view.to;
      var x = px.value, y = py.value;

      if (still()) {
        view.img.style.transform = 'translate3d(' + end.left + 'px,' + end.top + 'px,0)';
        view.img.style.clipPath = 'none';
        view.img.style.opacity = q;
        view.scrim.style.opacity = q;
        view.close.style.opacity = q;
        return;
      }

      // The thumbnail is a crop of the picture (object-fit: cover), not
      // always from the middle. Start the full picture scaled to cover that
      // box, placed and clipped so exactly the cropped part shows where the
      // thumbnail was, then open both out together.
      var cover = Math.max(src.width / end.width, src.height / end.height);
      var cropX = Math.max(0, end.width - src.width / cover);
      var cropY = Math.max(0, end.height - src.height / cover);
      var left0 = cropX * view.ox, top0 = cropY * view.oy;
      var il = lerp(left0, 0, p), ir = lerp(cropX - left0, 0, p);
      var it = lerp(top0, 0, p), ib = lerp(cropY - top0, 0, p);
      var s = lerp(cover, 1, p);
      var tx = lerp(src.left - left0 * cover, end.left, p);
      var ty = lerp(src.top - top0 * cover, end.top, p);
      // Dragged away from the middle, it shrinks about its own centre.
      var k = lerp(1, 1 - Math.min(0.3, Math.hypot(x, y) / 1600), q);
      var vx = tx + (il + (end.width - il - ir) / 2) * s;
      var vy = ty + (it + (end.height - it - ib) / 2) * s;
      tx = vx + (tx - vx) * k + x;
      ty = vy + (ty - vy) * k + y;
      s *= k;
      view.img.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) scale(' + s + ')';
      view.img.style.clipPath = 'inset(' + it + 'px ' + ir + 'px ' + ib + 'px ' + il + 'px round ' + 4 / s + 'px)';
      var dist = Math.hypot(x, y);

      var fade = q * (1 - clamp(dist / 500, 0, 0.85));
      view.scrim.style.opacity = fade;
      view.close.style.opacity = fade;
    }

    function photoSettled() {
      if (!view || grow.target !== 0 || grow.moving() || px.moving() || py.moving()) return;
      var v = view;
      view = null;
      v.source.style.visibility = '';
      v.layer.remove();
      document.removeEventListener('keydown', v.onKey);
      lockScroll(false);
      v.source.focus({ preventScroll: true });
    }

    function openPhoto(img) {
      if (view) return;
      var layer = document.createElement('div');
      layer.className = 'zoomer';
      layer.setAttribute('role', 'dialog');
      layer.setAttribute('aria-modal', 'true');
      layer.setAttribute('aria-label', img.alt);
      layer.innerHTML = '<div class="zoomer__scrim"></div>' +
        '<button type="button" class="glance__close" aria-label="Close the photo">' + CLOSE_ICON + '</button>';
      var big = document.createElement('img');
      big.className = 'zoomer__img';
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      big.draggable = false;
      var end = fit(img);
      big.style.width = end.width + 'px';
      big.style.height = end.height + 'px';
      layer.insertBefore(big, layer.lastChild);
      document.body.appendChild(layer);

      view = {
        source: img,
        layer: layer,
        img: big,
        scrim: layer.firstChild,
        close: layer.lastChild,
        from: img.getBoundingClientRect(),
        to: end,
        ox: crop(img).x,
        oy: crop(img).y,
        onKey: function (event) {
          if (event.key === 'Escape') { event.preventDefault(); shut(); }
          if (event.key === 'Tab') { event.preventDefault(); view.close.focus(); }
        }
      };
      img.style.visibility = 'hidden';
      lockScroll(true);
      document.addEventListener('keydown', view.onKey);
      view.close.addEventListener('click', function () { shut(); });
      view.scrim.addEventListener('click', function () { shut(); });
      bindPhotoDrag(layer, big);

      grow.set(0);
      px.set(0);
      py.set(0);
      grow.to(1, { response: 0.45, damping: 1 });
      view.close.focus({ preventScroll: true });
    }

    function shut(vx, vy) {
      if (!view) return;
      // Where it goes back to, measured now: the page may have reflowed.
      view.from = view.source.getBoundingClientRect();
      var c = crop(view.source);
      view.ox = c.x;
      view.oy = c.y;
      grow.to(0, { response: 0.4, damping: 1 });
      px.to(0, { velocity: vx || 0, response: 0.4, damping: 1 });
      py.to(0, { velocity: vy || 0, response: 0.4, damping: 1 });
    }

    function bindPhotoDrag(layer, big) {
      var g = null;
      big.addEventListener('pointerdown', function (event) {
        if (event.button !== 0) return;
        g = { id: event.pointerId, x0: event.clientX - px.value, y0: event.clientY - py.value,
              sx: event.clientX, sy: event.clientY, moved: false, tracker: new Tracker() };
        g.tracker.add(event.clientX, event.clientY, event.timeStamp);
        big.setPointerCapture(event.pointerId);
        px.set(px.value);
        py.set(py.value);
      });
      big.addEventListener('pointermove', function (event) {
        if (!g || event.pointerId !== g.id) return;
        g.tracker.add(event.clientX, event.clientY, event.timeStamp);
        if (!g.moved && Math.hypot(event.clientX - g.sx, event.clientY - g.sy) < 8) return;
        if (!g.moved) { g.moved = true; layer.setAttribute('data-dragging', ''); }
        px.set(event.clientX - g.x0);
        py.set(event.clientY - g.y0);
      });
      function up(event) {
        if (!g || event.pointerId !== g.id) return;
        var was = g;
        g = null;
        layer.removeAttribute('data-dragging');
        // A tap on the picture puts it back.
        if (!was.moved) { shut(); return; }
        var v = event.type === 'pointercancel' ? { x: 0, y: 0 } : was.tracker.velocity();
        var lx = px.value + project(v.x), ly = py.value + project(v.y);
        if (Math.hypot(lx, ly) > 160) { buzz(); shut(v.x, v.y); }
        else {
          px.to(0, { velocity: v.x, response: 0.35, damping: 0.85 });
          py.to(0, { velocity: v.y, response: 0.35, damping: 0.85 });
        }
      }
      big.addEventListener('pointerup', up);
      big.addEventListener('pointercancel', up);
    }

    Array.prototype.forEach.call(list, function (img) {
      img.setAttribute('data-zoomable', '');
      img.tabIndex = 0;
      img.setAttribute('aria-haspopup', 'dialog');
      img.addEventListener('click', function () { openPhoto(img); });
      img.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPhoto(img);
        }
      });
    });
  }
  /* ---- 7. the optional effects -------------------------------------------
     Each one checks its own switch (fx('name')) at the moment it would act,
     so the ?fx panel can turn any of them on and off without a reload.   */

  /* large-title: the page's title moves into the header once the big one
     has gone up underneath it. */
  (function () {
    var big = document.querySelector('.main--home .name, .page-title');
    if (!masthead || !big || !('IntersectionObserver' in window)) return;
    var watch = new IntersectionObserver(function (entries) {
      var e = entries[entries.length - 1];
      masthead.toggleAttribute('data-titled', !e.isIntersecting && e.boundingClientRect.top < masthead.offsetHeight);
    }, { rootMargin: '-' + masthead.offsetHeight + 'px 0px 0px 0px' });
    watch.observe(big);
  })();

  /* magnetic: a button leans a little toward the pointer over it, and
     springs back — with a wobble, because it was pulled — when it leaves. */
  (function () {
    var LEANS = '.btn, .theme';
    var pulls = new WeakMap();
    function springsFor(el) {
      var m = pulls.get(el);
      if (m) return m;
      var draw = function () { el.style.translate = m.x.value.toFixed(2) + 'px ' + m.y.value.toFixed(2) + 'px'; };
      m = {
        x: new Spring({ response: 0.3, damping: 0.55, precision: 0.05, onUpdate: draw }),
        y: new Spring({ response: 0.3, damping: 0.55, precision: 0.05, onUpdate: draw })
      };
      pulls.set(el, m);
      return m;
    }
    document.addEventListener('pointermove', function (event) {
      if (event.pointerType !== 'mouse' || !fx('magnetic') || still()) return;
      var el = event.target.closest ? event.target.closest(LEANS) : null;
      if (!el) return;
      var m = springsFor(el);
      var box = el.getBoundingClientRect();
      var cx = box.left + box.width / 2 - m.x.value;
      var cy = box.top + box.height / 2 - m.y.value;
      m.x.to((event.clientX - cx) * 0.22);
      m.y.to((event.clientY - cy) * 0.32);
    }, { passive: true });
    document.addEventListener('pointerout', function (event) {
      var el = event.target.closest ? event.target.closest(LEANS) : null;
      if (!el || (event.relatedTarget && el.contains(event.relatedTarget))) return;
      var m = pulls.get(el);
      if (m) { m.x.to(0); m.y.to(0); }
    });
  })();

  /* tilt: a photograph tips toward the pointer like a card held in the hand,
     with a light sliding across it — the Apple TV poster effect. */
  (function () {
    var cards = new WeakMap();
    function cardFor(fig, img) {
      var c = cards.get(fig);
      if (c) return c;
      var glare = document.createElement('span');
      glare.className = 'glare';
      glare.setAttribute('aria-hidden', 'true');
      fig.appendChild(glare);
      var draw = function () {
        var lift = clamp(c.lift.value, 0, 1);
        fig.style.transform = lift < 0.001 && Math.abs(c.rx.value) < 0.01 && Math.abs(c.ry.value) < 0.01 ? '' :
          'perspective(900px) rotateX(' + c.rx.value + 'deg) rotateY(' + c.ry.value + 'deg) scale(' + (1 + 0.035 * lift) + ')';
        glare.style.opacity = lift;
      };
      c = {
        glare: glare,
        rx: new Spring({ response: 0.35, damping: 0.75, precision: 0.01, onUpdate: draw }),
        ry: new Spring({ response: 0.35, damping: 0.75, precision: 0.01, onUpdate: draw }),
        lift: new Spring({ response: 0.3, precision: 0.002, onUpdate: draw })
      };
      cards.set(fig, c);
      return c;
    }
    document.addEventListener('pointermove', function (event) {
      if (event.pointerType !== 'mouse' || !fx('tilt') || still()) return;
      var fig = event.target.closest ? event.target.closest('.shot, .versus') : null;
      var img = fig && fig.querySelector('img');
      if (!img || event.target !== img) return;
      var c = cardFor(fig, img);
      var r = img.getBoundingClientRect();
      var nx = clamp((event.clientX - r.left) / r.width, 0, 1) - 0.5;
      var ny = clamp((event.clientY - r.top) / r.height, 0, 1) - 0.5;
      c.glare.style.left = img.offsetLeft + 'px';
      c.glare.style.top = img.offsetTop + 'px';
      c.glare.style.width = img.offsetWidth + 'px';
      c.glare.style.height = img.offsetHeight + 'px';
      c.glare.style.setProperty('--gx', (nx + 0.5) * 100 + '%');
      c.glare.style.setProperty('--gy', (ny + 0.5) * 100 + '%');
      c.rx.to(-ny * 14);
      c.ry.to(nx * 16);
      c.lift.to(1);
    }, { passive: true });
    document.addEventListener('pointerout', function (event) {
      if (!event.target.matches || !event.target.matches('.shot img, .versus img')) return;
      var c = cards.get(event.target.closest('.shot, .versus'));
      if (c) { c.rx.to(0); c.ry.to(0); c.lift.to(0); }
    });
    // Opening a photo should not leave its card tipped over behind it.
    document.addEventListener('click', function (event) {
      var fig = event.target.closest ? event.target.closest('.shot, .versus') : null;
      var c = fig && cards.get(fig);
      if (c) { c.rx.set(0); c.ry.set(0); c.lift.set(0); }
    }, true);
  })();

  /* dock-name: the letters of the name swell under the pointer and their
     neighbours swell a little less, the way icons do in the Dock. */
  (function () {
    var name = document.querySelector('.main--home .name');
    var area = document.querySelector('.main--home');
    if (!name || !area) return;
    var chars = Array.prototype.slice.call(name.querySelectorAll('.ch'));
    var springs = chars.map(function (ch) {
      ch.style.transformOrigin = '50% 90%';
      var s = new Spring({
        value: 1, response: 0.26, damping: 0.72, precision: 0.001,
        onUpdate: function () {
          ch.style.scale = s.value === 1 ? '' : s.value;
          ch.style.translate = s.value === 1 ? '' : '0 ' + (-(s.value - 1) * 0.25).toFixed(3) + 'em';
        }
      });
      return s;
    });
    function rest() { springs.forEach(function (s) { s.to(1); }); }
    area.addEventListener('pointermove', function (event) {
      if (event.pointerType !== 'mouse' || !fx('dock-name') || still()) return;
      var box = name.getBoundingClientRect();
      if (event.clientY < box.top - 50 || event.clientY > box.bottom + 30) { rest(); return; }
      var centres = chars.map(function (ch) {
        var r = ch.getBoundingClientRect();
        return r.left + r.width / 2;
      });
      centres.forEach(function (x, i) {
        var d = event.clientX - x;
        springs[i].to(1 + 0.34 * Math.exp(-(d * d) / (2 * 52 * 52)));
      });
    }, { passive: true });
    area.addEventListener('pointerleave', rest);
  })();

  /* spotlight: / or Ctrl K anywhere, or the magnifier in the header. */
  (function () {
    var items = data && data.search;
    var trigger = document.querySelector('[data-spotlight-open]');
    if (!items || !items.length) return;
    if (trigger) trigger.hidden = false;

    var layer = null, input = null, list = null, results = [], sel = 0, before = null;

    function score(item, q) {
      if (!q) return item.kind === 'page' ? 2 : 0;
      var title = item.title.toLowerCase();
      var all = title + ' ' + (item.body + ' ' + item.kind).toLowerCase();
      if (title.indexOf(q) === 0) return 4;
      if (title.indexOf(q) > -1) return 3;
      return q.split(/\s+/).every(function (w) { return all.indexOf(w) > -1; }) ? 1 : 0;
    }

    function pick(i) {
      sel = i;
      Array.prototype.forEach.call(list.children, function (li, n) {
        li.setAttribute('aria-selected', n === sel ? 'true' : 'false');
      });
      if (list.children[sel]) {
        input.setAttribute('aria-activedescendant', list.children[sel].id);
        list.children[sel].scrollIntoView({ block: 'nearest' });
      }
    }

    function render() {
      var q = input.value.trim().toLowerCase();
      results = items.map(function (it, i) { return { it: it, s: score(it, q), i: i }; })
        .filter(function (r) { return r.s > 0; })
        .sort(function (a, b) { return b.s - a.s || a.i - b.i; })
        .slice(0, 8)
        .map(function (r) { return r.it; });
      list.innerHTML = '';
      results.forEach(function (it, i) {
        var li = document.createElement('li');
        li.className = 'spot__item';
        li.id = 'spot-' + i;
        li.setAttribute('role', 'option');
        var a = document.createElement('a');
        a.href = it.href;
        a.tabIndex = -1;
        var strong = document.createElement('strong');
        strong.textContent = it.title;
        var span = document.createElement('span');
        span.textContent = it.body;
        var em = document.createElement('em');
        em.textContent = it.kind === 'page' || it.kind === 'link' ? '' : it.kind;
        a.appendChild(strong);
        a.appendChild(span);
        a.appendChild(em);
        a.addEventListener('pointermove', function () { if (sel !== i) pick(i); });
        li.appendChild(a);
        list.appendChild(li);
      });
      pick(0);
    }

    function open() {
      if (layer || !fx('spotlight')) return;
      before = document.activeElement;
      layer = document.createElement('div');
      layer.className = 'spot';
      layer.innerHTML =
        '<div class="spot__scrim"></div>' +
        '<div class="spot__panel" role="dialog" aria-modal="true">' +
          '<div class="spot__field">' + (trigger ? trigger.innerHTML : '') +
            '<input type="text" role="combobox" aria-expanded="true" aria-controls="spot-list" ' +
            'autocomplete="off" spellcheck="false"></div>' +
          '<ul class="spot__list" id="spot-list" role="listbox"></ul>' +
        '</div>';
      document.body.appendChild(layer);
      input = layer.querySelector('input');
      list = layer.querySelector('ul');
      input.placeholder = data.searchPlaceholder || '';
      input.setAttribute('aria-label', data.searchPlaceholder || '');
      layer.querySelector('.spot__panel').setAttribute('aria-label', trigger ? trigger.getAttribute('aria-label') : '');
      layer.firstChild.addEventListener('click', function () { close(); });
      input.addEventListener('input', render);
      lockScroll(true);
      render();
      input.focus();
    }

    function close(leaving) {
      if (!layer) return;
      var gone = layer;
      layer = null;
      lockScroll(false);
      if (still()) gone.remove();
      else {
        gone.setAttribute('data-closing', '');
        window.setTimeout(function () { gone.remove(); }, 160);
      }
      if (!leaving && before && before.focus) before.focus({ preventScroll: true });
    }

    function typing(el) {
      return el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
    }

    document.addEventListener('keydown', function (event) {
      if (!layer) {
        var combo = (event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey);
        var slash = event.key === '/' || (event.code === 'Slash' && !event.shiftKey);
        if (combo || (slash && !typing(event.target))) {
          if (!fx('spotlight')) return;
          event.preventDefault();
          open();
        }
        return;
      }
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      else if (event.key === 'ArrowDown') { event.preventDefault(); if (results.length) pick((sel + 1) % results.length); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); if (results.length) pick((sel - 1 + results.length) % results.length); }
      else if (event.key === 'Enter' && results[sel]) {
        event.preventDefault();
        var href = results[sel].href;
        close(true);
        window.location.href = href;
      } else if (event.key === 'Tab') { event.preventDefault(); }
    });
    if (trigger) trigger.addEventListener('click', open);
  })();

  /* island: copying the email grows a capsule out of the top of the screen
     that says so. The link still opens the mail app as well. */
  (function () {
    if (!data || !data.copied || !navigator.clipboard) return;
    var island = null, row = null, full = 0, timer = 0;

    function draw() {
      var w = width.value;
      island.style.width = w + 'px';
      island.style.opacity = clamp(appear.value, 0, 1);
      island.style.transform = 'scale(' + lerp(0.5, 1, clamp(appear.value, 0, 1)) + ')';
      row.style.opacity = clamp(((w - 38) / Math.max(1, full - 38)) * 1.6 - 0.6, 0, 1);
    }
    var width = new Spring({ value: 38, response: 0.45, damping: 0.62, precision: 0.2, onUpdate: draw,
      onRest: function () { if (width.target === 38) appear.to(0, { response: 0.25 }); } });
    var appear = new Spring({ response: 0.3, damping: 0.7, precision: 0.002, onUpdate: draw });

    function show() {
      if (!fx('island')) return;
      if (!island) {
        island = document.createElement('div');
        island.className = 'island';
        island.setAttribute('role', 'status');
        island.innerHTML = '<div class="island__row"><span class="island__tick">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>' +
          '</span><span></span></div>';
        document.body.appendChild(island);
        row = island.firstChild;
      }
      row.lastChild.textContent = data.copied;
      full = row.scrollWidth;
      appear.to(1);
      width.to(full);
      buzz(12);
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { width.to(38, { damping: 0.85 }); }, 1900);
    }

    document.addEventListener('click', function (event) {
      var a = event.target.closest ? event.target.closest('a[href^="mailto:"]') : null;
      if (!a || !fx('island')) return;
      navigator.clipboard.writeText(a.getAttribute('href').slice(7)).then(show, function () {});
    });
  })();

  /* The ?fx panel. Add ?fx to any address to open it; it stays until hidden. */
  (function () {
    var asked = /[?&]fx\b/.test(window.location.search);
    var kept = false;
    try {
      if (asked) localStorage.setItem('fx-panel', '1');
      kept = localStorage.getItem('fx-panel') === '1';
    } catch (e) {}
    if (!(asked || kept) || !window.FX) return;

    var panel = document.createElement('aside');
    panel.className = 'fx-panel';
    panel.setAttribute('aria-label', 'Effects');
    panel.innerHTML = '<h2><button type="button" class="fx-panel__fold" aria-expanded="true">Effects</button>' +
      '<button type="button" class="fx-panel__hide">Hide</button></h2>';
    var fold = panel.querySelector('.fx-panel__fold');
    function folded(on) {
      panel.toggleAttribute('data-folded', on);
      fold.setAttribute('aria-expanded', on ? 'false' : 'true');
      try { localStorage.setItem('fx-folded', on ? '1' : ''); } catch (e) {}
    }
    fold.addEventListener('click', function () { folded(!panel.hasAttribute('data-folded')); });
    try { if (localStorage.getItem('fx-folded') === '1') panel.setAttribute('data-folded', ''); } catch (e) {}
    window.FX.forEach(function (pair) {
      var label = document.createElement('label');
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.value = pair[0];
      box.checked = fx(pair[0]);
      var text = document.createElement('span');
      text.textContent = pair[1];
      var code = document.createElement('code');
      code.textContent = pair[0];
      text.appendChild(code);
      label.appendChild(box);
      label.appendChild(text);
      panel.appendChild(label);
    });
    panel.addEventListener('change', function () {
      var on = [], off = [];
      Array.prototype.forEach.call(panel.querySelectorAll('input'), function (b) {
        (b.checked ? on : off).push(b.value);
      });
      root.setAttribute('data-fx', on.join(' '));
      try { localStorage.setItem('fx-off', JSON.stringify(off)); } catch (e) {}
    });
    panel.querySelector('.fx-panel__hide').addEventListener('click', function () {
      try { localStorage.removeItem('fx-panel'); } catch (e) {}
      panel.remove();
    });
    document.body.appendChild(panel);
  })();
})();
