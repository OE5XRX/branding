# OE5XRX Branding

Brand assets and design tokens for the OE5XRX amateur radio club.

Live guideline: **https://oe5xrx.org/branding/**

## Directory Overview

| Path | Contents |
|------|----------|
| `logo/` | Theme-aware SVGs — `currentColor`, borderless |
| `color/` | `tokens.css` (CSS custom properties), `tokens.json` (source of truth) |
| `type/` | Font CSS (`fonts.css`) |
| `export/` | Raster exports: favicon ICO/PNG, Apple Touch, PWA icons |

## Color Tokens — Palette C (Marine + Cyan)

| Token | Light | Dark |
|-------|-------|------|
| `--bg` | `#F4F7F9` | `#0A1219` |
| `--surface` | `#E8EFF4` | `#0F1C28` |
| `--text` | `#0D1A24` | `#D8ECF5` |
| `--muted` | `#526070` | `#7AAFCA` |
| `--primary` | `#123B54` | `#3AC6D6` |
| `--accent` | `#0F7A87` | `#3AC6D6` |
| `--border` | `#C8D6E0` | `#1A2D3D` |
| `--success` | `#1B6B35` | `#4DB870` |
| `--warn` | `#8A5200` | `#FFB84D` |
| `--error` | `#B02020` | `#F06060` |

Light values are `:root` defaults; dark values apply under `prefers-color-scheme: dark` and `[data-theme="dark"]`.

## Fonts

| Role | Family | Weights | Source |
|------|--------|---------|--------|
| Heading / Body | IBM Plex Sans | 400, 600, 700 | Google Fonts (OFL) |
| Code / Technical | IBM Plex Mono | 400, 600 | Google Fonts (OFL) |

IBM Plex is released under the SIL Open Font License 1.1 — free for commercial and non-commercial use.

## Using tokens.css

Link the stylesheet, then reference tokens via `var()`:

```html
<link rel="stylesheet" href="https://oe5xrx.org/branding/color/tokens.css">
```

```css
.my-button {
  background: var(--primary);
  color: var(--bg);
  border: 1px solid var(--border);
}

.status-ok {
  color: var(--success);
}
```

For local use, copy `color/tokens.css` into your project and adjust the path.

## Using the Mark with currentColor

Embed `oe5xrx-mark.svg` inline and control its colour via the CSS `color` property — no fill attributes needed:

```html
<!-- The mark inherits the surrounding text colour -->
<span style="color: var(--primary);">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"
       style="width: 24px; height: 24px;" aria-label="OE5XRX">
    <!-- paste mark path data here from logo/oe5xrx-mark.svg -->
  </svg>
  OE5XRX
</span>
```

Switching theme context (light/dark) is handled entirely by the parent `color` value — the SVG requires no modification.

## Logo Files

| File | Description |
|------|-------------|
| `logo/oe5xrx-full.svg` | Vertical lockup — mark + wordmark, `currentColor` |
| `logo/oe5xrx-full-primary.svg` | Vertical lockup, brand primary `#123B54` |
| `logo/oe5xrx-full-white.svg` | Vertical lockup, white (for dark backgrounds) |
| `logo/oe5xrx-horizontal.svg` | Horizontal lockup, `currentColor` |
| `logo/oe5xrx-mark.svg` | Mark only, `currentColor` |
| `logo/oe5xrx-wordmark.svg` | Wordmark only, `currentColor` |
| `logo/favicon.svg` | Favicon-optimised SVG |
| `export/favicon.ico` | Multi-size ICO (16/32/48 px) |
| `export/favicon-16.png` | 16×16 raster |
| `export/favicon-32.png` | 32×32 raster |
| `export/favicon-48.png` | 48×48 raster |
| `export/apple-touch-icon-180.png` | 180×180 Apple Touch Icon |
| `export/pwa-192.png` | 192×192 PWA icon |
| `export/pwa-512.png` | 512×512 PWA icon |

## PWA / Web Manifest

Reference `manifest.webmanifest` for PWA installations:

```html
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#123B54">
```
