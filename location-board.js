/**
 * Location Board — prototype behaviour
 * ─────────────────────────────────────────────────────────────
 * Everything here is simulation. The markup lives in the HTML
 * (<template> blocks); this file only clones it, fills text, and
 * wires interactions. State is in memory and resets on reload.
 *
 * Would become Angular:
 *   views                → shared view records (API): name, owner, location ids
 *   myViewIds            → the signed-in person's tabs (API, per user)
 *   moveJob()            → the same "set location" call the scanner makes
 *   asideTab             → selected tab in the job aside
 *   time form submit     → time entry (API): minutes, worktypeid, proof
 */
(function () {

  /* ── State ─────────────────────────────────────────────────── */
  const views = VIEWS.map(v => ({ ...v, locationIds: [...v.locationIds] }));
  const myViewIds = [...MY_VIEW_IDS];
  let activeViewId = myViewIds[0];
  let searchTerm = '';
  let pickerFilter = 'all';
  let openJobNumber = null;
  let draggingJobNumber = null;
  let draggingColumnId = null;    // location id of the column being reordered
  const hiddenByView = {};        // viewId → location ids this person hid (non-owned boards)
  let asideTab = 'details'; // 'details' | 'activity' — sticks between jobs
  let activityFilter = 'all'; // 'all' | 'scan' | 'time' | 'proof'

  const ME = CURRENT_USER;
  const locationById = Object.fromEntries(LOCATIONS.map(l => [l.id, l]));
  const jobByNumber = Object.fromEntries(JOBS.map(j => [j.number, j]));

  /* ── Elements ──────────────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const tabsEl = $('viewTabs');
  const boardEl = $('board');
  const jobAside = $('jobAside');
  const columnsAside = $('columnsAside');

  function cloneTpl(id) {
    return $(id).content.firstElementChild.cloneNode(true);
  }
  function viewById(id) {
    return views.find(v => v.id === id);
  }
  function activeView() {
    return viewById(activeViewId);
  }
  function isOwner(view) {
    return view.owner === ME;
  }

  /* ── Formatting ────────────────────────────────────────────── */
  function fmtMinutes(min) {
    const h = Math.floor(min / 60), m = Math.round(min % 60);
    return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
  }
  // Local ISO timestamp, minutes precision — same shape as the mock data
  function nowIso() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function fmtDate(iso) {
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${m}/${d}/${y.slice(2)}`;
  }
  function deptName(deptId) {
    if (deptId == null || deptId < 0) return 'No department';
    return DEPARTMENTS[deptId] || `Dept ${deptId}`;
  }


  /* ════════════════════════════════════════════════════════════
     VIEW TABS
     Tabs are this person's list of views. Views themselves are shared.
     ════════════════════════════════════════════════════════════ */
  function renderTabs() {
    tabsEl.querySelectorAll('.view-tab:not(.view-tab--add)').forEach(t => t.remove());
    const addBtn = $('btnAddView');

    myViewIds.forEach(id => {
      const view = viewById(id);
      const tab = cloneTpl('tpl-view-tab');
      tab.dataset.viewId = view.id;
      tab.classList.toggle('active', view.id === activeViewId);
      tab.setAttribute('aria-selected', view.id === activeViewId);
      tab.querySelector('.view-tab__name').textContent = view.name;

      const close = tab.querySelector('[data-remove-view]');
      if (myViewIds.length === 1) {
        close.setAttribute('aria-disabled', 'true');
        close.title = 'You need at least one board';
      } else {
        close.title = `Remove ${view.name} from your tabs`;
      }
      tabsEl.insertBefore(tab, addBtn);
    });
  }

  tabsEl.addEventListener('click', e => {
    const close = e.target.closest('[data-remove-view]');
    if (close) {
      e.stopPropagation();
      if (close.getAttribute('aria-disabled') !== 'true') {
        removeFromTabs(close.closest('.view-tab').dataset.viewId);
      }
      return;
    }
    const tab = e.target.closest('.view-tab[data-view-id]');
    if (tab && tab.dataset.viewId !== activeViewId) {
      activeViewId = tab.dataset.viewId;
      render();
    }
  });

  $('btnAddView').addEventListener('click', openViewsAside);

  function addToTabs(viewId) {
    if (!myViewIds.includes(viewId)) myViewIds.push(viewId);
    activeViewId = viewId;
    render();
  }

  // Takes a view out of this person's tabs. The view itself stays.
  function removeFromTabs(viewId, { toast = true } = {}) {
    const index = myViewIds.indexOf(viewId);
    if (index === -1 || myViewIds.length === 1) return;
    myViewIds.splice(index, 1);
    if (activeViewId === viewId) activeViewId = myViewIds[Math.max(0, index - 1)];
    render();
    if (toast) {
      showToast(`Removed “${viewById(viewId).name}” from your tabs`, () => {
        myViewIds.splice(index, 0, viewId);
        activeViewId = viewId;
        render();
        renderViewPicker();
      });
    }
  }

  function createView(name) {
    const view = { id: 'v-' + Date.now(), name: name || 'Untitled board', owner: ME, locationIds: [] };
    views.push(view);
    addToTabs(view.id);
    return view;
  }

  // Anyone can duplicate; the copy belongs to whoever made it
  $('btnDuplicateView').addEventListener('click', () => {
    const source = activeView();
    const copy = { id: 'v-' + Date.now(), name: `${source.name} (copy)`, owner: ME, locationIds: [...source.locationIds] };
    views.push(copy);
    myViewIds.splice(myViewIds.indexOf(source.id) + 1, 0, copy.id);
    activeViewId = copy.id;
    render();
    showToast(`Duplicated “${source.name}” — you own this copy`);
    openColumnsAside({ focusName: true });
  });


  /* ════════════════════════════════════════════════════════════
     ADD VIEW ASIDE
     Every view in the company. A row toggles it in or out of your
     tabs; the panel stays open so several can be added in a row.
     ════════════════════════════════════════════════════════════ */
  const viewsAside = $('viewsAside');

  function openViewsAside() {
    $('viewSearch').value = '';
    renderViewPicker();
    $('btnAddView').setAttribute('aria-expanded', 'true');
    openFlyout(viewsAside);
    setTimeout(() => $('viewSearch').focus(), 50);
  }

  function renderViewPicker() {
    const query = $('viewSearch').value.trim().toLowerCase();
    const list = $('viewPickerList');
    list.replaceChildren();

    const matches = views.filter(v => !query || `${v.name} ${v.owner}`.toLowerCase().includes(query));
    matches.forEach(view => {
      const row = cloneTpl('tpl-view-option');
      const btn = row.querySelector('.view-option');
      const on = myViewIds.includes(view.id);
      btn.dataset.viewId = view.id;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on);
      row.querySelector('.view-option__name').textContent = view.name;
      const n = view.locationIds.length;
      const owner = isOwner(view) ? 'you' : view.owner;
      row.querySelector('.view-option__meta').textContent = `${n} ${n === 1 ? 'column' : 'columns'} · ${owner}`;
      row.querySelector('.view-option__on').hidden = !on;
      if (on && myViewIds.length === 1) {
        btn.setAttribute('aria-disabled', 'true');
        btn.title = 'You need at least one board';
      }
      list.append(row);
    });
    $('viewPickerNone').hidden = matches.length > 0;
  }

  $('viewSearch').addEventListener('input', renderViewPicker);

  $('viewPickerList').addEventListener('click', e => {
    const btn = e.target.closest('.view-option');
    if (!btn || btn.getAttribute('aria-disabled') === 'true') return;
    const id = btn.dataset.viewId;
    if (myViewIds.includes(id)) removeFromTabs(id, { toast: false });
    else addToTabs(id);
    renderViewPicker();
  });

  // Create view — uses the search text as the name if there is one
  $('btnCreateView').addEventListener('click', () => {
    const name = $('viewSearch').value.trim();
    closeFlyout(viewsAside);
    createView(name);
    openColumnsAside({ focusName: true });
  });


  /* ════════════════════════════════════════════════════════════
     BOARD
     ════════════════════════════════════════════════════════════ */
  function jobMatchesSearch(job) {
    if (!searchTerm) return true;
    const hay = `${job.number} ${job.description} ${job.customer} ${job.customerNumber} ${job.mgmtGroup}`.toLowerCase();
    return hay.includes(searchTerm);
  }

  function renderBoard() {
    const view = activeView();
    const mine = isOwner(view);
    $('viewTitle').textContent = view.name;
    $('viewOwner').textContent = mine ? 'Owned by you' : `Owned by ${view.owner}`;
    $('btnEditView').hidden = !mine;
    $('btnDeleteBoardToolbar').hidden = !mine;
    $('btnEmptyAddColumns').hidden = !mine;
    $('boardEmptyText').textContent = mine
      ? 'Pick the locations you want to watch. You can change them any time.'
      : `${view.owner} hasn't added any columns yet. Duplicate it to make your own.`;

    // The owner sees every column; anyone else sees the board minus what they hid
    const hidden = mine ? [] : (hiddenByView[view.id] || []);
    const visibleIds = view.locationIds.filter(id => !hidden.includes(id));
    if (!mine && view.locationIds.length && !visibleIds.length) {
      $('boardEmptyText').textContent = "You've hidden every column on this board. Use the hidden menu above to bring them back.";
    }
    renderHiddenCols(view, mine, hidden);

    boardEl.replaceChildren();
    boardEl.classList.toggle('is-reorderable', mine);
    const isEmpty = visibleIds.length === 0;
    boardEl.hidden = isEmpty;
    $('boardEmpty').hidden = !isEmpty;

    visibleIds.forEach(locationId => {
      const loc = locationById[locationId];
      const col = cloneTpl('tpl-column');
      col.dataset.locationId = loc.id;
      col.classList.toggle('is-locked', loc.locked);
      col.querySelector('.loc-column__header').draggable = mine;
      col.querySelector('.loc-column__grip').hidden = !mine;
      col.querySelector('.loc-column__hide').hidden = mine;
      col.querySelector('.loc-column__title').textContent = loc.name;
      col.querySelector('.loc-column__title').title = `${loc.name} · ${loc.code}`;
      col.querySelector('.loc-column__lock').hidden = !loc.locked;

      const jobs = JOBS.filter(j => j.locationId === loc.id && jobMatchesSearch(j));
      col.querySelector('.loc-column__count').textContent = jobs.length;

      const cardsEl = col.querySelector('.loc-column__cards');
      if (jobs.length === 0) cardsEl.append(cloneTpl('tpl-column-empty'));
      jobs.forEach(job => cardsEl.append(renderCard(job, loc.locked)));

      boardEl.append(col);
    });
  }

  // Cards in a locked column can't be picked up — locked means no
  // drag in AND no drag out. They still open the aside on click.
  function renderCard(job, isLocked) {
    const card = cloneTpl('tpl-job-card');
    card.draggable = !isLocked;
    card.classList.toggle('is-pinned', isLocked);
    card.dataset.jobNumber = job.number;
    card.classList.add(PROD_CLASS[job.prodType]);
    card.classList.toggle('is-selected', job.number === openJobNumber);
    card.querySelector('.card-job').textContent = job.number;
    card.querySelector('.card-desc').textContent = job.description;
    card.querySelector('.card-customer').textContent = `(${job.customerNumber}) ${job.customer}`;
    card.querySelector('.card-mgmt').textContent = job.mgmtGroup;
    card.setAttribute('aria-label', `Job ${job.number}, ${job.description}`);

    return card;
  }

  // Card click → job aside
  boardEl.addEventListener('click', e => {
    const hideBtn = e.target.closest('.loc-column__hide');
    if (hideBtn) {
      hideColumn(Number(hideBtn.closest('.loc-column').dataset.locationId));
      return;
    }
    const card = e.target.closest('.job-card');
    if (card) openJobAside(Number(card.dataset.jobNumber));
  });

  /* ── Hide columns (boards you don't own) ── */
  function hideColumn(locationId) {
    const view = activeView();
    const hidden = hiddenByView[view.id] ||= [];
    hidden.push(locationId);
    renderBoard();
    showToast(`Hid ${locationById[locationId].name} from your view`, () => {
      hidden.splice(hidden.indexOf(locationId), 1);
      renderBoard();
    });
  }

  function renderHiddenCols(view, mine, hidden) {
    $('hiddenCols').hidden = mine || hidden.length === 0;
    if ($('hiddenCols').hidden) { closeHiddenMenu(); return; }
    $('hiddenColsLabel').textContent = `${hidden.length} hidden`;
    const list = $('hiddenColsList');
    list.replaceChildren();
    // Board order, so the list reads like the board
    view.locationIds.filter(id => hidden.includes(id)).forEach(id => {
      const item = cloneTpl('tpl-hidden-col');
      item.querySelector('.hidden-cols__name').textContent = locationById[id].name;
      item.querySelector('[data-show-column]').dataset.showColumn = id;
      list.append(item);
    });
  }

  function closeHiddenMenu() {
    $('hiddenColsMenu').hidden = true;
    $('btnHiddenCols').setAttribute('aria-expanded', 'false');
  }
  $('btnHiddenCols').addEventListener('click', () => {
    const open = $('hiddenColsMenu').hidden;
    $('hiddenColsMenu').hidden = !open;
    $('btnHiddenCols').setAttribute('aria-expanded', open);
  });
  $('hiddenColsList').addEventListener('click', e => {
    const btn = e.target.closest('[data-show-column]');
    if (!btn) return;
    const hidden = hiddenByView[activeViewId];
    hidden.splice(hidden.indexOf(Number(btn.dataset.showColumn)), 1);
    renderBoard();
  });
  $('btnShowAllCols').addEventListener('click', () => {
    hiddenByView[activeViewId] = [];
    renderBoard();
  });
  // Click outside or Esc closes the menu
  document.addEventListener('click', e => {
    if (!e.target.closest('#hiddenCols')) closeHiddenMenu();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('hiddenColsMenu').hidden) closeHiddenMenu();
  });

  boardEl.addEventListener('keydown', e => {
    const card = e.target.closest('.job-card');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openJobAside(Number(card.dataset.jobNumber));
    }
  });

  $('boardSearch').addEventListener('input', e => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderBoard();
  });

  $('btnEmptyAddColumns').addEventListener('click', () => openColumnsAside());
  $('btnEditView').addEventListener('click', () => openColumnsAside());


  /* ════════════════════════════════════════════════════════════
     DRAG AND DROP
     Locked columns are closed both ways: their cards aren't draggable,
     and they never call preventDefault() in dragover, so the browser
     shows the "not allowed" cursor and drop never fires.
     ════════════════════════════════════════════════════════════ */
  /* ── Column reorder (owner only) ──
     The header is the handle. The insertion bar goes on whichever side
     of the hovered column the pointer is nearer to. */
  let columnDrop = null; // { id, after }

  function clearColumnDrop() {
    boardEl.querySelectorAll('.is-insert-before, .is-insert-after')
      .forEach(c => c.classList.remove('is-insert-before', 'is-insert-after'));
    columnDrop = null;
  }

  boardEl.addEventListener('dragstart', e => {
    const header = e.target.closest?.('.loc-column__header');
    if (!header || !header.draggable) return;
    const col = header.closest('.loc-column');
    draggingColumnId = Number(col.dataset.locationId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `column:${draggingColumnId}`);
    col.classList.add('is-column-dragging');
    e.stopImmediatePropagation(); // not a card drag
  });

  boardEl.addEventListener('dragover', e => {
    if (draggingColumnId == null) return;
    const col = e.target.closest('.loc-column');
    if (!col) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const id = Number(col.dataset.locationId);
    const box = col.getBoundingClientRect();
    const after = e.clientX > box.left + box.width / 2;
    if (columnDrop && columnDrop.id === id && columnDrop.after === after) return;
    clearColumnDrop();
    if (id === draggingColumnId) return; // dropping on itself does nothing
    col.classList.add(after ? 'is-insert-after' : 'is-insert-before');
    columnDrop = { id, after };
  });

  boardEl.addEventListener('drop', e => {
    if (draggingColumnId == null) return;
    e.preventDefault();
    if (columnDrop) {
      const ids = activeView().locationIds;
      ids.splice(ids.indexOf(draggingColumnId), 1);
      const target = ids.indexOf(columnDrop.id);
      ids.splice(columnDrop.after ? target + 1 : target, 0, draggingColumnId);
    }
    clearColumnDrop();
    renderBoard();
  });

  boardEl.addEventListener('dragend', () => {
    if (draggingColumnId == null) return;
    draggingColumnId = null;
    clearColumnDrop();
    boardEl.querySelectorAll('.is-column-dragging').forEach(c => c.classList.remove('is-column-dragging'));
  });

  boardEl.addEventListener('dragstart', e => {
    const card = e.target.closest('.job-card');
    if (!card || card.closest('.loc-column').classList.contains('is-locked')) {
      e.preventDefault();
      return;
    }
    draggingJobNumber = Number(card.dataset.jobNumber);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(draggingJobNumber));
    card.classList.add('is-dragging');
    card.closest('.loc-column').classList.add('is-source');
    boardEl.classList.add('is-dragging');
  });

  boardEl.addEventListener('dragend', () => {
    draggingJobNumber = null;
    boardEl.classList.remove('is-dragging');
    boardEl.querySelectorAll('.is-dragging, .is-source, .is-drop-target')
      .forEach(el => el.classList.remove('is-dragging', 'is-source', 'is-drop-target'));
  });

  boardEl.addEventListener('dragover', e => {
    const col = e.target.closest('.loc-column');
    if (!col || draggingJobNumber == null) return;
    if (col.classList.contains('is-locked') || col.classList.contains('is-source')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    boardEl.querySelectorAll('.is-drop-target').forEach(c => c !== col && c.classList.remove('is-drop-target'));
    col.classList.add('is-drop-target');
  });

  boardEl.addEventListener('dragleave', e => {
    const col = e.target.closest('.loc-column');
    if (col && !col.contains(e.relatedTarget)) col.classList.remove('is-drop-target');
  });

  boardEl.addEventListener('drop', e => {
    const col = e.target.closest('.loc-column');
    if (!col || draggingJobNumber == null) return;
    e.preventDefault();
    moveJob(draggingJobNumber, Number(col.dataset.locationId));
  });

  /* ── Edge panning while dragging a card ──
     Panning by hand isn't possible mid-drag, so holding a card near
     either edge of the board scrolls it. Same as lane-editor.js. */
  let edgeTimer = null;
  function startEdgeScroll(step) {
    if (edgeTimer) return;
    edgeTimer = setInterval(() => { boardEl.scrollLeft += step; }, 16);
  }
  function stopEdgeScroll() {
    clearInterval(edgeTimer);
    edgeTimer = null;
  }
  boardEl.addEventListener('dragover', e => {
    if (draggingJobNumber == null && draggingColumnId == null) return;
    const box = boardEl.getBoundingClientRect();
    const edge = 80;
    if (e.clientX > box.right - edge) startEdgeScroll(12);
    else if (e.clientX < box.left + edge) startEdgeScroll(-12);
    else stopEdgeScroll();
  });
  boardEl.addEventListener('dragend', stopEdgeScroll);
  boardEl.addEventListener('drop', stopEdgeScroll);


  /* ════════════════════════════════════════════════════════════
     DRAG TO PAN
     Trello-style: grab the board anywhere that isn't a card or a
     control and drag sideways. Pointer capture keeps the pan alive when
     the cursor leaves the board, and a pan of more than a few pixels
     swallows the click so panning never opens a job. Same behaviour as
     person-dashboard.js / PL-JM-1.25.
     ════════════════════════════════════════════════════════════ */
  let panning = false, panStartX = 0, panStartScroll = 0, panMoved = 0;

  boardEl.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.pointerType === 'touch') return; // touch scrolls natively
    if (e.target.closest('.job-card, button, a, input')) return;
    if (e.target.closest('.loc-column__header[draggable="true"]')) return; // that's a reorder drag
    panning = true;
    panMoved = 0;
    panStartX = e.clientX;
    panStartScroll = boardEl.scrollLeft;
    boardEl.setPointerCapture(e.pointerId);
    boardEl.classList.add('is-panning');
  });

  boardEl.addEventListener('pointermove', e => {
    if (!panning) return;
    const dx = e.clientX - panStartX;
    panMoved = Math.max(panMoved, Math.abs(dx));
    boardEl.scrollLeft = panStartScroll - dx;
  });

  function endPan(e) {
    if (!panning) return;
    panning = false;
    boardEl.releasePointerCapture(e.pointerId);
    boardEl.classList.remove('is-panning');
    if (panMoved > 4) {
      boardEl.addEventListener('click', ev => { ev.stopPropagation(); ev.preventDefault(); },
        { capture: true, once: true });
    }
  }
  boardEl.addEventListener('pointerup', endPan);
  boardEl.addEventListener('pointercancel', endPan);


  function moveJob(jobNumber, toLocationId) {
    const job = jobByNumber[jobNumber];
    const fromLocationId = job.locationId;
    if (fromLocationId === toLocationId) return;
    if (locationById[fromLocationId].locked || locationById[toLocationId].locked) return;
    job.locationId = toLocationId;
    // Log the move in the job's activity, same as a scan
    const scans = SCANS[jobNumber] ||= scansFor(job).map(s => ({ ...s, locationId: fromLocationId }));
    const scan = { locationId: toLocationId, who: ME, via: 'board', at: nowIso() };
    scans.push(scan);
    renderBoard();
    if (openJobNumber === jobNumber) renderJobAside();
    showToast(`Moved ${jobNumber} to ${locationById[toLocationId].name}`, () => {
      scans.splice(scans.indexOf(scan), 1);
      job.locationId = fromLocationId;
      renderBoard();
      if (openJobNumber === jobNumber) renderJobAside();
    });
  }


  /* ════════════════════════════════════════════════════════════
     JOB ASIDE
     ════════════════════════════════════════════════════════════ */
  function openJobAside(jobNumber) {
    openJobNumber = jobNumber;
    resetTimeForm();
    renderJobAside();
    renderBoard(); // selected-card outline
    openFlyout(jobAside);
  }

  function setJobField(name, value) {
    jobAside.querySelectorAll(`[data-job="${name}"]`).forEach(el => { el.textContent = value; });
  }

  function renderJobAside() {
    const job = jobByNumber[openJobNumber];
    const loc = locationById[job.locationId];

    setJobField('number', job.number);
    setJobField('description', job.description);
    setJobField('customerNumber', job.customerNumber);
    setJobField('customer', job.customer);
    setJobField('mgmtGroup', job.mgmtGroup);
    setJobField('location', loc.name);
    setJobField('jobType', job.jobType);
    setJobField('prodType', job.prodType);
    jobAside.querySelector('[data-job="locationLock"]').hidden = !loc.locked;

    jobAside.querySelector('[data-job="prodDot"]').className = 'prod-dot ' + PROD_CLASS[job.prodType];

    // Prototype links — real routes are the management group and customer records
    $('crumbMgmtGroup').href = `../PL-CM-1.5/customer-detail-page-mg-group.html?group=${encodeURIComponent(job.mgmtGroup)}`;
    $('crumbCustomer').href = `../PL-CM-1.5/customer-detail-page.html?customer=${job.customerNumber}`;

    // Prototype link — the real route is the job detail page for this job
    $('linkJobPage').href = `../PL-8.0-JM-New-jobs/job-detail-page.html?job=${job.number}`;
    $('linkJobPage').title = `Open job ${job.number} — ${job.description}`;

    renderAsideTab();
    renderLocationForm(job, loc);
    renderActivity();
    renderProofContacts();
    renderNotes();
    renderDetails(job);
  }

  /* ── Move job form ──
     The datalist only offers unlocked locations; anything else is refused. */
  const unlockedNames = LOCATIONS.filter(l => !l.locked)
    .sort((a, b) => a.name.localeCompare(b.name));
  $('locationOptions').replaceChildren(...unlockedNames.map(l => new Option('', l.name)));
  const locationByName = Object.fromEntries(unlockedNames.map(l => [l.name, l]));

  function renderLocationForm(job, loc) {
    const input = $('moveLocation');
    input.value = '';
    setInvalid(input, false);
    $('locationError').hidden = true;
    input.disabled = loc.locked;
    $('btnMoveJob').disabled = loc.locked;
    input.placeholder = loc.locked ? `In ${loc.name} (locked) — scan to move` : 'Move to location';
  }

  function showLocationError(message) {
    $('locationError').textContent = message;
    $('locationError').hidden = false;
    setInvalid($('moveLocation'), true);
    $('moveLocation').focus();
  }

  $('moveLocation').addEventListener('input', () => {
    setInvalid($('moveLocation'), false);
    $('locationError').hidden = true;
  });
  $('moveLocation').addEventListener('change', () => {
    const input = $('moveLocation');
    const match = matchFromList(input);
    if (match) input.value = match;
  });

  $('locationForm').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('moveLocation');
    const typed = input.value.trim();
    if (!typed) return showLocationError('Type a location to move this job to.');
    const name = matchFromList(input);
    if (!name) {
      const locked = LOCATIONS.find(l => l.locked && l.name.toLowerCase() === typed.toLowerCase());
      return showLocationError(locked
        ? `${locked.name} is locked — jobs get there by scanning.`
        : `“${typed}” isn't a location in the list.`);
    }
    const job = jobByNumber[openJobNumber];
    const to = locationByName[name];
    if (to.id === job.locationId) return showLocationError(`It's already in ${name}.`);
    moveJob(job.number, to.id); // re-renders the aside, which clears the form
  });

  /* ── Aside tabs ── */
  function renderAsideTab() {
    jobAside.querySelectorAll('[data-aside-tab]').forEach(tab => {
      const on = tab.dataset.asideTab === asideTab;
      tab.classList.toggle('active', on);
      tab.setAttribute('aria-selected', on);
      tab.tabIndex = on ? 0 : -1;
    });
    $('panelDetails').hidden = asideTab !== 'details';
    $('panelActivity').hidden = asideTab !== 'activity';
  }

  jobAside.querySelector('.aside-tabs').addEventListener('click', e => {
    const tab = e.target.closest('[data-aside-tab]');
    if (!tab) return;
    asideTab = tab.dataset.asideTab;
    renderAsideTab();
  });

  // Arrow keys move between tabs (WAI-ARIA tabs pattern)
  jobAside.querySelector('.aside-tabs').addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    asideTab = asideTab === 'details' ? 'activity' : 'details';
    renderAsideTab();
    jobAside.querySelector(`[data-aside-tab="${asideTab}"]`).focus();
  });

  /* ── Activity ── */
  // Only proofs that went out get named in the title
  const PROOF_LABEL = { yes: 'Proof Sent', revised: 'Revised Proof Sent' };
  // Row-end count wording, per filter: [singular, plural]
  const ACTIVITY_NOUN = {
    all: ['activity', 'activities'],
    scan: ['scan', 'scans'],
    time: ['time entry', 'time entries'],
    proof: ['proof sent', 'proofs sent'],
  };
  const ACTIVITY_EMPTY = {
    all: 'No activity yet.',
    scan: 'No location scans yet.',
    time: 'No time entries yet.',
    proof: 'No proofs sent yet.',
  };

  // Jobs without a scan history still have a current location
  function scansFor(job) {
    return SCANS[job.number] || [{ locationId: job.locationId, who: '—', via: 'scanner', at: '2026-10-20T08:00' }];
  }

  // "1h05m", "45m", "05m"
  function fmtDuration(min) {
    const h = Math.floor(min / 60), m = String(min % 60).padStart(2, '0');
    return h ? `${h}h${m}m` : `${m}m`;
  }

  // Scans + time entries as one list, earliest first
  function activityFor(job) {
    const scans = scansFor(job).map(s => ({ kind: 'scan', ...s }));
    // A proof sent is logged on a time entry but shows as its own row,
    // right after that time entry (the sort is stable, so same-time order holds)
    const time = (TIME_ENTRIES[job.number] || []).flatMap(t => {
      const rows = [{ kind: 'time', ...t }];
      if (PROOF_LABEL[t.proof]) rows.push({ kind: 'proof', who: t.who, at: t.at, proof: t.proof, task: t.task });
      return rows;
    });
    return [...scans, ...time].sort((a, b) => a.at.localeCompare(b.at));
  }

  function matchesFilter(item, filter) {
    if (filter === 'all') return true;
    return item.kind === filter;
  }

  function renderActivity() {
    const job = jobByNumber[openJobNumber];
    const all = activityFor(job);

    jobAside.querySelectorAll('[data-activity-filter]').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.dataset.activityFilter === activityFilter);
    });

    const items = all.filter(item => matchesFilter(item, activityFilter));
    const list = $('activityList');
    list.replaceChildren();

    items.forEach((item, i) => {
      const row = cloneTpl('tpl-activity-row');
      row.dataset.kind = item.kind;
      row.querySelector('.timeline-date').textContent = fmtDate(item.at);
      const connector = row.querySelector('.timeline-connector');
      if (i === 0) { row.classList.add('timeline-row-first'); connector.classList.add('timeline-connector-first'); }
      if (i === items.length - 1) connector.classList.add('timeline-connector-last');

      const title = row.querySelector('.timeline-event__title');
      const meta = row.querySelector('.timeline-event__meta');
      if (item.kind === 'scan') {
        const verb = item.via === 'board' ? 'Moved to' : 'Scanned to';
        title.textContent = `${verb} ${locationById[item.locationId].name}`;
      } else if (item.kind === 'proof') {
        title.textContent = PROOF_LABEL[item.proof];
      } else {
        title.textContent = `${item.task} • ${fmtDuration(item.minutes)}`;
      }
      meta.textContent = item.who;
      list.append(row);
    });

    const [one, many] = ACTIVITY_NOUN[activityFilter];
    $('activityCount').textContent = `${items.length} ${items.length === 1 ? one : many}`;

    $('activityEmpty').hidden = items.length > 0;
    $('activityEmpty').textContent = ACTIVITY_EMPTY[activityFilter];

    const total = (TIME_ENTRIES[job.number] || []).reduce((sum, e) => sum + e.minutes, 0);
    $('timeChip').textContent = `${fmtMinutes(total)} total`;
  }

  jobAside.querySelector('.activity-filters').addEventListener('click', e => {
    const btn = e.target.closest('[data-activity-filter]');
    if (!btn) return;
    // Clicking the selected pill unselects it, which falls back to All
    const filter = btn.dataset.activityFilter;
    activityFilter = filter === activityFilter ? 'all' : filter;
    renderActivity();
  });

  /* ── Log time form ── */
  const timeFields = ['timeHours', 'timeMinutes', 'timeProof', 'timeTask'];

  // The allowed values come straight from each input's <datalist>
  function listValues(input) {
    return [...input.list.options].map(o => o.value);
  }

  // Exact (case-insensitive) match, else a unique prefix match, else null.
  function matchFromList(input) {
    const typed = input.value.trim().toLowerCase();
    if (!typed) return null;
    const values = listValues(input);
    const exact = values.find(v => v.toLowerCase() === typed);
    if (exact) return exact;
    const starts = values.filter(v => v.toLowerCase().startsWith(typed));
    return starts.length === 1 ? starts[0] : null;
  }

  function setInvalid(input, invalid) {
    if (invalid) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function resetTimeForm() {
    $('timeForm').reset();
    timeFields.forEach(id => setInvalid($(id), false));
    $('timeError').hidden = true;
  }

  function showTimeError(message, field) {
    $('timeError').textContent = message;
    $('timeError').hidden = false;
    if (field) {
      setInvalid(field, true);
      field.focus();
    }
  }

  // On leaving a list field: snap to the list value, or refuse it.
  ['timeProof', 'timeTask'].forEach(id => {
    const input = $(id);
    input.addEventListener('change', () => {
      if (!input.value.trim()) { setInvalid(input, false); return; }
      const match = matchFromList(input);
      if (match) {
        input.value = match;
        setInvalid(input, false);
        $('timeError').hidden = true;
      } else {
        setInvalid(input, true);
        $('timeError').textContent = `“${input.value.trim()}” isn't in the list.`;
        $('timeError').hidden = false;
      }
    });
    input.addEventListener('input', () => setInvalid(input, false));
  });

  $('timeForm').addEventListener('submit', e => {
    e.preventDefault();
    const hoursEl = $('timeHours'), minsEl = $('timeMinutes');
    const proofEl = $('timeProof'), taskEl = $('timeTask');
    timeFields.forEach(id => setInvalid($(id), false));

    const hours = Number(hoursEl.value) || 0;
    const mins = Number(minsEl.value) || 0;
    if (hours < 0) return showTimeError('Hours can\'t be negative.', hoursEl);
    if (mins < 0 || mins > 59) return showTimeError('Minutes need to be between 0 and 59.', minsEl);
    if (hours + mins === 0) return showTimeError('Enter hours, minutes, or both.', hoursEl);

    const proof = matchFromList(proofEl);
    if (!proof) return showTimeError(proofEl.value.trim()
      ? `“${proofEl.value.trim()}” isn't an option — use Yes, No, or Revised.`
      : 'Was a proof sent? Yes, No, or Revised.', proofEl);

    const task = matchFromList(taskEl);
    if (!task) return showTimeError(taskEl.value.trim()
      ? `“${taskEl.value.trim()}” isn't a task in the list.`
      : 'Choose a task.', taskEl);
    const taskOption = [...taskEl.list.options].find(o => o.value === task);

    const minutes = hours * 60 + mins;
    (TIME_ENTRIES[openJobNumber] ||= []).unshift({
      who: ME,
      minutes,
      task,
      taskId: Number(taskOption.dataset.worktypeId), // worktypeid
      proof: proof.toLowerCase(),
      at: nowIso(),
    });
    resetTimeForm();
    renderActivity();
    showToast(`Logged ${fmtMinutes(minutes)} to ${openJobNumber}`);
    hoursEl.focus(); // ready for the next entry
  });

  /* ── Proofing contacts — read-only, click to copy ── */
  function renderProofContacts() {
    const emails = PROOF_CONTACTS[openJobNumber] || [];
    const has = emails.length > 0;
    $('proofContactsString').textContent = emails.join(', ');
    $('proofContactsWrap').hidden = !has;
    $('proofContactsEmpty').hidden = has;
    $('proofContactsWrap').classList.remove('copy-wrap-copied');
  }

  function copyProofContacts() {
    const wrap = $('proofContactsWrap');
    const text = $('proofContactsString').textContent;
    if (!text) return;
    // Flash immediately on click rather than waiting on the clipboard
    clearTimeout(copyFlashTimer);
    wrap.classList.add('copy-wrap-copied');
    copyFlashTimer = setTimeout(() => wrap.classList.remove('copy-wrap-copied'), 700);
    navigator.clipboard.writeText(text);
  }
  let copyFlashTimer = null;
  $('proofContactsWrap').addEventListener('click', copyProofContacts);
  $('proofContactsWrap').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyProofContacts(); }
  });

  /* ── Notes ── */
  function renderNotes() {
    const notes = NOTES[openJobNumber] || [];
    const list = $('noteList');
    list.replaceChildren();
    notes.forEach((note, i) => {
      const item = cloneTpl('tpl-note');
      item.querySelector('.widget-note-num').textContent = `(${i + 1})`;
      item.querySelector('.widget-note-text').textContent = note.text;
      list.append(item);
    });
    $('noteEmpty').hidden = notes.length > 0;
  }

  /* ── Detail cards ── */
  function renderDetails(job) {
    const details = DETAIL_PRESETS[job.prodType] || [];
    const list = $('detailList');
    list.replaceChildren();

    details.forEach((detail, i) => {
      const card = cloneTpl('tpl-detail-card');
      card.querySelector('.detail-num').textContent = i + 1;
      card.querySelector('.detail-card-name').textContent = detail.title;

      const body = card.querySelector('.detail-card-body');
      const notesEl = card.querySelector('.detail-card-notes');
      detail.sections.forEach(section => {
        const sec = cloneTpl('tpl-detail-section');
        sec.querySelector('.detail-section-title').textContent = section.name;
        const tiles = sec.querySelector('.spec-tiles');
        section.specs.forEach(([label, value]) => {
          const tile = cloneTpl('tpl-spec-tile');
          tile.querySelector('.spec-tile-label').textContent = label;
          tile.querySelector('.spec-tile-value').textContent = value;
          tiles.append(tile);
        });
        body.insertBefore(sec, notesEl);
      });

      // Detail notes sit at the foot of the card, same note row as the widget
      if (detail.note) {
        const item = cloneTpl('tpl-note');
        item.querySelector('.widget-note-num').textContent = '(1)';
        item.querySelector('.widget-note-text').textContent = detail.note;
        notesEl.append(item);
        notesEl.hidden = false;
      }
      list.append(card);
    });
  }


  /* ════════════════════════════════════════════════════════════
     COLUMNS ASIDE (edit view)
     ════════════════════════════════════════════════════════════ */
  // What the view looked like when the panel opened — Cancel restores it
  let viewSnapshot = null;

  function openColumnsAside({ focusName = false } = {}) {
    const view = activeView();
    if (!isOwner(view)) return; // owner only
    viewSnapshot = { id: view.id, name: view.name, locationIds: [...view.locationIds] };

    const ownerSelect = $('viewOwnerSelect');
    ownerSelect.replaceChildren(...USERS.map(u => new Option(u === ME ? `${u} (you)` : u, u)));
    ownerSelect.value = view.owner;
    $('ownerChangeNote').hidden = true;

    $('viewNameInput').value = view.name;
    $('pickerSearch').value = '';
    setPickerFilter('all');
    openFlyout(columnsAside);
    if (focusName) setTimeout(() => $('viewNameInput').select(), 50);
  }

  function renderPicker() {
    const view = activeView();
    const query = $('pickerSearch').value.trim().toLowerCase();
    const list = $('pickerList');
    list.replaceChildren();
    $('pickerShownCount').textContent = view.locationIds.length;

    const matches = LOCATIONS.filter(loc => {
      if (pickerFilter === 'shown' && !view.locationIds.includes(loc.id)) return false;
      if (!query) return true;
      return loc.name.toLowerCase().includes(query);
    });

    // "Shown" lists in board order; "All" groups by department, A–Z
    const groups = new Map();
    if (pickerFilter === 'shown') {
      matches.sort((a, b) => view.locationIds.indexOf(a.id) - view.locationIds.indexOf(b.id));
      groups.set('On this board, left to right — drag column headers on the board to reorder', matches);
    } else {
      [...matches]
        .sort((a, b) => deptName(a.deptId).localeCompare(deptName(b.deptId)) || a.name.localeCompare(b.name))
        .forEach(loc => {
          const key = deptName(loc.deptId);
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(loc);
        });
    }

    groups.forEach((locs, title) => {
      const group = cloneTpl('tpl-picker-group');
      group.querySelector('.picker-group__title').textContent = title;
      const ul = group.querySelector('.picker-group__list');
      locs.forEach(loc => {
        const row = cloneTpl('tpl-picker-row');
        const check = row.querySelector('.picker-row__check');
        check.checked = view.locationIds.includes(loc.id);
        check.dataset.locationId = loc.id;
        row.querySelector('.picker-row__name').textContent = loc.name;
        row.querySelector('.picker-row__locked').hidden = !loc.locked;
        ul.append(row);
      });
      list.append(group);
    });

    $('pickerNone').hidden = matches.length > 0;
  }

  function setPickerFilter(filter) {
    pickerFilter = filter;
    columnsAside.querySelectorAll('[data-picker-filter]').forEach(btn => {
      const on = btn.dataset.pickerFilter === filter;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on);
    });
    renderPicker();
  }

  columnsAside.addEventListener('click', e => {
    const filterBtn = e.target.closest('[data-picker-filter]');
    if (filterBtn) setPickerFilter(filterBtn.dataset.pickerFilter);
  });

  // Live: checking a location adds it to the end of the view
  $('pickerList').addEventListener('change', e => {
    const check = e.target.closest('.picker-row__check');
    if (!check) return;
    const view = activeView();
    const id = Number(check.dataset.locationId);
    if (check.checked) view.locationIds.push(id);
    else view.locationIds.splice(view.locationIds.indexOf(id), 1);
    $('pickerShownCount').textContent = view.locationIds.length;
    renderBoard();
  });

  $('pickerSearch').addEventListener('input', renderPicker);

  $('viewNameInput').addEventListener('input', e => {
    activeView().name = e.target.value.trim() || 'Untitled board';
    renderTabs();
    $('viewTitle').textContent = activeView().name;
  });

  /* ── Owner dropdown — applied on Save ── */
  $('viewOwnerSelect').addEventListener('change', e => {
    $('ownerChangeNote').hidden = e.target.value === ME;
  });

  /* ── Save / Cancel ── */
  function revertViewEdits() {
    if (!viewSnapshot) return;
    const view = viewById(viewSnapshot.id);
    if (view) {
      view.name = viewSnapshot.name;
      view.locationIds = viewSnapshot.locationIds;
      render();
    }
    viewSnapshot = null;
  }

  $('btnCancelViewEdit').addEventListener('click', () => closeFlyout(columnsAside));

  $('btnSaveViewEdit').addEventListener('click', () => {
    const view = activeView();
    const newOwner = $('viewOwnerSelect').value;
    viewSnapshot = null; // keep the live edits
    closeFlyout(columnsAside);
    if (newOwner !== view.owner) {
      view.owner = newOwner;
      render();
      showToast(`Saved — “${view.name}” now belongs to ${newOwner}`);
    } else {
      showToast(`Saved “${view.name}”`);
    }
  });

  /* ── Delete — owner only, removes it for everyone ──
     From the toolbar or the Edit board panel. */
  $('btnDeleteView').addEventListener('click', deleteActiveBoard);
  $('btnDeleteBoardToolbar').addEventListener('click', deleteActiveBoard);

  // Both delete buttons ask first
  function deleteActiveBoard() {
    const view = activeView();
    if (!isOwner(view)) return;
    if (myViewIds.length === 1 && myViewIds[0] === activeViewId) {
      showToast('Add another board to your tabs before deleting this one');
      return;
    }
    $('confirmDeleteTitle').textContent = `Delete ${view.name}?`;
    const n = view.locationIds.length;
    $('confirmDeleteBody').textContent =
      `This deletes the board for everyone, including anyone who keeps it in their tabs. ` +
      `Its ${n} column${n === 1 ? '' : 's'} go with it — the jobs and locations themselves aren't affected.`;
    openConfirm();
  }

  const confirmModal = $('confirmDeleteBoard');
  let confirmReturnFocus = null;
  function openConfirm() {
    confirmReturnFocus = document.activeElement;
    confirmModal.classList.add('open');
    $('btnConfirmDeleteBoard').focus();
  }
  function closeConfirm() {
    confirmModal.classList.remove('open');
    if (confirmReturnFocus && document.contains(confirmReturnFocus)) confirmReturnFocus.focus();
  }
  confirmModal.addEventListener('click', e => {
    if (e.target === confirmModal || e.target.closest('[data-close-modal]')) closeConfirm();
  });
  $('btnConfirmDeleteBoard').addEventListener('click', () => {
    confirmModal.classList.remove('open');
    performDelete();
  });

  function performDelete() {
    revertViewEdits(); // unsaved edits don't matter — it's going away
    const view = activeView();
    const viewIndex = views.indexOf(view);
    const tabIndex = myViewIds.indexOf(view.id);
    if (columnsAside.classList.contains('open')) closeFlyout(columnsAside);
    views.splice(viewIndex, 1);
    myViewIds.splice(tabIndex, 1);
    activeViewId = myViewIds[Math.max(0, tabIndex - 1)];
    render();
    showToast(`Deleted “${view.name}”`, () => {
      views.splice(viewIndex, 0, view);
      myViewIds.splice(tabIndex, 0, view.id);
      activeViewId = view.id;
      render();
    });
  }


  /* ════════════════════════════════════════════════════════════
     FLYOUT + TOAST (house patterns)
     ════════════════════════════════════════════════════════════ */
  let lastFocus = null;

  function openFlyout(overlay) {
    lastFocus = document.activeElement;
    overlay.classList.add('open');
    overlay.querySelector('[data-close]').focus({ preventScroll: true });
  }
  function closeFlyout(overlay) {
    overlay.classList.remove('open');
    if (overlay === jobAside) {
      openJobNumber = null;
      renderBoard();
    }
    if (overlay === viewsAside) $('btnAddView').setAttribute('aria-expanded', 'false');
    // Closing the edit panel any way other than Save is a cancel
    if (overlay === columnsAside) revertViewEdits();
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  [jobAside, columnsAside, viewsAside].forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay || e.target.closest('[data-close]')) closeFlyout(overlay);
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    // The confirm sits on top — Esc closes it first, not the panel under it
    if (confirmModal.classList.contains('open')) { closeConfirm(); return; }
    const open = document.querySelector('.flyout-overlay.open');
    if (open) closeFlyout(open);
  });

  let toastTimer = null;
  let toastUndo = null;
  function showToast(text, undo = null) {
    $('toastText').textContent = text;
    toastUndo = undo;
    $('toastAction').hidden = !undo;
    $('toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), undo ? 5000 : 2500);
  }
  $('toastAction').addEventListener('click', () => {
    if (toastUndo) toastUndo();
    toastUndo = null;
    $('toast').classList.remove('show');
  });


  /* ── Init ──────────────────────────────────────────────────── */
  function render() {
    renderTabs();
    renderBoard();
  }
  render();

})();
