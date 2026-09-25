/* AGWAS version badge — one shared file for every sport app.
 *
 * In an app, beside the credit line:
 *   <a class="agwas-ver" data-agwas-ver="f1" href="https://dataviz.aguywithascarf.com/releases/#f1"></a>
 *   <script defer src="https://dataviz.aguywithascarf.com/ver.js"></script>
 *
 * The version comes from /releases.json on the hub, so bumping an app there updates its
 * badge with no redeploy of the app. The anchor stays empty — and invisible, separator
 * included — unless the version actually loads, so a failed fetch leaves nothing behind.
 * React apps may render the anchor after this runs, or re-render it, so late arrivals
 * are caught by a MutationObserver rather than a one-shot fill.
 */
(function () {
  if (window.__agwasVer) return;            // included twice on one page: run once
  window.__agwasVer = true;

  var SRC = 'https://dataviz.aguywithascarf.com/releases.json';
  var versions = null, queued = false;

  var style = document.createElement('style');
  style.textContent =
    '.agwas-ver{font:inherit;color:inherit;opacity:.72;text-decoration:none;white-space:nowrap;' +
    'font-variant-numeric:tabular-nums}' +
    '.agwas-ver:hover{opacity:1;text-decoration:underline}' +
    '.agwas-ver:not(:empty)::before{content:"\\00b7\\00a0";opacity:.7}' +
    '.agwas-ver.bare::before{content:none}' +
    /* the "Release notes · v1.4.0" line added to the foot of each app's help panel */
    '.agwas-rel{margin:14px 0 0;font-size:.92em;opacity:.78}' +
    '.agwas-rel a{color:inherit}';
  (document.head || document.documentElement).appendChild(style);

  function fill() {
    queued = false;
    if (!versions) return;
    var els = document.querySelectorAll('[data-agwas-ver]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i], v = versions[el.getAttribute('data-agwas-ver')];
      if (!v || el.textContent === 'v' + v) continue;
      el.textContent = 'v' + v;
      el.title = 'Release notes';
    }
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(fill); } }

  fetch(SRC, { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
    versions = {};
    (d.apps || []).forEach(function (a) { if (a.releases && a.releases[0]) versions[a.id] = a.releases[0].version; });
    fill();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }).catch(function () { /* no version is better than a broken one */ });
})();
