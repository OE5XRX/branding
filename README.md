# OE5XRX Branding

Marken-Assets und Design-Tokens für den Amateurfunkverein OE5XRX.

- **Logo:** `logo/` — theme-fähige SVGs (currentColor), rahmenlos.
- **Farben:** `color/tokens.json` (Single-Source), `color/tokens.css` (CSS-Variablen).
- **Typografie:** `type/`.
- **Raster-Exports:** `export/` (Favicon, PWA-Icons).
- **Guideline & Vorschau:** `index.html` → https://oe5xrx.github.io/branding/

## Nutzung (Kurz)

Logo per `currentColor`: das SVG erbt die Textfarbe, funktioniert auf hell und dunkel.
Farb-Tokens via `color/tokens.css` einbinden (`:root` + `prefers-color-scheme`).
