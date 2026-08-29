# OE5XRX Jekyll Brand-Layer

Kanonischer Brand-Layer für just-the-docs-Sites. Wird per Composite Action
`OE5XRX/branding/.github/actions/apply-brand@<tag>` in Consumer kopiert.

Inhalt dieses Ordners:
- `_sass/color_schemes/oe5xrx.scss` — Farb-/Font-Scheme (Palette C, hell).
- `_sass/color_schemes/oe5xrx-dark.scss` — Dunkel-Scheme (auf JTD-Dark-Basis).
- `_sass/custom/custom.scss` — Logo-Recolor (mask) + Toggle-Button-Styling.
- `_includes/head_custom.html` — @font-face (self-hosted IBM Plex) + theme-color + pre-paint.
- `_includes/nav_footer_custom.html` — Hell/Dunkel-Toggle (Auto + Button).
- `assets/css/just-the-docs-oe5xrx-dark.scss` — Entry-CSS für das Dunkel-Stylesheet.

Fonts (WOFF2) liegen zentral in `../type/fonts/` und werden von der Action nach
`assets/fonts/` des Consumers kopiert.

Consumer-Setup (in `_config.yml`):

    color_scheme: oe5xrx
    logo: "/assets/oe5xrx-logo.svg"
    favicon_ico: "/favicon.ico"

Und im Build-Workflow vor `jekyll build`:

    - uses: OE5XRX/branding/.github/actions/apply-brand@v0.2.3
      # with: { dest: doc }   # nur wenn die Jekyll-Source in einem Unterordner liegt

Nicht in Consumer-Repos editieren — hier ist die Single Source. Details +
`.gitignore`-Liste im Root-`README.md`.
