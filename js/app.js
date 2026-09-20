/* ==========================================================================
   Ben Silver — portfolio
   A single small React island: the light/dark theme toggle.

   Everything else on this site is plain HTML and CSS. The active nav state,
   the layout and the responsive behaviour are all CSS — no JavaScript needed.
   That means the site still reads fine if this file never loads.

   You shouldn't need to edit this file to change any text. See EDITING.md.
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'bs-theme';

  /* ---- Theme helpers ---------------------------------------------------- */

  function systemPrefersDark() {
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function storedTheme() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      // Private browsing, blocked storage, etc. Not worth failing over.
      return null;
    }
  }

  function storeTheme(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (err) {
      /* ignore */
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function currentTheme() {
    return storedTheme() || (systemPrefersDark() ? 'dark' : 'light');
  }

  /* ---- Icons ------------------------------------------------------------ */

  function moonIcon(React) {
    return React.createElement(
      'svg',
      {
        width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.6,
        strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': 'true'
      },
      React.createElement('path', { d: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z' })
    );
  }

  function sunIcon(React) {
    var rays = [
      'M12 2.5v2', 'M12 19.5v2', 'M2.5 12h2', 'M19.5 12h2',
      'm5.3 5.3 1.4 1.4', 'm17.3 17.3 1.4 1.4',
      'm18.7 5.3-1.4 1.4', 'm6.7 17.3-1.4 1.4'
    ].map(function (d, i) {
      return React.createElement('path', { key: i, d: d });
    });

    return React.createElement(
      'svg',
      {
        width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.6,
        strokeLinecap: 'round', 'aria-hidden': 'true'
      },
      [React.createElement('circle', { key: 'c', cx: 12, cy: 12, r: 4.2 })].concat(rays)
    );
  }

  /* ---- Component -------------------------------------------------------- */

  function ThemeToggle(React) {
    return function () {
      var state = React.useState(currentTheme);
      var theme = state[0];
      var setTheme = state[1];

      React.useEffect(function () {
        applyTheme(theme);
      }, [theme]);

      // Follow the system setting until the visitor makes their own choice.
      React.useEffect(function () {
        if (!window.matchMedia) return;
        var query = window.matchMedia('(prefers-color-scheme: dark)');

        function onChange(event) {
          if (storedTheme()) return;
          setTheme(event.matches ? 'dark' : 'light');
        }

        if (query.addEventListener) {
          query.addEventListener('change', onChange);
          return function () { query.removeEventListener('change', onChange); };
        }
        query.addListener(onChange);
        return function () { query.removeListener(onChange); };
      }, []);

      function toggle() {
        var next = theme === 'dark' ? 'light' : 'dark';
        storeTheme(next);
        setTheme(next);
      }

      var label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

      return React.createElement(
        'button',
        {
          type: 'button',
          className: 'theme-toggle',
          onClick: toggle,
          'aria-label': label,
          title: label
        },
        theme === 'dark' ? sunIcon(React) : moonIcon(React)
      );
    };
  }

  /* ---- Mount ------------------------------------------------------------ */

  function mount() {
    var nodes = document.querySelectorAll('[data-theme-toggle]');
    if (!nodes.length) return;

    if (!window.React || !window.ReactDOM) {
      // React failed to load (offline, CDN blocked). The site is fully usable
      // without the toggle, so just leave the slot empty.
      return;
    }

    var React = window.React;
    var Toggle = ThemeToggle(React);

    Array.prototype.forEach.call(nodes, function (node) {
      if (window.ReactDOM.createRoot) {
        window.ReactDOM.createRoot(node).render(React.createElement(Toggle));
      } else {
        window.ReactDOM.render(React.createElement(Toggle), node);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
