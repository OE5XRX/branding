/* OE5XRX Branding Guideline — Theme Toggle */

const btn = document.getElementById('theme-toggle');
btn?.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme')
    || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', cur === 'dark' ? 'light' : 'dark');
});
