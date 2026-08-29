# Jekyll Brand-Layer (PoC dashboard) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Einen wiederverwendbaren OE5XRX-Brand-Layer (Palette-C-hell, self-hosted IBM Plex, Logo, Favicon) für `just-the-docs`-Sites aufbauen, per Composite GitHub Action aus dem `branding`-Repo ausliefern, und als PoC auf `dashboard` anwenden.

**Architecture:** `branding`-Repo hält den kanonischen Layer (`jekyll/`) + eine Composite Action (`.github/actions/apply-brand`), die ihre mitgelieferten Assets via `$GITHUB_ACTION_PATH` in eine Consumer-Site kopiert. Consumer binden sie gepinnt per `uses: OE5XRX/branding/.github/actions/apply-brand@<tag>` vor `jekyll build` ein (SRCREV-Lockfile-Muster). dashboard ist der erste Consumer.

**Tech Stack:** Jekyll + just-the-docs (Gem), GitHub Actions (composite), SCSS, self-hosted WOFF2 (IBM Plex, OFL), Bash.

**Spec:** `docs/superpowers/specs/2026-08-29-jekyll-brand-layer-design.md` (im branding-Repo)

## Global Constraints

- **Distribution:** Build-Time-Fetch **gepinnt** via Composite Action `uses: OE5XRX/branding/.github/actions/apply-brand@<ref>`. Kein committeter Copy im Consumer.
- **Palette C (hell), verbatim:** `--bg #F4F7F9`, `--surface #E8EFF4`, `--text #0D1A24`, `--muted #526070`, `--primary #123B54`, `--accent #0F7A87`, `--border #C8D6E0`.
- **Fonts:** IBM Plex Sans (400/600/700) + IBM Plex Mono (400/600), **self-hosted WOFF2** (kein Google-CDN). OFL.
- **just-the-docs bleibt Gem-Theme.** Brand ist additiver Layer (color_scheme + head_custom + Assets). Kein Fork.
- **Theme-Modus:** nur Hell. Kein Dunkel-Scheme/Toggle in diesem PoC.
- **Scope:** nur PoC dashboard. OE5XRX.github.io + HW-Module-CI NICHT.
- **Logo:** `branding/logo/oe5xrx-horizontal.svg` → Consumer-Pfad `assets/oe5xrx-logo.svg`. Favicon: `branding/export/favicon.ico` → Consumer-Root `favicon.ico`.
- **Action-Ziel-Root:** Input `dest` (default `.`).
- **Commits/Push:** eigene Repos (branding, dashboard); Push erlaubt (Nutzer-Consent für Branding-Arbeit liegt vor). PoC deployt öffentlich auf dashboard-Pages.

---

### Task 1: Self-hosted IBM Plex WOFF2 in den Brand-Layer

**Files:**
- Create: `branding/jekyll/assets/fonts/IBMPlexSans-Regular.woff2`
- Create: `branding/jekyll/assets/fonts/IBMPlexSans-SemiBold.woff2`
- Create: `branding/jekyll/assets/fonts/IBMPlexSans-Bold.woff2`
- Create: `branding/jekyll/assets/fonts/IBMPlexMono-Regular.woff2`
- Create: `branding/jekyll/assets/fonts/IBMPlexMono-SemiBold.woff2`

**Interfaces:**
- Produces: fünf WOFF2-Dateien unter `branding/jekyll/assets/fonts/`, referenziert von `head_custom.html` (Task 2) und kopiert von der Action (Task 3).

- [ ] **Step 1: Fonts von fontsource (OFL) laden**

```bash
cd /home/pbuchegger/OE5XRX/branding
mkdir -p jekyll/assets/fonts
base="https://cdn.jsdelivr.net/fontsource/fonts"
curl -fsSL "$base/ibm-plex-sans@latest/latin-400-normal.woff2" -o jekyll/assets/fonts/IBMPlexSans-Regular.woff2
curl -fsSL "$base/ibm-plex-sans@latest/latin-600-normal.woff2" -o jekyll/assets/fonts/IBMPlexSans-SemiBold.woff2
curl -fsSL "$base/ibm-plex-sans@latest/latin-700-normal.woff2" -o jekyll/assets/fonts/IBMPlexSans-Bold.woff2
curl -fsSL "$base/ibm-plex-mono@latest/latin-400-normal.woff2" -o jekyll/assets/fonts/IBMPlexMono-Regular.woff2
curl -fsSL "$base/ibm-plex-mono@latest/latin-600-normal.woff2" -o jekyll/assets/fonts/IBMPlexMono-SemiBold.woff2
```

- [ ] **Step 2: Verifizieren (nicht leer, echtes WOFF2)**

```bash
cd /home/pbuchegger/OE5XRX/branding
for f in jekyll/assets/fonts/*.woff2; do
  sz=$(stat -c%s "$f"); hdr=$(head -c4 "$f" | tr -d '\0')
  echo "$f  ${sz}B  magic=$hdr"
  [ "$sz" -gt 5000 ] && [ "$hdr" = "wOF2" ] || { echo "FAIL $f"; exit 1; }
done
```
Expected: alle 5 Dateien > 5 kB, Magic `wOF2`.

- [ ] **Step 3: Commit**

```bash
cd /home/pbuchegger/OE5XRX/branding
git add jekyll/assets/fonts/
git commit -m "feat(jekyll): add self-hosted IBM Plex WOFF2 (OFL) for brand layer"
```

---

### Task 2: Color-Scheme + head_custom + Layer-README

**Files:**
- Create: `branding/jekyll/_sass/color_schemes/oe5xrx.scss`
- Create: `branding/jekyll/_includes/head_custom.html`
- Create: `branding/jekyll/README.md`

**Interfaces:**
- Consumes: die WOFF2-Dateinamen aus Task 1.
- Produces: `oe5xrx.scss` (JTD-Color-Scheme, definiert Farb- + Font-Family-Variablen), `head_custom.html` (@font-face + theme-color). Beide werden von der Action (Task 3) kopiert; `color_scheme: oe5xrx` (Task 5) aktiviert das Scheme.

- [ ] **Step 1: Color-Scheme schreiben**

`branding/jekyll/_sass/color_schemes/oe5xrx.scss` — just-the-docs-Variablen-Overrides (Palette C hell). KEINE `@import`, nur Variablenzuweisungen:
```scss
// OE5XRX brand color scheme (Palette C, light) for just-the-docs.
// Do not edit in consumer repos — canonical source: OE5XRX/branding jekyll/.

$body-background-color:    #F4F7F9;
$sidebar-color:            #E8EFF4;
$search-background-color:  #FFFFFF;
$table-background-color:   #FFFFFF;
$code-background-color:    #E8EFF4;
$feedback-color:           darken(#E8EFF4, 3%);

$body-text-color:          #0D1A24;
$body-heading-color:       #0D1A24;
$nav-child-link-color:     #123B54;
$link-color:               #123B54;
$btn-primary-color:        #123B54;
$base-button-color:        #F4F7F9;

$border-color:             #C8D6E0;

$body-font-family:  "IBM Plex Sans", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
$mono-font-family:  "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
```

- [ ] **Step 2: head_custom.html schreiben (@font-face + theme-color)**

`branding/jekyll/_includes/head_custom.html` — baseurl-sichere Font-URLs via `relative_url`:
```html
{% comment %} OE5XRX brand — self-hosted IBM Plex + theme-color. Canonical: OE5XRX/branding. {% endcomment %}
<meta name="theme-color" content="#123B54">
<style>
  @font-face { font-family: "IBM Plex Sans"; font-style: normal; font-weight: 400;
    font-display: swap; src: url("{{ '/assets/fonts/IBMPlexSans-Regular.woff2' | relative_url }}") format("woff2"); }
  @font-face { font-family: "IBM Plex Sans"; font-style: normal; font-weight: 600;
    font-display: swap; src: url("{{ '/assets/fonts/IBMPlexSans-SemiBold.woff2' | relative_url }}") format("woff2"); }
  @font-face { font-family: "IBM Plex Sans"; font-style: normal; font-weight: 700;
    font-display: swap; src: url("{{ '/assets/fonts/IBMPlexSans-Bold.woff2' | relative_url }}") format("woff2"); }
  @font-face { font-family: "IBM Plex Mono"; font-style: normal; font-weight: 400;
    font-display: swap; src: url("{{ '/assets/fonts/IBMPlexMono-Regular.woff2' | relative_url }}") format("woff2"); }
  @font-face { font-family: "IBM Plex Mono"; font-style: normal; font-weight: 600;
    font-display: swap; src: url("{{ '/assets/fonts/IBMPlexMono-SemiBold.woff2' | relative_url }}") format("woff2"); }
</style>
```
(Verwende `{% comment %}`-Tags, nicht `{# #}` — HTML-Kommentar hier ok, aber Liquid-Kommentar-Konvention beachten.)

- [ ] **Step 3: Layer-README**

`branding/jekyll/README.md`:
```markdown
# OE5XRX Jekyll Brand-Layer

Kanonischer Brand-Layer für just-the-docs-Sites. Wird per Composite Action
`OE5XRX/branding/.github/actions/apply-brand@<tag>` in Consumer kopiert.

Inhalt:
- `_sass/color_schemes/oe5xrx.scss` — Farb- + Font-Scheme (Palette C, hell).
- `_includes/head_custom.html` — @font-face (self-hosted IBM Plex) + theme-color.
- `assets/fonts/*.woff2` — IBM Plex Sans/Mono (OFL).

Consumer-Setup (in `_config.yml`):
    color_scheme: oe5xrx
    logo: "/assets/oe5xrx-logo.svg"
    favicon_ico: "/favicon.ico"

Und im Build-Workflow vor `jekyll build`:
    - uses: OE5XRX/branding/.github/actions/apply-brand@v0.1.0

Nicht in Consumer-Repos editieren — hier ist die Single Source.
```

- [ ] **Step 4: SCSS-Syntax grob prüfen (falls sass vorhanden)**

```bash
cd /home/pbuchegger/OE5XRX/branding
if command -v sass >/dev/null; then
  printf '%s\n' '@import "jekyll/_sass/color_schemes/oe5xrx";' > /tmp/t.scss
  sass --no-source-map /tmp/t.scss /tmp/t.css 2>&1 | head || true
fi
# Mindestens: keine offensichtlichen Syntaxfehler, alle 7 Palette-Farben präsent
grep -c '#F4F7F9\|#E8EFF4\|#0D1A24\|#123B54\|#0F7A87\|#C8D6E0' jekyll/_sass/color_schemes/oe5xrx.scss
grep -c 'IBM Plex Sans\|IBM Plex Mono' jekyll/_sass/color_schemes/oe5xrx.scss
```
Expected: Farb- und Font-Vars vorhanden. (sass ist optional — JTD-Kompilierung erfolgt final im dashboard-Build, Task 7.)

- [ ] **Step 5: Commit**

```bash
cd /home/pbuchegger/OE5XRX/branding
git add jekyll/_sass jekyll/_includes jekyll/README.md
git commit -m "feat(jekyll): add oe5xrx color scheme, head_custom font-face, layer README"
```

---

### Task 3: Composite Action `apply-brand`

**Files:**
- Create: `branding/.github/actions/apply-brand/action.yml`

**Interfaces:**
- Consumes: `branding/jekyll/**` (Task 1+2), `branding/logo/oe5xrx-horizontal.svg`, `branding/export/favicon.ico` (bestehend).
- Produces: Composite Action mit Input `dest` (default `.`), die Scheme/Fonts/head_custom/Logo/Favicon in `<dest>` kopiert. Consumierbar als `uses: OE5XRX/branding/.github/actions/apply-brand@<ref>`.

- [ ] **Step 1: action.yml schreiben**

`branding/.github/actions/apply-brand/action.yml`:
```yaml
name: "Apply OE5XRX Brand"
description: "Kopiert den OE5XRX-Brand-Layer (Farben, Fonts, Logo, Favicon) in eine just-the-docs-Site."
inputs:
  dest:
    description: "Jekyll-Source-Root, in den kopiert wird."
    required: false
    default: "."
runs:
  using: "composite"
  steps:
    - shell: bash
      run: |
        set -euo pipefail
        ROOT="$(cd "$GITHUB_ACTION_PATH/../../.." && pwd)"   # branding-Repo-Root
        DEST="${{ inputs.dest }}"
        mkdir -p "$DEST/_sass/color_schemes" "$DEST/_includes" "$DEST/assets/fonts"
        cp "$ROOT/jekyll/_sass/color_schemes/oe5xrx.scss" "$DEST/_sass/color_schemes/"
        cp "$ROOT/jekyll/_includes/head_custom.html"      "$DEST/_includes/"
        cp "$ROOT"/jekyll/assets/fonts/*.woff2            "$DEST/assets/fonts/"
        cp "$ROOT/logo/oe5xrx-horizontal.svg"             "$DEST/assets/oe5xrx-logo.svg"
        cp "$ROOT/export/favicon.ico"                     "$DEST/favicon.ico"
        echo "OE5XRX brand layer applied to '$DEST':"
        ls -R "$DEST/_sass/color_schemes" "$DEST/_includes" "$DEST/assets/fonts" "$DEST/assets/oe5xrx-logo.svg" "$DEST/favicon.ico"
```

- [ ] **Step 2: action.yml validieren (YAML + Struktur)**

```bash
cd /home/pbuchegger/OE5XRX/branding
python3 -c "import yaml,sys; d=yaml.safe_load(open('.github/actions/apply-brand/action.yml')); assert d['runs']['using']=='composite'; assert d['inputs']['dest']['default']=='.'; print('action.yml OK')"
```
Expected: `action.yml OK`.

- [ ] **Step 3: Copy-Logik lokal trocken testen (simuliert den Runner)**

```bash
cd /home/pbuchegger/OE5XRX/branding
rm -rf /tmp/branddest && mkdir -p /tmp/branddest
GITHUB_ACTION_PATH="$(pwd)/.github/actions/apply-brand" DEST=/tmp/branddest bash -c '
  set -euo pipefail
  ROOT="$(cd "$GITHUB_ACTION_PATH/../../.." && pwd)"
  mkdir -p "$DEST/_sass/color_schemes" "$DEST/_includes" "$DEST/assets/fonts"
  cp "$ROOT/jekyll/_sass/color_schemes/oe5xrx.scss" "$DEST/_sass/color_schemes/"
  cp "$ROOT/jekyll/_includes/head_custom.html" "$DEST/_includes/"
  cp "$ROOT"/jekyll/assets/fonts/*.woff2 "$DEST/assets/fonts/"
  cp "$ROOT/logo/oe5xrx-horizontal.svg" "$DEST/assets/oe5xrx-logo.svg"
  cp "$ROOT/export/favicon.ico" "$DEST/favicon.ico"
'
# Verify all expected files landed
test -f /tmp/branddest/_sass/color_schemes/oe5xrx.scss
test -f /tmp/branddest/_includes/head_custom.html
test $(ls /tmp/branddest/assets/fonts/*.woff2 | wc -l) -eq 5
test -f /tmp/branddest/assets/oe5xrx-logo.svg
test -f /tmp/branddest/favicon.ico
echo "dry-run copy OK"
```
Expected: `dry-run copy OK` (alle Zielpfade vorhanden, 5 Fonts).

- [ ] **Step 4: Commit + Push (branding-Layer ist jetzt komplett)**

```bash
cd /home/pbuchegger/OE5XRX/branding
git add .github/actions/apply-brand/action.yml
git commit -m "feat(ci): add apply-brand composite action (fetch+copy brand layer)"
git push origin main
```

---

### Task 4: branding-Release taggen `v0.1.0`

**Files:** (keine Datei; Git-Tag)

**Interfaces:**
- Consumes: gepushter `main` mit Tasks 1–3.
- Produces: Tag `v0.1.0` auf `branding`, auf den dashboard pinnt.

- [ ] **Step 1: Tag setzen + pushen**

```bash
cd /home/pbuchegger/OE5XRX/branding
git tag -a v0.1.0 -m "OE5XRX brand v0.1.0 — logo (final geometry), Palette C, IBM Plex, jekyll brand layer + apply-brand action"
git push origin v0.1.0
```

- [ ] **Step 2: Verifizieren**

```bash
cd /home/pbuchegger/OE5XRX/branding
gh api repos/OE5XRX/branding/git/refs/tags/v0.1.0 -q .ref
gh api repos/OE5XRX/branding/contents/.github/actions/apply-brand/action.yml?ref=v0.1.0 -q .name
```
Expected: `refs/tags/v0.1.0` und `action.yml` am Tag erreichbar.

---

### Task 5: dashboard `_config.yml` + Cleanup + `.gitignore`

**Files:**
- Modify: `dashboard/_config.yml`
- Modify: `dashboard/.gitignore`
- Delete (falls vorhanden): `dashboard/assets/Icon.png`, `dashboard/favicon.ico` (werden vom Brand-Layer ersetzt)

**Interfaces:**
- Consumes: Standard-Pfade des Brand-Layers (`assets/oe5xrx-logo.svg`, `favicon.ico`, `color_scheme: oe5xrx`).
- Produces: dashboard-Config, die das Scheme aktiviert und auf die gefetchten Assets zeigt.

- [ ] **Step 1: Aktuellen dashboard-Stand ansehen**

```bash
cd /home/pbuchegger/OE5XRX/dashboard
sed -n '1,20p' _config.yml
cat .gitignore 2>/dev/null || echo "(kein .gitignore)"
ls assets/ 2>/dev/null; ls favicon.ico 2>/dev/null
# JTD-Scheme-Mechanik prüfen: gibt es ein assets/css/ stylesheet?
ls assets/css/ 2>/dev/null || echo "(kein assets/css — JTD Gem-Default)"
```

- [ ] **Step 2: `_config.yml` auf Brand umstellen**

In `dashboard/_config.yml` setzen/ersetzen (Theme-Zeile `theme: just-the-docs` bleibt):
```yaml
color_scheme: oe5xrx
logo: "/assets/oe5xrx-logo.svg"
favicon_ico: "/favicon.ico"
```
(Alte `logo:`/`favicon_ico:`-Werte ersetzen, nicht doppeln.)

- [ ] **Step 3: JTD-Scheme-Wiring sicherstellen**

just-the-docs benötigt, dass das Scheme kompiliert wird. Prüfen, ob dashboard eine `assets/css/`-Stylesheet-Einstiegsdatei hat. Falls **nicht** vorhanden, anlegen `dashboard/assets/css/style.scss`:
```scss
---
---
@import "just-the-docs";
```
(Mit `color_scheme: oe5xrx` in `_config.yml` zieht JTD dann `_sass/color_schemes/oe5xrx.scss`. Falls dashboard bereits eine solche Datei hat, unverändert lassen.)

- [ ] **Step 4: Alte committete Brand-Assets entfernen + ignorieren**

```bash
cd /home/pbuchegger/OE5XRX/dashboard
git rm --cached -q assets/Icon.png favicon.ico 2>/dev/null || true
rm -f assets/Icon.png favicon.ico
cat >> .gitignore <<'EOF'

# OE5XRX brand layer (fetched at build via apply-brand action — do not commit)
/_sass/color_schemes/oe5xrx.scss
/_includes/head_custom.html
/assets/fonts/
/assets/oe5xrx-logo.svg
/favicon.ico
EOF
```

- [ ] **Step 5: Commit**

```bash
cd /home/pbuchegger/OE5XRX/dashboard
git add _config.yml .gitignore assets/css/style.scss 2>/dev/null; git add -A
git commit -m "feat: adopt OE5XRX brand scheme (color_scheme, logo, favicon) + ignore fetched brand assets"
```

---

### Task 6: dashboard-Workflow — apply-brand vor dem Build

**Files:**
- Modify: `dashboard/.github/workflows/jekyll.yml`

**Interfaces:**
- Consumes: `OE5XRX/branding/.github/actions/apply-brand@v0.1.0` (Task 4).
- Produces: Build, der vor `jekyll build` den Brand-Layer fetcht+kopiert.

- [ ] **Step 1: Fetch-Step einfügen**

In `dashboard/.github/workflows/jekyll.yml` im `build`-Job **nach** `actions/checkout` und **vor** `bundle exec jekyll build` einfügen:
```yaml
      - name: Apply OE5XRX brand layer
        uses: OE5XRX/branding/.github/actions/apply-brand@v0.1.0
```
(Kein `with:` nötig — `dest` default `.` passt für dashboard = Repo-Root.)

- [ ] **Step 2: Workflow-YAML validieren**

```bash
cd /home/pbuchegger/OE5XRX/dashboard
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/jekyll.yml')); print('workflow YAML OK')"
grep -n 'apply-brand@v0.1.0' .github/workflows/jekyll.yml
# Reihenfolge: checkout vor apply-brand vor jekyll build
grep -nE 'actions/checkout|apply-brand|jekyll build' .github/workflows/jekyll.yml
```
Expected: `apply-brand` steht zwischen `checkout` und `jekyll build`.

- [ ] **Step 3: Commit + Push (löst dashboard-Build aus)**

```bash
cd /home/pbuchegger/OE5XRX/dashboard
git add .github/workflows/jekyll.yml
git commit -m "ci: fetch OE5XRX brand layer (apply-brand@v0.1.0) before jekyll build"
git push origin main
```

---

### Task 7: E2E-Verifikation am deployten dashboard

**Files:** (keine)

**Interfaces:**
- Consumes: dashboard-Deploy (Task 6) + branding@v0.1.0 (Task 4).
- Produces: bestätigt markenkonformes, live gebautes dashboard.

- [ ] **Step 1: Build-Status abwarten (Kontor: ScheduleWakeup, kein Block-Wait)**

```bash
cd /home/pbuchegger/OE5XRX/dashboard
gh run list --workflow=jekyll.yml -L 1
```
Falls noch laufend: via ScheduleWakeup ~90 s später erneut prüfen (kein blockierendes Warten). Bei Fehlschlag: `gh run view --log-failed` → Ursache fixen (häufig: JTD-Scheme-Wiring Task 5 Step 3, oder Font-Pfad).

- [ ] **Step 2: apply-brand-Step-Log prüfen**

```bash
cd /home/pbuchegger/OE5XRX/dashboard
rid=$(gh run list --workflow=jekyll.yml -L 1 --json databaseId -q '.[0].databaseId')
gh run view "$rid" --log | grep -A6 'Apply OE5XRX brand layer' | head -20
```
Expected: Kopier-Ausgabe listet oe5xrx.scss, head_custom.html, 5 Fonts, Logo, favicon.

- [ ] **Step 3: Live-Site auf Brand prüfen**

dashboard-Pages-URL ermitteln (`gh api repos/OE5XRX/dashboard/pages -q .html_url`), dann:
```bash
base=$(gh api repos/OE5XRX/dashboard/pages -q .html_url)
echo "URL: $base"
curl -s -o /dev/null -w 'site %{http_code}\n' "$base"
# gebautes CSS enthält Brand-Primary?
css=$(curl -s "$base" | grep -oE 'assets/css/[^"]+\.css' | head -1)
curl -s "$base/${css#*/}" 2>/dev/null | grep -ioE '#123b54|#f4f7f9' | sort -u
# Font geladen?
curl -s -o /dev/null -w 'font %{http_code}\n' "$base/assets/fonts/IBMPlexSans-Regular.woff2"
# Favicon + Logo
curl -s -o /dev/null -w 'favicon %{http_code}\n' "$base/favicon.ico"
curl -s -o /dev/null -w 'logo %{http_code}\n' "$base/assets/oe5xrx-logo.svg"
```
Expected: Site 200; CSS enthält `#123b54`/`#f4f7f9`; Font/Favicon/Logo je 200.

- [ ] **Step 4: Rest-Blau-Check (übersehene JTD-Variablen)**

Gebautes CSS + Startseite visuell/textuell auf just-the-docs-Default-Blau (`#2c84fa`, `#7253ed`, `#5c5962`-Links) prüfen. Falls Default-Blau durchscheint: die betreffende JTD-Variable in `branding/jekyll/_sass/color_schemes/oe5xrx.scss` ergänzen (z. B. `$link-color`-Abkömmlinge, Search-Highlight), neuen Patch-Tag `v0.1.1` setzen, dashboard-Pin bumpen, erneut bauen. Im Report festhalten, ob nötig.

- [ ] **Step 5: Abschluss-Notiz**

Kein Commit. Ergebnis (URL, HTTP-Codes, gefundene Brand-Farben, ob Rest-Blau) im Task-Report festhalten.

---

## Self-Review

**Spec coverage:**
- Kanonischer Layer `branding/jekyll/` (scheme, head_custom, fonts) → Tasks 1–2 ✅
- Logo/Favicon aus bestehenden Pfaden (keine Dubletten) → Task 3 (Action kopiert) ✅
- Composite Action `apply-brand`, Input `dest` default `.` → Task 3 ✅
- Fetch-pinned via `uses@ref`, SRCREV-Muster → Task 6 (`@v0.1.0`) ✅
- Tag `v0.1.0` → Task 4 ✅
- dashboard-Integration (`color_scheme`, logo, favicon, workflow) → Tasks 5–6 ✅
- Self-hosted WOFF2, DSGVO (kein CDN) → Task 1 + Task 2 (@font-face lokal) ✅
- Nur Hell, nur PoC dashboard → Global Constraints, keine anderen Sites berührt ✅
- Testing (SCSS kompiliert, Action-Copy, Font-URLs, visuelle Abnahme) → Task 2 Step 4, Task 3 Step 3, Task 7 ✅
- Risiko baseurl/Font-Pfade → `relative_url` in Task 2; verifiziert Task 7 Step 3 ✅
- Risiko JTD-Variablen-Abdeckung (Rest-Blau) → Task 7 Step 4 ✅
- Risiko JTD-Scheme-Wiring (assets/css) → Task 5 Step 3 ✅

**Placeholder scan:** Konkrete Font-URLs, vollständiger scss/html/yaml-Inhalt, echte Verifikations-Commands. Keine TBD/TODO. Font-Dateiinhalte (Binär) werden geladen, nicht im Plan eingebettet — legitim.

**Type/Namens-Konsistenz:** Font-Dateinamen identisch in Task 1 (create), Task 2 (@font-face `IBMPlexSans-Regular.woff2` …) und Task 3 (`*.woff2`-Copy). Zielpfade konsistent: `assets/oe5xrx-logo.svg`, `favicon.ico`, `_sass/color_schemes/oe5xrx.scss`, `_includes/head_custom.html` in Task 3 (Action), Task 5 (config/gitignore), Task 6/7 (verify). Tag `v0.1.0` identisch Task 4/6.
