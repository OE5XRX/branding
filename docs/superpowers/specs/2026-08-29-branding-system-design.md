# OE5XRX Branding-System — Design

**Datum:** 2026-08-29
**Status:** Design (approved, Spec-Review offen)
**Ziel-Repo:** `OE5XRX/branding` (neu anzulegen)

## Zusammenfassung

Ein wiederverwendbares Brand-System für den Verein OE5XRX als eigenes Repo mit
GitHub-Pages-Guideline-Seite. Kern ist die **Vektorisierung der bestehenden
Turm-Marke** (aktuell nur als fixed-color PNG `Icon.png` vorhanden), theme-fähig
für hell/dunkel, plus Farbpalette, Typografie und Design-Tokens. Die
Guideline-Seite referenziert die echten Assets direkt und dient gleichzeitig als
Vorschau-/Auswahl-Werkzeug für Palette und Schrift.

**Scope:** Nur das Brand-System definieren. Kein Ausrollen auf Apps
(station-manager, internal-web, Pages, HW-Docs) — das passiert später je Repo.

## Problem / Motivation

Das aktuelle Vereins-Branding hat zwei Mängel:

- **a) Nicht theme-fähig.** Das Logo ist ein fixed-color Raster (petrolblauer Turm
  auf Creme) und funktioniert nicht sauber auf hellen/dunklen Hintergründen.
- **b) Keine SVG-Quelle mehr.** Es existiert nur noch das PNG (`Icon.png`), keine
  editierbare Vektorquelle.

Zusätzlich fehlt ein zusammenhängendes System (Farben, Typografie, Tokens), auf das
alle Vereins-Apps zugreifen können.

Der Nutzer will bevorzugt das **aktuelle Design weiterverwenden**, nicht neu
erfinden.

> **Hinweis:** Ein früherer Ordner `brand-previews/` im Meta-Verzeichnis war ein
> Fehlversuch und wird **komplett ignoriert**. Einzige Referenz ist das aktuelle
> Logo `OE5XRX.github.io/Icon.png`.

## Entscheidungen (aus Brainstorming)

| Thema | Entscheidung |
|-------|--------------|
| Logo-Richtung | Aktuelle Turm-Marke **1:1 vektorisieren**, aber **den abgerundeten Rahmen weglassen** (passt nicht überall). |
| Wortmark | „OE5XRX" als **Outline-Pfad** zeichnen, nicht als Live-Font → keine Font-Abhängigkeit. |
| Theme-Fähigkeit | `fill`/`stroke="currentColor"` → Logo folgt der Textfarbe (hell/dunkel automatisch). |
| Farben | **Offen erkunden**: 3 Richtungen in die Guideline-Seite rendern, Nutzer wählt im Browser. |
| Typografie | **Voll**: Open-Source Heading- + Body-Schrift als Teil des Brands. Kandidaten auf der Seite, Nutzer wählt. |
| Umfang | **Nur Brand-System** (kein App-Rollout). |
| Delivery | Neues Repo `OE5XRX/branding` + statische GitHub-Pages-HTML-Guideline (kein Jekyll). |

## Architektur / Repo-Struktur

Die Guideline-Seite referenziert die **echten** Deliverables direkt (Dogfooding →
Seite kann nie mit den Assets aus dem Takt geraten).

```
branding/
  index.html            # Guideline + Live-Vorschau (Pages, root, reines HTML/CSS/JS)
  logo/                 # alle SVGs, theme-fähig (currentColor)
    oe5xrx-full.svg          # Full-Lockup vertikal (Turm + Wellen + Blitz + Wortmark)
    oe5xrx-mark.svg          # nur Turm-Glyph (quadratisch)
    oe5xrx-wordmark.svg      # nur „OE5XRX"
    oe5xrx-horizontal.svg    # Mark links + Wortmark rechts
    oe5xrx-full-petrol.svg   # fixed-color Fallback (Petrol)
    oe5xrx-full-white.svg    # fixed-color Fallback (Weiß)
    favicon.svg
  color/
    tokens.json         # Farb-Single-Source
    tokens.css          # CSS-Custom-Properties, :root + prefers-color-scheme/[data-theme]
  type/
    fonts.css           # @font-face / Font-Einbindung
    README.md           # Schrift-Doku (Familien, Gewichte, Einsatz)
  export/               # generierte Rasters
    favicon.ico
    pwa-192.png
    pwa-512.png
  README.md             # was das ist, wie konsumieren
  .github/workflows/    # optional: Raster-Build (SVG→PNG/ICO) + Pages-Deploy
```

GitHub Pages: **deploy from branch**, root-Ordner, reines statisches HTML — keine
Jekyll-Abhängigkeit.

## Komponenten

### 1. Logo-System

Alle Varianten rahmenlos und theme-fähig. Die Turm-Marke wird aus `Icon.png` als
Vektor nachgezeichnet (Turm-Mast mit Dreiecks-Verstrebung, Blitz oben, zwei
konzentrische Wellenbögen je Seite). Der Rahmen des Originals entfällt.

- **Full-Lockup vertikal** — heutiger Aufbau minus Rahmen (Marke über Wortmark).
- **Mark** — nur Turm-Glyph, quadratische Bounding-Box (Favicon/PWA/Avatar).
- **Wordmark** — nur „OE5XRX" als Outline.
- **Horizontal-Lockup** — Mark links, Wortmark rechts (Navbars/Header).
- **Fixed-Color-Exports** — Petrol und Weiß auf transparent, für Kontexte ohne
  `currentColor` (z.B. E-Mail, Print, Fremdplattformen).
- **Favicon** (SVG + ICO) und **PWA-Icons** (192/512 PNG) aus der Mark generiert.

**Theme-Mechanik:** `currentColor` → das Logo erbt die umgebende Textfarbe; ein
einziges SVG deckt hell und dunkel ab. Fixed-Color-Dateien nur als Fallback.

**Wortmark-Entscheidung:** Als Outline-Pfad gezeichnet — unabhängig von
installierten Fonts, pixel-stabil bei jeder Skalierung.

### 2. Farbpalette (Exploration → Auswahl)

Drei Richtungen werden voll ausgebaut (hell **und** dunkel) in `index.html`
gerendert; der Nutzer wählt im Browser:

- **A — Petrol-treu:** heutiges Petrol als Primary, warme Neutrals, minimal.
- **B — Petrol + Signal:** Petrol + gezielte warme Akzentfarbe (Status/CTA).
- **C — Kontrast-Variante:** frischer (z.B. tieferes Marine/Cyan-Duo).

Jede Palette als vollständiges Token-Set, je hell/dunkel:
`bg, surface, text, muted, primary, accent, border` + semantisch
`success, warn, error`.

Nach Auswahl wird **eine** Palette in `color/tokens.json` + `tokens.css`
festgezogen; die anderen bleiben nicht im finalen Token-Set.

### 3. Typografie (Exploration → Auswahl)

2–3 Open-Source-Pairings als Specimen zum Vergleich auf der Seite.
Empfehlung fürs Funk-/Engineering-Profil: **IBM Plex Sans** (Body) +
**IBM Plex Mono** (Rufzeichen/Frequenzen/Code) + markanter Heading-Kandidat
(z.B. Space Grotesk). Nutzer wählt am Rendering; Gewinner wird in `type/`
eingebunden und dokumentiert.

### 4. Design-Tokens

- `color/tokens.json` = Single-Source (Farbwerte, Namen, hell/dunkel).
- `color/tokens.css` = CSS-Custom-Properties mit `:root` +
  `prefers-color-scheme`/`[data-theme]`-Umschaltung.
- Weitere Formate (SCSS, Django-Settings, Tailwind-Config) **später bei Bedarf** —
  jetzt bewusst YAGNI.

### 5. Guideline-Seite (`index.html`)

Reines statisches HTML/CSS/JS mit hell/dunkel-Umschalter. Abschnitte:

- **Logo** — alle Varianten auf hellem und dunklem Swatch, mit Download-Links.
- **Farben** — Swatches mit Hex + Token-Name, hell/dunkel.
- **Typografie** — Specimen der gewählten/kandidierenden Schriften.
- **Do / Don't** — Schutzraum, Mindestgröße, „keinen Rahmen ergänzen", „nicht frei
  umfärben".

## Daten- / Kontrollfluss

1. Turm-Marke aus `Icon.png` → Vektor-Redraw → `logo/*.svg` (currentColor).
2. `index.html` bindet die echten SVGs + `tokens.css` ein → rendert Paletten- und
   Schrift-Kandidaten.
3. Push → GitHub Pages rendert die Seite → Nutzer prüft im Browser.
4. Nutzer wählt Palette + Schrift → Tokens/Fonts werden festgezogen.
5. Raster-Assets (Favicon/PWA) werden aus den finalen SVGs generiert.

## Umsetzungs-Reihenfolge (für die Plan-Phase)

1. Repo `OE5XRX/branding` anlegen (Grundgerüst, README, Pages aktivieren).
2. Turm-Marke vektorisieren → alle Logo-Varianten (currentColor, rahmenlos).
3. `index.html`-Grundgerüst mit hell/dunkel-Umschalter + Logo-Sektion.
4. 3 Paletten-Richtungen + 2–3 Schrift-Pairings in die Seite rendern.
5. **Checkpoint:** Nutzer wählt Palette + Schrift im Browser.
6. Gewählte Tokens (`tokens.json`/`tokens.css`) + Fonts festziehen.
7. Raster-Exports (Favicon/PWA) generieren.
8. Guideline-Seite fertigstellen (Do/Don't, Download-Links) + README.

## Fehlerbehandlung / Risiken

- **Vektorisierungs-Treue:** Der Redraw muss visuell nah am Original bleiben.
  Gegenmaßnahme: Vergleich Original-PNG vs. SVG direkt auf der Guideline-Seite
  (Side-by-side), bevor „fertig".
- **Palette/Schrift erst nach Rendering final:** Der Spec definiert System +
  Kandidaten; Schritte 6–8 hängen am Nutzer-Checkpoint (Schritt 5). Ohne Auswahl
  keine finalen Tokens.
- **Pages-Setup:** Reines HTML, kein Jekyll → keine `_config.yml`/Gemfile-Reibung.
  Falls Pages doch Jekyll-Processing erzwingt, `.nojekyll` an Repo-Root legen.

## Testing / Verifikation

- Guideline-Seite lädt lokal (`index.html` im Browser) und über Pages fehlerfrei.
- Jede Logo-Variante rendert korrekt auf hellem **und** dunklem Swatch
  (currentColor-Umschaltung sichtbar).
- Side-by-side Original-PNG vs. Vektor-SVG bestätigt Treue.
- `tokens.css` schaltet zwischen hell/dunkel korrekt (prefers-color-scheme +
  manueller Toggle).
- Favicon/PWA-Raster liegen in korrekten Größen vor.

## Explizit NICHT in Scope

- Ausrollen auf station-manager, internal-web, oe5xrx.org, HW-Docs.
- Zusätzliche Token-Formate (SCSS/Django/Tailwind).
- Marken-Redesign / neue Formsprache (nur Vektorisierung des Bestehenden).
- Der alte `brand-previews/`-Ordner (ignoriert).
