/**
 * Board Map — every board's shared lanes and how they connect.
 * ─────────────────────────────────────────────────────────────
 * Reads the same model as the person board (lane-data.js): BOARDS, LANES,
 * LANE_JOBS, LOCATION_BOARD. Nothing here is a new data source.
 *
 *   One band per board        lanes in board order (array order = progress)
 *   Personal lanes            left out — they never hand work to anyone
 *   Completed lanes           draw a connector to where the work goes:
 *     board destination   →  solid line to that board's start lane
 *     scan destination    →  dashed line to the scan location
 *   Scan locations            dotted line on to the board that picks work
 *                             up there (LOCATION_BOARD), if any
 *
 * Markup lives in board-map.html as <template>s; this file clones them,
 * then measures the rendered nodes and draws the connectors into the SVG.
 * In Angular the bands/lanes/stops are @for blocks and the connector paths
 * become a computed `d` per wire, recalculated on resize.
 */

const $ = id => document.getElementById(id);
const clone = id => $(id).content.firstElementChild.cloneNode(true);

const GUTTER_PAD = 16;    // first track sits this far into a gutter
const TRACK_GAP  = 8;     // spacing between connector tracks
const CORNER     = 8;     // radius of a connector's bends

const nodeEls = {};       // node key → element. Lanes key by lane id, stops by 'stop:' + location.
const bandEls = [];       // band elements, top to bottom — the routing rows
const nodeRow = {};       // node key → band index
let wires = [];           // { from, to, kind }

/* ── Model reads ─────────────────────────────────────────── */

function mapLanesFor(boardId) {
  return lanesForBoard(boardId).filter(l => l.scope !== 'personal');
}

function jobsInLane(lane) {
  return LANE_JOBS.filter(j => j.board === lane.board && j.laneId === lane.id);
}

const stopKey = location => 'stop:' + location;

/* ── Render nodes ────────────────────────────────────────── */

function renderBands() {
  const bands = $('map-bands');
  const stopsBand = $('map-stops-band');
  const stops = [];        // distinct scan locations, in the order they're first pointed at

  BOARDS.forEach(board => {
    const band = clone('tpl-map-band');
    const lanes = mapLanesFor(board.id);
    const start = startLaneOf(board.id);
    const total = lanes.reduce((n, l) => n + jobsInLane(l).length, 0);

    band.querySelector('.map-band__title').textContent = board.label;
    band.querySelector('.map-band__meta').textContent = board.dept;
    band.querySelector('.map-band__count').textContent =
      total + (total === 1 ? ' job' : ' jobs') + ' · ' + lanes.length + ' lanes';

    const list = band.querySelector('.map-band__lanes');
    lanes.forEach(lane => {
      list.appendChild(buildLane(lane, start && start.id === lane.id));
      nodeRow[lane.id] = bandEls.length;

      if (isHandoff(lane) && lane.destination) {
        if (lane.destination.type === 'board') {
          const target = startLaneOf(lane.destination.boardId);
          if (target) wires.push({ from: lane.id, to: target.id, kind: 'board' });
        } else {
          const loc = lane.destination.location;
          if (stops.indexOf(loc) === -1) stops.push(loc);
          wires.push({ from: lane.id, to: stopKey(loc), kind: 'scan' });
        }
      }
    });

    bands.insertBefore(band, stopsBand);
    bandEls.push(band);
  });

  // Scan locations band — always last
  const stopRow = bandEls.length;
  bandEls.push(stopsBand);
  stops.forEach(loc => {
    $('map-stops').appendChild(buildStop(loc));
    nodeRow[stopKey(loc)] = stopRow;

    const boardId = LOCATION_BOARD[loc];
    const target = boardId ? startLaneOf(boardId) : null;
    if (target) wires.push({ from: stopKey(loc), to: target.id, kind: 'feed' });
  });
  stopsBand.hidden = stops.length === 0;
}

function buildLane(lane, isStart) {
  const el = clone('tpl-map-lane');
  const status = STATUS_BY_ID[lane.statusId];
  const jobs = jobsInLane(lane);

  el.dataset.node = lane.id;
  el.classList.add(status.cls);
  el.querySelector('.status-dot').classList.add(status.cls);
  el.querySelector('.map-lane__name').textContent = lane.name;
  el.querySelector('.map-lane__name').title = lane.name;
  el.querySelector('.map-lane__count').textContent = jobs.length;
  el.querySelector('.map-lane__count').title = jobs.length + (jobs.length === 1 ? ' job' : ' jobs') + ' in this lane';
  el.querySelector('.map-lane__status').textContent = status.label;
  if (!jobs.length) el.classList.add('is-empty');

  if (isStart) {
    el.querySelector('.map-lane__start').hidden = false;
    el.title = 'Work handed to this board arrives here';
  }

  if (lane.scope === 'subgroup') {
    const chip = el.querySelector('.map-lane__scope');
    chip.hidden = false;
    chip.textContent = scopeChipLabel(lane);
  }

  if (isHandoff(lane) && lane.destination) {
    const h = el.querySelector('.map-lane__handoff');
    h.hidden = false;
    h.querySelector('.map-lane__target').textContent = destinationLabel(lane);
    h.querySelector('.map-lane__mode').textContent = needsScan(lane) ? 'scan' : 'no ticket';
  }

  if (needsScan(lane)) {
    el.classList.add('needs-scan');
    if (jobs.length) {
      const oldest = jobs.reduce((n, j) => Math.max(n, j.daysWaiting), 0);
      const w = el.querySelector('.map-lane__waiting');
      w.hidden = false;
      w.textContent = jobs.length + ' waiting to be walked' + (oldest ? ' · oldest ' + oldest + 'd' : '');
      if (oldest >= 2) el.classList.add('is-stale');
    }
  }

  nodeEls[lane.id] = el;
  attachTrace(el, lane.id);
  return el;
}

function buildStop(location) {
  const el = clone('tpl-map-stop');
  const key = stopKey(location);
  const boardId = LOCATION_BOARD[location];

  el.dataset.node = key;
  el.querySelector('.map-stop__name').textContent = location;
  el.querySelector('.map-stop__next').textContent = boardId
    ? 'Picks up on the ' + BOARD_BY_ID[boardId].label + ' board'
    : 'Leaves these boards';

  nodeEls[key] = el;
  attachTrace(el, key);
  return el;
}

/* ── Connectors ──────────────────────────────────────────── */
/* Orthogonal routing. A connector leaves its lane straight down (or up),
   runs sideways in the gutter between bands, and drops into the target.
   A target more than one band away is reached through the channel down
   the left edge, so no line ever crosses a lane. Each connector gets its
   own track (k) in every gutter and in the channel so none overlap. */

function boxOf(el, origin) {
  const r = el.getBoundingClientRect();
  return { left: r.left - origin.left, right: r.right - origin.left,
           top: r.top - origin.top, bottom: r.bottom - origin.top,
           cx: (r.left + r.right) / 2 - origin.left };
}

function drawWires() {
  const canvas = $('map-canvas');
  const origin = canvas.getBoundingClientRect();
  const group = $('map-wire-group');
  group.textContent = '';

  const bands = bandEls.map(b => boxOf(b, origin));
  const channelRight = bands.reduce((x, b) => Math.min(x, b.left), Infinity) - GUTTER_PAD;
  const gutterY = (i, k) => bands[i].bottom + GUTTER_PAD + k * TRACK_GAP;   // gutter below band i
  const n = wires.length;

  wires.forEach((w, k) => {
    const s = nodeEls[w.from], t = nodeEls[w.to];
    if (!s || !t) return;
    const S = boxOf(s, origin), T = boxOf(t, origin);
    const rs = nodeRow[w.from], rt = nodeRow[w.to];
    const shift = (k - (n - 1) / 2) * TRACK_GAP;   // keeps exit/entry points apart
    const sx = S.cx + shift, tx = T.cx + shift;
    const channelX = channelRight - k * TRACK_GAP;
    let pts;

    if (rt > rs) {                       // target is below
      pts = [[sx, S.bottom], [sx, gutterY(rs, k)]];
      if (rt - rs > 1) pts.push([channelX, gutterY(rs, k)], [channelX, gutterY(rt - 1, k)]);
      pts.push([tx, gutterY(rt - 1, k)], [tx, T.top]);
    } else {                             // target is above
      pts = [[sx, S.top], [sx, gutterY(rs - 1, k)]];
      if (rs - rt > 1) pts.push([channelX, gutterY(rs - 1, k)], [channelX, gutterY(rt, k)]);
      pts.push([tx, gutterY(rt, k)], [tx, T.bottom]);
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', roundedPath(pts));
    path.setAttribute('class', 'map-wire map-wire--' + w.kind);
    path.setAttribute('marker-end', 'url(#arrow-' + w.kind + ')');
    path.dataset.from = w.from;
    path.dataset.to = w.to;
    group.appendChild(path);
  });
}

// Polyline → path with rounded bends.
function roundedPath(points) {
  const pts = points.filter((p, i) => i === 0 || p[0] !== points[i - 1][0] || p[1] !== points[i - 1][1]);
  let d = 'M' + pts[0][0] + ',' + pts[0][1];
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [cx, cy] = pts[i], [nx, ny] = pts[i + 1];
    const r = Math.min(CORNER, Math.hypot(cx - px, cy - py) / 2, Math.hypot(nx - cx, ny - cy) / 2);
    const a = toward(cx, cy, px, py, r), b = toward(cx, cy, nx, ny, r);
    d += ' L' + a[0] + ',' + a[1] + ' Q' + cx + ',' + cy + ' ' + b[0] + ',' + b[1];
  }
  const last = pts[pts.length - 1];
  return d + ' L' + last[0] + ',' + last[1];
}

function toward(x, y, tx, ty, r) {
  const len = Math.hypot(tx - x, ty - y) || 1;
  return [x + (tx - x) / len * r, y + (ty - y) / len * r];
}

/* ── Tracing ─────────────────────────────────────────────── */
/* Hover or focus a node to light its connectors and the nodes at the other
   end. A scan location passes the trace through, so tracing "To Pre-Press"
   also shows where that scan lands. */

function attachTrace(el, key) {
  el.addEventListener('mouseenter', () => trace(key));
  el.addEventListener('mouseleave', clearTrace);
  el.addEventListener('focus', () => trace(key));
  el.addEventListener('blur', clearTrace);
}

function trace(key) {
  const lit = new Set([key]);
  const litWires = wires.filter(w => w.from === key || w.to === key);
  litWires.slice().forEach(w => {
    const other = w.from === key ? w.to : w.from;
    lit.add(other);
    if (other.indexOf('stop:') === 0) {
      wires.filter(x => x !== w && (x.from === other || x.to === other)).forEach(x => {
        litWires.push(x);
        lit.add(x.from);
        lit.add(x.to);
      });
    }
  });

  $('map').classList.add('is-tracing');
  Object.keys(nodeEls).forEach(k => nodeEls[k].classList.toggle('is-lit', lit.has(k)));
  $('map-wire-group').querySelectorAll('.map-wire').forEach(p => {
    p.classList.toggle('is-lit', litWires.some(w => w.from === p.dataset.from && w.to === p.dataset.to));
  });
}

function clearTrace() {
  $('map').classList.remove('is-tracing');
  document.querySelectorAll('#map .is-lit').forEach(el => el.classList.remove('is-lit'));
}

/* ── Init ────────────────────────────────────────────────── */

renderBands();
drawWires();
new ResizeObserver(drawWires).observe($('map-canvas'));
if (document.fonts) document.fonts.ready.then(drawWires);
