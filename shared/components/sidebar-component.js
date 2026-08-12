/**
 * Platinum Sidebar Component
 * ─────────────────────────────────────────────────────────────
 * Drop-in shared sidebar for Platinum prototype pages.
 * Requires:
 *   • Font Awesome kit (fa-regular / fa-solid icons)
 *   • Platinum design tokens in :root (primitives + semantic layer)
 *     loaded via platinum-buttons.js before this script.
 *
 * Usage:
 *   <script src="components/platinum-buttons.js"></script>
 *   <script src="components/sidebar-component.js"></script>
 *
 * Config (set before this script):
 *   window.SIDEBAR_CONFIG = { activeItem: 'Customer', user: { name, role } }
 *
 * Exposes: window.toggleSidebar()
 *
 * Token notes
 * ───────────
 *   • --bg-inverse       → sidebar surface (dark in light mode, light in dark mode)
 *   • --text-on-dark     → base for all sidebar text/hover/divider via color-mix()
 *   • --accent-default   → gold-500 active chip (same in both modes)
 *   • --r-sm / --r-md    → radius tokens from semantic layer
 */
(function () {

  /* ─── CSS ──────────────────────────────────────────────────── */
  const CSS = `
:root {
  --sidebar-w:       192px;
  --sidebar-cw:       52px;

  /* Inverse surface — carbon in light mode, ivory in dark mode */
  --sidebar-bg:      var(--bg-inverse);

  /* Active chip — accent semantic token (gold-500 in both modes) */
  --sidebar-active:  var(--accent-default);

  /* Text/chrome derived from text-on-dark, which is always the correct
     contrasting tone for whichever surface bg-inverse resolves to. */
  --sidebar-text:    color-mix(in srgb, var(--text-on-dark) 80%, transparent);
  --sidebar-muted:   color-mix(in srgb, var(--text-on-dark) 38%, transparent);
  --sidebar-hover:   color-mix(in srgb, var(--text-on-dark)  7%, transparent);
  --sidebar-divider: color-mix(in srgb, var(--text-on-dark)  9%, transparent);
}

/* ── SIDEBAR ─────────────────────────────────────────────── */
.sidebar {
  width: var(--sidebar-w); min-width: var(--sidebar-w);
  background: var(--sidebar-bg);
  display: flex; flex-direction: column;
  flex-shrink: 0; overflow: hidden;
  transition: width .22s ease, min-width .22s ease;
  z-index: 200;
}
.sidebar.collapsed { width: var(--sidebar-cw); min-width: var(--sidebar-cw); }

/* ── Profile row ─────────────────────────────────────────── */
.sidebar-profile {
  display: flex; align-items: flex-start;
  justify-content: space-between;
  padding: 16px 12px 12px; gap: 6px; flex-shrink: 0;
}
.sb-profile-text { overflow: hidden; }
.sb-name {
  font-size: 13.5px; font-weight: 600;
  color: var(--sidebar-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;
}
.sb-role {
  font-size: 10px; color: var(--sidebar-muted);
  white-space: nowrap; margin-top: 1px;
}
.sidebar.collapsed .sb-profile-text { display: none; }
.sidebar.collapsed .sidebar-profile  { justify-content: center; padding: 14px 0 12px; }

/* ── Collapse button ─────────────────────────────────────── */
.sb-collapse {
  width: 24px; height: 24px; border: none; background: none; cursor: pointer;
  color: var(--sidebar-muted); border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; flex-shrink: 0; margin-top: 1px;
  transition: color .15s, background .15s;
}
.sb-collapse:hover { color: var(--sidebar-text); background: var(--sidebar-hover); }
.sb-collapse i { transition: transform .22s ease; }
.sidebar.collapsed .sb-collapse i { transform: rotate(180deg); }

/* ── Divider ─────────────────────────────────────────────── */
.sb-hr { height: 1px; background: var(--sidebar-divider); margin: 0 10px 6px; flex-shrink: 0; }

/* ── Nav ─────────────────────────────────────────────────── */
.sidebar-nav { flex: 1; padding: 0 6px; overflow-y: auto; }
.sidebar-nav::-webkit-scrollbar { display: none; }

.nav-item {
  display: flex; align-items: center; gap: 9px;
  padding: 7px 8px; border-radius: var(--r-md);
  cursor: pointer; color: var(--sidebar-text);
  font-size: 13px; font-weight: 400;
  white-space: nowrap; margin-bottom: 1px;
  transition: background .12s, color .12s; user-select: none;
}
.nav-item:hover { background: var(--sidebar-hover); color: var(--text-on-dark); }
.nav-item.active {
  background: var(--sidebar-active);
  /* Text on gold chip — use bg-inverse so it matches the sidebar surface in both modes */
  color: var(--bg-inverse);
  font-weight: 600;
}
.nav-item i { width: 16px; text-align: center; font-size: 13px; flex-shrink: 0; }
.nav-item span { overflow: hidden; text-overflow: ellipsis; }
.sidebar.collapsed .nav-item span    { display: none; }
.sidebar.collapsed .nav-item         { justify-content: center; padding: 9px 0; }
.sidebar.collapsed .nav-item i       { width: auto; }

/* ── Section label ───────────────────────────────────────── */
.nav-lbl {
  font-size: 9px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: var(--sidebar-muted);
  padding: 10px 8px 3px; white-space: nowrap;
}
.sidebar.collapsed .nav-lbl { display: none; }

/* ── Sub-items ───────────────────────────────────────────── */
.nav-sub {
  display: flex; align-items: center;
  padding: 5px 8px 5px 30px; font-size: 11.5px;
  color: var(--sidebar-muted); cursor: pointer;
  border-radius: var(--r-sm); white-space: nowrap;
  margin-bottom: 1px; transition: color .12s, background .12s;
}
.nav-sub:hover { color: var(--sidebar-text); background: var(--sidebar-hover); }
.sidebar.collapsed .nav-sub { display: none; }

/* ── Bottom strip ────────────────────────────────────────── */
.sidebar-bottom {
  padding: 6px;
  border-top: 1px solid var(--sidebar-divider);
  flex-shrink: 0;
}
`;

  /* ─── HTML ─────────────────────────────────────────────────── */
  const HTML = `
<aside class="sidebar" id="sidebar">
  <div class="sidebar-profile">
    <div class="sb-profile-text">
      <div class="sb-name">Healey Pembridge</div>
      <div class="sb-role">ui/ux designer</div>
    </div>
    <button class="sb-collapse" onclick="toggleSidebar()" title="Collapse sidebar">
      <i class="fa-regular fa-chevron-left"></i>
    </button>
  </div>

  <div class="sb-hr"></div>

  <nav class="sidebar-nav">
    <div class="nav-item active"><i class="fa-regular fa-house"></i><span>Dashboard</span></div>
    <div class="nav-item"><i class="fa-regular fa-folder"></i><span>Jobs</span></div>
    <div class="nav-item"><i class="fa-regular fa-user"></i><span>Customer</span></div>
    <div class="nav-item"><i class="fa-regular fa-pallet-boxes"></i><span>Inventory</span></div>
    <div class="nav-item"><i class="fa-regular fa-chart-mixed"></i><span>Reports</span></div>
    <div class="sb-hr" style="margin:6px 4px"></div>
    <div class="nav-lbl">Tools</div>
    <div class="nav-sub">Time Tracker</div>
    <div class="nav-sub">Interior Board Requests</div>
    <div class="nav-sub">Bindery Scheduler</div>
    <div class="nav-sub">PIF Board</div>
  </nav>

  <div class="sidebar-bottom">
    <div class="nav-item"><i class="fa-regular fa-users"></i><span>Manage Users</span></div>
    <div class="nav-item"><i class="fa-regular fa-left-from-bracket"></i><span>Logout</span></div>
    <div class="nav-item"><i class="fa-regular fa-gear"></i><span>Settings</span></div>
    <div class="nav-item"><i class="fa-regular fa-circle-question"></i><span>Help</span></div>
  </div>
</aside>`;

  /* ─── INIT ─────────────────────────────────────────────────── */
  function init() {
    const cfg = window.SIDEBAR_CONFIG || {};

    const style = document.createElement('style');
    style.id = 'platinum-sidebar-styles';
    style.textContent = CSS;
    document.head.appendChild(style);

    let html = HTML;
    if (cfg.user) {
      html = html
        .replace('Healey Pembridge', cfg.user.name || 'Healey Pembridge')
        .replace('ui/ux designer',   cfg.user.role || 'ui/ux designer');
    }

    const tmp = document.createElement('div');
    tmp.innerHTML = html.trim();
    const sidebar = tmp.firstElementChild;

    const activeLabel = cfg.activeItem || 'Dashboard';
    sidebar.querySelectorAll('.nav-item').forEach(el => {
      const label = el.querySelector('span')?.textContent.trim();
      el.classList.toggle('active', label === activeLabel);
    });

    document.body.insertBefore(sidebar, document.body.firstChild);
  }

  window.toggleSidebar = function () {
    document.getElementById('sidebar').classList.toggle('collapsed');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
