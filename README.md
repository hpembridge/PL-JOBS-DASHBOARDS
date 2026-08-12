# PL-JOBS-DASHBOARDS — Active Jobs Dashboards

Exploration: what does "my active jobs" look like for different roles across the shop?

Not a git repo yet (per Healey — this is exploration only). No submodule for shared tokens; `shared/` is a plain copy of the current `platinum-shared` design tokens, sidebar component, and `customer-management.css` styles. If this graduates to a real prototype repo, swap `shared/` for the usual submodule setup (see any PL-CM-* README for the pattern).

## The three views

1. **`person-dashboard.html`** — Creative Services and Press. These are people who have their own named scan location(s) in `job_locations.xlsx` (e.g. "Colin Dunn", "Colin D - Proof Out", "Kristen M - Plated"). One page, "Viewing as" switcher to preview any of them. Filter pills = that person's own locations only (so most people get 1-2 pills; Colin Dunn's second pill is Proof Out, per Healey's example).

2. **`department-dashboard.html`** — Bindery, Woodshop, Press (general queue), Pre-Press, Shipping, Accounting. One shared board per department — everyone in the department looks at the same page. Filter pills = every scan location that belongs to that department (Bindery and Woodshop have the most).

3. **`sales-dashboard.html`** — scoped by client attachment, not scan location. "Viewing as" switches the rep; pills are that rep's client accounts (not statuses) since a rep's jobs span every department a job happens to be sitting in.

## Data

`mock-data.js` is invented — job_locations.xlsx only defines department → scan location → status id, it has no job records, and nothing in the shop's exports ties sales reps to clients (at least nothing Healey pointed me at). Real wiring would replace `JOBS` in that file with a live feed keyed off the same `LOCATION_DESC` / `JOB_STATUS_ID` values used here, plus whatever table actually carries rep→client assignment.

## Styling

Table, toolbar, search header, and card chrome are pulled straight from `PL-CM-1.5/customer-jobs.html` (design-tokens.css variables, `.jobs-table`, `.card`, `.search-list-header`, breadcrumb/topbar). New additions specific to this exploration:

- `.viewing-as` — the person/department/rep switcher
- `.pill-filter-row` / `.pill-filter` — clickable status/client pills used as filters (multi-select for person & department views, single-select for the sales client picker)
- `.row-pill` — the read-only pill shown per job row for its current scan location

## Open questions for Healey

- Should "the rest of production" list (Press general queue, Pre-Press, Shipping, Accounting) really share this one template, or does Press need its own layout since it mixes named individuals (Mike, Barry, David, Kristen M) *and* a general queue?
- Sales pills are client accounts here since "attached to clients" was the ask — but should there also be a status filter for sales, or is client-only correct?
- Real job counts per department (Bindery especially) will likely be much higher than this mock data — worth checking whether the pill row needs to collapse/scroll past a certain count.
