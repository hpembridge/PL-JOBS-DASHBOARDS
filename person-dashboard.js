/**
 * My Active Jobs — the person board, rebuilt on the lane concept.
 * ─────────────────────────────────────────────────────────────
 * Lanes are no longer that person's scan locations. They come from
 * lane-data.js: each lane reports as one of the five true statuses, its
 * position is progress, and its scope decides who sees and edits it.
 * A job lands in a lane by its `laneId`, and on this person's board by
 * its `assignee` — not by a scan status named after them.
 *
 * Lane management is inline. Edit, delete and add are gated by the same
 * canEditLane() / canCreateScope() rules as the Lane Management screen,
 * so what you can do to a lane is decided by its scope, right here on
 * the board.
 *
 * The flyout and every mutation of LANES live in lane-editor.js.
 */

let viewer = VIEWERS[0];
let confirmId = null;        // lane showing its inline delete confirmation
let search = '';

/* ── Context bar ─────────────────────────────────────────── */

function initViewerSelect() {
  const sel = $('viewer-select');
  VIEWERS.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = v.name + ' — ' + v.roleLabel;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => {
    viewer = VIEWERS.find(v => v.id === sel.value);
    closeFlyout();
    renderAll();
  });
}

function renderContext() {
  $('dept-display').textContent = BOARD_BY_ID[viewer.board].label;
  const sg = SUBGROUPS.find(s => s.id === viewer.subgroup);
  $('subgroup-display').textContent = sg ? sg.label : '—';
  $('job-count').textContent = LANE_JOBS.filter(j =>
    j.board === viewer.board && (j.assignee === viewer.name || j.assignee === null)).length;
  $('permission-note').textContent = PERMISSION_NOTES[viewer.role];
}

/* ── Board ───────────────────────────────────────────────── */

function myJobs(laneId) {
  return jobsFor(viewer, laneId).filter(j =>
    !search ||
    j.desc.toLowerCase().includes(search) ||
    String(j.job).includes(search) ||
    j.customer.toLowerCase().includes(search) ||
    j.mgmtGroup.toLowerCase().includes(search)
  );
}

function renderBoard() {
  const board = $('kanban');
  board.textContent = '';

  const visible = lanesFor(viewer);
  if (confirmId && !visible.some(l => l.id === confirmId)) confirmId = null;

  // A gap goes between every pair of lanes and after the last one — never
  // before the first, since work enters there.
  visible.forEach((lane, i) => {
    if (i > 0) board.appendChild(buildGap(lane.id));
    board.appendChild(buildLane(lane));
  });
  if (visible.length) board.appendChild(buildGap(null));

  // Add lane, at the end of the board, only if this viewer may create one.
  if (SCOPES.some(s => canCreateScope(s.id, viewer))) {
    const add = clone('tpl-add-lane');
    const scope = SCOPE_BY_ID[defaultScopeFor(viewer)];
    add.querySelector('.lane--add__scope').textContent = scope.label;
    add.addEventListener('click', () => addLane());
    board.appendChild(add);
  }
}

function buildGap(beforeLaneId) {
  const gap = clone('tpl-lane-drop');
  attachGapTarget(gap, beforeLaneId);
  return gap;
}

function buildLane(lane) {
  const el = clone('tpl-lane');
  const status = STATUS_BY_ID[lane.statusId];
  const editable = canEditLane(lane, viewer);
  const jobs = myJobs(lane.id);

  el.dataset.laneId = lane.id;
  el.classList.add(status.cls);
  el.querySelector('.status-dot').classList.add(status.cls);
  el.querySelector('.lane-title').textContent = lane.name;
  el.querySelector('.lane-title').title = lane.name + ' — reports as ' + status.label;
  el.querySelector('.lane-count').textContent = jobs.length;

  const cards = el.querySelector('.lane-cards');
  if (jobs.length) jobs.forEach(j => cards.appendChild(buildJobCard(j)));
  else cards.appendChild(clone('tpl-lane-empty'));

  // Handoff lanes say where they send work, and whether that needs a scan.
  if (isHandoff(lane) && lane.destination) {
    el.classList.add('is-handoff');
    const meta = el.querySelector('.lane-handoff');
    meta.hidden = false;
    meta.querySelector('.lane-handoff__target').textContent = destinationLabel(lane);
    meta.querySelector('.lane-handoff__mode').textContent = needsScan(lane) ? 'scan' : 'no ticket';
  }

  // A scan-mapped lane is a staging lane, not an exit: these jobs are
  // waiting on someone to physically walk them.
  if (needsScan(lane)) {
    el.classList.add('needs-scan');
    const note = el.querySelector('.lane-scan-note');
    const oldest = jobs.reduce((n, j) => Math.max(n, j.daysWaiting), 0);
    if (jobs.length) {
      note.hidden = false;
      note.querySelector('.lane-scan-note__text').textContent =
        jobs.length + (jobs.length === 1 ? ' job waiting to be walked' : ' jobs waiting to be walked') +
        (oldest ? ' · oldest ' + oldest + 'd' : '');
      note.querySelector('[data-action="simulate-scan"]').addEventListener('click', () => {
        const r = scanJob(jobs[0].job, lane);
        if (!r) return;
        onJobsChanged();
        showToast(r.board
          ? '#' + r.job.job + ' scanned to ' + r.location + ' — now on the ' + r.board.label + ' board'
          : '#' + r.job.job + ' scanned to ' + r.location + ' — off this board');
      });
    }
    if (oldest >= 2) el.classList.add('is-stale');
  }

  attachJobDropTarget(el, lane);

  if (lane.id === selectedId) el.classList.add('is-selected');

  if (editable) {
    el.querySelector('[data-action="edit"]').addEventListener('click', () => selectLane(lane.id));
    el.querySelector('[data-action="delete"]').addEventListener('click', () => {
      confirmId = lane.id;
      renderBoard();
    });
    el.querySelector('[data-action="confirm-cancel"]').addEventListener('click', () => {
      confirmId = null;
      renderBoard();
    });
    el.querySelector('[data-action="confirm-delete"]').addEventListener('click', () => deleteLane(lane.id));
    el.querySelector('.lane-lock').remove();
    attachDragSource(el.querySelector('.lane-header'), lane);
    if (lane.id === confirmId) {
      el.classList.add('is-confirming');
      el.querySelector('.lane-confirm').hidden = false;
      el.querySelector('.lane-confirm__note').textContent = jobs.length
        ? jobs.length + (jobs.length === 1 ? ' job is' : ' jobs are') + ' sitting in it.'
        : "It's empty.";
    }
  } else {
    el.classList.add('is-locked');
    el.querySelector('.lane-lock').title = 'Managed by your ' +
      (lane.scope === 'global' ? 'supervisor' : 'lead');
    el.querySelector('.lane-actions').remove();
    el.querySelector('.lane-confirm').remove();
  }
  return el;
}

function buildJobCard(j) {
  const card = clone('tpl-job-card');
  card.classList.add(j.prodClass);
  card.title = j.prodType + ' · ' + j.jobType;
  card.querySelector('.card-job').textContent = j.job;
  card.querySelector('.card-desc').textContent = j.desc;
  card.querySelector('.card-customer').textContent = j.customer;
  card.querySelector('.card-mgmt').textContent = j.mgmtGroup;
  if (j.assignee === null) card.classList.add('is-unclaimed');
  if (j.daysWaiting) {
    const w = card.querySelector('.card-waiting');
    w.hidden = false;
    w.textContent = 'waiting ' + j.daysWaiting + 'd';
  }
  card.addEventListener('click', () => showToast('Opening job #' + j.job + '…'));
  attachJobDragSource(card, j);
  return card;
}

/* ── Plumbing ────────────────────────────────────────────── */

function renderAll() {
  renderContext();
  renderBoard();
  renderEditor();
}

// lane-editor.js calls these whenever it changes LANES or LANE_JOBS.
function onLanesChanged() {
  confirmId = null;
  renderBoard();
}
function onJobsChanged() {
  renderContext();
  renderBoard();
}

/* ── Drag to pan ─────────────────────────────────────────── */
/* Trello-style: grab the board anywhere that isn't a card, a lane header
   or a control and drag it sideways. Pointer capture keeps the drag alive
   when the cursor leaves the board, and a drag of more than a few pixels
   swallows the click so panning never opens a job. Lifted from
   PL-JM-1.25/dashboard-jobs.js so both boards behave the same. */

function initPanning() {
  const board = $('kanban');
  let panning = false, startX = 0, startScroll = 0, moved = 0;

  board.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    if (e.target.closest('.job-card, .lane-header, .lane-confirm, .lane--add, .lane-scan-note')) return;

    panning = true;
    moved = 0;
    startX = e.clientX;
    startScroll = board.scrollLeft;
    board.setPointerCapture(e.pointerId);
    board.classList.add('is-panning');
  });

  board.addEventListener('pointermove', e => {
    if (!panning) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    board.scrollLeft = startScroll - dx;
  });

  function endPan(e) {
    if (!panning) return;
    panning = false;
    board.releasePointerCapture(e.pointerId);
    board.classList.remove('is-panning');
    if (moved > 4) {
      board.addEventListener('click', ev => { ev.stopPropagation(); ev.preventDefault(); },
        { capture: true, once: true });
    }
  }

  board.addEventListener('pointerup', endPan);
  board.addEventListener('pointercancel', endPan);
}

$('search-input').addEventListener('input', e => {
  search = e.target.value.toLowerCase().trim();
  renderBoard();
});

initViewerSelect();
initPanning();
setScrollHost($('kanban'));
renderAll();
