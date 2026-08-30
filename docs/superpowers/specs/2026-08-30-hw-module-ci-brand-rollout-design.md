# HW-Module-CI Brand-Rollout (Paket A: Web-Docs) — Design

**Datum:** 2026-08-30
**Status:** Design (approved, Spec-Review offen)
**Ziel-Repo:** `OE5XRX/HW-Module-CI` (+ ein Pilot-Modul zum Testen)
**Voraussetzung:** `OE5XRX/branding@v0.2.5` (apply-brand-Action, dark mode, mermaid live re-render)

## Zusammenfassung

Die rollenden Doku-Seiten der HW-Module (`gh-pages` je Modul, gebaut von der reusable
`create-debug-docs`-Workflow via `cd doc && jekyll build`) auf das OE5XRX-Brand
umstellen — Farben, self-hosted IBM Plex, Logo, Favicon/Apple-Touch, Hell/Dunkel
(Auto+Toggle), Mermaid-Theming + Live-Re-Render, dunkles Code-Highlighting.

Der Brand wird über die **bestehende zentrale `setup`-Composite-Action** eingezogen
(sie staged ohnehin `doc/`-Assets für jeden Modul-Build). So reisen Brand-Config und
Brand-Assets immer gemeinsam. Alles gepinnt auf `branding@v0.2.5`.

**Scope:** nur Paket A (Web-Docs). Paket B (KiBot-Fertigungslogo `doc/Icon.png`) und
das Pinnen der Module auf einen HW-Module-CI-Tag sind eigene Folge-Vorhaben.

## Problem / Kontext

Zwei Doku-Pfade der HW-Module:

| Pfad | Workflow | baut Jekyll? | Ziel | Brand-Status |
|------|----------|--------------|------|--------------|
| Release | `create-release-docs` | nein (KiBot + md) | Dateien → OE5XRX.github.io | ✅ (via oe5xrx.org, bereits gebrandet) |
| **Rollend (main)** | `create-debug-docs` | **ja** (`cd doc && jekyll build`) | eigene `gh-pages` je Modul | ⬜ **Ziel dieses Vorhabens** |

Die rollenden Seiten bauen aus der geteilten `HW-Module-CI/doc/_config.yml`
(`theme: just-the-docs`, `logo: /Icon.png`, **kein `color_scheme`**) → altes Branding,
kein Dark-Mode.

**Verteilmechanismus (bestehend):** `HW-Module-CI/.github/actions/setup/action.yml`
(composite) checkt Caller + HW-Module-CI aus und kopiert `_ci/doc/{_config.yml,
Gemfile, favicon.ico, Icon.png}` + generiert `doc/_data/project.yml` in den
Caller-Tree. `setup` wird von `create-debug-docs` UND `create-release-docs` genutzt.

**Einbindung durch Consumer:** Module binden die Workflows via `@main` ein → jede
Änderung an HW-Module-CI-main wirkt sofort bei allen Modulen beim nächsten Build.

## Entscheidungen (aus Brainstorming)

| Thema | Entscheidung |
|-------|--------------|
| Scope | **Paket A zuerst** (Web-Docs). Paket B (KiBot) + Pinning später. |
| Mechanismus | **apply-brand in `setup` nesten** (`uses:` innerhalb der Composite-Action, `dest: doc`). Config + Assets gemeinsam gestaged; eine zentrale Stelle. |
| Brand-Version | gepinnt auf `branding@v0.2.5`. |
| Rollout/Test | **direkt auf HW-Module-CI-main**, dann **ein Pilot-Modul** (FMTransceiver) neu bauen + verifizieren; bei Bruch schneller Revert. |

## Architektur / Datenfluss (rollender Build)

1. Modul-Push auf `main` → `create-debug-docs.yaml@main` (reusable) startet.
2. Job checkt aus, ruft `setup` (composite) auf:
   - Checkout Caller (persist-credentials:false) + HW-Module-CI@main (`_ci`).
   - Detect KiCad-Projektname.
   - **Stage Jekyll assets:** cp `_ci/doc/{_config.yml, Gemfile, favicon.ico, Icon.png}` → `doc/`, schreibe `doc/_data/project.yml`.
   - **NEU:** `uses: OE5XRX/branding/.github/actions/apply-brand@v0.2.5` mit `dest: doc` → kopiert Scheme(s), `_sass/custom`, `_includes/{head_custom,nav_footer_custom,mermaid_config.js}`, `assets/css/just-the-docs-oe5xrx-dark.scss`, `assets/fonts/*`, `assets/oe5xrx-logo.svg`, überschreibt `doc/favicon.ico`, schreibt `doc/apple-touch-icon.png`.
3. KiBot-Export (unverändert), Artefakte nach `doc/`.
4. `cd doc && bundle exec jekyll build` → `doc/_site` mit Brand.
5. Deploy `doc/_site` → `gh-pages` (unverändert).

## Komponenten / Geänderte Dateien (alle in HW-Module-CI)

### 1. `.github/actions/setup/action.yml`
Nach dem „Stage Jekyll assets"-Step einen Step ergänzen:
```yaml
    - name: Apply OE5XRX brand layer
      uses: OE5XRX/branding/.github/actions/apply-brand@v0.2.5
      with:
        dest: doc
```
Composite-Actions dürfen fremde Repo-Actions via `uses:` einbinden. Der Step läuft
NACH dem Kopieren, sodass die Brand-`favicon.ico` die von setup kopierte alte
überschreibt. Reihenfolge relativ zu `project.yml`-Generierung ist egal.

### 2. `doc/_config.yml`
```yaml
color_scheme: oe5xrx
logo: "/assets/oe5xrx-logo.svg"
```
- `color_scheme: oe5xrx` neu.
- `logo:` von `/Icon.png` auf `/assets/oe5xrx-logo.svg` (von apply-brand gefetcht).
- `favicon_ico: /favicon.ico` bleibt (apply-brand überschreibt die Datei).
- `mermaid.version`, `defaults` (layout), `theme: just-the-docs` bleiben unverändert.

### 3. `.github/workflows/create-release-docs.yaml`
Im „Copy consumer-authored content into output folder"-Step die Exclusion um
`apple-touch-icon.png` ergänzen (apply-brand schreibt es als Top-Level-`.png`; ohne
Exclusion leakt es pro Modul in den Release-Deploy nach OE5XRX.github.io):
```bash
              ! -name 'Icon.png' \
              ! -name 'apple-touch-icon.png' \
```
(`favicon.ico`, `_sass/`, `_includes/`, `assets/` werden ohnehin nicht kopiert —
`.ico` ist nicht in der Extension-Liste, Unterordner sind durch `-maxdepth 1`
ausgeschlossen.)

## Asset-Interplay (geprüft)

- **favicon:** setup kopiert altes `favicon.ico`; apply-brand (danach) überschreibt mit Brand. ✓
- **Logo:** Web-Logo nun `/assets/oe5xrx-logo.svg` (gefetcht). `doc/Icon.png` bleibt für KiBot (Paket B). ✓
- **head_custom-Clobber:** Module haben kein `doc/_includes/` → apply-brand legt seines konfliktfrei an. ✓
- **JTD-Scheme-Wiring:** kein `assets/css/style.scss` nötig (Gem-Theme; wie dashboard/pages). ✓
- **Mermaid:** Modul-Docs nutzen `mermaid.version: 11.3.0`; das Brand-Re-Render-Modul importiert `@{{ site.mermaid.version }}` → gleiche URL/Instanz. ✓
- **Release-Pfad:** unberührt (deployt weiter nach OE5XRX.github.io, dort schon gebrandet); nur die apple-touch-Exclusion kommt dazu. ✓

## Testing / Verifikation

**Vorab (lokal / statisch):**
- `setup/action.yml` valides YAML; apply-brand-Step korrekt (`uses`, `with.dest: doc`).
- apply-brand-Dry-Run mit `dest: doc` (bereits früher bewiesen: legt alle Dateien unter `doc/` an).
- `doc/_config.yml` valides YAML mit `color_scheme: oe5xrx`.
- release-docs-Exclusion enthält `apple-touch-icon.png`.

**Pilot (nach Push auf HW-Module-CI-main):**
- Ein Modul (FMTransceiver) `create-debug-docs` neu triggern (Re-run oder Trivial-Push).
- Build grün; `gh-pages`-Seite live prüfen:
  - Scheme-CSS enthält Brand-Primary `#123B54` / Bg `#F4F7F9`; Dark-CSS `just-the-docs-oe5xrx-dark.css` 200 mit `#0A1219`/`#3AC6D6`.
  - Fonts/Logo/Favicon/Apple-Touch je 200.
  - Toggle-Button vorhanden; nav_footer-Script parst (kein `//`).
  - Mermaid-Diagramme rendern; im Dunkeln dunkel; Live-Re-Render beim Toggle.
  - Dunkles Code-Highlighting lesbar (falls die Seite Code-Blöcke hat).
- Bei Bruch: `setup`-Step / `_config.yml`-Änderung reverten (Ein-Commit-Rollback auf HW-Module-CI-main).

**Ausrollen:** nach erfolgreichem Pilot fächert der Brand beim nächsten `main`-Push
jedes Moduls automatisch aus (keine Aktion pro Modul nötig).

## Risiken

- **`@main`-Fan-out:** Bruch trifft kurzzeitig alle Module. Mitigation: gründlicher Vorab-Check + sofort verfügbarer Ein-Commit-Revert; bewusst gewählt (Nutzer-Entscheidung gegen Branch-Test).
- **apply-brand-Erreichbarkeit im Build:** Netzwerk-/Tag-Abhängigkeit (branding public, Tag existiert). Wie bei den anderen Consumern akzeptiert.
- **Mermaid-Version-Drift:** Falls ein Modul künftig eine andere `mermaid.version` setzt, muss das Re-Render-Modul weiterhin `{{ site.mermaid.version }}` nutzen (tut es) — kein Hardcode.

## Explizit NICHT in Scope

- **Paket B:** KiBot-Fertigungslogo (`doc/Icon.png` → neue Marke als PNG).
- **Modul-Pinning** auf einen HW-Module-CI-Tag statt `@main`.
- Änderungen an den Modul-Repos selbst (außer ggf. ein Trivial-Push zum Pilot-Trigger).
