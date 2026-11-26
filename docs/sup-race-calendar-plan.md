# Seattle-area SUP race calendar implementation plan

**Status** Draft for review, November 25, 2026. The [proposed ADR](sup-race-calendar-adr.md) defines the publication contract. This branch delivers the decision and plan for Ivan's review. Each stage below describes future work.

## Sequence and acceptance criteria

### 1. Establish the collection and identity rules

Extend `src/content.config.ts` with a JSON glob collection and schema. Read each file as one object, derive the ID from its filename and verify this behavior with the installed Astro loader. Use one set of validators for the build and CI. Put cross-record checks and date/status grouping in `src/lib/races.ts`. Accept an explicit as-of date for reproducible tests. Store date-only values as validated calendar dates to avoid a UTC conversion moving a race to the previous day in Seattle.

**Accept when** an empty collection builds, a synthetic valid record loads, and CI rejects invalid dates, end before start, reversed registration dates, invalid source URLs, unsupported status, approved records lacking edition-specific evidence, and duplicate IDs or occurrence-specific provider aliases. Detect filename/ID collisions before a loader can silently overwrite them. Shared series URLs are allowed. Keep synthetic fixtures under tests and out of shipped content.

### 2. Build the static page and calendar states

Add `src/pages/races/index.astro`, reserve the `races` path segment in `src/lib/content.ts`, and add a single Races navigation entry through `src/layouts/Site.astro`. Use literal Panda style calls in `src/styles/site.ts` and existing Verdant tokens. Group approved dates by month. Put date, locality, eligible distances, registration window, organizer, checked date and status together. Use the organizer's wording for a correction when precision matters. Label a missing registration deadline “Closing date not announced.” When there are no upcoming races, say so and preserve access to any past listings and postponements.

**Accept when** the production build emits `dist/races/index.html` with one H1, canonical URL, sitemap entry, working navigation and stable anchors. The page has meaningful empty, populated, cancelled, postponed and past states. Pending or withdrawn entries are absent from public HTML, metadata and sitemap. The calendar adds no client script or fetch. A same-day event remains upcoming through Pacific midnight at the end of its final day.

### 3. Exercise the full publication path in CI

Extend the existing pull-request job that runs `npm run verify`. Run schema and collection-wide checks on data-only changes as well as code changes. Keep source availability and editorial judgments out of network-dependent CI tests.

| Layer              | Acceptance check                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Vitest             | Fixed-date cases cover Pacific day boundaries, daylight-saving transitions, multi-day events, same-day ties, unknown registration dates and allowed status transitions. Matching cases include a reschedule, two rounds sharing a website, distinct annual editions, the same provider ID seen twice, and an ambiguous match sent to review. Preserve the repository's 80% thresholds for statements, branches, functions and lines. |
| Built site         | Extend `tests/integration/` and `scripts/check-site.mjs` as appropriate. Build isolated fixtures for empty and mixed records. Assert the expected text, order, links, exclusion of private candidates, reserved route collision failure and a single calendar route.                                                                                                                                                                 |
| Playwright and axe | From Home, follow Races with the keyboard, use the skip link, read a status and follow a descriptive source link target. Check 320px and desktop layouts, light and dark appearance, and JavaScript-disabled reading. Run the existing axe rule tags on empty and populated states with zero violations. Manually spot-check headings, status announcements in reading order, focus and zoom before release.                         |

**Accept when** an intentionally invalid fixture fails the relevant check, valid fixtures pass, and the normal verification command passes on a clean checkout. Browser fixtures must never seed production data.

### 4. Rehearse an editorial data-only PR

Start with a manual rehearsal using a synthetic race in an isolated test checkout. For a real proposal, an editor opens current-edition sources, checks scope and explicit SUP racing, resolves identity against approved records and open proposals, and records the evidence. The proposed diff contains only occurrence JSON under `src/content/races/`. Include source links, facts verified, unknowns and old/new values in the PR body. A proposed approval-state change is subject to the same human review as an event edit.

For an update, cite the changed fact and retain the same ID. For a cancellation, require an explicit organizer notice. A missing page or closed registration triggers investigation. Recheck competing proposals against the current base before merge. If evidence is inconclusive, hold the proposal. Record the decision in the review. An authorized maintainer performs the normal merge only after CI passes and the latest revision has editorial sign-off.

**Accept when** replaying the same observation opens no second proposal, a changed start date updates one occurrence, an organizer cancellation remains visible with no signup action, and an unrelated code or workflow change fails the watch-PR path check. Exercise stale approvals after edits and conflicting proposals for one ID. A recorded recheck alone should not open a daily PR.

### 5. Decide whether to connect the daily watch

After the manual path and editorial ownership are approved, separately authorize any integration work. Reuse Seattle SUP Race Watch's existing discovery output and cadence. A future adapter would compare its findings with master and open PRs, produce the same evidence packet, and open or amend a data-only proposal on a material change. Give it proposal-only access with no merge or deploy authority. Enforce the path restriction with a trusted base-branch check for watch proposals. Require an authorized human review of the latest commit through repository controls. If either control cannot be enforced, retain the manual handoff.

**Accept when** a dry run with recorded observations demonstrates a new occurrence, repeat, correction, conflict and cancellation, including retry after a PR was created but its response was lost. Confirm that no-change days stay quiet and that the watch's existing notifications still work. Any credentials, workflow activation, refresh schedule or release require separate approval.

## Initial leads awaiting independent verification

The November 25 watch report supplied these names. All three remain outside public data. The report also lacked verifiable original announcement dates. First discovery must not be presented as the announcement date.

| Lead                                      | Evidence the reviewer still needs                                                                                                                                                                                                                                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PaddleTube Seattle Test Stream, Ballard   | The watch could not access the organizer page. Confirm directly that the test stream includes a public SUP race, then verify the edition, date, launch, course and RSVP details. A syndicated event listing alone is insufficient. [Organizer lead](https://harbormaster.paddletube.com/seattle/)                |
| Narrows Challenge 2027, Gig Harbor        | Check the 2027 organizer or designated registration page for the date and explicit eligibility of SUP paddlers. Verify which distances apply to SUP before listing any. Historical courses or championship designations do not establish this edition's program. [Organizer lead](https://narrowschallenge.com/) |
| PNWORCA Winter Series Race #4, Bellingham | Check the host's current season and round for the exact date, location and explicit SUP division. Confirm Bellingham is in scope. Keep a season-only listing in discovery. [Host club lead](https://www.bbop.us/s-projects-side-by-side)                                                                         |

## Outstanding questions

- **Geography.** Does launch coverage include Bellingham and the wider Salish Sea, or only greater Seattle and nearby Puget Sound communities? Ivan should settle the boundary before accepting a borderline event.
- **Editorial coverage.** Who can approve race PRs, who covers urgent cancellations, and how often should an editor revisit unresolved postponements or conflicting sources?
- **Static freshness.** Is rollover on the next ordinary build acceptable with a visible as-of date, or does launch require an independently approved daily rebuild and release? A quiet watch day produces no data PR to trigger a build.
- **Archive size.** The proposed first release keeps past entries on the page. At what point should older seasons move to a separate archive while preserving inbound anchors?
- **First release.** May the calendar launch with the reviewed empty state, or should the navigation link wait for the first verified occurrence?
