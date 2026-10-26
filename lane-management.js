/**
 * Lane Management — the strip and the context bar.
 * ─────────────────────────────────────────────────────────────
 * The flyout, and everything that mutates LANES, lives in lane-editor.js
 * so this screen and the person dashboard edit lanes identically.
 * This file only draws the strip and tells the editor when to open.
 */

let viewer = VIEWERS[0];
let confirmId = null;        // lane showing its inline delete confirmation

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
  $('permission-note').textContent = PERMISSION_NOTES[viewer.role];
}

/* ── Lane strip — the board in order ─────────────────────── */

function renderStrip() {
  const track = $('lane-track');
  track.textContent = '';

  const visible = lanesFor(viewer);
  $('lane-count').textContent = visible.length + ' lanes';
  if (confirmId && !visible.some(l => l.id === confirmId)) confirmId = null;

  // Drops land in the gaps between tiles, never before the first one.
  visible.forEach((lane, i) => {
    if (i > 0) track.appendChild(buildGap(lane.id));
    track.appendChild(buildLaneTile(lane, i + 1));
  });
  if (visible.length) track.appendChild(buildGap(null));
}

function buildGap(beforeLaneId) {
  const gap = clone('tpl-lane-drop');
  attachGapTarget(gap, beforeLaneId);
  return gap;
}

function buildLaneTile(lane, position) {
  const tile = clone('tpl-lane-tile');
  const editable = canEditLane(lane, viewer);

  tile.dataset.laneId = lane.id;
  tile.classList.add(STATUS_BY_ID[lane.statusId].cls);
  tile.querySelector('.lane-tile__order').textContent = position;
  tile.querySelector('.lane-tile__name').textContent = lane.name;
  tile.querySelector('.status-dot').classList.add(STATUS_BY_ID[lane.statusId].cls);
  tile.querySelector('.lane-tile__status-label').textContent = STATUS_BY_ID[lane.statusId].label;

  // Handoff lanes show where they send work, and whether that needs a scan.
  if (isHandoff(lane) && lane.destination) {
    tile.classList.add('is-handoff');
    const meta = tile.querySelector('.lane-tile__handoff');
    meta.hidden = false;
    meta.querySelector('.lane-tile__handoff-target').textContent = destinationLabel(lane);
    meta.querySelector('.lane-tile__handoff-mode').textContent = needsScan(lane) ? 'scan' : 'no ticket';
  }

  const chip = tile.querySelector('.scope-chip');
  chip.textContent = scopeChipLabel(lane);
  chip.classList.add('scope-chip--' + lane.scope);

  if (lane.id === selectedId) tile.classList.add('is-selected');
  tile.addEventListener('click', () => selectLane(lane.id));

  // Edit and delete are per-lane and permission-gated: a viewer who can't edit
  // this lane doesn't get the buttons at all, just the lock.
  if (editable) {
    tile.querySelector('[data-action="edit"]').addEventListener('click', e => {
      e.stopPropagation();
      selectLane(lane.id);
    });
    tile.querySelector('[data-action="delete"]').addEventListener('click', e => {
      e.stopPropagation();
      confirmId = lane.id;
      renderStrip();
    });
    tile.querySelector('[data-action="confirm-cancel"]').addEventListener('click', e => {
      e.stopPropagation();
      confirmId = null;
      renderStrip();
    });
    tile.querySelector('[data-action="confirm-delete"]').addEventListener('click', e => {
      e.stopPropagation();
      deleteLane(lane.id);
    });
    if (lane.id === confirmId) {
      tile.classList.add('is-confirming');
      tile.querySelector('.lane-tile__confirm').hidden = false;
    }
    tile.querySelector('.lane-tile__lock').remove();
    attachDragSource(tile, lane);
  } else {
    tile.classList.add('is-locked');
    tile.draggable = false;
    tile.querySelector('.lane-tile__actions').remove();
    tile.querySelector('.lane-tile__confirm').remove();
  }
  return tile;
}

/* ── Plumbing ────────────────────────────────────────────── */

function renderAll() {
  renderContext();
  renderStrip();
  renderEditor();
}

// lane-editor.js calls these whenever it changes LANES or LANE_JOBS.
function onLanesChanged() {
  confirmId = null;
  renderStrip();
}
function onJobsChanged() { renderStrip(); }

$('btn-add-lane').addEventListener('click', () => addLane());

initViewerSelect();
setScrollHost($('lane-track'));
renderAll();
