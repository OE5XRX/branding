# OE5XRX Branding

Marken-Assets und Design-Tokens für den Amateurfunkverein OE5XRX.

- **Logo:** `logo/` — theme-fähige SVGs (currentColor), rahmenlos.
- **Farben:** `color/tokens.json` (Single-Source), `color/tokens.css` (CSS-Variablen).
- **Typografie:** `type/`.
- **Raster-Exports:** `export/` (Favicon, PWA-Icons).
- **Guideline & Vorschau:** `index.html` → https://oe5xrx.github.io/branding/

## Gewählte Palette: C — Marine + Cyan

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

## Gewählte Schrift: IBM Plex

| Rolle | Familie | Gewichte |
|-------|---------|---------|
| Sans (Heading/Body) | IBM Plex Sans | 400, 600, 700 |
| Mono (Code/Technik) | IBM Plex Mono | 400, 600 |

## Nutzung (Kurz)

Logo per `currentColor`: das SVG erbt die Textfarbe, funktioniert auf hell und dunkel.
Farb-Tokens via `color/tokens.css` einbinden (`:root` = hell C, `prefers-color-scheme:dark` = dunkel C).
Single-Source der Wahrheit: `color/tokens.json`.
