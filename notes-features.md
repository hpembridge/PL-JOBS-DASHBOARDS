### My Active Jobs (Creative & Production)
- one page, "Viewing as" picker swaps between anyone with a personal scan location
- filter pills = only that person's own locations (1-2 pills for most people)
- row shows that job's current scan location as a read-only pill too

### Department Jobs (Bindery, Woodshop, Press, Pre-Press, Shipping, Accounting)
- one shared board per department, not per person
- filter pills = every scan location under that department
- Bindery and Woodshop will have the most pills — worth testing at real volume

### My Clients' Active Jobs (Sales)
- scoped by client attachment instead of scan location
- "Viewing as" swaps the rep; pills are that rep's client accounts, single-select
- still shows each job's current scan location as a read-only pill in the row, just not filterable by it

## Styling
- lifted straight from `customer-jobs.html`'s table/toolbar/search-header/card styling
- new: `.viewing-as` switcher, `.pill-filter` row, `.row-pill` read-only chip
