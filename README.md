# PL-JOBS-DASHBOARDS — Active Jobs Dashboards

Exploration: what does "my active jobs" look like for different roles across the shop?

`shared/` is the `PL-shared` submodule (design tokens + sidebar component). `customer-management.css` lives at this repo's root rather than in `shared/`, matching PL-CM-1.5 — it isn't part of PL-shared.

All four are **kanban boards**. Lanes are what were filter pills in the earlier list version; cards follow the wireframe.

1. **`person-dashboard.html`** — Creative Services and Press. These are people who have their own named scan location(s) in `job_locations.xlsx` (e.g. "Colin Dunn", "Colin D - Proof Out", "Kristen M - Plated"). One page, "Viewing as" switcher to preview any of them. Lanes = that person's own locations, so most people get two: Working and Proof Out.

2. **`department-dashboard.html`** — Bindery, Woodshop, Press, Pre-Press, Shipping, Accounting, and Creative Services. One shared board per department — everyone in the department looks at the same page. Lanes are derived from `LOCATIONS`, so **every** stop in that department gets one, including stops owned by a named individual (a Press lead needs to see what's sitting at Mike-Plated, even though Mike also sees it on his own board). Empty stops collapse to a 44px rail with a vertical label — click one to open it, or use "Expand N empty stops" for all of them at once.

   **Creative Services is a special case.** Its 46 stops were mostly individual designers and their proof-out queues, so instead of 40 lanes it shows the 8 shared stops as lanes, then one combined **Working** lane and one combined **Proof Out** lane, with the actual scan location on each card as a pill. 10 lanes instead of 40. The shared-stop list is `CREATIVE_SHARED_STOPS` in `mock-data.js`; anything in Creative that isn't on that list rolls into Working or Proof Out depending on whether its name contains "proof out". The generic `Proof Out` stop (status 18) lands in the Proof Out lane.

3. **`sales-dashboard.html`** — the job set is scoped by client attachment (every job across the rep's accounts), and **lanes are the department the job's current scan location belongs to** — Creative Services, Accounting, Press, Bindery, Woodshop, Pre-Press, Shipping, plus Unassigned for stops with no `DEPARTMENT_DESC`. So a rep can see at a glance how much of their book is in art vs. on the floor vs. ready to ship. Lanes only appear for departments the rep actually has work in. Every card shows its **actual scan location** as a pill, since a lane here covers many stops. No client dropdown — search covers customer and management group if you need to narrow to one account.

4. **`allocation-dashboard.html`** — the allocator's board. A segmented toggle picks which queue you're working: **Page Layout** (Printing, PDF Only, Paper, Press Proof) or **Bindery** (Bindery, Woodshop Only, Menu Hardware). The first lane is the allocation stop itself — `Page Layout Allocation` or `Bindery Allocation`, whichever matches the toggle — styled with the gold accent so it reads as the source column, and **pinned to the left edge** so it stays in view while the designer inboxes scroll past it. After it comes one inbox lane per designer, titled "<Name> - Inbox", which is that designer's own working stop from `job_locations`. The legend narrows to just the production types the selected allocator handles.

## Cards

Per the wireframe: job number, description, customer name, management group, and a colored stripe down the right edge keyed to production type. The whole card is the click target. Production type, job type, and created date are in the card's tooltip rather than on its face, to keep it as clean as the wireframe.

Where a lane holds more than one scan location — the sales board, and Creative's Working / Proof Out lanes — the card also carries the job's actual scan location as a pill under the management group.

Three stripe colors come from the wireframe; the rest are pulled from the token palette so every production type is distinguishable:

| Production type | Color | Source |
|---|---|---|
| Bindery | grey | wireframe |
| Printing | yellow | wireframe |
| PDF Only | blue | wireframe |
| Paper | mint | `--datacolor-mint-*` |
| Woodshop Only | copper | `--datacolor-orange-*` / `--color-copper-500` |
| Menu Hardware | grape | `--datacolor-grape-*` |
| Press Proof | cherry | `--datacolor-cherry-*` |

Since the stripe is the only production-type cue on the card face, every board carries a legend above it rather than relying on color alone. The allocation board's legend narrows to just the types that allocator handles.

## Data

`mock-data.js` now carries the **real** `job_locations.xlsx` contents — all 161 rows, deduped on location + status id — as the `LOCATIONS` array. That's the single source of truth for which department a scan location belongs to, so every dashboard derives a job's department from nothing but its current scan location (`DEPT_BY_LOCATION` / `deptOf()`). Individuals' departments are derived the same way rather than hardcoded.

Everything else in that file is invented: job_locations has no job records, and nothing available ties sales reps to client accounts. Real wiring would replace `JOBS` with a live feed keyed off the same `LOCATION_DESC` / `JOB_STATUS_ID` values, plus whatever table actually carries rep→client assignment.

## Styling

Table, toolbar, search header, and card chrome are pulled straight from `PL-CM-1.5/customer-jobs.html` (design-tokens.css variables, `.jobs-table`, `.card`, `.search-list-header`, breadcrumb/topbar). New additions specific to this exploration:

- `.viewing-as` — the person/department/rep switcher
- `.kanban` / `.lane` — the board and its lanes (`.is-collapsed` for the empty-stop rail, `.is-allocation` for the pinned allocation source column — `position: sticky; left: 0`)
- `.job-card` / `.card-stripe` — the wireframe card and its production-type stripe
- `.card-pills` / `.card-pill` — the scan-location pill on the card
- `.prod-*` — the seven production-type color classes (each sets `--stripe-fill` / `--stripe-line`)
- `.legend` — production-type key above each board
- `.view-toggle` — the segmented Page Layout / Bindery switch on the allocation board

## Open questions

**`Press Proof` as a production type.** You listed it under Page Layout alongside print, PDF, and paper, so I added it as a seventh production type with its own stripe color. It isn't in the Production Type filter on the customer jobs page, and `Press Proof` also exists as a *scan location* under 107 - Press (status 998) — so confirm which you meant. If it's meant to be the scan location rather than a production type, drop it from `PROD_TYPES` and `ALLOCATION_VIEWS[0].prodTypes` in `mock-data.js`.

**Which designers get an inbox lane.** The allocation board lists the 13 Creative Services people who have their own scan location, and shows the same 13 under both toggles. If bindery-side allocation actually routes to a different (or shorter) set of people, that list is `DESIGNERS` in `mock-data.js`.

**Only the allocation board pins a lane.** Creative Services also has `Page Layout Allocation` and `Bindery Allocation` as its first two lanes on the department board, and I left those scrolling — pinning both would hold 576px of a 1440px viewport before you see anything else. Easy to add if you want one or both of them pinned there too.

**Bindery is still 40 lanes.** Creative went from 40 to 10 with the shared-stops-plus-Working-plus-Proof-Out split, but Bindery has 40 real stops and Press 21, none of which are person-name queues — so the same trick doesn't apply. They're workable as scrolling boards; flagging it in case Bindery wants grouping too (BIP-prefixed stops are an obvious cluster).

Other, smaller:

- Press mixes named individuals (Mike, Barry, David, Kristen M, Tony Stetzik) *and* shared machine stops as sibling lanes. Reads fine at this volume — worth confirming that's what the floor wants.
- Should the `Unassigned` lane on the sales board get a better label? It covers In Production, Outside Services, Not Scanned In, Cancelled, Quality Control, and the outside vendors (Lake Erie Graphics, United Finishing) — every row with no `DEPARTMENT_DESC`.
- The scan-location pill sits at the bottom of the card, under the management group. If people scan for it more than for the customer, it should probably move up under the description.
- No drag-and-drop between lanes. Moving a job means a scan, so I assumed the board is read-only — say if you want dragging on the allocation board as a shortcut for assigning to a designer, since that's the one place it would genuinely save steps.
