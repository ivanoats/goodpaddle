# Good Paddle

A static paddleboarding site built with Astro, Markdown, and the [Verdant design system](https://verdant-design.org/).

## Development

```sh
nvm use
npm ci
npm run dev
```

The site runs at `http://localhost:4321`. No local certificate installation is needed.

```sh
npm run build
npm run preview
```

Astro writes deployable files to `dist/`. Panda extracts styles from literal calls in `src/styles/site.ts`; Verdant supplies the semantic tokens and theme runtime. Generated styles and the copied theme runtime are gitignored. Original public image URLs remain available; the homepage uses optimized WebP variants.

## Writing pages

Add `src/content/pages/your-page.md`:

```markdown
---
title: Your page title
description: A useful search and sharing description.
navLabel: Your page
navOrder: 2
draft: true
---

## Start with a second-level heading

Write the body here. The template supplies the page's h1.
```

Set `draft: false` to publish at `/your-page/`. `home.md` maps to `/`. Omit `navLabel` to publish without adding a navigation link. Use lowercase kebab-case filenames; nested directories become nested routes. Reserved or duplicate published routes fail the build. Frontmatter is validated by Astro's content schema.

Posts live in `src/content/posts/` and additionally require `published: YYYY-MM-DD`. Publishing the first post enables `/blog/` and the Blog navigation link. Drafts never produce public routes. About, Contact, and the example post remain drafts pending reviewed content. Homepage replacement copy is provisional and should be reviewed before release.

Use ordinary Markdown, not embedded application components. Images need alt text and internal links must resolve. The template owns site navigation, metadata, and appearance controls.

## Verification

```sh
npx playwright install chromium
npm run verify
```

Verification runs ESLint, Prettier, Astro type checking, Vitest coverage, a production build, generated HTML/link/asset-budget checks, and Playwright/axe tests. `CROSS_BROWSER=1 npm run test:browser` also runs Firefox and WebKit after installing their browsers. CI runs all browsers weekly.

Coverage requires **80% lines, statements, functions, and branches** in `src/lib/**/*.ts`, which currently contains all custom executable application behavior. Include new application logic in that scope (or expand the include pattern). Content schemas, literal style declarations, Astro templates, infrastructure scripts, generated code, and Verdant's third-party runtime are outside the percentage. Rendered output and theme behavior are checked separately. LCOV is written to `coverage/lcov.info`.

Local commands: `npm test`, `npm run test:coverage`, `npm run check`, `npm run check:site`, `npm run test:browser`, and `npm run format`.

## Delivery and analysis

See [service setup and release instructions](docs/service-setup.md) for SonarQube Cloud, DeepSource, branch protection, AWS deployment, and rollback. Workflows target the repository's existing `master` default branch. Hosted integrations and deployment stay disabled until configured; no secrets belong in this repository.

See the [modernization plan](docs/modernization-plan.md) for scope and rationale.
