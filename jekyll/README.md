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

    - uses: OE5XRX/branding/.github/actions/apply-brand@v0.1.1

Nicht in Consumer-Repos editieren — hier ist die Single Source.
