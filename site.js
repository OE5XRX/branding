/* OE5XRX Branding Guideline — Theme Toggle */

const btn = document.getElementById('theme-toggle');

const isDark = () => {
  const cur = document.documentElement.getAttribute('data-theme');
  if (cur) return cur === 'dark';
  return matchMedia('(prefers-color-scheme:dark)').matches;
};

const syncPressed = () => {
  btn?.setAttribute('aria-pressed', isDark() ? 'true' : 'false');
};

// Reflect the effective (system or explicit) theme on load.
syncPressed();

btn?.addEventListener('click', () => {
  document.documentElement.setAttribute('data-theme', isDark() ? 'light' : 'dark');
  syncPressed();
});
