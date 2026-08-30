# HW-Module-CI Brand-Rollout (Paket A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die rollenden HW-Module-Doku-Seiten (`gh-pages` je Modul, gebaut von `create-debug-docs`) auf das OE5XRX-Brand umstellen, indem `apply-brand@v0.2.5` in die zentrale `setup`-Composite-Action von HW-Module-CI genestet wird.

**Architecture:** HW-Module-CIs `setup` (composite) staged bereits `doc/`-Assets für jeden Modul-Build. Wir ergänzen dort einen `uses: OE5XRX/branding/.github/actions/apply-brand@v0.2.5`-Step (`dest: doc`) und setzen `color_scheme: oe5xrx` in der geteilten `doc/_config.yml`. Da Module HW-Module-CI via `@main` einbinden, wirkt es sofort — daher gründliche Vorab-Validierung + Pilot-Modul + Rollback.

**Tech Stack:** GitHub Actions (composite + reusable workflows), just-the-docs (Gem), Jekyll, Bash.

**Spec:** `docs/superpowers/specs/2026-08-30-hw-module-ci-brand-rollout-design.md` (im branding-Repo)

## Global Constraints

- **Mechanismus:** `apply-brand@v0.2.5` (`dest: doc`) als Step in `HW-Module-CI/.github/actions/setup/action.yml`, NACH dem „Stage Jekyll assets"-Step (damit Brand-`favicon.ico` die alte überschreibt).
- **Config:** `HW-Module-CI/doc/_config.yml` bekommt `color_scheme: oe5xrx` und `logo: "/assets/oe5xrx-logo.svg"`. `favicon_ico: /favicon.ico`, `theme: just-the-docs`, `mermaid`, `defaults` bleiben.
- **release-docs:** Copy-Exclusion um `! -name 'apple-touch-icon.png'` ergänzen.
- **NICHT anfassen:** `doc/Icon.png` (KiBot/Paket B), der Release-Deploy-Pfad, Modul-Repos (außer Pilot-Trigger).
- **Rollout:** direkt auf HW-Module-CI-`main`; Pilot-Modul = **HW-Module-FMTransceiver**. Bei Bruch: Ein-Commit-Revert.
- **branding-Pin:** exakt `@v0.2.5` (nicht `@main`).
- Push auf HW-Module-CI-main ist erlaubt (Nutzer-Consent für diesen Rollout liegt vor).

---

### Task 1: Brand in `setup` nesten + `_config.yml` + release-Exclusion

**Files:**
- Modify: `HW-Module-CI/.github/actions/setup/action.yml`
- Modify: `HW-Module-CI/doc/_config.yml`
- Modify: `HW-Module-CI/.github/workflows/create-release-docs.yaml`

**Interfaces:**
- Consumes: `OE5XRX/branding/.github/actions/apply-brand@v0.2.5` (Input `dest`, default `.`).
- Produces: gebrandeter `doc/`-Tree bei jedem Modul-Build (Scheme, Fonts, Logo, Favicon, Apple-Touch, Dark-Toggle, Mermaid-Handling).

- [ ] **Step 1: apply-brand-Step in setup/action.yml ergänzen**

In `HW-Module-CI/.github/actions/setup/action.yml`, direkt NACH dem Step `- name: Stage Jekyll assets into caller's doc/` (dessen `run:`-Block mit den `cp`-Befehlen + `project.yml`), einen neuen Step einfügen:
```yaml
    - name: Apply OE5XRX brand layer
      uses: OE5XRX/branding/.github/actions/apply-brand@v0.2.5
      with:
        dest: doc
```
(Gleiche Einrückung wie die anderen `- name:`-Steps unter `runs.steps`.)

- [ ] **Step 2: doc/_config.yml auf Brand umstellen**

In `HW-Module-CI/doc/_config.yml`: die Zeile `logo: "/Icon.png"` ersetzen durch zwei Zeilen:
```yaml
color_scheme: oe5xrx
logo: "/assets/oe5xrx-logo.svg"
```
`favicon_ico: /favicon.ico`, `theme: just-the-docs`, der `mermaid:`-Block und `defaults:` bleiben unverändert.

- [ ] **Step 3: release-docs Copy-Exclusion ergänzen**

In `HW-Module-CI/.github/workflows/create-release-docs.yaml`, im Step „Copy consumer-authored content into output folder", nach der Zeile `! -name 'Icon.png' \` eine Zeile ergänzen:
```bash
              ! -name 'apple-touch-icon.png' \
```
(Gleiche Einrückung/Backslash-Fortsetzung wie `! -name 'Icon.png' \`.)

- [ ] **Step 4: YAML validieren**

```bash
cd /home/pbuchegger/OE5XRX/HW-Module-CI
python3 -c "import yaml; yaml.safe_load(open('.github/actions/setup/action.yml')); print('setup OK')"
python3 -c "import yaml; yaml.safe_load(open('doc/_config.yml')); d=yaml.safe_load(open('doc/_config.yml')); assert d['color_scheme']=='oe5xrx'; assert d['logo']=='/assets/oe5xrx-logo.svg'; print('config OK')"
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/create-release-docs.yaml')); print('release-docs OK')"
grep -c "apply-brand@v0.2.5" .github/actions/setup/action.yml
grep -c "apple-touch-icon.png" .github/workflows/create-release-docs.yaml
```
Expected: alle drei „OK", `apply-brand@v0.2.5` = 1, `apple-touch-icon.png` ≥ 1.

- [ ] **Step 5: Dry-Run — setup-Copy + apply-brand simulieren (landet alles unter doc/?)**

Simuliert, was der Build tut: alte Assets nach doc/ kopieren, dann apply-brand drüber.
```bash
cd /home/pbuchegger/OE5XRX/HW-Module-CI
rm -rf /tmp/mod && mkdir -p /tmp/mod/doc && echo "# test" > /tmp/mod/doc/index.md
# setup's staging:
cp doc/_config.yml /tmp/mod/doc/_config.yml
cp doc/favicon.ico /tmp/mod/doc/favicon.ico
cp doc/Icon.png    /tmp/mod/doc/Icon.png
# apply-brand (dest=doc) — run its copy logic against branding repo:
BR=/home/pbuchegger/OE5XRX/branding
GITHUB_ACTION_PATH="$BR/.github/actions/apply-brand" DEST=/tmp/mod/doc bash -c '
  set -euo pipefail
  ROOT="$(cd "$GITHUB_ACTION_PATH/../../.." && pwd)"
  mkdir -p "$DEST/_sass/color_schemes" "$DEST/_sass/custom" "$DEST/_includes" "$DEST/assets/fonts" "$DEST/assets/css"
  cp "$ROOT"/jekyll/_sass/color_schemes/oe5xrx*.scss "$DEST/_sass/color_schemes/"
  cp "$ROOT/jekyll/_sass/custom/custom.scss" "$DEST/_sass/custom/"
  cp "$ROOT/jekyll/_includes/head_custom.html" "$DEST/_includes/"
  cp "$ROOT/jekyll/_includes/nav_footer_custom.html" "$DEST/_includes/"
  cp "$ROOT/jekyll/_includes/mermaid_config.js" "$DEST/_includes/"
  cp "$ROOT/jekyll/assets/css/just-the-docs-oe5xrx-dark.scss" "$DEST/assets/css/"
  cp "$ROOT"/type/fonts/*.woff2 "$DEST/assets/fonts/"
  cp "$ROOT/logo/oe5xrx-horizontal.svg" "$DEST/assets/oe5xrx-logo.svg"
  cp "$ROOT/export/favicon.ico" "$DEST/favicon.ico"
  cp "$ROOT/export/apple-touch-icon-180.png" "$DEST/apple-touch-icon.png"
'
# assertions
test -f /tmp/mod/doc/_sass/color_schemes/oe5xrx.scss
test -f /tmp/mod/doc/_sass/color_schemes/oe5xrx-dark.scss
test -f /tmp/mod/doc/_includes/nav_footer_custom.html
test -f /tmp/mod/doc/_includes/mermaid_config.js
test $(ls /tmp/mod/doc/assets/fonts/*.woff2 | wc -l) -eq 5
test -f /tmp/mod/doc/assets/oe5xrx-logo.svg
test -f /tmp/mod/doc/apple-touch-icon.png
# brand favicon overwrote the old one:
cmp -s /tmp/mod/doc/favicon.ico "$BR/export/favicon.ico" && echo "favicon overwritten OK"
# Icon.png (KiBot) untouched:
test -f /tmp/mod/doc/Icon.png && echo "Icon.png retained (KiBot)"
echo "dry-run OK"
```
Expected: `favicon overwritten OK`, `Icon.png retained (KiBot)`, `dry-run OK`.

- [ ] **Step 6: Commit + Push auf HW-Module-CI-main (löst Fan-out beim nächsten Modul-Build aus)**

```bash
cd /home/pbuchegger/OE5XRX/HW-Module-CI
git add .github/actions/setup/action.yml doc/_config.yml .github/workflows/create-release-docs.yaml
git commit -m "feat(ci): brand module docs via apply-brand@v0.2.5 in setup (color_scheme oe5xrx, dark mode, mermaid)"
git push origin main
```

---

### Task 2: Pilot-Verifikation (HW-Module-FMTransceiver) + Rollback-Bereitschaft

**Files:** (keine)

**Interfaces:**
- Consumes: HW-Module-CI-main aus Task 1 + `branding@v0.2.5`.
- Produces: bestätigt gebrandete Modul-`gh-pages`; sonst Rollback.

- [ ] **Step 1: FMTransceiver-Debug-Docs neu bauen**

Der Debug-Build triggert auf Push zu main; ein Re-Run re-resolved `@main` (holt neues setup):
```bash
cd /home/pbuchegger/OE5XRX/HW-Module-FMTransceiver
rid=$(gh run list --repo OE5XRX/HW-Module-FMTransceiver --workflow=create-debug-docs.yaml -L1 --json databaseId -q '.[0].databaseId')
gh run rerun "$rid" --repo OE5XRX/HW-Module-FMTransceiver
```
Falls kein vorheriger Run existiert oder Rerun `@main` nicht neu zieht: leeren Commit auf FMTransceiver-main pushen (`git commit --allow-empty -m "ci: trigger branded debug docs" && git push`).
Build-Status abwarten (Kontor: ScheduleWakeup statt Block-Wait).

- [ ] **Step 2: Build grün?**

```bash
gh run list --repo OE5XRX/HW-Module-FMTransceiver --workflow=create-debug-docs.yaml -L1
```
Bei Fehlschlag: `gh run view <id> --log-failed`. Typische Ursachen: apply-brand-Step-Syntax, SCSS-Import, fehlendes doc/index.md. Fixen (Task 1) und erneut.

- [ ] **Step 3: gh-pages-Seite auf Brand verifizieren**

URL ermitteln + prüfen:
```bash
base=$(gh api repos/OE5XRX/HW-Module-FMTransceiver/pages -q .html_url); base=${base%/}
echo "URL: $base"
curl -s -o /dev/null -w 'site %{http_code}\n' "$base/"
css=$(curl -s "$base/" | grep -oE '/[^"]*just-the-docs-default\.css' | head -1)
curl -s "$base$css" | grep -oiE '#123b54|#f4f7f9' | sort | uniq -c
curl -s -o /dev/null -w 'dark-css %{http_code}\n' "$base/assets/css/just-the-docs-oe5xrx-dark.css"
curl -s -o /dev/null -w 'font %{http_code}\n' "$base/assets/fonts/IBMPlexSans-Regular.woff2"
curl -s -o /dev/null -w 'logo %{http_code}\n' "$base/assets/oe5xrx-logo.svg"
curl -s -o /dev/null -w 'favicon %{http_code}\n' "$base/favicon.ico"
curl -s -o /dev/null -w 'apple-touch %{http_code}\n' "$base/apple-touch-icon.png"
curl -s "$base/" | grep -c 'oe5xrx-theme-toggle'
# mermaid: config theme logic present, rerender module imports matching version
curl -s "$base/" | grep -c '__oe5xrxRerenderMermaid'
```
Expected: site 200; CSS enthält `#123b54`/`#f4f7f9`; dark-css/font/logo/favicon/apple-touch je 200; Toggle vorhanden; falls die Seite Mermaid nutzt, Re-Render-Modul present.

- [ ] **Step 4: Toggle-Script parst (der //-Minifier-Fehler darf nicht auftreten)**

```bash
base=$(gh api repos/OE5XRX/HW-Module-FMTransceiver/pages -q .html_url); base=${base%/}
curl -s "$base/" -o /tmp/fm.html
python3 -c "import re;h=open('/tmp/fm.html').read();i=h.find('oe5xrx-theme-toggle');m=re.search(r'<script>(.*?)</script>',h[i:],re.S);open('/tmp/fm-t.js','w').write(m.group(1))"
node --check /tmp/fm-t.js && echo "toggle parses OK"
```
Expected: `toggle parses OK`.

- [ ] **Step 5: Ergebnis + ggf. Rollback**

Bei Erfolg: Ergebnis (URL, HTTP-Codes, Brand-Farben, Toggle) festhalten; keine weitere Aktion — der Brand fächert bei jedem Modul-`main`-Push automatisch aus.
Bei nicht behebbarem Bruch (Rollback):
```bash
cd /home/pbuchegger/OE5XRX/HW-Module-CI
git revert --no-edit HEAD   # den Task-1-Commit
git push origin main
```
und im Report vermerken.

---

## Self-Review

**Spec coverage:**
- apply-brand in setup nesten (`dest: doc`, `@v0.2.5`) → Task 1 Step 1 ✅
- `doc/_config.yml` color_scheme/logo → Task 1 Step 2 ✅
- release-docs apple-touch-Exclusion → Task 1 Step 3 ✅
- favicon-Overwrite-Reihenfolge (Step nach Staging) → Task 1 Step 1 + Dry-Run Step 5 ✅
- Icon.png bleibt (KiBot) → Dry-Run assertion ✅
- Rollout direkt auf main + Pilot FMTransceiver + Rollback → Task 1 Step 6, Task 2 ✅
- Verifikation (Farben, dark, fonts, logo, favicon, apple-touch, toggle, mermaid) → Task 2 Step 3–4 ✅

**Placeholder scan:** Konkrete YAML/Bash-Inhalte, echte Assertions, echte Commands. Keine TBD/TODO.

**Type/Namens-Konsistenz:** `apply-brand@v0.2.5` identisch in Constraints/Task 1. Pfade (`doc/_sass/color_schemes/oe5xrx*.scss`, `assets/oe5xrx-logo.svg`, `favicon.ico`, `apple-touch-icon.png`) konsistent zwischen Dry-Run (Task 1) und Verifikation (Task 2). Pilot-Modul durchgängig HW-Module-FMTransceiver.

**Hinweis:** Task 1 pusht auf geteiltes `@main` → Fan-out. Deshalb Steps 4–5 (YAML + Dry-Run) VOR dem Push in Step 6; Task 2 Step 5 hält den Ein-Commit-Revert bereit.
