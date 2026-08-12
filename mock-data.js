/**
 * Mock data for the Active Jobs Dashboards exploration.
 * ─────────────────────────────────────────────────────────────
 * LOCATIONS below is the real contents of job_locations.xlsx
 * (161 rows, deduped on location + status id). It is the single
 * source of truth for which department a scan location belongs to,
 * which is what lets every dashboard derive a job's department from
 * nothing but its current scan location.
 *
 * Everything else — JOBS, SALES_REPS, client names — is INVENTED for
 * prototyping. job_locations has no job records, and nothing available
 * ties sales reps to client accounts. Real integration would replace
 * JOBS with a live feed keyed off the same LOCATION_DESC /
 * JOB_STATUS_ID values used here.
 */

// ── job_locations.xlsx — department → scan location → status id ──
// dept: null means the location has no DEPARTMENT_DESC in the source data.
const LOCATIONS = [
  { dept: null, desc: 'In Production', statusId: 45 },
  { dept: null, desc: 'Prototype Out', statusId: 912 },
  { dept: null, desc: 'Outside Services', statusId: 1 },
  { dept: null, desc: 'Master Production Ticket', statusId: 930 },
  { dept: null, desc: 'Tape Machine', statusId: 934 },
  { dept: null, desc: 'Digital Solutions', statusId: 950 },
  { dept: null, desc: 'Prototype Table 1', statusId: 957 },
  { dept: null, desc: 'Prototype Table 2', statusId: 716 },
  { dept: null, desc: 'Prototype Logojet/Stamping', statusId: 717 },
  { dept: null, desc: 'Not Scanned In', statusId: 9 },
  { dept: null, desc: 'Cancelled', statusId: 99 },
  { dept: null, desc: 'Accounting Hold', statusId: 400 },
  { dept: null, desc: 'Quality Control', statusId: 105 },
  { dept: null, desc: 'Lake Erie Graphics', statusId: 5 },
  { dept: null, desc: 'United Finishing', statusId: 6 },
  { dept: null, desc: 'Kevin Holowenko', statusId: 4 },
  { dept: '100 - Sales', desc: 'Cold Order', statusId: 101 },
  { dept: '102 - Office', desc: 'Peyton', statusId: 201 },
  { dept: '102 - Office', desc: 'Purchasing', statusId: 202 },
  { dept: '102 - Office', desc: 'Dawn L - Proof Out', statusId: 200 },
  { dept: '104 - Creative Services', desc: 'Megan Doctor', statusId: 300 },
  { dept: '104 - Creative Services', desc: 'Megan Doctor - Proof Out', statusId: 301 },
  { dept: '104 - Creative Services', desc: 'Kendra Taylor', statusId: 302 },
  { dept: '104 - Creative Services', desc: 'Kendra Taylor - Proof Out', statusId: 303 },
  { dept: '104 - Creative Services', desc: 'Hannah Barnes', statusId: 307 },
  { dept: '104 - Creative Services', desc: 'Hannah Barnes - Proof Out', statusId: 308 },
  { dept: '104 - Creative Services', desc: 'Abigail Muny', statusId: 309 },
  { dept: '104 - Creative Services', desc: 'Abigial Muny - Proof Out', statusId: 310 },
  { dept: '104 - Creative Services', desc: 'Lauren Laudato', statusId: 311 },
  { dept: '104 - Creative Services', desc: 'Lauren Laudato - Proof Out', statusId: 312 },
  { dept: '104 - Creative Services', desc: 'Pull Plate Inbox', statusId: 902 },
  { dept: '104 - Creative Services', desc: 'Prototype Completed', statusId: 313 },
  { dept: '104 - Creative Services', desc: 'Jenna Fioritto', statusId: 314 },
  { dept: '104 - Creative Services', desc: 'Jenna Fioritto - Proof Out', statusId: 315 },
  { dept: '104 - Creative Services', desc: 'Evan Markos', statusId: 316 },
  { dept: '104 - Creative Services', desc: 'Evan Markos - Proof Out', statusId: 317 },
  { dept: '104 - Creative Services', desc: 'Marissa Lee', statusId: 318 },
  { dept: '104 - Creative Services', desc: 'Marissa Lee - Proof Out', statusId: 319 },
  { dept: '104 - Creative Services', desc: 'Jordan Stephens', statusId: 935 },
  { dept: '104 - Creative Services', desc: 'Brittany Backus', statusId: 933 },
  { dept: '104 - Creative Services', desc: 'Colin Dunn', statusId: 938 },
  { dept: '104 - Creative Services', desc: 'Kaylee Compeli', statusId: 940 },
  { dept: '104 - Creative Services', desc: 'Sara Sandman', statusId: 942 },
  { dept: '104 - Creative Services', desc: 'Joe C - Proof Out', statusId: 960 },
  { dept: '104 - Creative Services', desc: 'Matt B - Proof Out', statusId: 961 },
  { dept: '104 - Creative Services', desc: 'Brittany B - Proof Out', statusId: 962 },
  { dept: '104 - Creative Services', desc: 'Sara S - Proof Out', statusId: 963 },
  { dept: '104 - Creative Services', desc: 'Jayne E - Proof Out', statusId: 965 },
  { dept: '104 - Creative Services', desc: 'Russell B - Proof Out', statusId: 966 },
  { dept: '104 - Creative Services', desc: 'Kaylee C - Proof Out', statusId: 968 },
  { dept: '104 - Creative Services', desc: 'Colin D - Proof Out', statusId: 970 },
  { dept: '104 - Creative Services', desc: 'Megan O - Proof Out', statusId: 972 },
  { dept: '104 - Creative Services', desc: 'Jordan S - Proof Out', statusId: 999 },
  { dept: '104 - Creative Services', desc: 'Russell', statusId: 905 },
  { dept: '104 - Creative Services', desc: 'Proofreading', statusId: 914 },
  { dept: '104 - Creative Services', desc: 'Art Hold', statusId: 915 },
  { dept: '104 - Creative Services', desc: 'Prototype Production', statusId: 916 },
  { dept: '104 - Creative Services', desc: 'Joe', statusId: 917 },
  { dept: '104 - Creative Services', desc: 'Matt B', statusId: 910 },
  { dept: '104 - Creative Services', desc: 'Healey', statusId: 911 },
  { dept: '104 - Creative Services', desc: 'Page Layout Allocation', statusId: 903 },
  { dept: '104 - Creative Services', desc: 'Megan', statusId: 921 },
  { dept: '104 - Creative Services', desc: 'Jayne', statusId: 906 },
  { dept: '104 - Creative Services', desc: 'Bindery Allocation', statusId: 901 },
  { dept: '104 - Creative Services', desc: 'Proof Out', statusId: 18 },
  { dept: '104 - Creative Services', desc: 'Final Proofreading', statusId: 304 },
  { dept: '106 - Accounting', desc: 'Accounting', statusId: 937 },
  { dept: '106 - Accounting', desc: '1/4 Round Corner Machine', statusId: 500 },
  { dept: '106 - Accounting', desc: '1/8 Round Corner Machine', statusId: 501 },
  { dept: '106 - Accounting', desc: 'Billed', statusId: 95 },
  { dept: '106 - Accounting', desc: 'No Charge', statusId: 96 },
  { dept: '107 - Press', desc: 'Bindery Coiling', statusId: 718 },
  { dept: '107 - Press', desc: 'Kristen M - Proof Out', statusId: 601 },
  { dept: '107 - Press', desc: 'Mike-Plated', statusId: 602 },
  { dept: '107 - Press', desc: 'Barry-Plated', statusId: 603 },
  { dept: '107 - Press', desc: 'David-Plated', statusId: 604 },
  { dept: '107 - Press', desc: 'Kristen M - Plated', statusId: 605 },
  { dept: '107 - Press', desc: 'Epson Printer', statusId: 606 },
  { dept: '107 - Press', desc: 'Jobs On Hold', statusId: 78 },
  { dept: '107 - Press', desc: 'Press Proof', statusId: 998 },
  { dept: '107 - Press', desc: 'Cutter/Pelz', statusId: 67 },
  { dept: '107 - Press', desc: 'Cutter 1', statusId: 70 },
  { dept: '107 - Press', desc: 'UV Cart/Digital room', statusId: 71 },
  { dept: '107 - Press', desc: 'Laminator', statusId: 75 },
  { dept: '107 - Press', desc: 'Laminating Cart/Digital Room', statusId: 77 },
  { dept: '107 - Press', desc: 'Digital', statusId: 918 },
  { dept: '107 - Press', desc: 'UV Press', statusId: 919 },
  { dept: '107 - Press', desc: 'UV Coating', statusId: 923 },
  { dept: '107 - Press', desc: 'Die Cutter', statusId: 65 },
  { dept: '107 - Press', desc: 'Duplo/Folder/Stitcher', statusId: 924 },
  { dept: '107 - Press', desc: 'Pelz Room', statusId: 925 },
  { dept: '107 - Press', desc: 'Tony Stetzik - Proof Out', statusId: 607 },
  { dept: '108 - Bindery', desc: 'Leather Ordered', statusId: 926 },
  { dept: '108 - Bindery', desc: 'Logo Decoration', statusId: 55 },
  { dept: '108 - Bindery', desc: 'To Be Figured', statusId: 25 },
  { dept: '108 - Bindery', desc: 'Bindery On Cart', statusId: 2 },
  { dept: '108 - Bindery', desc: 'Bindery Staging', statusId: 28 },
  { dept: '108 - Bindery', desc: 'BIP Fast Track', statusId: 974 },
  { dept: '108 - Bindery', desc: 'BIP Viscore', statusId: 975 },
  { dept: '108 - Bindery', desc: 'Woodshop Complete', statusId: 976 },
  { dept: '108 - Bindery', desc: 'BIP Glue Stamp', statusId: 977 },
  { dept: '108 - Bindery', desc: 'BIP Glue Logojet', statusId: 978 },
  { dept: '108 - Bindery', desc: 'BIP Viscore Logojet', statusId: 979 },
  { dept: '108 - Bindery', desc: 'BIP Finish Work', statusId: 980 },
  { dept: '108 - Bindery', desc: 'BIP Complex', statusId: 990 },
  { dept: '108 - Bindery', desc: 'Distro TBF', statusId: 936 },
  { dept: '108 - Bindery', desc: 'Ready for Preassembly', statusId: 720 },
  { dept: '108 - Bindery', desc: 'BIP Rowmark', statusId: 700 },
  { dept: '108 - Bindery', desc: 'BIP Litho', statusId: 701 },
  { dept: '108 - Bindery', desc: 'Pull Table', statusId: 702 },
  { dept: '108 - Bindery', desc: 'Material on Order', statusId: 703 },
  { dept: '108 - Bindery', desc: 'Bindery Sewing', statusId: 704 },
  { dept: '108 - Bindery', desc: 'Bindery Drilling', statusId: 705 },
  { dept: '108 - Bindery', desc: 'Bindery Diecutting', statusId: 706 },
  { dept: '108 - Bindery', desc: 'Table 1 - The Power Team', statusId: 707 },
  { dept: '108 - Bindery', desc: 'Table 2 - Double Trouble', statusId: 708 },
  { dept: '108 - Bindery', desc: 'Table 3 - Glue Lagoon', statusId: 709 },
  { dept: '108 - Bindery', desc: 'Table 4 - Stick em up', statusId: 710 },
  { dept: '108 - Bindery', desc: 'Table 5 - Viscor Vikings', statusId: 711 },
  { dept: '108 - Bindery', desc: 'Repair Jobs', statusId: 712 },
  { dept: '108 - Bindery', desc: 'Bindery Stock Release', statusId: 713 },
  { dept: '108 - Bindery', desc: 'Bindery Metal', statusId: 714 },
  { dept: '108 - Bindery', desc: 'Bindery Wrapped', statusId: 715 },
  { dept: '108 - Bindery', desc: 'Distro In Production', statusId: 953 },
  { dept: '108 - Bindery', desc: 'Bindery Finishing', statusId: 954 },
  { dept: '108 - Bindery', desc: 'Litho Complete', statusId: 721 },
  { dept: '108 - Bindery', desc: 'BIP - Material on Order', statusId: 722 },
  { dept: '108 - Bindery', desc: 'Bindery Preproduction Quality Check', statusId: 719 },
  { dept: '108 - Bindery', desc: 'Bindery PreProduction', statusId: 724 },
  { dept: '108 - Bindery', desc: 'Material Inventory Check', statusId: 725 },
  { dept: '108 - Bindery', desc: 'Ready for Production', statusId: 726 },
  { dept: '108 - Bindery', desc: 'Mimaki', statusId: 727 },
  { dept: '109 - Wood', desc: 'Woodshop Staining', statusId: 809 },
  { dept: '109 - Wood', desc: 'Woodshop Prototype', statusId: 801 },
  { dept: '109 - Wood', desc: 'Woodshop CNC', statusId: 802 },
  { dept: '109 - Wood', desc: 'Woodshop Laser', statusId: 803 },
  { dept: '109 - Wood', desc: 'Woodshop Sanding', statusId: 804 },
  { dept: '109 - Wood', desc: 'Woodshop Spray', statusId: 805 },
  { dept: '109 - Wood', desc: 'Woodshop Cleaning', statusId: 806 },
  { dept: '109 - Wood', desc: 'Woodshop Finishing', statusId: 807 },
  { dept: '109 - Wood', desc: 'Wood Shop', statusId: 800 },
  { dept: '109 - Wood', desc: 'Rubber Band Orders', statusId: 810 },
  { dept: '109 - Wood', desc: 'Woodshop Check-Out', statusId: 808 },
  { dept: '110 - Pre Press', desc: 'Pre-Press', statusId: 20 },
  { dept: '110 - Pre Press', desc: 'Mix Master Mike Proof Out', statusId: 909 },
  { dept: '110 - Pre Press', desc: 'Money Mitch Proof Out', statusId: 908 },
  { dept: '110 - Pre Press', desc: 'Da Barons Proof Out', statusId: 913 },
  { dept: '110 - Pre Press', desc: 'Prepress Hold', statusId: 922 },
  { dept: '110 - Pre Press', desc: 'Paper on Order', statusId: 927 },
  { dept: '110 - Pre Press', desc: 'Plated', statusId: 920 },
  { dept: '110 - Pre Press', desc: 'DJ Skittles Proof Out', statusId: 931 },
  { dept: '110 - Pre Press', desc: 'Bindery Quality Check', statusId: 723 },
  { dept: '112 - Shipping', desc: 'St Clair Warehouse', statusId: 102 },
  { dept: '112 - Shipping', desc: 'Shipping - Hold CSR', statusId: 103 },
  { dept: '112 - Shipping', desc: 'Shipping - Hold Partial Order', statusId: 104 },
  { dept: '112 - Shipping', desc: 'Shipping', statusId: 3 },
  { dept: '112 - Shipping', desc: 'Shipping Inventory Release', statusId: 81 },
  { dept: '112 - Shipping', desc: 'Shipping Inventory', statusId: 100 },
  { dept: '112 - Shipping', desc: 'Secondary Shipping', statusId: 80 },
  { dept: '112 - Shipping', desc: 'Shipping Priority', statusId: 973 },
  { dept: '112 - Shipping', desc: 'Shipped', statusId: 85 },
];

// Fast lookup: scan location description → department description (or null)
const DEPT_BY_LOCATION = {};
LOCATIONS.forEach(l => { DEPT_BY_LOCATION[l.desc] = l.dept; });

// Short, pill-friendly labels for each department
const DEPT_SHORT_NAME = {
  '100 - Sales':              'Sales',
  '102 - Office':             'Office',
  '104 - Creative Services':  'Creative Services',
  '106 - Accounting':         'Accounting',
  '107 - Press':              'Press',
  '108 - Bindery':            'Bindery',
  '109 - Wood':               'Woodshop',
  '110 - Pre Press':          'Pre-Press',
  '112 - Shipping':           'Shipping',
};
const UNASSIGNED_DEPT = 'Unassigned';

function deptOf(locationDesc) {
  return DEPT_BY_LOCATION[locationDesc] || null;
}
function deptLabel(deptDesc) {
  if (!deptDesc) return UNASSIGNED_DEPT;
  return DEPT_SHORT_NAME[deptDesc] || deptDesc;
}

// ── People whose dashboard is driven by a personal scan location ──
// (their name — or a shorthand of it — is itself a stop in job_locations)
const PEOPLE = [
  { name: 'Megan Doctor',    locations: [
    { label: 'Working',    desc: 'Megan Doctor' },
    { label: 'Proof Out',  desc: 'Megan Doctor - Proof Out' },
  ]},
  { name: 'Kendra Taylor',   locations: [
    { label: 'Working',    desc: 'Kendra Taylor' },
    { label: 'Proof Out',  desc: 'Kendra Taylor - Proof Out' },
  ]},
  { name: 'Hannah Barnes',   locations: [
    { label: 'Working',    desc: 'Hannah Barnes' },
    { label: 'Proof Out',  desc: 'Hannah Barnes - Proof Out' },
  ]},
  { name: 'Abigail Muny',    locations: [
    { label: 'Working',    desc: 'Abigail Muny' },
    { label: 'Proof Out',  desc: 'Abigial Muny - Proof Out' },
  ]},
  { name: 'Lauren Laudato',  locations: [
    { label: 'Working',    desc: 'Lauren Laudato' },
    { label: 'Proof Out',  desc: 'Lauren Laudato - Proof Out' },
  ]},
  { name: 'Jenna Fioritto',  locations: [
    { label: 'Working',    desc: 'Jenna Fioritto' },
    { label: 'Proof Out',  desc: 'Jenna Fioritto - Proof Out' },
  ]},
  { name: 'Evan Markos',     locations: [
    { label: 'Working',    desc: 'Evan Markos' },
    { label: 'Proof Out',  desc: 'Evan Markos - Proof Out' },
  ]},
  { name: 'Marissa Lee',     locations: [
    { label: 'Working',    desc: 'Marissa Lee' },
    { label: 'Proof Out',  desc: 'Marissa Lee - Proof Out' },
  ]},
  { name: 'Colin Dunn',      locations: [
    { label: 'Working',    desc: 'Colin Dunn' },
    { label: 'Proof Out',  desc: 'Colin D - Proof Out' },
  ]},
  { name: 'Brittany Backus', locations: [
    { label: 'Working',    desc: 'Brittany Backus' },
    { label: 'Proof Out',  desc: 'Brittany B - Proof Out' },
  ]},
  { name: 'Kaylee Compeli',  locations: [
    { label: 'Working',    desc: 'Kaylee Compeli' },
    { label: 'Proof Out',  desc: 'Kaylee C - Proof Out' },
  ]},
  { name: 'Sara Sandman',    locations: [
    { label: 'Working',    desc: 'Sara Sandman' },
    { label: 'Proof Out',  desc: 'Sara S - Proof Out' },
  ]},
  { name: 'Jordan Stephens', locations: [
    { label: 'Working',    desc: 'Jordan Stephens' },
    { label: 'Proof Out',  desc: 'Jordan S - Proof Out' },
  ]},
  { name: 'Kristen M',       locations: [
    { label: 'Proof Out',  desc: 'Kristen M - Proof Out' },
    { label: 'Plated',     desc: 'Kristen M - Plated' },
  ]},
  { name: 'Mike',            locations: [
    { label: 'Plated',     desc: 'Mike-Plated' },
  ]},
  { name: 'Barry',           locations: [
    { label: 'Plated',     desc: 'Barry-Plated' },
  ]},
  { name: 'David',           locations: [
    { label: 'Plated',     desc: 'David-Plated' },
  ]},
  { name: 'Tony Stetzik',    locations: [
    { label: 'Proof Out',  desc: 'Tony Stetzik - Proof Out' },
  ]},
];
// Each person's department is derived from their own scan location.
PEOPLE.forEach(p => {
  p.dept = deptOf(p.locations[0].desc);
  p.deptLabel = deptLabel(p.dept);
});

// ── Departments that get one shared board ──
// Pills are derived from LOCATIONS, so every location in the department is
// represented — including stops owned by a named individual, since a
// department lead needs to see those jobs too.
const DEPT_BOARD_ORDER = [
  '108 - Bindery',
  '109 - Wood',
  '107 - Press',
  '110 - Pre Press',
  '112 - Shipping',
  '106 - Accounting',
  '104 - Creative Services',
];
const DEPARTMENTS = DEPT_BOARD_ORDER.map(desc => ({
  desc,
  label: deptLabel(desc),
  locations: LOCATIONS.filter(l => l.dept === desc),
}));

// ── Sales reps and the client accounts they carry ──
const SALES_REPS = [
  { name: 'Jordan Reyes', clients: [
    'Marriott International — The Marriott Cleveland Downtown',
    'Marriott International — The Ritz-Carlton Key Biscayne',
    'Boyd Gaming — The Orleans',
  ]},
  { name: 'Casey Malone', clients: [
    'Live! Hospitality — Live! Casino Philadelphia',
    'Quaker Steak & Lube — Corporate',
    'Top Golf — Independence',
  ]},
  { name: 'Priya Nair', clients: [
    'True Food Kitchen — Corporate',
    'Cinepolis — Cinepolis Luxury Cinemas',
    "Keke's — Franchise Group East",
  ]},
];

const PROD_TYPES = ['Bindery', 'Printing', 'Paper', 'PDF Only', 'Woodshop Only', 'Menu Hardware'];
const JOB_TYPES  = ['New Job', 'Rerun w/ Changes', 'Pull-Plate', 'Inventory Release', 'Replacement Ticket'];

function pick(arr, i) { return arr[i % arr.length]; }

const JOB_DESCRIPTIONS = [
  'Dinner Menu — Spring Refresh', 'Wine List — Revised Covers', 'Banquet Event Order — Q2 Template',
  'Leather Menu Covers — 8.5×11 — Qty 120', 'Room Service Insert — Holiday Edition',
  'Wooden Menu Board — Lobby Display', 'Two Panel Aluminum Cover With 4 Views', 'Breakfast Menu — Weekday',
  'Poolside Menu — Laminated', 'Kids Menu — Activity Back', 'Banquet Menu — Plated Dinner',
  'Cocktail List — Seasonal', 'Room Service Door Hanger', 'In-Room Dining Menu — Refresh',
  'Dessert Menu — Insert Card', 'Catering Menu — Corporate Package', 'Happy Hour Menu — Table Tent',
  'Brunch Menu — Weekend', 'Wine Spiral — Reprint', 'Menu Cover — Stitched Leather',
  'Banquet Order Form — Revised', 'Digital Menu Board Artwork', 'Takeout Menu — Trifold',
  'VIP Menu — Gold Foil Cover', 'Bar Menu — Laminated Insert', 'Event Signage — A-Frame',
  'Chalkboard Menu Insert', 'Private Dining Menu — Custom Cover', 'Allergen Card — Reprint',
  'Kids Placemat — Activity', 'Wine List Holder — Wood', 'Loyalty Card Insert',
  'Seasonal Cover Wrap', 'Table Tent — Specials', 'Menu Binder — Refill Pages',
];

// ── Master job list ──
// Every job sits at exactly one current scan location. That location alone
// determines the job's department (via DEPT_BY_LOCATION) and which
// dashboards/pills it appears under. Client + rep drive the Sales view.
const JOBS = [];
let jobCounter = 118400;

function addJob({ locationDesc, person = null, client = null, rep = null }) {
  jobCounter -= (3 + (jobCounter % 5));
  const i = JOBS.length;
  const daysAgo = 1 + (i * 3) % 60;
  const date = new Date(2026, 7, 12); // fixed "today" for this prototype (Aug 12, 2026)
  date.setDate(date.getDate() - daysAgo);
  const dateStr = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();

  let repName = rep, clientName = client;
  if (!repName) {
    const r = pick(SALES_REPS, i);
    repName = r.name;
    // Different stride than the rep pick so each rep's clients actually
    // rotate instead of every job landing on client[0].
    clientName = client || pick(r.clients, Math.floor(i / SALES_REPS.length) + i);
  }

  const dept = deptOf(locationDesc);

  JOBS.push({
    job: jobCounter,
    desc: pick(JOB_DESCRIPTIONS, i),
    client: clientName,
    rep: repName,
    location: locationDesc,
    statusId: (LOCATIONS.find(l => l.desc === locationDesc) || {}).statusId,
    dept,                          // canonical, e.g. '108 - Bindery' or null
    deptLabel: deptLabel(dept),    // pill-friendly, e.g. 'Bindery' / 'Unassigned'
    person: person ? person.name : null,
    prodType: pick(PROD_TYPES, i),
    jobType: pick(JOB_TYPES, i + 1),
    date: dateStr,
  });
}

// 1-3 jobs at each person's own location(s)
PEOPLE.forEach((p, pi) => {
  p.locations.forEach((loc, li) => {
    const count = 1 + ((pi + li) % 3);
    for (let k = 0; k < count; k++) addJob({ locationDesc: loc.desc, person: p });
  });
});

// Jobs spread across the shared department queues. Only a slice of each
// department's locations gets seeded so the pill row shows a realistic mix
// of busy and empty stops.
DEPARTMENTS.forEach((d, di) => {
  d.locations.forEach((loc, li) => {
    if (li % 3 === 2) return;                 // leave roughly a third empty
    const count = (di + li) % 4 === 0 ? 2 : 1;
    for (let k = 0; k < count; k++) addJob({ locationDesc: loc.desc });
  });
});

// A few jobs at department-less stops, so 'Unassigned' is represented
SALES_REPS.forEach((rep, ri) => {
  rep.clients.forEach((client, ci) => {
    addJob({ locationDesc: 'In Production', client, rep: rep.name });
    if ((ri + ci) % 2 === 0) addJob({ locationDesc: 'Outside Services', client, rep: rep.name });
  });
});
