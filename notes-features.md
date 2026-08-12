### My Active Jobs (Creative & Production)
- one page, "Viewing as" picker swaps between anyone with a personal scan location
- filter pills = only that person's own locations (1-2 pills for most people)
- row shows that job's current scan location as a read-only pill too

### Department Jobs (Bindery, Woodshop, Press, Pre-Press, Shipping, Accounting, Creative)
- one shared board per department, not per person
- filter pills = every scan location under that department, derived from the real location table — including stops owned by a named individual, so a department lead sees those jobs too
- empty stops collapse behind a "Show N empty stops" toggle
- **Creative Services produces 40 occupied pills** because most of its stops are individual designers and proof-out queues. Needs grouping — see README.

### My Clients' Active Jobs (Sales)
- job set is scoped by client attachment; **filter pills are the department the job's scan location belongs to**
- lets a rep see how much of their book is in art vs. on the floor vs. ready to ship
- pills only appear for departments the rep has jobs in; multi-select
- client is a separate dropdown below the pills, and pill counts rescope to the selected client
- `Unassigned` pill covers stops with no DEPARTMENT_DESC (In Production, Outside Services, outside vendors, etc.)

## Data
- `mock-data.js` carries the real job_locations.xlsx table (161 rows) as `LOCATIONS`
- every job's department is derived from its scan location via `deptOf()` — nothing hardcoded
- jobs, clients, and rep→client assignment are invented

## Styling
- lifted straight from `customer-jobs.html`'s table/toolbar/search-header/card styling
- new: `.viewing-as` switcher, `.pill-filter` row, `.row-pill` read-only chip, `.sub-filter` dropdown
