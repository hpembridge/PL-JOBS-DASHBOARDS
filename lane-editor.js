/**
 * Lane editor — shared by lane-management.html and person-dashboard.html.
 * ─────────────────────────────────────────────────────────────
 * Owns the lane flyout and everything that mutates LANES, so both the
 * management screen and the board edit lanes exactly the same way and
 * with exactly the same permission rules.
 *
 * A page using this must provide:
 *   • the flyout markup and the tpl-status-option template
 *   • a global `viewer`
 *   • `onLanesChanged()` — re-render whatever that page draws
 *
 * All markup comes from <template> blocks; nothing here builds HTML
 * strings. In Angular this file is a LaneEditorComponent plus a
 * LaneService, and `draft` is the reactive form model.
 */

const $ = id => document.getElementById(id);
const clone = id => $(id).content.firstElementChild.cloneNode(true);

let selectedId = null;   // lane open in the flyout
let draft = null;        // working copy, committed on Save

const PERMISSION_NOTES = {
  supervisor: 'Supervisors edit global and subgroup lanes, and create subgroups.',
  lead: 'Leads edit only the lanes attached to the subgroup they lead, plus their own personal lanes.',
  member: 'Team members edit their own personal lanes. Global and subgroup lanes are read-only.',
};

/* ── Open / close ────────────────────────────────────────── */

function selectLane(id) {
  selectedId = id;
  const lane = LANES.find(l => l.id === id);
  draft = lane ? JSON.parse(JSON.stringify(lane)) : null;
  $('lane-flyout').classList.add('open');
  renderEditor();
  onLanesChanged();
}

function closeFlyout() {
  $('lane-flyout').classList.remove('open');
  selectedId = null;
  draft = null;
  onLanesChanged();
}

/* ── Create / save / delete ──────────────────────────────── */

// New lanes start at the broadest scope this viewer may create in; scope is
// then changeable in the flyout like any other field.
function defaultScopeFor(v) {
  const allowed = SCOPES.filter(scope => canCreateScope(scope.id, v));
  return allowed.length ? allowed[0].id : 'personal';
}

function addLane(scopeId, insertAt) {
  const scope = scopeId || defaultScopeFor(viewer);
  const lane = {
    id: nextLaneId(),
    name: 'New lane',
    statusId: 'todo',
    scope: scope,
    subgroup: scope === 'subgroup' ? viewer.subgroup : null,
    board: viewer.board,
    owner: viewer.name,
  };
  if (typeof insertAt === 'number') LANES.splice(insertAt, 0, lane);
  else LANES.push(lane);
  selectLane(lane.id);
  $('lane-name').focus();
  $('lane-name').select();
}

function saveLane() {
  draft.name = $('lane-name').value.trim() || 'Untitled lane';
  if (isHandoff(draft)) {
    draft.destination = $('dest-type').value === 'board'
      ? { type: 'board', boardId: $('dest-value').value }
      : { type: 'scan',  location: $('dest-value').value };
  } else {
    delete draft.destination;
  }
  draft.scope = $('lane-scope').value;
  draft.subgroup = draft.scope === 'subgroup' ? $('lane-subgroup').value : null;

  const i = LANES.findIndex(l => l.id === draft.id);
  if (i >= 0) LANES[i] = JSON.parse(JSON.stringify(draft));
  const name = draft.name;
  closeFlyout();
  showToast('Saved "' + name + '"');
}

function cancelEdit() {
  closeFlyout();
  showToast('Changes discarded');
}

function deleteLane(id) {
  const lane = LANES.find(l => l.id === id);
  if (!lane) return;
  LANES = LANES.filter(l => l.id !== id);
  if (selectedId === id) closeFlyout();
  else onLanesChanged();
  showToast('Deleted "' + lane.name + '"');
}

/* ── Reorder — a lane's position is its progress ─────────── */
/* You drop BETWEEN lanes, not onto them: the board renders a gap between
   every pair of lanes and one after the last, and the gap is the target.
   Dragging and dropping are separate permissions — you can only drag a
   lane you're allowed to edit, but you can drop it into any gap, including
   between lanes you can't touch. There is no gap before the first lane:
   work enters there, so nothing goes ahead of it.

   `scrollHost` is the element that scrolls (the board, or the strip
   track), so a drag near either edge pans it and you can reach the far
   right without letting go. */

let dragId = null;         // lane being reordered
let dragJob = null;        // job being moved
let scrollHost = null;
let edgeTimer = null;

function attachDragSource(handle, lane) {
  handle.draggable = true;
  handle.addEventListener('dragstart', e => {
    dragId = lane.id;
    handle.closest('.lane, .lane-tile').classList.add('is-dragging');
    if (scrollHost) scrollHost.classList.add('is-reordering');
    e.dataTransfer.effectAllowed = 'move';
  });
  handle.addEventListener('dragend', () => {
    dragId = null;
    stopEdgeScroll();
    if (scrollHost) scrollHost.classList.remove('is-reordering');
    const el = handle.closest('.lane, .lane-tile');
    if (el) el.classList.remove('is-dragging');
  });
}

// beforeLaneId === null means the gap at the end of the board.
function attachGapTarget(el, beforeLaneId) {
  el.addEventListener('dragover', e => {
    if (!dragId) return;              // gaps reorder lanes; they don't take jobs
    e.preventDefault();
    el.classList.add('is-over');
  });
  el.addEventListener('dragleave', () => el.classList.remove('is-over'));
  el.addEventListener('drop', e => {
    e.preventDefault();
    el.classList.remove('is-over');
    moveLaneToGap(dragId, beforeLaneId);
  });
}

function moveLaneToGap(fromId, beforeLaneId) {
  if (!fromId || fromId === beforeLaneId) return;
  const from = LANES.findIndex(l => l.id === fromId);
  if (from < 0) return;
  const [moved] = LANES.splice(from, 1);

  let at;
  if (beforeLaneId) {
    at = LANES.findIndex(l => l.id === beforeLaneId);
  } else {
    // End of this viewer's board — after the last lane they can see.
    const visible = lanesFor(viewer);
    const last = visible[visible.length - 1];
    at = last ? LANES.findIndex(l => l.id === last.id) + 1 : LANES.length;
  }
  LANES.splice(at < 0 ? LANES.length : at, 0, moved);

  onLanesChanged();
  showToast('Moved "' + moved.name + '" — progress order updated');
}

/* ── Edge panning while dragging ─────────────────────────── */

function setScrollHost(el) {
  scrollHost = el;
  el.addEventListener('dragover', e => {
    if (!dragId && !dragJob) return;
    const box = el.getBoundingClientRect();
    const edge = 80;
    if (e.clientX > box.right - edge) startEdgeScroll(12);
    else if (e.clientX < box.left + edge) startEdgeScroll(-12);
    else stopEdgeScroll();
  });
  el.addEventListener('dragleave', stopEdgeScroll);
  el.addEventListener('drop', stopEdgeScroll);
}

function startEdgeScroll(step) {
  if (edgeTimer) return;
  edgeTimer = setInterval(() => { scrollHost.scrollLeft += step; }, 16);
}
function stopEdgeScroll() {
  clearInterval(edgeTimer);
  edgeTimer = null;
}

/* ── Moving a job ─────────────────────────────────────────── */
/* A job is dropped onto a LANE (not a gap). Every lane accepts a job
   except a scan-mapped handoff: there's a physical ticket, so only the
   scan puts it there, and the lane says so instead of silently refusing. */

function attachJobDragSource(card, job) {
  card.addEventListener('dragstart', e => {
    dragJob = job.job;
    card.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  });
  card.addEventListener('dragend', () => {
    dragJob = null;
    stopEdgeScroll();
    card.classList.remove('is-dragging');
    document.querySelectorAll('.lane').forEach(l =>
      l.classList.remove('is-job-target', 'is-job-blocked'));
  });
}

function attachJobDropTarget(el, lane) {
  el.addEventListener('dragover', e => {
    if (!dragJob) return;             // lanes take jobs; they don't take lanes
    e.preventDefault();
    el.classList.add(canDropJobInto(lane) ? 'is-job-target' : 'is-job-blocked');
  });
  el.addEventListener('dragleave', () => el.classList.remove('is-job-target', 'is-job-blocked'));
  el.addEventListener('drop', e => {
    if (!dragJob) return;
    e.preventDefault();
    e.stopPropagation();
    el.classList.remove('is-job-target', 'is-job-blocked');
    dropJob(dragJob, lane);
  });
}

function dropJob(jobNumber, lane) {
  // A scan-mapped handoff can't be reached by dragging — that's the whole
  // point of mapping it to a physical location.
  if (!canDropJobInto(lane)) {
    showToast('#' + jobNumber + ' has to be scanned to ' + lane.destination.location +
      ' — dragging won\'t move the ticket');
    return;
  }

  // A board handoff sends it away entirely: it lands unclaimed in that
  // board's start lane, whatever that lane is currently called.
  if (isHandoff(lane) && lane.destination && lane.destination.type === 'board') {
    const r = handOffJob(jobNumber, lane.destination.boardId);
    if (r) {
      onJobsChanged();
      showToast('#' + jobNumber + ' handed to ' + r.board.label + ' — now in "' + r.lane.name + '"');
    }
    return;
  }

  moveJob(jobNumber, lane.id);
  onJobsChanged();
}

/* ── Form ────────────────────────────────────────────────── */

function renderEditor() {
  if (!draft) return;

  const editable = canEditLane(LANES.find(l => l.id === selectedId) || draft, viewer);
  $('lane-flyout').classList.toggle('is-locked', !editable);
  $('editor-lock').hidden = editable;
  $('editor-lock-text').textContent =
    'This is a ' + SCOPE_BY_ID[draft.scope].label.toLowerCase() + ' lane. ' + PERMISSION_NOTES[viewer.role];
  $('btn-save').disabled = !editable;

  $('editor-title').textContent = draft.name || 'Untitled lane';
  $('editor-dot').className = 'status-dot status-dot--lg ' + STATUS_BY_ID[draft.statusId].cls;
  const chip = $('editor-scope-chip');
  chip.className = 'scope-chip scope-chip--' + draft.scope;
  chip.textContent = scopeChipLabel(draft);

  $('lane-name').value = draft.name;

  // Only the scopes this viewer may create in — a team member can't promote
  // their own personal lane to a subgroup or global one.
  const scopeOptions = SCOPES
    .filter(s => canCreateScope(s.id, viewer) || s.id === draft.scope)
    .map(s => ({ value: s.id, label: s.label + ' — ' + s.blurb }));
  fillSelect($('lane-scope'), scopeOptions, draft.scope);
  $('lane-scope').disabled = scopeOptions.length < 2;

  const sgSelect = $('lane-subgroup');
  fillSelect(sgSelect, SUBGROUPS.map(s => ({ value: s.id, label: s.label })), draft.subgroup);
  sgSelect.disabled = draft.scope !== 'subgroup';

  renderStatusPicker();
  renderDestination();
}

/* ── Destination — only Completed lanes have one ─────────── */

function renderDestination() {
  const section = $('destination-section');
  const handoff = isHandoff(draft);
  section.hidden = !handoff;
  if (!handoff) {
    delete draft.destination;
    return;
  }

  // A lane that just became Completed needs a destination; default it to
  // the first board that isn't this one.
  if (!draft.destination) {
    const other = BOARDS.find(b => b.id !== draft.board);
    draft.destination = { type: 'board', boardId: other ? other.id : BOARDS[0].id };
  }

  const type = draft.destination.type;
  $('dest-type').value = type;

  if (type === 'board') {
    fillSelect($('dest-value'),
      BOARDS.filter(b => b.id !== draft.board).map(b => ({ value: b.id, label: b.label })),
      draft.destination.boardId);
  } else {
    fillSelect($('dest-value'),
      scanLocationOptions().map(l => ({ value: l.desc, label: l.desc + '  ·  #' + l.statusId })),
      draft.destination.location);
  }

  $('destination-echo').textContent = type === 'board'
    ? 'Dropping a job here hands it to ' + destinationLabel(draft) +
      ', where it lands unclaimed in whatever lane sits first on that board.'
    : 'Jobs dropped here stay put and show as waiting. Only a scan at ' +
      destinationLabel(draft) + ' takes them off this board.';
}

function fillSelect(sel, options, value) {
  sel.textContent = '';
  options.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.value;
    opt.textContent = o.label;
    sel.appendChild(opt);
  });
  sel.value = value == null ? '' : value;
}

function renderStatusPicker() {
  const picker = $('status-picker');
  picker.textContent = '';
  TRUE_STATUSES.forEach(status => {
    const option = clone('tpl-status-option');
    const input = option.querySelector('input');
    input.value = status.id;
    input.checked = draft.statusId === status.id;
    option.classList.toggle('is-selected', input.checked);
    option.querySelector('.status-dot').classList.add(status.cls);
    option.querySelector('.status-option__label').textContent = status.label;
    option.querySelector('.status-option__blurb').textContent = status.blurb;
    input.addEventListener('change', () => {
      draft.statusId = status.id;
      renderEditor();
    });
    picker.appendChild(option);
  });
}

/* ── Toast ───────────────────────────────────────────────── */

function showToast(msg) {
  const t = $('toast');
  t.textContent = '→  ' + msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

/* ── Wiring ──────────────────────────────────────────────── */

$('lane-name').addEventListener('input', () => {
  if (!draft) return;
  draft.name = $('lane-name').value;
  $('editor-title').textContent = draft.name || 'Untitled lane';
});
$('lane-scope').addEventListener('change', () => {
  if (!draft) return;
  draft.scope = $('lane-scope').value;
  draft.subgroup = draft.scope === 'subgroup' ? (draft.subgroup || viewer.subgroup) : null;
  renderEditor();
});
$('dest-type').addEventListener('change', () => {
  if (!draft) return;
  draft.destination = $('dest-type').value === 'board'
    ? { type: 'board', boardId: (BOARDS.find(b => b.id !== draft.board) || BOARDS[0]).id }
    : { type: 'scan',  location: scanLocationOptions()[0].desc };
  renderDestination();
});
$('dest-value').addEventListener('change', () => {
  if (!draft || !draft.destination) return;
  if (draft.destination.type === 'board') draft.destination.boardId = $('dest-value').value;
  else draft.destination.location = $('dest-value').value;
  renderDestination();
});
$('btn-save').addEventListener('click', saveLane);
$('btn-cancel').addEventListener('click', cancelEdit);
$('btn-close').addEventListener('click', closeFlyout);
$('lane-flyout').addEventListener('click', e => {
  if (e.target.id === 'lane-flyout') closeFlyout();      // click the scrim to dismiss
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('lane-flyout').classList.contains('open')) closeFlyout();
});
