# OE5XRX Jekyll Brand-Layer — Design

**Datum:** 2026-08-29
**Status:** Design (approved, Spec-Review offen)
**Ziel-Repos:** `OE5XRX/branding` (Quelle + Composite-Action), `OE5XRX/dashboard` (PoC-Consumer)

## Zusammenfassung

Ein wiederverwendbarer Brand-Layer für die `just-the-docs`-Jekyll-Sites von OE5XRX:
Farben (Palette C, hell), Schrift (IBM Plex, self-hosted), Logo und Favicon — aus
**einer Single Source** (`branding`-Repo). Konsumiert wird über eine **Composite
GitHub Action** im `branding`-Repo, gepinnt per Ref (SRCREV-Lockfile-Muster). Dieses
Vorhaben liefert den kanonischen Layer + Action und wendet ihn als **Proof-of-Concept
auf `dashboard`** an.

## Problem / Motivation

Die drei OE5XRX-Jekyll-Sites (`OE5XRX.github.io`, `dashboard`, `HW-Module-CI`-Docs)
laufen aktuell auf dem **Default-Look** von `just-the-docs` (Gem, kein
Color-Scheme, keine Font-Anpassung, altes `Icon.png`/`favicon.ico`). Nach der
Fertigstellung des Brand-Systems (Logo Marine/Cyan, IBM Plex) sollen die Sites
markenkonform werden — **ohne** dass Farben/Schrift/Logo je Site dupliziert werden
und auseinanderdriften.

## Entscheidungen (aus Brainstorming)

| Thema | Entscheidung |
|-------|--------------|
| Theme-Basis | `just-the-docs` bleibt als Gem-Theme; Brand ist ein additiver Layer (Color-Scheme + head_custom + Assets). |
| Distribution | **Build-Time-Fetch, gepinnt** (nicht committeter Copy). Entspricht dem „SRCREV als Lockfile"-Muster von `station-agent`. |
| Fetch-Mechanik | **Composite GitHub Action** im `branding`-Repo, konsumiert via `uses: OE5XRX/branding/.github/actions/apply-brand@<ref>` (wie HW-Module-CI `@ref`-Muster). |
| remote_theme | **Verworfen** — würde einen kompletten `just-the-docs`-Fork erzwingen (chained nicht), unverhältnismäßig für einen kleinen Brand-Layer. |
| Umfang | **Nur PoC dashboard.** Kanonischer Layer + Action + dashboard-Integration. Rollout auf OE5XRX.github.io + HW-Module-CI später separat. |
| Theme-Modus | **Nur Hell** (Palette C light). Dunkel-Scheme + Umschalter im späteren Rollout. |
| Font-Hosting | **Self-hosted WOFF2** (IBM Plex Sans/Mono). DSGVO-sicher (kein Google-CDN-Request) — relevant für AT/Verein. |
| Ziel-Root | Variabel via Action-Input `dest` (default `.`); dashboard/OE5XRX.github.io = Repo-Root, HW-Module-CI später = `doc`. |
| Logo im PoC | Ja, mit-tauschen (kohärenter PoC): `oe5xrx-horizontal.svg` als Logo. |
| Erster Tag | `v0.1.0` auf `branding`. |

## Architektur

### 1. Kanonischer Brand-Layer (`branding/jekyll/`)

```
branding/jekyll/
  _sass/color_schemes/oe5xrx.scss   # JTD-Variablen-Overrides (Palette C hell) + Font-Family-Vars
  _includes/head_custom.html        # @font-face (self-hosted IBM Plex) + <meta theme-color #123B54>
  assets/fonts/
    IBMPlexSans-Regular.woff2        # 400
    IBMPlexSans-SemiBold.woff2       # 600
    IBMPlexSans-Bold.woff2           # 700
    IBMPlexMono-Regular.woff2        # 400
    IBMPlexMono-SemiBold.woff2       # 600
  README.md                          # wie konsumieren (Action + _config-Einträge)
```

`oe5xrx.scss` (JTD-Color-Scheme) mappt die Palette-C-hell-Tokens auf
just-the-docs-SCSS-Variablen. Mindestens:
```scss
$body-background-color:   #F4F7F9;
$sidebar-color:           #E8EFF4;
$body-text-color:         #0D1A24;
$body-heading-color:      #0D1A24;
$link-color:              #123B54;
$btn-primary-color:       #123B54;
$nav-child-link-color:    #123B54;
$border-color:            #C8D6E0;
$code-background-color:   #E8EFF4;
$body-font-family:        "IBM Plex Sans", system-ui, -apple-system, sans-serif;
$mono-font-family:        "IBM Plex Mono", ui-monospace, monospace;
```
(Weitere JTD-Variablen — Search-Highlight, Table-Stripes — nach Bedarf im Build
angleichen, damit nichts Default-blau durchscheint.)

`head_custom.html` enthält die `@font-face`-Regeln mit baseurl-sicheren URLs
(`{{ '/assets/fonts/…' | relative_url }}`) sowie `<meta name="theme-color" content="#123B54">`.

Logo + Favicon liegen **nicht** doppelt im Layer, sondern werden von der Action aus
den bestehenden kanonischen Pfaden kopiert: `branding/logo/oe5xrx-horizontal.svg`
und `branding/export/favicon.ico`.

### 2. Composite Action (`branding/.github/actions/apply-brand/action.yml`)

```yaml
name: Apply OE5XRX Brand
description: Kopiert den OE5XRX-Brand-Layer (Farben, Fonts, Logo, Favicon) in eine just-the-docs-Site.
inputs:
  dest:
    description: "Jekyll-Source-Root, in den kopiert wird."
    required: false
    default: "."
runs:
  using: composite
  steps:
    - shell: bash
      run: |
        set -euo pipefail
        ROOT="$GITHUB_ACTION_PATH/../../.."          # branding-Repo-Root (Action liegt in .github/actions/apply-brand)
        DEST="${{ inputs.dest }}"
        mkdir -p "$DEST/_sass/color_schemes" "$DEST/_includes" "$DEST/assets/fonts"
        cp "$ROOT/jekyll/_sass/color_schemes/oe5xrx.scss" "$DEST/_sass/color_schemes/"
        cp "$ROOT/jekyll/_includes/head_custom.html"      "$DEST/_includes/"
        cp "$ROOT"/jekyll/assets/fonts/*.woff2            "$DEST/assets/fonts/"
        cp "$ROOT/logo/oe5xrx-horizontal.svg"             "$DEST/assets/oe5xrx-logo.svg"
        cp "$ROOT/export/favicon.ico"                     "$DEST/favicon.ico"
        echo "OE5XRX brand layer applied to '$DEST'."
```

Beim `uses: OE5XRX/branding/.github/actions/apply-brand@v0.1.0` lädt der Runner das
gesamte `branding`-Repo an diesem Ref; `$GITHUB_ACTION_PATH` zeigt auf das
Action-Verzeichnis, von dem aus die Geschwister-Ordner (`jekyll/`, `logo/`,
`export/`) erreichbar sind. Fetch + Copy-Logik + Assets sind damit **alle**
single-source in `branding`, gepinnt per Ref.

### 3. dashboard-Integration (PoC)

- `dashboard/_config.yml`:
  ```yaml
  color_scheme: oe5xrx
  logo: "/assets/oe5xrx-logo.svg"
  favicon_ico: "/favicon.ico"
  ```
- `dashboard/.github/workflows/jekyll.yml`: **vor** `bundle exec jekyll build` einfügen:
  ```yaml
  - uses: OE5XRX/branding/.github/actions/apply-brand@v0.1.0
  ```
- `dashboard/.gitignore`: gefetchte Build-Artefakte ignorieren, damit sie nicht
  versehentlich committet werden:
  ```
  /_sass/color_schemes/oe5xrx.scss
  /_includes/head_custom.html
  /assets/fonts/
  /assets/oe5xrx-logo.svg
  /favicon.ico
  ```
  (Hinweis: falls dashboard heute ein eigenes `favicon.ico`/`Icon.png` committed
  hat, das der Brand-Layer ersetzt, wird das im Zuge dessen entfernt/ignoriert.)

### 4. Versionierung

`branding` bekommt den ersten Release-Tag **`v0.1.0`** (nach Merge des Layers +
Action). Der Consumer-Pin referenziert ihn. Künftige Brand-Änderungen → neuer Tag +
Pin-Bump im Consumer (ein PR, reviewbar, reproduzierbar).

## Daten- / Kontrollfluss (Build)

1. dashboard-Workflow startet (`push`).
2. `actions/checkout` holt dashboard.
3. `apply-brand@v0.1.0` lädt branding@v0.1.0, kopiert Scheme/Fonts/head_custom/Logo/
   Favicon nach `.` (Repo-Root).
4. `ruby/setup-ruby` + `bundle exec jekyll build` — JTD kompiliert `oe5xrx.scss` (weil
   `color_scheme: oe5xrx`), bindet `head_custom.html` + self-hosted Fonts ein.
5. `upload-pages-artifact` + Deploy → markenkonformes dashboard.

## Testing / Verifikation

- **SCSS kompiliert:** `bundle exec jekyll build` in dashboard (mit gefetchtem Layer)
  läuft fehlerfrei; erzeugte CSS enthält die Brand-Farben (`#123B54`/`#F4F7F9`) und
  `@font-face`-IBM-Plex.
- **Action-Copy korrekt:** Dry-Run der Composite-Action (lokal via `act` oder
  Shell-Nachbau) legt alle Dateien an den erwarteten Pfaden ab.
- **Font-URLs auflösbar:** `@font-face`-URLs berücksichtigen baseurl
  (`relative_url`), Fonts unter `/assets/fonts/` erreichbar.
- **Visuelle Endabnahme:** deploytes dashboard zeigt Marine/Cyan-Farben, IBM Plex,
  neues Logo + Favicon (kein Default-blau, kein altes Icon).

## Explizit NICHT in Scope

- Rollout auf **OE5XRX.github.io** und **HW-Module-CI** (späteres, separates Vorhaben;
  HW-Module-CI dann: `apply-brand` einmal mit `dest: doc` im Docs-Build, der
  bestehende setup-Copy fächert an alle HW-Module aus).
- **Dunkel-Scheme + Umschalter** (späterer Rollout).
- **station-manager** (eigenes Design-System, separate Entscheidung Amber vs. Marine).
- **internal-web** (noch kein Frontend).
- Änderung des `just-the-docs`-Themes selbst / Fork.

## Risiken

- **Netzwerk-Abhängigkeit beim Build:** Bricht, wenn GitHub/der Tag nicht erreichbar
  ist. Akzeptiert (branding ist public; Pin auf existierenden Tag). Bewusst gewählt
  gegen hermetische Copy-Builds.
- **baseurl/Font-Pfade:** Falsche `@font-face`-URLs → Fonts laden nicht. Mitigation:
  `relative_url`-Filter + Verifikation im Build.
- **JTD-Variablen-Abdeckung:** Übersehene Variablen lassen Default-blau durchscheinen.
  Mitigation: nach erstem Build gezielt auf Rest-Blau prüfen und Scheme ergänzen.
