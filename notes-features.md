All four boards are kanban. Lanes are what used to be filter pills.

### Card (per wireframe)
- job number, description, customer name, MANAGEMENT GROUP
- colored stripe down the right edge = production type
- gray = bindery, yellow = print/press, blue = PDF only (from the wireframe)
- mint = paper, copper = woodshop, grape = menu hardware (added so all six types are distinguishable)
- cherry = press proof (7th type, added for the page layout allocation queue)
- production type / job type / created date live in the tooltip, to keep the card face as clean as the wireframe
- legend sits above every board, since the stripe is the only production-type cue on the card
- where a lane covers more than one stop, the card also shows its actual scan location as a pill

### My Active Jobs (Creative & Production)
- "Viewing as" picker swaps between anyone with a personal scan location
- lanes = that person's own locations, so usually two: Working and Proof Out

### Department Jobs (Bindery, Woodshop, Press, Pre-Press, Shipping, Accounting, Creative)
- one shared board per department
- lanes = every scan location under that department, including stops owned by a named individual
- empty stops collapse to a narrow rail with a vertical label; click one to open, or "Expand N empty stops" for all
- **Creative Services is special-cased**: only the 8 shared stops get lanes, then one combined Working lane and one combined Proof Out lane, with the real scan location as a pill on each card. 10 lanes instead of 40.

### My Clients' Active Jobs (Sales)
- job set scoped by client attachment; lanes = the department the job is currently sitting in
- lets a rep see how much of their book is in art vs. on the floor vs. ready to ship
- only departments the rep has work in get a lane
- client dropdown removed — search covers customer name and management group
- each card shows its actual scan location as a pill, since a lane covers many stops

### Allocation
- segmented toggle: Page Layout (printing, PDF only, paper, press proof) or Bindery (bindery, woodshop only, menu hardware)
- first lane is the allocation stop itself — Page Layout Allocation or Bindery Allocation — gold-accented as the source column, and pinned to the left edge so it stays visible while the inboxes scroll past
- then one lane per designer, "<Name> - Inbox", which is that designer's own working stop
- legend narrows to just the production types that allocator handles

