/* ===========================================================================
   app.js — the only JavaScript on the site.

   Two jobs:
     1. Upgrade the corner "At a glance" link into an overlay panel (React).
        Without JavaScript the same link jumps to the same summary, rendered
        inline at the foot of every page. Nothing is lost, it just doesn't
        animate.
     2. Tell every button where the pointer is, so the fill rises from under
        the cursor. Plain CSS custom property, no React needed.

   Copy is never written here. The panel reads the same strings the pages were
   generated from, embedded as JSON by tools/render.py.
   =========================================================================== */

(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 2. cursor-aware buttons ------------------------------------------ */

  function trackPointer(event) {
    var btn = event.target.closest ? event.target.closest('.btn') : null;
    if (!btn) return;
    var box = btn.getBoundingClientRect();
    var x = ((event.clientX - box.left) / box.width) * 100;
    btn.style.setProperty('--press-x', Math.max(0, Math.min(100, x)) + '%');
  }

  document.addEventListener('pointermove', trackPointer, { passive: true });
  document.addEventListener('pointerdown', trackPointer, { passive: true });

  /* ---- 1. the summary panel --------------------------------------------- */

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
  var opener = document.querySelector('[data-glance-open]');
  var mount = document.getElementById('glance-root');

  if (!data || !opener || !mount || !window.React || !window.ReactDOM) {
    // Leave the inline summary in place and let the link jump to it.
    return;
  }

  document.documentElement.setAttribute('data-glance', 'overlay');

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

    React.useEffect(function () {
      if (closeBtn.current) closeBtn.current.focus();

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
      var previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return function () {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = previousOverflow;
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
                className: 'btn btn--on-dark' + (action.primary ? ' btn--primary' : ''),
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
      if (REDUCED) {
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
})();
