{
  startOnLoad: true,
  theme: (function () {
    /* Pick Mermaid's theme from the active OE5XRX color scheme at load time
       (dark visitors get dark diagrams). Block comment only — inline scripts
       get collapsed to one line, and a // would comment out the rest. */
    try {
      var s = localStorage.getItem('oe5xrx-theme');
      var dark = s === 'dark' || (s !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      return dark ? 'dark' : 'default';
    } catch (e) { return 'default'; }
  })()
}
