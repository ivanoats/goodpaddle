# Good Paddle modernization plan

Status: local implementation prepared, October 6, 2026. Astro/Markdown/Verdant, tests, CI, and opt-in integration/deployment workflows are implemented. Hosted service activation, branch protection, cloud validation, content approval, and release remain pending. See `service-setup.md` for the activation checklist.

## Current state

The repository contains one hand-authored `index.html`, one `style.css`, and image assets. About, Blog, Contact, and the hero call to action all point to `#`; the page contains placeholder copy. There is no application JavaScript or backend.

`npm test` deliberately exits with an error. There is no checked-in CI workflow, coverage configuration, SonarQube configuration, or DeepSource configuration. Local serving depends on machine-specific HTTPS certificate paths. Deployment uses an unpinned `scottyjs` command targeting the `www.goodpaddle.com` S3 bucket; the live hosting configuration has not been verified. The local branch is named `master`; confirm the remote default before configuring workflows.

## Recommended architecture

Use Astro with static output, plain Markdown content, and the published `@sustainablewebsites/verdant-design` PandaCSS preset. Keep TypeScript for routing helpers, content validation, and any necessary browser behavior. Ship browser JavaScript only for interactions that need it.

Astro provides schema-validated Markdown collections and generated static routes. This avoids maintaining a custom Markdown build pipeline as the site grows. See the [Astro content collections documentation](https://docs.astro.build/en/guides/content-collections/).

Verdant supplies tokens, recipes, and layout patterns, rather than ready-made UI components. Build semantic Good Paddle markup around those recipes. Its 0.x API can change between minor versions, so pin the chosen release and review upgrades. Follow the [official installation guide](https://github.com/ivanoats/verdant-wsg-demo/blob/main/docs/INSTALL.md) linked from [Verdant](https://verdant-design.org/).

Suggested structure:

```text
src/
  content/pages/             # home.md, about.md, contact.md
  content/posts/             # Markdown blog posts
  content.config.ts         # collection schemas
  pages/                    # static route adapters, blog index, 404
  layouts/                  # site shell, page and post layouts
  components/               # header, navigation, hero, footer
  styles/                   # literal Panda calls and Markdown prose styling
  lib/                      # application content and URL helpers
  scripts/                  # small browser interactions, if needed
public/                     # icons and assets copied without transformation
tests/                      # unit, generated-site and browser tests
.github/workflows/          # CI and deployment
panda.config.ts
sonar-project.properties
```

## Implementation sequence

Deliver each step on a feature branch through a reviewable PR. Add relevant tests alongside each feature; the testing milestone completes the suite and enforces the thresholds.

| Step                          | Work                                                                                                                                                                                                                                  | Acceptance criteria                                                                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Establish the build        | Add Astro, TypeScript, PandaCSS, and Verdant; pin a compatible supported Node LTS and lockfile. Replace local server scripts with portable `dev`, `build`, and `preview` commands. Update lint/format configuration and add basic CI. | A clean checkout builds with `npm ci` and `npm run build`; homepage and existing assets render locally. Verify Panda extraction in a production build before migrating all styles.                   |
| 2. Move content to Markdown   | Add page/post schemas and layouts; migrate homepage copy into Markdown; generate routes, navigation, metadata, sitemap, and 404.                                                                                                      | Adding a Markdown file produces a page without editing a template. Invalid frontmatter and duplicate/reserved routes fail the build. Drafts are absent from production pages, listings, and sitemap. |
| 3. Apply Verdant              | Build the shared shell and prose styles using semantic tokens, recipes, and layout patterns. Replace checkbox navigation with accessible navigation. Optimize the existing paddleboarding imagery.                                    | Desktop and mobile pages work at 320px and upward, with keyboard navigation and readable light/dark themes. No placeholder links ship. Visual review retains Good Paddle's identity.                 |
| 4. Enforce tests and coverage | Complete Vitest coverage, built-site checks, Playwright journeys, and axe accessibility checks. Establish reviewed asset budgets.                                                                                                     | At least 80% lines, statements, functions, and branches for owned executable source. All public routes pass structural/link checks; key journeys pass on the production build.                       |
| 5. Add review feedback        | Prepare SonarQube Cloud analysis and DeepSource configuration/report uploads. Activate accounts and repository integrations after owner authorization.                                                                                | A trial PR receives results from both services for its exact commit; coverage appears for both PR and default branch. Deliberate test failures block merges.                                         |
| 6. Automate deployment        | Replace manual Scotty deployment with a workflow for the confirmed host, using the tested build artifact. Document release and rollback steps.                                                                                        | Only a verified default-branch commit can deploy; production smoke tests pass; a previous artifact can be restored. First production release requires approval.                                      |

## Markdown content contract

- Require `title` and `description`; support `draft`, navigation label/order, and optional hero image metadata. Require a publication date for blog posts.
- Derive routes from content IDs with explicit handling for the homepage. Reject collisions with `/blog/`, `/404`, and other reserved routes. Preserve `/` and existing public asset URLs or document redirects.
- Keep layout, theme controls, and navigation markup in components. Keep page prose and hero text in Markdown/frontmatter. Use plain Markdown initially; introduce MDX only for a demonstrated authoring need.
- Provide prose styles for headings, links, lists, blockquotes, tables, and code. Validate local links, image references, and image alternative text.
- Default to Home, About, Blog, and Contact based on the existing navigation. Publish only pages with reviewed content; hide unfinished routes. The actual contact destination and initial posts need owner input. A contact backend is outside this migration unless requested.

## Verdant integration details

Register the Verdant preset after Panda's base preset. Put literal style calls in scanned TypeScript modules imported by Astro components; prove extraction on a representative page. Generate styles during the build and ignore generated output in git. Define explicit prose selectors for generated Markdown HTML, which does not contain Panda calls.

Use Verdant's system fonts, semantic color pairings, spacing, focus styles, and reduced-motion behavior. Retain the existing logo wording and paddleboarding photography. Use responsive image variants and explicit dimensions; avoid lazy-loading the main above-the-fold image.

If including the System/Light/Dark selector, copy the package's theme script during the build and follow its documented pre-stylesheet loading and attribute contract. Test persistence, OS changes in System mode, unavailable storage, and no-JavaScript fallback. Do not add a service worker in the initial migration; it introduces cache/update behavior that this site does not yet require.

## Testing and the 80% target

Interpret “about 80%” as an initial minimum of 80% across lines, statements, functions, and branches for owned executable JS/TS. Configure an explicit coverage include pattern so unimported source cannot silently disappear from the denominator. Exclude dependencies, generated Panda/build output, declarations, fixtures, and tests; document every additional exclusion.

Use Vitest with V8 coverage and emit LCOV plus a readable local report. Cover actual behavior: draft filtering, route collisions, URL generation, sorting, validation, and custom navigation behavior where present. Do not add application logic just to create a coverage denominator. See [Vitest coverage guidance](https://vitest.dev/guide/coverage.html).

Markdown, CSS, Astro markup, and third-party theme code are not meaningfully represented by this JS/TS percentage. Validate these with generated HTML checks and browser tests, and report that scope alongside the percentage:

- Build checks: expected routes, titles/descriptions, canonical URLs, single page heading, landmarks, working internal links and images, sitemap, and draft exclusion.
- Playwright: home-to-page navigation, mobile menu keyboard behavior, blog index/post links, theme selection, and 404 handling. Run Chromium on PRs; run Firefox/WebKit before release and on a scheduled workflow.
- Accessibility: axe checks across public pages and themes, plus manual keyboard, zoom, and screen-reader spot checks. Automated checks alone do not establish full accessibility compliance.
- Visual/performance: reviewed screenshots for the homepage and a prose page; compressed CSS/JS/image budgets derived from the first accepted build. Keep font transfers at zero while using system fonts.

## CI/CD behavior

On pull requests and pushes to the confirmed default branch: install from the lockfile, lint/format-check, type-check, run unit tests with coverage, build, validate generated content, and run browser/accessibility checks. Upload coverage and failed-browser diagnostics. Cancel superseded PR runs and pin third-party actions to reviewed commit SHAs.

Run external analysis after coverage is generated. Gate merging on the local verification job and configured SonarQube/DeepSource checks once both integrations have produced a valid baseline. Ensure a successful scan submission is not mistaken for a passing quality gate.

Use separate reporting handling when necessary: DeepSource requires coverage for the analyzed commit, rather than GitHub's synthetic PR merge commit. Keep integration testing of the prospective merge result while generating/uploading correctly attributed head-commit coverage. Fork PRs must still run local checks without exposing upload or deployment credentials; do not execute untrusted PR code in a privileged workflow.

Deploy the exact successful artifact for the selected default-branch SHA. Because external checks can finish asynchronously, explicitly await their outcome before release. Upload only `dist/`, retain release artifacts for rollback, and verify homepage, assets, representative deep routes, HTTPS, and actual HTTP 404 status after deployment.

The repository suggests S3 hosting, so retain AWS provisionally. Confirm bucket, CDN, domain redirects, clean URL routing, caching, and permissions before implementing deployment. Prefer short-lived GitHub OIDC credentials scoped to the site. If a different host is chosen, revise only the deployment milestone. Do not assume Verdant's Netlify hosting or header files apply to Good Paddle.

## SonarQube and DeepSource

Recommend SonarQube Cloud to avoid maintaining a server for a small static site. If an existing SonarQube Server is available, use its endpoint instead and verify PR analysis support for that edition.

For SonarQube, add project/organization identifiers and analysis scope to `sonar-project.properties`, separating source from tests and excluding generated files. Import `coverage/lcov.info` with `sonar.javascript.lcov.reportPaths`. Use CI-based analysis when importing coverage, and disable conflicting automatic analysis if enabled. Store the analysis token in GitHub secrets. Configure a new-code quality gate targeting at least 80% coverage; local Vitest thresholds remain authoritative for overall JS/TS coverage and small changes. See [SonarQube's JavaScript/TypeScript coverage guide](https://docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/test-coverage/javascript-typescript-test-coverage).

For DeepSource, connect the repository and enable JavaScript/TypeScript and test-coverage analysis. Current documentation allows dashboard configuration without `.deepsource.toml`; prefer a checked-in configuration for reproducible analyzer settings and exclusions where supported. Upload the LCOV report using the documented JavaScript key, preferably via GitHub OIDC; use a repository DSN secret if necessary. See [core analyzers](https://docs.deepsource.com/docs/platform/reference/core-analyzers), [coverage formats](https://docs.deepsource.com/docs/platform/reference/code-coverage), and [coverage setup](https://docs.deepsource.com/docs/platform/getting-started/track-code-coverage).

Check both services' treatment of `.astro` files during setup rather than assuming template analysis support. Keep Astro's checks, generated-site validation, and browser coverage for any unsupported surfaces. Align exclusions across tools and investigate differing metrics before treating them as regressions. Tune overlapping style findings so both services provide useful feedback without duplicating formatter noise.

## Decisions and activation prerequisites

The working defaults are Astro, plain Markdown, Verdant's published preset, GitHub Actions, SonarQube Cloud, and retaining AWS hosting. Before service activation or production rollout, confirm:

1. The intended host and access to its deployment settings.
2. SonarQube Cloud versus an existing Server, organization/project ownership, and plans that support this repository's visibility and PR feedback needs.
3. DeepSource repository access and desired quality gates.
4. Reviewed About/Contact copy, the contact destination, and whether the blog launches now.

Prepare code and workflows locally first. Account connections, secrets, branch protection, pushes, and publishing affect shared state or require credentials; obtain Ivan's authorization for those concrete actions under the supplied global AGENTS.md instructions.

## Completion criteria

The migration is complete when content can be published from Markdown, Verdant styling works across the supported states, meaningful executable-code coverage meets the 80% thresholds, every public route passes the defined checks, both analysis services report on PRs, and a tested build can be released and rolled back through the documented workflow.
