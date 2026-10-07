# Service setup and releases

Local configuration is prepared. No hosted account has been connected, repository settings changed, or deployment performed. These actions require Ivan's approval under the global AGENTS.md instructions.

## Activate feedback

1. Connect `ivanoats/goodpaddle` to SonarQube Cloud. Confirm the organization, repository visibility, and plan support for PR analysis. Select GitHub Actions analysis and disable automatic analysis if enabled. Add the `SONAR_TOKEN` repository secret, `SONAR_ORGANIZATION` and `SONAR_PROJECT_KEY` variables, then set `SONAR_ENABLED=true`. `sonar-project.properties` imports the generated LCOV report. The scanner waits for the quality gate.
2. Configure the Sonar new-code gate for at least 80% coverage plus the desired reliability/security rules. Local Vitest thresholds independently enforce overall application logic coverage, including small changes where Sonar's new-code conditions may not apply.
3. Connect the same repository to DeepSource and enable JavaScript/TypeScript and test coverage. The checked-in `.deepsource.toml` documents the intended analyzer scope. Enable GitHub OIDC coverage reporting, then set `DEEPSOURCE_ENABLED=true`. The workflow installs the vendor CLI using its documented installer and uploads LCOV with the `javascript` key. If the organization requires pinned CLI binaries, replace this installer with an approved version/checksum before activation.
4. Run a trial PR. Confirm both services attach feedback and coverage to the exact PR head SHA, and that pushes to `master` populate their default-branch metrics. CI tests GitHub's merge result separately from head-commit coverage reporting. Fork PRs run verification without access to analysis credentials; do not use privileged PR triggers to work around this.
5. Confirm `.astro` analysis support in the chosen service editions. Templates remain covered by Astro diagnostics and generated-site/browser checks. Align coverage exclusions with Vitest; do not claim the 80% percentage measures Markdown/CSS/templates.
6. After a successful baseline, configure branch protection/rulesets on `master` to require `verify`, `analysis`, and the actual SonarQube/DeepSource GitHub checks. Enable “require branches to be up to date” or use a merge queue. Record the exact external check-run names, separated by commas, in `REQUIRED_EXTERNAL_CHECKS`. Include both services; upload completion alone is not proof of passing analysis. Verify a deliberately failing trial PR is blocked before enabling deployment.

The documentation currently recommends dashboard configuration for new DeepSource projects while still supporting TOML. Confirm that the dashboard reflects the checked-in choices during onboarding. Reference: [DeepSource coverage setup](https://docs.deepsource.com/docs/platform/getting-started/track-code-coverage) and [Sonar JavaScript coverage](https://docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/test-coverage/javascript-typescript-test-coverage).

## Confirm hosting before enabling delivery

The old repository targeted an S3 website bucket named `www.goodpaddle.com`. The prepared workflow assumes S3 plus CloudFront; this has not been verified against the live account. Keep `DEPLOY_ENABLED` unset until the actual infrastructure matches this contract:

- HTTPS canonical origin `https://www.goodpaddle.com`; apex redirects to it.
- `/` and directory routes resolve to their `index.html` files. An S3 website origin supplies this behavior; a private REST origin needs an appropriate CDN rewrite. Missing pages must return `404.html` with HTTP 404, not an SPA fallback or a 200 response.
- CloudFront compression enabled; HTML and mutable theme script revalidation configured appropriately. Existing assets retain their URLs.
- Response headers configured at CloudFront, including content-type protection and an appropriate CSP tested against Astro output. Netlify `_headers` files would have no effect here.
- An AWS OIDC trust relationship scoped to this repository's `production` GitHub environment. The role has only the bucket list/read/write/delete permissions necessary for publishing site files and CloudFront invalidation permissions for the selected distribution.
- A GitHub `production` environment restricted to `master`, with required reviewers for releases. Keep this approval gate for the first deployment.

Configure these variables: `AWS_DEPLOY_ROLE_ARN`, `AWS_REGION`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`, `SITE_URL` (without a trailing slash). Configure both analysis services and `REQUIRED_EXTERNAL_CHECKS`, then set `DEPLOY_ENABLED=true` only after approval.

## Release flow

A successful push CI run on `master` uploads `site-<commit SHA>` for 30 days. The Deploy workflow verifies the run belongs to the CI workflow, was a successful default-branch push, and is still current for an automatic release. It waits up to roughly 7.5 minutes for the configured external check-runs to succeed before proceeding to the protected production environment.

After approval, it downloads that exact artifact, obtains short-lived AWS credentials, uploads assets before HTML, removes obsolete HTML routes, and invalidates CloudFront. Old hashed assets remain so cached pages and previous releases work. Default-branch CI tests Chromium, Firefox, and WebKit before release. Smoke checks verify the homepage, theme script, sitemap, a published deep route when one exists, and a real 404 response. A deployment failure is visible as a failed workflow; it does not automatically rebuild or roll back.

## Rollback

Select the Deploy workflow manually on `master`, enter an earlier successful `master` push CI run ID with its artifact still retained, and approve the production environment. The same provenance and external-check gates apply; the current-head restriction is waived only for explicit manual rollback. The previous tested artifact is restored without rebuilding. Obsolete HTML is removed while older hashed assets are retained.

Before the first production release, exercise the workflow in a staging bucket/distribution, including publishing a new nested route, removing it, confirming HTTP 404, and restoring the prior artifact. These cloud checks remain pending until access is authorized. Preserve a copy of the current live site before replacing it, since its legacy release has no CI artifact to restore.

## Remaining release checks

- Review the provisional homepage copy. Supply About/Contact copy and the contact destination before enabling those drafts.
- Review desktop/mobile screenshots and perform keyboard, zoom, and screen-reader checks. Automated axe checks are not a full accessibility audit.
- Confirm host routing, headers, domain redirects, production transfer sizes, and rollback in staging.
- Review the local CSS/JS budgets (25 KiB/15 KiB Brotli). They are proposed ceilings, not claims about measured production transfers or energy use.
