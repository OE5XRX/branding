# OE5XRX Branding-System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein wiederverwendbares Vereins-Brand-System als eigenes Repo `OE5XRX/branding` mit vektorisiertem, theme-fähigem Logo, Farbpalette, Typografie, Design-Tokens und einer GitHub-Pages-Guideline-Seite.

**Architecture:** Neues statisches Repo (kein Jekyll). Die Turm-Marke aus dem bestehenden `Icon.png` wird als rahmenloses, `currentColor`-basiertes SVG nachgezeichnet. Eine `index.html`-Guideline referenziert die echten Assets direkt (Dogfooding) und dient zugleich als Browser-Vorschau, in der der Nutzer aus 3 Paletten- und 2–3 Schrift-Kandidaten auswählt. Nach der Auswahl werden Tokens/Fonts festgezogen und Raster-Exports generiert.

**Tech Stack:** Reines HTML/CSS/JS, SVG (currentColor), `cairosvg` (SVG→PNG), ImageMagick (`convert`/`magick`, PNG→ICO + Resize), GitHub Pages (deploy from branch), `gh` CLI.

**Spec:** `docs/superpowers/specs/2026-08-29-branding-system-design.md`

## Global Constraints

- **Referenz-Logo:** einzig `OE5XRX.github.io/Icon.png` (1024×1024). Der Ordner `brand-previews/` wird **komplett ignoriert**.
- **Rahmen weglassen:** Der abgerundete Rahmen des Originals wird NICHT übernommen.
- **Theme-Mechanik:** Logo-SVGs nutzen `fill`/`stroke="currentColor"` — ein SVG deckt hell+dunkel ab. Fixed-Color-Dateien nur als expliziter Fallback.
- **Wortmark:** „OE5XRX" wird als Outline-Pfad gezeichnet, NICHT als Live-Font (keine Font-Abhängigkeit).
- **Kein Jekyll:** `.nojekyll` an Repo-Root; reines statisches HTML.
- **Palette & Schrift** sind erst nach dem Nutzer-Checkpoint (Task 8) final. Vorher: Kandidaten, keine finalen Tokens.
- **Scope:** nur Brand-System. Kein Ausrollen auf Apps.
- **Commits:** häufig, ein Task = ein sinnvoller Commit (oder mehrere kleine). Squash beim späteren PR ist Konvention, hier aber eigenes Repo.
- **Org/Repo:** `OE5XRX/branding`, `gh` als `peterus`.

---

### Task 1: Repo-Grundgerüst `OE5XRX/branding`

**Files:**
- Create: `branding/.nojekyll`
- Create: `branding/.gitignore`
- Create: `branding/README.md`
- Create: `branding/logo/.gitkeep`, `branding/color/.gitkeep`, `branding/type/.gitkeep`, `branding/export/.gitkeep`

**Interfaces:**
- Produces: lokales Repo unter `/home/pbuchegger/OE5XRX/branding`, GitHub-Repo `OE5XRX/branding`, Ordnerstruktur aus dem Spec.

- [ ] **Step 1: Lokales Repo + Struktur anlegen**

```bash
cd /home/pbuchegger/OE5XRX
mkdir -p branding/{logo,color,type,export}
cd branding
git init -b main
touch .nojekyll logo/.gitkeep color/.gitkeep type/.gitkeep export/.gitkeep
printf "export/*.tmp\n.DS_Store\n" > .gitignore
```

- [ ] **Step 2: README-Grundgerüst schreiben**

`branding/README.md`:

```markdown
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
```

- [ ] **Step 3: GitHub-Repo anlegen + pushen**

```bash
cd /home/pbuchegger/OE5XRX/branding
git add -A && git commit -m "chore: scaffold branding repo structure"
gh repo create OE5XRX/branding --public --source=. --remote=origin --push
```

- [ ] **Step 4: Verifizieren**

Run: `gh repo view OE5XRX/branding --json name,visibility -q '.name+" "+.visibility'`
Expected: `branding public`
Run: `ls -R /home/pbuchegger/OE5XRX/branding` → alle Ordner + `.nojekyll` vorhanden.

---

### Task 2: Turm-Marke vektorisieren → `logo/oe5xrx-mark.svg`

Kern-Task. Die Turm-Marke aus `Icon.png` als rahmenloses SVG nachzeichnen. Elemente laut Original: zentraler Mast als schmales A-Frame/Dreieck mit innerer X-Kreuzverstrebung im unteren Drittel und kleinem Apex-Knoten oben; je zwei konzentrische Wellenbögen links und rechts des Apex; Blitz oberhalb des Apex. Quadratische Bounding-Box, zentriert, mit Schutzraum.

**Files:**
- Create: `branding/logo/oe5xrx-mark.svg`
- Create (temp, nicht committen): `/tmp/mark-cmp.png`

**Interfaces:**
- Produces: `oe5xrx-mark.svg` — `viewBox="0 0 128 128"`, alle Formen `stroke="currentColor"` bzw. `fill="currentColor"`, KEINE festen Farben, kein Rahmen. Basis-Glyph für alle Lockups, Favicon und PWA-Icons.

- [ ] **Step 1: Original zur Referenz isolieren**

```bash
cd /home/pbuchegger/OE5XRX
identify OE5XRX.github.io/Icon.png   # 1024x1024 bestätigen
cp OE5XRX.github.io/Icon.png /tmp/orig.png
```
Original visuell einprägen (Read auf die PNG): Mast-Proportionen, Wellenanzahl (2 je Seite), Blitz-Position, Strichstärke relativ zur Fläche.

- [ ] **Step 2: SVG zeichnen (currentColor, rahmenlos)**

`branding/logo/oe5xrx-mark.svg` — Struktur (Koordinaten beim Zeichnen an Original angleichen; Strichstärke ~ so dick wie im Original relativ zur Höhe):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="OE5XRX">
  <g fill="none" stroke="currentColor" stroke-width="7"
     stroke-linecap="round" stroke-linejoin="round">
    <!-- Wellen links -->
    <path d="..."/>   <!-- äußerer Bogen links -->
    <path d="..."/>   <!-- innerer Bogen links -->
    <!-- Wellen rechts -->
    <path d="..."/>   <!-- äußerer Bogen rechts -->
    <path d="..."/>   <!-- innerer Bogen rechts -->
    <!-- Mast: A-Frame -->
    <path d="..."/>   <!-- linkes Bein -->
    <path d="..."/>   <!-- rechtes Bein -->
    <!-- X-Kreuzverstrebung unteres Drittel -->
    <path d="..."/>
    <path d="..."/>
    <!-- Apex-Knoten -->
    <circle cx="64" cy=".." r=".." fill="currentColor" stroke="none"/>
  </g>
  <!-- Blitz oben (gefüllt) -->
  <path d="..." fill="currentColor"/>
</svg>
```

Konkrete Pfad-Koordinaten iterativ aus dem Original ableiten (Schritt 3–4 als Loop). Der Blitz ist eine gefüllte Zickzack-Fläche, die Wellen sind offene Bögen, der Mast offene Linien.

- [ ] **Step 3: Nach PNG rendern und mit Original vergleichen**

```bash
cd /home/pbuchegger/OE5XRX/branding
cairosvg logo/oe5xrx-mark.svg -o /tmp/mark-cmp.png -W 1024 -H 1024 -b white
magick montage /tmp/orig.png /tmp/mark-cmp.png -tile 2x1 -geometry +6+6 /tmp/mark-sidebyside.png
```
Danach `/tmp/mark-sidebyside.png` per Read ansehen.

- [ ] **Step 4: Iterieren bis Treue stimmt**

Expected: Silhouette (Mast-Winkel, Wellenbögen, Blitz, Apex) liegt erkennbar deckungsgleich zum Original — nur ohne Rahmen. Bei Abweichung Koordinaten/Strichstärke in `oe5xrx-mark.svg` anpassen und Step 3 wiederholen. Abbruchkriterium: Nutzer-erkennbar dasselbe Logo.

- [ ] **Step 5: Theme-Check (dunkler Grund)**

```bash
cairosvg logo/oe5xrx-mark.svg -o /tmp/mark-dark.png -W 512 -H 512 -b '#111111'
```
Read `/tmp/mark-dark.png`. Expected: nichts sichtbar (currentColor=schwarz auf schwarz → belegt, dass keine festen Farben drinstecken). Dann Kontrolle mit gesetzter Farbe:
```bash
sed 's/currentColor/#e8e8e8/g' logo/oe5xrx-mark.svg > /tmp/mark-white.svg
cairosvg /tmp/mark-white.svg -o /tmp/mark-white.png -W 512 -H 512 -b '#111111'
```
Read `/tmp/mark-white.png`. Expected: helles Logo klar auf dunklem Grund sichtbar.

- [ ] **Step 6: Commit**

```bash
git add logo/oe5xrx-mark.svg
git commit -m "feat(logo): vectorize tower mark as theme-adaptive SVG"
```

---

### Task 3: Wortmark → `logo/oe5xrx-wordmark.svg`

**Files:**
- Create: `branding/logo/oe5xrx-wordmark.svg`

**Interfaces:**
- Consumes: die Buchstabenform-Optik aus `Icon.png` (rundlich-geometrisch, bold).
- Produces: `oe5xrx-wordmark.svg` — „OE5XRX" als **Outline-Pfade** (kein `<text>`), `fill="currentColor"`, horizontale Bounding-Box, gleiche optische Höhe wie im Original-Verhältnis.

- [ ] **Step 1: Wortmark als Outline erzeugen**

Zwei erlaubte Wege — der Executor wählt den mit besserem Ergebnis:
1. Eine passende freie Schrift lokal zu Pfaden konvertieren (z.B. via `python3` + `fonttools`/`freetype` oder Inkscape-freier Weg mit `text-to-path`), dann Pfade ins SVG übernehmen.
2. Falls kein Font-zu-Pfad-Tool sauber läuft: Buchstaben aus geometrischen Pfaden nachzeichnen (rundlich-geometrisch, bold, wie Original).

`branding/logo/oe5xrx-wordmark.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 96" role="img" aria-label="OE5XRX">
  <path fill="currentColor" d="..."/>  <!-- OE5XRX als Outline -->
</svg>
```

- [ ] **Step 2: Rendern + gegen Original-Schriftzug prüfen**

```bash
cd /home/pbuchegger/OE5XRX/branding
cairosvg logo/oe5xrx-wordmark.svg -o /tmp/wordmark.png -W 720 -b white
```
Read `/tmp/wordmark.png`. Expected: „OE5XRX" lesbar, Proportionen nahe am Original-Schriftzug.

- [ ] **Step 3: Commit**

```bash
git add logo/oe5xrx-wordmark.svg
git commit -m "feat(logo): add OE5XRX wordmark as outline paths"
```

---

### Task 4: Lockups + Fixed-Color-Fallbacks

**Files:**
- Create: `branding/logo/oe5xrx-full.svg` (vertikal: Mark über Wortmark)
- Create: `branding/logo/oe5xrx-horizontal.svg` (Mark links, Wortmark rechts)
- Create: `branding/logo/oe5xrx-full-petrol.svg` (fixed color)
- Create: `branding/logo/oe5xrx-full-white.svg` (fixed color)
- Create: `branding/logo/favicon.svg` (= Mark, quadratisch, ggf. leicht optimiert)

**Interfaces:**
- Consumes: `oe5xrx-mark.svg`, `oe5xrx-wordmark.svg` (Pfad-Inhalte werden eingebettet, nicht via `<use href>` extern referenziert — SVGs müssen standalone funktionieren).
- Produces: fünf zusätzliche Logo-Dateien. Alle `currentColor` außer den beiden `-petrol`/`-white` Fallbacks (feste Werte: Petrol `#1E5A6E` — im finalen Token nach Task 9 ggf. angleichen; Weiß `#FFFFFF`).

- [ ] **Step 1: Vertikales Full-Lockup bauen**

Mark-Gruppe + Wortmark-Gruppe in einem `viewBox` vertikal stapeln, zentriert, mit definiertem Abstand. `branding/logo/oe5xrx-full.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 176" role="img" aria-label="OE5XRX">
  <g><!-- mark-Pfade, y 0..128 --></g>
  <g transform="translate(..,132)"><!-- wordmark-Pfade skaliert --></g>
</svg>
```

- [ ] **Step 2: Horizontales Lockup bauen**

`branding/logo/oe5xrx-horizontal.svg` — Mark links (0..128 breit), Wortmark rechts vertikal zentriert.

- [ ] **Step 3: Fixed-Color-Fallbacks erzeugen**

```bash
cd /home/pbuchegger/OE5XRX/branding
sed 's/currentColor/#1E5A6E/g' logo/oe5xrx-full.svg > logo/oe5xrx-full-petrol.svg
sed 's/currentColor/#FFFFFF/g' logo/oe5xrx-full.svg > logo/oe5xrx-full-white.svg
cp logo/oe5xrx-mark.svg logo/favicon.svg
```

- [ ] **Step 4: Alle rendern + Sichtprüfung**

```bash
for f in full horizontal full-petrol full-white favicon; do
  cairosvg logo/oe5xrx-$f.svg -o /tmp/logo-$f.png -W 512 -b '#cccccc' 2>/dev/null || \
  cairosvg logo/$f.svg -o /tmp/logo-$f.png -W 512 -b '#cccccc'
done
magick montage /tmp/logo-*.png -tile 3x2 -geometry +6+6 /tmp/logo-all.png
```
Read `/tmp/logo-all.png`. Expected: alle Varianten korrekt, currentColor-Varianten auf grau sichtbar, petrol/white in ihren Farben.

- [ ] **Step 5: Commit**

```bash
git add logo/
git commit -m "feat(logo): add vertical/horizontal lockups, fixed-color fallbacks, favicon"
```

---

### Task 5: Guideline-Gerüst `index.html` + Logo-Sektion + `tokens.css`-Platzhalter

**Files:**
- Create: `branding/index.html`
- Create: `branding/color/tokens.css` (vorläufig, wird in Task 9 final)
- Create: `branding/site.css` (Layout der Guideline-Seite)
- Create: `branding/site.js` (Theme-Toggle)

**Interfaces:**
- Consumes: alle `logo/*.svg`.
- Produces: lauffähige `index.html` mit hell/dunkel-Umschalter, die die echten Logo-SVGs auf hellem UND dunklem Swatch zeigt, plus einen direkten Side-by-side „Original-PNG vs. Vektor"-Vergleich.

- [ ] **Step 1: `tokens.css`-Platzhalter (neutral, hell/dunkel)**

`branding/color/tokens.css`:
```css
:root{
  --bg:#ffffff; --surface:#f4f4f2; --text:#1a1a1a; --muted:#6b6b6b;
  --primary:#1E5A6E; --accent:#1E5A6E; --border:#dcdcda;
  --success:#2e7d32; --warn:#b26a00; --error:#c62828;
}
@media (prefers-color-scheme:dark){
  :root{ --bg:#111418; --surface:#1a1f26; --text:#e8e8e8; --muted:#9aa4ad;
    --primary:#5fb3c9; --accent:#5fb3c9; --border:#2a313a; }
}
[data-theme="dark"]{ --bg:#111418; --surface:#1a1f26; --text:#e8e8e8; --muted:#9aa4ad;
  --primary:#5fb3c9; --accent:#5fb3c9; --border:#2a313a; }
[data-theme="light"]{ --bg:#ffffff; --surface:#f4f4f2; --text:#1a1a1a; --muted:#6b6b6b;
  --primary:#1E5A6E; --accent:#1E5A6E; --border:#dcdcda; }
```

- [ ] **Step 2: `site.css` + `site.js` (Theme-Toggle)**

`site.js`:
```js
const btn = document.getElementById('theme-toggle');
btn?.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme')
    || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', cur === 'dark' ? 'light' : 'dark');
});
```
`site.css`: einfaches Layout mit `background:var(--bg); color:var(--text)`, Swatch-Boxen `.swatch-light{background:#fff;color:#111}` und `.swatch-dark{background:#111;color:#eee}` für die Logo-auf-hell/dunkel-Darstellung.

- [ ] **Step 3: `index.html` mit Logo-Sektion + Original-Vergleich**

Logos per `<img src="logo/oe5xrx-full.svg">` in `.swatch-light` und `.swatch-dark` einbetten. WICHTIG: `<img>`-eingebettete SVGs erben `currentColor` NICHT vom Elternelement — für die Theme-Demonstration die SVGs stattdessen **inline** einbetten (oder via `<object>`/CSS-mask). Empfehlung: Logo-SVG-Markup inline in `index.html` einfügen, Swatch setzt `color`. Für die reine Datei-Vorschau/Download zusätzlich `<img>` + Download-Link.
Original-Vergleich: `<img src="../OE5XRX.github.io/Icon.png">` (nur lokal; für die Pages-Version eine Kopie `export/orig-reference.png` ablegen und die referenzieren) neben dem inline Vektor-Full-Lockup.

- [ ] **Step 4: Lokal öffnen + prüfen**

```bash
cd /home/pbuchegger/OE5XRX/branding
python3 -m http.server 8099 &   # nur lokal; danach killen
```
Seite unter `http://localhost:8099/` rendern (bzw. via cairosvg-Screenshot der Teilkomponenten, falls kein Browser). Expected: Logo sichtbar auf hell und dunkel, Toggle schaltet, Original steht neben Vektor. Server danach beenden.

- [ ] **Step 5: Original-Referenz für Pages kopieren + Commit**

```bash
cp /home/pbuchegger/OE5XRX/OE5XRX.github.io/Icon.png export/orig-reference.png
git add index.html site.css site.js color/tokens.css export/orig-reference.png
git commit -m "feat(site): guideline scaffold with theme toggle and logo section"
```

---

### Task 6: Drei Paletten-Richtungen in die Seite rendern

**Files:**
- Modify: `branding/index.html` (Farb-Sektion)
- Create: `branding/color/candidates.css` (die 3 Kandidaten-Paletten als benannte Sets)

**Interfaces:**
- Produces: Farb-Sektion mit 3 vollständigen Paletten (A/B/C), je hell+dunkel, jede mit Swatches inkl. Hex + Token-Name, und je einer kleinen Demo (Button/Karte/Logo) pro Palette.

- [ ] **Step 1: 3 Paletten als Token-Sets definieren**

`branding/color/candidates.css` — drei Sets `.pal-a`, `.pal-b`, `.pal-c`, jeweils mit `--bg/--surface/--text/--muted/--primary/--accent/--border/--success/--warn/--error`, plus dunkle Gegenstücke:
- **A Petrol-treu:** primary `#1E5A6E`, accent = primary, warme Neutrals.
- **B Petrol + Signal:** primary `#1E5A6E`, accent warm `#E8833A` (o.ä.).
- **C Kontrast:** tieferes Marine `#123B54` + Cyan-Akzent `#3AC6D6` (o.ä.).
Exakte Werte beim Umsetzen ausbalancieren (Kontrast WCAG AA für Text auf bg prüfen).

- [ ] **Step 2: Farb-Sektion in `index.html`**

Pro Palette ein Block: Titel, Swatch-Reihe (Farbe + Hex + `--token`), Mini-Demo (Karte mit Button + inline Logo), einmal auf hell, einmal auf dunkel.

- [ ] **Step 3: Kontrast verifizieren**

Kurzes `python3`-Snippet: WCAG-Kontrast `--text` vs `--bg` und `--text` vs `--surface` je Palette (hell+dunkel) ≥ 4.5. Ausgabe prüfen; bei Fail Werte anpassen.

- [ ] **Step 4: Rendern + Sichtprüfung + Commit**

Lokal öffnen (wie Task 5 Step 4), Read eines Screenshots/der Komponenten. Expected: 3 Paletten klar unterscheidbar, alle Swatches lesbar hell+dunkel.
```bash
git add index.html color/candidates.css
git commit -m "feat(color): render 3 palette candidates (A/B/C) in guideline"
```

---

### Task 7: Zwei–drei Schrift-Pairings als Specimen

**Files:**
- Modify: `branding/index.html` (Typografie-Sektion)
- Create: `branding/type/fonts.css` (@font-face / Google-Fonts-Import der Kandidaten)

**Interfaces:**
- Produces: Typografie-Sektion mit 2–3 Pairings als Specimen (Heading + Body + Mono-Sample mit Rufzeichen/Frequenz), umschaltbar oder untereinander.

- [ ] **Step 1: Kandidaten einbinden**

`branding/type/fonts.css` — Kandidaten laden (self-host bevorzugt; für die Vorschau reicht der Fonts-CDN-Import):
- Pairing 1 (Empfehlung): Heading **Space Grotesk**, Body **IBM Plex Sans**, Mono **IBM Plex Mono**.
- Pairing 2: Heading **IBM Plex Sans SemiBold**, Body **IBM Plex Sans**, Mono **IBM Plex Mono** (konsistente Familie).
- Pairing 3 (optional): Heading **Sora**/**Chivo**, Body **Inter**, Mono **JetBrains Mono**.

- [ ] **Step 2: Specimen-Sektion in `index.html`**

Je Pairing: H1/H2-Beispiel, Fließtext-Absatz, und Mono-Zeile mit `OE5XRX · 145.500 MHz · JN78` (typischer Funk-Content). Schriftnamen + Einsatzzweck dazuschreiben.

- [ ] **Step 3: Rendern + Sichtprüfung + Commit**

Lokal prüfen. Expected: Pairings laden, Mono zeigt Ziffern/Rufzeichen sauber.
```bash
git add index.html type/fonts.css
git commit -m "feat(type): add 2-3 font pairings as specimens"
```

---

### Task 8: CHECKPOINT — Nutzer wählt Palette + Schrift

**Kein Code.** Dies ist ein bewusster Halt.

- [ ] **Step 1: Pages-Deploy sicherstellen (Vorschau live)**

```bash
cd /home/pbuchegger/OE5XRX/branding
git push
gh api -X POST repos/OE5XRX/branding/pages -f 'source[branch]=main' -f 'source[path]=/' 2>/dev/null || \
  gh api repos/OE5XRX/branding/pages >/dev/null   # falls schon aktiv
```
Expected: `https://oe5xrx.github.io/branding/` erreichbar (nach kurzer Build-Zeit).

- [ ] **Step 2: Nutzer-Entscheidung einholen**

Dem Nutzer die Pages-URL nennen und um Auswahl bitten: **eine** Palette (A/B/C) und **ein** Schrift-Pairing. Auf Antwort warten. Erst nach expliziter Wahl weiter zu Task 9.

---

### Task 9: Gewählte Tokens + Fonts festziehen

**Files:**
- Create: `branding/color/tokens.json` (Single-Source, finale Palette)
- Modify: `branding/color/tokens.css` (finale Werte aus der Wahl)
- Delete: `branding/color/candidates.css`
- Modify: `branding/type/fonts.css` (nur gewähltes Pairing; self-host wenn möglich)
- Modify: `branding/index.html` (Kandidaten-UI → finale Doku), `logo/oe5xrx-full-petrol.svg` falls Primary-Hex sich änderte
- Modify: `branding/README.md`

**Interfaces:**
- Consumes: Nutzer-Wahl aus Task 8.
- Produces: finale `tokens.json` + `tokens.css` (eine Palette, hell+dunkel), `fonts.css` mit einem Pairing.

- [ ] **Step 1: `tokens.json` schreiben**

```json
{
  "$schema": "https://design-tokens.org",
  "color": {
    "light": { "bg":"#..","surface":"#..","text":"#..","muted":"#..",
      "primary":"#..","accent":"#..","border":"#..",
      "success":"#..","warn":"#..","error":"#.." },
    "dark": { "bg":"#..","surface":"#..","text":"#..","muted":"#..",
      "primary":"#..","accent":"#..","border":"#..",
      "success":"#..","warn":"#..","error":"#.." }
  }
}
```

- [ ] **Step 2: `tokens.css` auf finale Werte setzen, `candidates.css` entfernen**

```bash
cd /home/pbuchegger/OE5XRX/branding
git rm color/candidates.css
```
`index.html`: Kandidaten-Blöcke durch die eine finale Palette + Specimen ersetzen.

- [ ] **Step 3: Fonts finalisieren**

`fonts.css` auf das gewählte Pairing reduzieren. Primary-Hex-Änderung ggf. in `oe5xrx-full-petrol.svg` nachziehen (Datei ggf. umbenennen zu `-primary` falls Farbe kein Petrol mehr — sonst belassen).

- [ ] **Step 4: Verifizieren + Commit**

Kontrast erneut prüfen (wie Task 6 Step 3, nur finale Palette). Lokal rendern.
```bash
git add -A
git commit -m "feat: lock final palette tokens and typography pairing"
```

---

### Task 10: Raster-Exports (Favicon + PWA-Icons)

**Files:**
- Create: `branding/export/favicon-16.png`, `favicon-32.png`, `favicon-48.png`, `favicon.ico`
- Create: `branding/export/pwa-192.png`, `branding/export/pwa-512.png`
- Create: `branding/export/apple-touch-icon-180.png`

**Interfaces:**
- Consumes: `logo/favicon.svg` (bzw. `logo/oe5xrx-mark.svg`), finale Primary-Farbe.
- Produces: Raster-Icons in Standardgrößen. PWA-Icons mit gefüllter Fläche (Maskable-tauglich: genug Padding), Favicon in Primary auf transparent.

- [ ] **Step 1: PNGs rendern**

```bash
cd /home/pbuchegger/OE5XRX/branding
PRIMARY="#1E5A6E"   # finale Primary aus tokens.json einsetzen
sed "s/currentColor/$PRIMARY/g" logo/favicon.svg > /tmp/favicon-color.svg
for s in 16 32 48 180 192 512; do
  cairosvg /tmp/favicon-color.svg -o export/tmp-$s.png -W $s -H $s
done
mv export/tmp-16.png export/favicon-16.png
mv export/tmp-32.png export/favicon-32.png
mv export/tmp-48.png export/favicon-48.png
mv export/tmp-180.png export/apple-touch-icon-180.png
mv export/tmp-192.png export/pwa-192.png
mv export/tmp-512.png export/pwa-512.png
```

- [ ] **Step 2: ICO bauen**

```bash
magick export/favicon-16.png export/favicon-32.png export/favicon-48.png export/favicon.ico
identify export/favicon.ico   # 3 Frames erwartet
```

- [ ] **Step 3: Sichtprüfung + Commit**

```bash
magick montage export/favicon-32.png export/pwa-192.png export/pwa-512.png export/apple-touch-icon-180.png -tile 4x1 -geometry +6+6 -background '#cccccc' /tmp/rasters.png
```
Read `/tmp/rasters.png`. Expected: scharfe Icons, Mark zentriert, genug Rand.
```bash
git add export/
git commit -m "feat(export): generate favicon.ico and PWA/apple raster icons"
```

---

### Task 11: Guideline-Seite fertigstellen + README + Deploy-Verifikation

**Files:**
- Modify: `branding/index.html` (Do/Don't, Download-Links, Meta/Favicon-Einbindung)
- Modify: `branding/README.md` (Konsum-Doku, Token-Tabelle, Font-Namen)

**Interfaces:**
- Produces: vollständige, deploybare Guideline unter `https://oe5xrx.github.io/branding/`.

- [ ] **Step 1: Do/Don't-Sektion + Download-Links**

`index.html` ergänzen: Schutzraum, Mindestgröße, „keinen Rahmen ergänzen", „nicht frei umfärben". Pro Logo-Variante Download-Link. Im `<head>` echte Favicon/PWA-Einbindung (`<link rel="icon" href="export/favicon.ico">`, `apple-touch-icon`, ein kleines `manifest.webmanifest` optional).

- [ ] **Step 2: README-Konsumdoku**

Token-Tabelle (Name → hell/dunkel Hex), Font-Namen + Quelle, `currentColor`-Nutzungshinweis, Beispiel-Snippet zum Einbinden von `tokens.css`.

- [ ] **Step 3: Deploy + End-to-End-Verifikation**

```bash
cd /home/pbuchegger/OE5XRX/branding
git add -A && git commit -m "docs: finalize guideline (do/dont, downloads) and README"
git push
```
Warten auf Pages-Build (ScheduleWakeup, da Kontor kein zuverlässiges Block-Warten hat), dann:
```bash
curl -sI https://oe5xrx.github.io/branding/ | head -1        # 200 erwartet
curl -s https://oe5xrx.github.io/branding/ | grep -c "OE5XRX" # > 0
```
Expected: Seite live, Logo/Farben/Typo/Do-Dont sichtbar, alle Downloads erreichbar.

---

## Self-Review

**Spec coverage:**
- Repo-Struktur → Task 1 ✅
- Logo-System (Mark, Wordmark, Lockups, Fixed-Color, Favicon) → Tasks 2–4 ✅
- Theme-Fähigkeit currentColor → Task 2 Step 5, Task 5 ✅
- Farbpalette-Exploration (3 Richtungen) → Task 6; Auswahl → Task 8; Festziehen → Task 9 ✅
- Typografie (2–3 Pairings, Auswahl) → Task 7/8/9 ✅
- Design-Tokens (json + css) → Task 5 (Platzhalter) / Task 9 (final) ✅
- Guideline-Seite (Logo/Farben/Typo/Do-Dont) → Tasks 5,6,7,11 ✅
- Raster-Exports → Task 10 ✅
- Pages-Deploy, kein Jekyll (.nojekyll) → Task 1, Task 8 Step 1, Task 11 ✅
- Rahmen weglassen / brand-previews ignorieren → Global Constraints, Task 2 ✅
- Original-vs-Vektor-Vergleich (Treue-Risiko) → Task 2 Step 3-4, Task 5 Step 3 ✅

**Placeholder scan:** Bewusste Platzhalter nur an legitimen Stellen: SVG-Pfad-Koordinaten (visuell-iterativ, nicht vorab bestimmbar) und finale Hex/Font-Werte (hängen am Nutzer-Checkpoint Task 8). Beide sind explizit als iterativ/checkpoint-abhängig markiert, kein verstecktes „TODO".

**Type/Namens-Konsistenz:** Dateinamen durchgängig `oe5xrx-*.svg`; Token-Namen `--bg/--surface/--text/--muted/--primary/--accent/--border/--success/--warn/--error` identisch in Task 5/6/9; `favicon.svg`/`favicon.ico` konsistent zwischen Task 4/10/11.

**Hinweis Task 5 Step 3:** currentColor-Vererbung funktioniert nur bei **inline** eingebettetem SVG, nicht via `<img>` — im Plan explizit adressiert, damit der Theme-Effekt in der Guideline echt demonstriert wird.
