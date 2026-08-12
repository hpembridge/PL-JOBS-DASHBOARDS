# PL-JOBS-DASHBOARDS — Active Jobs Dashboards

Exploration: what does "my active jobs" look like for different roles across the shop?

Not a git repo yet (per Healey — this is exploration only). No submodule for shared tokens; `shared/` is a plain copy of the current `platinum-shared` design tokens, sidebar component, and `customer-management.css` styles. If this graduates to a real prototype repo, swap `shared/` for the usual submodule setup (see any PL-CM-* README for the pattern).

## The three views

1. **`person-dashboard.html`** — Creative Services and Press. These are people who have their own named scan location(s) in `job_locations.xlsx` (e.g. "Colin Dunn", "Colin D - Proof Out", "Kristen M - Plated"). One page, "Viewing as" switcher to preview any of them. Filter pills = that person's own locations only (so most people get 1-2 pills; Colin Dunn's second pill is Proof Out, per Healey's example).

2. **`department-dashboard.html`** — Bindery, Woodshop, Press, Pre-Press, Shipping, Accounting, and Creative Services. One shared board per department — everyone in the department looks at the same page. Filter pills are derived from `LOCATIONS`, so **every** stop in that department is represented, including ones owned by a named individual (a Press lead needs to see what's sitting at Mike-Plated, even though Mike also sees it on his own dashboard). Multi-select. Stops with nothing sitting at them collapse behind a "Show N empty stops" toggle so the row stays scannable.

3. **`sales-dashboard.html`** — the job set is scoped by client attachment (every job across the rep's accounts), but the **filter pills are the department the job's current scan location belongs to** — Creative Services, Press, Bindery, Woodshop, Pre-Press, Shipping, Accounting, plus Unassigned for stops with no `DEPARTMENT_DESC` in the source data. So a rep can see at a glance how much of their book is sitting in art vs. on the floor vs. ready to ship. Pills are multi-select and only appear for departments the rep actually has jobs in. Narrowing to a single client is a separate dropdown below the pills, and the pill counts rescope to that client.

## Data

`mock-data.js` now carries the **real** `job_locations.xlsx` contents — all 161 rows, deduped on location + status id — as the `LOCATIONS` array. That's the single source of truth for which department a scan location belongs to, so every dashboard derives a job's department from nothing but its current scan location (`DEPT_BY_LOCATION` / `deptOf()`). Individuals' departments are derived the same way rather than hardcoded.

Everything else in that file is invented: job_locations has no job records, and nothing available ties sales reps to client accounts. Real wiring would replace `JOBS` with a live feed keyed off the same `LOCATION_DESC` / `JOB_STATUS_ID` values, plus whatever table actually carries rep→client assignment.

## Styling

Table, toolbar, search header, and card chrome are pulled straight from `PL-CM-1.5/customer-jobs.html` (design-tokens.css variables, `.jobs-table`, `.card`, `.search-list-header`, breadcrumb/topbar). New additions specific to this exploration:

- `.viewing-as` — the person/department/rep switcher
- `.pill-filter-row` / `.pill-filter` — clickable filter pills, multi-select on all three boards (`.is-empty` de-emphasises stops with a zero count)
- `.row-pill` — the read-only pill shown per job row for its current scan location
- `.sub-filter` — the secondary dropdown (client, on the sales board)

## Open question worth looking at first

**The Creative Services department board has 40 occupied pills, five rows deep.** That's not mock-data inflation — it's what the real location table produces, because 30-odd of Creative's 46 stops are individual people's names and proof-out queues. Collapsing empty stops barely dents it. Options, roughly in order of how much I'd want them:

1. Group the pills — one "Designers" group that expands, separate from the shared stops (Proofreading, Art Hold, Page Layout Allocation, Bindery Allocation, Final Proofreading).
2. Drop person-owned stops from the department board entirely and let the per-person dashboards own them — but then a Creative lead loses the shop-wide view, which seems like the wrong trade.
3. Leave Creative off the department boards altogether, since it's per-person by design — but the shared stops then have no home.

Bindery (27 occupied) and Press (17) are fine as flat rows, so this is really a Creative-specific problem.

## Other open questions

- Press mixes named individuals (Mike, Barry, David, Kristen M, Tony Stetzik) *and* shared machine stops on the same board. It reads fine at this volume — worth a look to confirm that's what the floor actually wants.
- Sales pills are department-of-scan-location per your note. Should the `Unassigned` group get a better label? It covers In Production, Outside Services, Not Scanned In, Cancelled, Quality Control, and the outside vendors (Lake Erie Graphics, United Finishing) — all the rows with no `DEPARTMENT_DESC`.
- Real per-stop job counts will be much higher than this mock data. Pills wrap rather than scroll right now; at real volume the wrap depth is the thing to watch.
