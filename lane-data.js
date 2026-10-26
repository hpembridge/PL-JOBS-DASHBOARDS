/**
 * Lane management — model and mock data.
 * ═════════════════════════════════════════════════════════════
 * A LANE IS A STATUS BUCKET ON A BOARD.
 *
 * The per-person scan statuses ("Megan Doctor", "Megan Doctor - Proof
 * Out", "Kristen M - PLATED") go away. They encoded two things in one
 * field — WHO has the job and WHAT STATE it's in — and are replaced by
 * an assignee on the job and one of five true statuses on the lane.
 *
 *   lane.board     → which department board it belongs to
 *   lane.statusId  → which true status it reports as
 *   lane.scope     → who sees it (global / subgroup / personal)
 *   array order    → progress, left to right
 *
 * ── The start lane ──
 * Whatever sits at position 0 on a board is that board's start: where
 * work arrives. Destinations point at a BOARD, not at a lane, and the
 * board resolves to its own position 0 on delivery — so reordering
 * lanes can never silently repoint someone else's handoff.
 *
 * ── Handoff lanes ──
 * Completed is the only status that leaves your board: "no further
 * action is needed from me" means it's going somewhere. So every
 * Completed lane carries a destination, and no other lane needs one —
 * With client and With someone else both come back to you by
 * definition. A destination is one of two kinds:
 *
 *   { type: 'board', boardId }  digital handoff. No physical ticket, so
 *                               no scan: drop a job here and it lands in
 *                               that board's start lane.
 *   { type: 'scan', location }  a physical ticket moves. The board can't
 *                               pretend it walked: the job SITS in this
 *                               lane until someone scans it at that
 *                               location.
 *
 * Whether a scan is required is therefore derived from the mapping, not
 * a separate setting that can be set wrong on its own. This is what
 * replaces a "workflow path" field on the job — routing is the board.
 *
 * deptLabel() / PROD_TYPES / PROD_CLASS / pick() come from mock-data.js,
 * which must load first.
 * ═════════════════════════════════════════════════════════════
 */

// ── The five true statuses ──
const TRUE_STATUSES = [
  { id: 'todo',      label: 'To do',             blurb: 'I have the next action',                                     cls: 'status--todo' },
  { id: 'hold',      label: 'On hold',           blurb: 'Work is intentionally paused',                               cls: 'status--hold' },
  { id: 'elsewhere', label: 'With someone else',  blurb: 'Someone else has the next action, and it comes back to me',  cls: 'status--elsewhere' },
  { id: 'client',    label: 'With client',       blurb: 'The client has the next action',                             cls: 'status--client' },
  { id: 'done',      label: 'Completed',         blurb: 'No further action is needed from me — the job leaves this board', cls: 'status--done' },
];
const STATUS_BY_ID = {};
TRUE_STATUSES.forEach(s => { STATUS_BY_ID[s.id] = s; });

const HANDOFF_STATUS = 'done';
function isHandoff(lane) { return lane.statusId === HANDOFF_STATUS; }
function needsScan(lane) { return isHandoff(lane) && lane.destination && lane.destination.type === 'scan'; }

// ── Boards ── one per department in this prototype.
const BOARDS = [
  { id: 'csr',      label: 'CSR',               dept: '102 - Office' },
  { id: 'creative', label: 'Creative Services', dept: '104 - Creative Services' },
  { id: 'prepress', label: 'Pre-Press',         dept: '110 - Pre Press' },
];
const BOARD_BY_ID = {};
BOARDS.forEach(b => { BOARD_BY_ID[b.id] = b; });

// ── Scopes ── who a lane belongs to, and who may edit it.
const SCOPES = [
  { id: 'global',   label: 'Global',   blurb: 'Everyone on this board',          editableBy: ['supervisor'] },
  { id: 'subgroup', label: 'Subgroup', blurb: 'One user subgroup',               editableBy: ['supervisor', 'lead'] },
  { id: 'personal', label: 'Personal', blurb: 'Just me — never leaves my board', editableBy: ['supervisor', 'lead', 'member'] },
];
const SCOPE_BY_ID = {};
SCOPES.forEach(s => { SCOPE_BY_ID[s.id] = s; });

const SUBGROUPS = [
  { id: 'page-layout', label: 'Page Layout', board: 'creative' },
  { id: 'bindery-fin', label: 'Bindery',     board: 'creative' },
  { id: 'order-entry', label: 'Order Entry', board: 'csr' },
];

// ── Who is looking ── drives the board shown and what's editable.
const VIEWERS = [
  { id: 'peyton',  name: 'Peyton',        role: 'supervisor', roleLabel: 'CSR supervisor', board: 'csr',      subgroup: 'order-entry' },
  { id: 'colin',   name: 'Colin Dunn',    role: 'supervisor', roleLabel: 'Supervisor',     board: 'creative', subgroup: 'page-layout' },
  { id: 'megan',   name: 'Megan Doctor',  role: 'lead',       roleLabel: 'Lead',           board: 'creative', subgroup: 'page-layout' },
  { id: 'hannah',  name: 'Hannah Barnes', role: 'member',     roleLabel: 'Team member',    board: 'creative', subgroup: 'page-layout' },
  { id: 'mitch',   name: 'Money Mitch',   role: 'lead',       roleLabel: 'Pre-Press lead', board: 'prepress', subgroup: null },
];

// ── Scan locations a handoff lane can map to ──
// Real rows from job_locations.xlsx: the physical stops that still exist
// once the person-shaped statuses are gone.
function scanLocationOptions() {
  return LOCATIONS.filter(l => [
    'Pre-Press', 'Shipping', 'Shipping Inventory Release', 'St Clair Warehouse',
    'Page Layout Allocation', 'Bindery Allocation', 'Plated', 'Quality Control',
    'Outside Services', 'Prototype Table 1',
  ].indexOf(l.desc) !== -1);
}

/* ── Lanes ─────────────────────────────────────────────────── */

let LANES = [
  // ── CSR board ── one start, several exits. This is the case that used
  // to want a "workflow path" field on the job: a new job can go to
  // Creative, straight to Pre-Press, or straight to Shipping for an
  // inventory release. Each of those is just a Completed lane.
  { id: 'c1', board: 'csr', name: 'New orders',        statusId: 'todo',      scope: 'global', subgroup: null, owner: 'Peyton' },
  { id: 'c2', board: 'csr', name: 'Gathering details', statusId: 'todo',      scope: 'global', subgroup: null, owner: 'Peyton' },
  { id: 'c3', board: 'csr', name: 'Waiting on client', statusId: 'client',    scope: 'global', subgroup: null, owner: 'Peyton' },
  { id: 'c4', board: 'csr', name: 'To Creative',       statusId: 'done',      scope: 'global', subgroup: null, owner: 'Peyton',
    destination: { type: 'board', boardId: 'creative' } },
  { id: 'c5', board: 'csr', name: 'To Pre-Press',      statusId: 'done',      scope: 'global', subgroup: null, owner: 'Peyton',
    destination: { type: 'scan', location: 'Pre-Press' } },
  { id: 'c6', board: 'csr', name: 'Inventory release', statusId: 'done',      scope: 'global', subgroup: null, owner: 'Peyton',
    destination: { type: 'scan', location: 'Shipping Inventory Release' } },

  // ── Creative Services board ──
  { id: 'l1', board: 'creative', name: 'On deck',              statusId: 'todo',      scope: 'global',   subgroup: null,          owner: 'Colin Dunn' },
  { id: 'l2', board: 'creative', name: 'On hold',              statusId: 'hold',      scope: 'global',   subgroup: null,          owner: 'Colin Dunn' },
  { id: 'l3', board: 'creative', name: 'Design',               statusId: 'todo',      scope: 'global',   subgroup: null,          owner: 'Colin Dunn' },
  { id: 'l4', board: 'creative', name: 'Initial proofreading', statusId: 'elsewhere', scope: 'subgroup', subgroup: 'page-layout', owner: 'Megan Doctor' },
  { id: 'l5', board: 'creative', name: 'Client proof',         statusId: 'client',    scope: 'global',   subgroup: null,          owner: 'Colin Dunn' },
  { id: 'l6', board: 'creative', name: 'My follow-ups',        statusId: 'todo',      scope: 'personal', subgroup: null,          owner: 'Hannah Barnes' },
  { id: 'l7', board: 'creative', name: 'Released to press',    statusId: 'done',      scope: 'global',   subgroup: null,          owner: 'Colin Dunn',
    destination: { type: 'scan', location: 'Plated' } },
  { id: 'l8', board: 'creative', name: 'Back to CSR',          statusId: 'done',      scope: 'global',   subgroup: null,          owner: 'Colin Dunn',
    destination: { type: 'board', boardId: 'csr' } },

  // ── Pre-Press board ──
  { id: 'p1', board: 'prepress', name: 'Incoming',       statusId: 'todo', scope: 'global', subgroup: null, owner: 'Money Mitch' },
  { id: 'p2', board: 'prepress', name: 'Imposition',     statusId: 'todo', scope: 'global', subgroup: null, owner: 'Money Mitch' },
  { id: 'p3', board: 'prepress', name: 'Paper on order', statusId: 'hold', scope: 'global', subgroup: null, owner: 'Money Mitch' },
  { id: 'p4', board: 'prepress', name: 'To plating',     statusId: 'done', scope: 'global', subgroup: null, owner: 'Money Mitch',
    destination: { type: 'scan', location: 'Plated' } },
];

let laneIdCounter = 100;
function nextLaneId() { return 'n' + (++laneIdCounter); }

/* ── Permissions ───────────────────────────────────────────── */

function canEditLane(lane, viewer) {
  if (lane.scope === 'personal') return lane.owner === viewer.name;
  if (lane.scope === 'global')   return viewer.role === 'supervisor';
  if (lane.scope === 'subgroup') {
    if (viewer.role === 'supervisor') return true;
    return viewer.role === 'lead' && lane.subgroup === viewer.subgroup;
  }
  return false;
}

function canCreateScope(scopeId, viewer) {
  const scope = SCOPE_BY_ID[scopeId];
  if (!scope) return false;
  if (scopeId === 'subgroup' && !viewer.subgroup) return false;
  return scope.editableBy.indexOf(viewer.role) !== -1;
}

/* ── Reading the board ─────────────────────────────────────── */

function lanesForBoard(boardId) {
  return LANES.filter(l => l.board === boardId);
}

function lanesFor(viewer) {
  return lanesForBoard(viewer.board).filter(l =>
    l.scope === 'global' ||
    (l.scope === 'subgroup' && l.subgroup === viewer.subgroup) ||
    (l.scope === 'personal' && l.owner === viewer.name)
  );
}

// Where work arrives on a board: whatever is at position 0.
function startLaneOf(boardId) {
  return lanesForBoard(boardId)[0] || null;
}

function scopeChipLabel(lane) {
  if (lane.scope === 'subgroup') {
    const sg = SUBGROUPS.find(s => s.id === lane.subgroup);
    return sg ? sg.label : 'Subgroup';
  }
  return SCOPE_BY_ID[lane.scope].label;
}

// What a handoff lane sends work to, in words.
function destinationLabel(lane) {
  const d = lane.destination;
  if (!d) return null;
  if (d.type === 'board') {
    const board = BOARD_BY_ID[d.boardId];
    return board ? board.label : 'another board';
  }
  return d.location;
}

/* ═══════════════════════════════════════════════════════════
   BOARD MOCK — jobs
   ═══════════════════════════════════════════════════════════
   A job carries a board, a lane and an assignee. assignee === null
   means unclaimed — it shows in that board's start lane for everyone,
   which is what an inbox is. Everything here is invented.
   ═══════════════════════════════════════════════════════════ */

const CUSTOMERS = [
  { name: 'Omni Hotels — Severin',           mgmt: 'Omni Hotels & Resorts' },
  { name: 'Boyd Gaming — Blue Chip',          mgmt: 'Boyd Gaming' },
  { name: 'True Food Kitchen — Beachwood',    mgmt: 'True Food Kitchen' },
  { name: "Keke's Breakfast Cafe #142",       mgmt: "Keke's" },
  { name: 'Village Inn — Aurora',             mgmt: 'VICORP' },
  { name: 'Quaker Steak & Lube — Sheffield',  mgmt: 'Live! Hospitality' },
  { name: 'Mystic Dunes Resort',              mgmt: 'Marriott Vacations Worldwide' },
  { name: 'Top Golf — Independence',          mgmt: 'Topgolf Callaway' },
];

const LANE_JOBS = [];
let laneJobCounter = 121400;

function addLaneJob(board, laneId, assignee, i, daysWaiting) {
  const c = pick(CUSTOMERS, i);
  const prodType = pick(PROD_TYPES, i);
  LANE_JOBS.push({
    job: ++laneJobCounter,
    desc: pick(JOB_DESCRIPTIONS, i),
    customer: c.name,
    mgmtGroup: c.mgmt,
    prodType: prodType,
    prodClass: PROD_CLASS[prodType],
    jobType: pick(JOB_TYPES, i),
    board: board,
    laneId: laneId,
    assignee: assignee || null,
    daysWaiting: daysWaiting || 0,     // only meaningful in a scan-mapped lane
  });
}

// [board, laneId, assignee, count, daysWaiting]
const BOARD_SEED = [
  ['csr',      'c1', null,            3, 0],
  ['csr',      'c2', 'Peyton',        2, 0],
  ['csr',      'c3', 'Peyton',        1, 0],
  ['csr',      'c5', 'Peyton',        2, 2],   // waiting to be walked to Pre-Press
  ['csr',      'c6', 'Peyton',        1, 0],

  ['creative', 'l1', null,            2, 0],
  ['creative', 'l1', 'Colin Dunn',    1, 0],
  ['creative', 'l2', 'Hannah Barnes', 2, 0],
  ['creative', 'l3', 'Colin Dunn',    2, 0],
  ['creative', 'l3', 'Hannah Barnes', 3, 0],
  ['creative', 'l4', 'Megan Doctor',  2, 0],
  ['creative', 'l5', 'Colin Dunn',    2, 0],
  ['creative', 'l6', 'Hannah Barnes', 2, 0],
  ['creative', 'l7', 'Colin Dunn',    2, 3],   // waiting to be walked to Plated
  ['creative', 'l8', 'Hannah Barnes', 1, 0],

  ['prepress', 'p1', null,            2, 0],
  ['prepress', 'p2', 'Money Mitch',   2, 0],
  ['prepress', 'p3', 'Money Mitch',   1, 0],
  ['prepress', 'p4', 'Money Mitch',   1, 1],
];

let seedIndex = 0;
BOARD_SEED.forEach(([board, laneId, assignee, count, days]) => {
  for (let k = 0; k < count; k++) addLaneJob(board, laneId, assignee, seedIndex++, days);
});

// Jobs this viewer sees in a lane: their own, plus anything unclaimed.
function jobsFor(viewer, laneId) {
  return LANE_JOBS.filter(j =>
    j.board === viewer.board &&
    j.laneId === laneId &&
    (j.assignee === viewer.name || j.assignee === null)
  );
}

/* ── Moving a job ──────────────────────────────────────────── */

// Can a job be DRAGGED into this lane? Everything except a scan-mapped
// handoff: there's a physical ticket, so only a scan puts it there.
function canDropJobInto(lane) {
  return !needsScan(lane);
}

// Move within a board.
function moveJob(jobNumber, laneId) {
  const job = LANE_JOBS.find(j => j.job === jobNumber);
  if (!job) return null;
  job.laneId = laneId;
  job.daysWaiting = 0;
  return job;
}

// Hand a job to another board: it lands unclaimed in that board's start
// lane, and leaves this one.
function handOffJob(jobNumber, boardId) {
  const job = LANE_JOBS.find(j => j.job === jobNumber);
  const start = startLaneOf(boardId);
  if (!job || !start) return null;
  job.board = boardId;
  job.laneId = start.id;
  job.assignee = null;
  job.daysWaiting = 0;
  return { job: job, board: BOARD_BY_ID[boardId], lane: start };
}

// Reality wins: the scan is the truth. Scanning a job at a handoff lane's
// location sends it to whichever board picks work up there, and off these
// boards entirely when nothing here does. Prototype stand-in for the scan
// feed — in the real thing this arrives from the scanner, not a button.
const LOCATION_BOARD = {
  'Pre-Press': 'prepress',
  'Page Layout Allocation': 'creative',
  // Plated, Shipping and the rest belong to boards that don't exist yet in
  // this prototype, so a job scanned there simply leaves.
};

function scanJob(jobNumber, lane) {
  const job = LANE_JOBS.find(j => j.job === jobNumber);
  if (!job || !needsScan(lane)) return null;
  const location = lane.destination.location;
  const boardId = LOCATION_BOARD[location];
  const start = boardId ? startLaneOf(boardId) : null;

  job.assignee = null;
  job.daysWaiting = 0;
  if (start) {
    job.board = boardId;
    job.laneId = start.id;
  } else {
    job.board = null;             // off these boards — scanned into the shop
    job.laneId = null;
  }
  return { job: job, location: location, board: boardId ? BOARD_BY_ID[boardId] : null };
}
