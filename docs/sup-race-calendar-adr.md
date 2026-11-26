# ADR 0001 — Publish a reviewed Pacific Northwest SUP race calendar

**Status** Proposed for review, November 25, 2026. Implementation starts after Ivan accepts the decision. See the [implementation plan](sup-race-calendar-plan.md).

## Context

Seattle SUP Race Watch reports newly discovered races and series around greater Seattle and Puget Sound. Paddlers need to know whether they can enter on a stand-up paddleboard, which course they can race, and whether the organizer has moved or cancelled it. A discovery report can point to a previous edition or repeat a syndicated announcement. Good Paddle needs an editorial decision between discovery and publication.

The site already builds static Astro pages from validated collections, shares a Verdant/Panda theme, and checks the generated site in CI. The existing Markdown page router owns most paths. The calendar needs its own reserved path and a way to keep the history of an occurrence through changes.

## Decision

Launch coverage includes greater Seattle and Puget Sound, Bellingham, WA, Vancouver, BC, and Portland, OR. Apply the same SUP eligibility and source checks throughout this area.

Add a build-time Astro collection with one JSON file per race occurrence in `src/content/races/`. A weekend event can have multiple SUP divisions and courses in one record. Give independently scheduled series rounds separate records with a shared series ID. Render approved records into static HTML at `/races/`. Keep discovery notes outside the published collection.

| Record fields             | Meaning and validation                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID and series             | Use an immutable, editor-assigned lowercase filename stem, such as `example-winter-2027-round-2`. Use it as the Astro ID and HTML anchor. Keep it through renames, moves and rescheduling across years. A new edition gets a new ID.                                                                                                                                             |
| Name, organizer, location | Require display name, organizer name and URL, locality and a verified venue or area. Add launch details only if sourced.                                                                                                                                                                                                                                                         |
| Schedule and status       | Use local ISO calendar dates for start and optional inclusive end, optional local start time, and the event's IANA time zone. Require a date for scheduled races. Support postponed and cancelled states, a previously announced date and a short sourced change note. Preserve the last announced date on cancellation.                                                         |
| Eligibility and courses   | Require explicit current-edition SUP racing evidence. Record SUP divisions and their applicable distances with units when published. An unknown SUP course stays unknown even if the organizer lists distances for other craft.                                                                                                                                                  |
| Entry                     | Store the organizer-designated registration or RSVP URL and any published opening and closing dates. Omit unknown values. Render a clear unknown state and link to the organizer when there is no entry link.                                                                                                                                                                    |
| Evidence and review       | Record source URLs, source role, facts supported, date checked, stable provider event identifiers when available, first discovery date and last substantive verification date. Record original announcement date only if evidenced. Use editorial state `pending` or `approved`, separate from race status. Human approval of the exact proposed revision is recorded on the PR. |

### Verify the occurrence and resolve duplicates

An editor must independently open an organizer, host club or organizer-designated registration source for the actual edition. Verify race format, SUP eligibility, date and place before first publication. Use a second authoritative source or organizer clarification when evidence conflicts. A syndicated listing can identify a lead. It cannot establish eligibility or resolve a conflict. Attribute optional details to their sources and leave unpublished facts open. A season-only announcement stays on the watchlist until a date is verified. A previously published race can carry a postponement while its new date is unknown.

Match incoming records first by a known occurrence ID or edition-specific provider ID. Normalize source URLs for comparison by removing tracking parameters and fragments while preserving event-identifying parameters. A reused series homepage is supporting evidence only. Compare organizer, edition, round, locality and normalized name for possible matches. Date is a clue because it can change. Ambiguous matches go to an editor before creating or combining records. Keep prior identifiers as aliases on correction. An unchanged rediscovery produces no PR. A material change updates the same record and calendar anchor.

### Publish changes and handle time

A future, separately authorized handoff from the existing daily watch may propose a data-only PR. It compares against master and outstanding proposals, includes evidence and a field-level change summary, and updates an existing proposal for the same occurrence. The editor checks the sources and reviews the latest revision. Only an approved record in a human-reviewed merge can reach the calendar. CI verifies the shape and consistency of records. The reviewer decides whether the source supports the claims.

Show dated upcoming races in start-date order with an ID tie-breaker. Show cancellations prominently against their announced dates and suppress registration calls to action. Keep a postponed event with no replacement date in a separate status section, with its former date clearly labeled and entry actions suppressed. When a verified replacement arrives, restore scheduled status on the same ID. If a correction makes a race ineligible, withdraw it from public output and retain its ID and history in git.

Use one build timestamp and derive the current calendar date in each event’s IANA time zone. An occurrence remains current through its inclusive final local date, then moves to a past section in reverse chronological order at the next build. Past records retain their anchors, sources and status, with entry actions suppressed. An undated postponement needs editorial follow-up to resolve or retire it. Display the build's “Calendar as of” date and the last verification date on each listing. A static page can retain yesterday's grouping until a new build is released.

### Reader experience

Use the existing site layout, skip link, navigation, theme and Verdant semantic tokens. Offer a chronological list with month headings, textual statuses, machine-readable dates, descriptive organizer links and an honest empty state. Reading the calendar and following a link must work with JavaScript disabled. A semantic list also accommodates several events on one day and longer change notices at narrow widths.

## Alternatives and trade-offs

| Alternative                             | Why choose the proposed approach                                                                                                                                                              |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hand-edit one Markdown calendar         | Initially simpler, but duplicate reconciliation and cancellations require editing prose. Separate records give each correction a small, inspectable diff.                                     |
| Pull a registration feed in the browser | Reflects upstream edits rapidly, but introduces a runtime dependency and can expose unreviewed changes. Static HTML trades immediacy for predictable availability and editorial control.      |
| Hosted calendar or CMS                  | Offers built-in editing and recurrence, at the cost of another service, permissions and an additional representation to reconcile. Git and the existing review process suffice at this scale. |
| Let the monitor publish automatically   | Gets news out sooner, but an old division list or an ambiguous series match can mislead paddlers. The proposed review gate costs editor time on material changes.                             |

## Non-goals and review decisions

The first release covers race discovery through a readable regional listing. Individual event pages, maps, filters, reminders, ICS/RSS, submissions, results, payments and a new crawler are outside scope. This proposal adds no runtime service. Before release, settle ownership of time-sensitive corrections and the refresh policy described in the [plan](sup-race-calendar-plan.md#outstanding-questions).
