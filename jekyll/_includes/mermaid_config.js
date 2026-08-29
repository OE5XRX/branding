{
  startOnLoad: true,
  theme: (function () {
    /* Runs when JTD builds `var config = {...}`, i.e. BEFORE mermaid.run().
       Two jobs, guaranteed pre-render timing:
       1) capture each diagram's source into data-mmd-src (so the theme toggle
          can re-render live — mermaid discards the source once rendered);
       2) return the theme from the active OE5XRX scheme.
       Block comment only — inline scripts get collapsed to one line. */
    try {
      var els = document.querySelectorAll('.language-mermaid');
      for (var i = 0; i < els.length; i++) {
        if (!els[i].getAttribute('data-mmd-src')) {
          els[i].setAttribute('data-mmd-src', els[i].textContent);
        }
      }
      var s = localStorage.getItem('oe5xrx-theme');
      var dark = s === 'dark' || (s !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      return dark ? 'dark' : 'default';
    } catch (e) { return 'default'; }
  })()
}
