/**
 * Mock data for the Active Jobs Dashboards exploration.
 * ─────────────────────────────────────────────────────────────
 * This is INVENTED data for prototyping only. It's shaped the way
 * job_locations.xlsx is shaped (department → scan location → status id)
 * plus a plausible job/client/rep layer on top, since job_locations
 * itself has no job records.
 *
 * Real integration would replace JOBS with a live feed keyed off the
 * same LOCATION_DESC / JOB_STATUS_ID values used here.
 */

// ── People whose dashboard is driven by a personal scan location ──
// (their name — or a shorthand of it — is itself a stop in job_locations)
const PEOPLE = [
  { name: 'Megan Doctor',    dept: 'Creative Services', locations: [
    { label: 'Working',    desc: 'Megan Doctor',              statusId: 300 },
    { label: 'Proof Out',  desc: 'Megan Doctor - Proof Out',  statusId: 301 },
  ]},
  { name: 'Kendra Taylor',   dept: 'Creative Services', locations: [
    { label: 'Working',    desc: 'Kendra Taylor',             statusId: 302 },
    { label: 'Proof Out',  desc: 'Kendra Taylor - Proof Out', statusId: 303 },
  ]},
  { name: 'Hannah Barnes',   dept: 'Creative Services', locations: [
    { label: 'Working',    desc: 'Hannah Barnes',             statusId: 307 },
    { label: 'Proof Out',  desc: 'Hannah Barnes - Proof Out', statusId: 308 },
  ]},
  { name: 'Abigail Muny',    dept: 'Creative Services', locations: [
    { label: 'Working',    desc: 'Abigail Muny',              statusId: 309 },
    { label: 'Proof Out',  desc: 'Abigial Muny - Proof Out',  statusId: 310 },
  ]},
  { name: 'Lauren Laudato',  dept: 'Creative Services', locations: [
    { label: 'Working',    desc: 'Lauren Laudato',            statusId: 311 },
    { label: 'Proof Out',  desc: 'Lauren Laudato - Proof Out',statusId: 312 },
  ]},
  { name: 'Jenna Fioritto',  dept: 'Creative Services', locations: [
    { label: 'Working',    desc: 'Jenna Fioritto',            statusId: 314 },
    { label: 'Proof Out',  desc: 'Jenna Fioritto - Proof Out',statusId: 315 },
  ]},
  { name: 'Evan Markos',     dept: 'Creative Services', locations: [
    { label: 'Working',    desc: 'Evan Markos',               statusId: 316 },
    { label: 'Proof Out',  desc: 'Evan Markos - Proof Out',   statusId: 317 },
  ]},
  { name: 'Marissa Lee',     dept: 'Creative Services', locations: [
    { label: 'Working',    desc: 'Marissa Lee',               statusId: 318 },
    { label: 'Proof Out',  desc: 'Marissa Lee - Proof Out',   statusId: 319 },
  ]},
  { name: 'Colin Dunn',      dept: 'Creative Services', locations: [
    { label: 'Working',    desc: 'Colin Dunn',                statusId: 938 },
    { label: 'Proof Out',  desc: 'Colin D - Proof Out',       statusId: 970 },
  ]},
  { name: 'Brittany Backus', dept: 'Creative Services', locations: [
    { label: 'Working',    desc: 'Brittany Backus',           statusId: 933 },
    { label: 'Proof Out',  desc: 'Brittany B - Proof Out',    statusId: 962 },
  ]},
  { name: 'Kaylee Compeli',  dept: 'Creative Services', locations: [
    { label: 'Working',    desc: 'Kaylee Compeli',            statusId: 940 },
    { label: 'Proof Out',  desc: 'Kaylee C - Proof Out',      statusId: 968 },
  ]},
  { name: 'Sara Sandman',    dept: 'Creative Services', locations: [
    { label: 'Working',    desc: 'Sara Sandman',              statusId: 942 },
    { label: 'Proof Out',  desc: 'Sara S - Proof Out',        statusId: 963 },
  ]},
  { name: 'Jordan Stephens', dept: 'Creative Services', locations: [
    { label: 'Working',    desc: 'Jordan Stephens',           statusId: 935 },
    { label: 'Proof Out',  desc: 'Jordan S - Proof Out',      statusId: 999 },
  ]},
  { name: 'Kristen M',       dept: 'Press', locations: [
    { label: 'Proof Out',  desc: 'Kristen M - Proof Out',     statusId: 601 },
    { label: 'Plated',     desc: 'Kristen M - Plated',        statusId: 605 },
  ]},
  { name: 'Mike',            dept: 'Press', locations: [
    { label: 'Plated',     desc: 'Mike-Plated',               statusId: 602 },
  ]},
  { name: 'Barry',           dept: 'Press', locations: [
    { label: 'Plated',     desc: 'Barry-Plated',              statusId: 603 },
  ]},
  { name: 'David',           dept: 'Press', locations: [
    { label: 'Plated',     desc: 'David-Plated',              statusId: 604 },
  ]},
  { name: 'Tony Stetzik',    dept: 'Press', locations: [
    { label: 'Proof Out',  desc: 'Tony Stetzik - Proof Out',  statusId: 607 },
  ]},
];

// ── Departments whose dashboard is one shared board with many status pills ──
const DEPARTMENTS = [
  { id: 7, desc: '108 - Bindery', locations: [
    { desc: 'Bindery On Cart',         statusId: 2 },
    { desc: 'Bindery Staging',         statusId: 28 },
    { desc: 'BIP Fast Track',          statusId: 974 },
    { desc: 'BIP Viscore',             statusId: 975 },
    { desc: 'BIP Glue Stamp',          statusId: 977 },
    { desc: 'BIP Finish Work',         statusId: 980 },
    { desc: 'Bindery Sewing',          statusId: 704 },
    { desc: 'Bindery Diecutting',      statusId: 706 },
    { desc: 'Bindery Preproduction Quality Check', statusId: 719 },
    { desc: 'Ready for Production',    statusId: 726 },
    { desc: 'Distro In Production',    statusId: 953 },
    { desc: 'Bindery Finishing',       statusId: 954 },
  ]},
  { id: 8, desc: '109 - Wood', locations: [
    { desc: 'Woodshop Prototype', statusId: 801 },
    { desc: 'Woodshop CNC',       statusId: 802 },
    { desc: 'Woodshop Laser',     statusId: 803 },
    { desc: 'Woodshop Sanding',   statusId: 804 },
    { desc: 'Woodshop Spray',     statusId: 805 },
    { desc: 'Woodshop Cleaning',  statusId: 806 },
    { desc: 'Woodshop Finishing', statusId: 807 },
    { desc: 'Woodshop Check-Out', statusId: 808 },
    { desc: 'Woodshop Staining',  statusId: 809 },
  ]},
  { id: 6, desc: '107 - Press', locations: [
    { desc: 'Jobs On Hold',              statusId: 78 },
    { desc: 'Press Proof',               statusId: 998 },
    { desc: 'Cutter/Pelz',               statusId: 67 },
    { desc: 'Cutter 1',                  statusId: 70 },
    { desc: 'UV Cart/Digital room',      statusId: 71 },
    { desc: 'Laminator',                 statusId: 75 },
    { desc: 'Digital',                   statusId: 918 },
    { desc: 'UV Press',                  statusId: 919 },
    { desc: 'UV Coating',                statusId: 923 },
    { desc: 'Die Cutter',                statusId: 65 },
    { desc: 'Duplo/Folder/Stitcher',     statusId: 924 },
    { desc: 'Pelz Room',                 statusId: 925 },
  ]},
  { id: 9, desc: '110 - Pre Press', locations: [
    { desc: 'Pre-Press',              statusId: 20 },
    { desc: 'Prepress Hold',          statusId: 922 },
    { desc: 'Paper on Order',         statusId: 927 },
    { desc: 'Plated',                 statusId: 920 },
    { desc: 'Bindery Quality Check',  statusId: 723 },
  ]},
  { id: 10, desc: '112 - Shipping', locations: [
    { desc: 'St Clair Warehouse',            statusId: 102 },
    { desc: 'Shipping',                      statusId: 3 },
    { desc: 'Shipping Inventory Release',    statusId: 81 },
    { desc: 'Shipping Inventory',            statusId: 100 },
    { desc: 'Secondary Shipping',            statusId: 80 },
    { desc: 'Shipping Priority',             statusId: 973 },
    { desc: 'Shipped',                       statusId: 85 },
  ]},
  { id: 5, desc: '106 - Accounting', locations: [
    { desc: 'Accounting', statusId: 937 },
    { desc: 'Billed',     statusId: 95 },
    { desc: 'No Charge',  statusId: 96 },
  ]},
];

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

// ── Master job list ──
// Every job sits at exactly one current scan location, which is what
// drives which pill(s)/dashboard(s) it shows up under. Every job also
// belongs to a client + rep, which is what drives the Sales dashboard.
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

const JOBS = [];
let jobCounter = 118400;

function addJob({ person = null, deptEntry = null, location = null, client = null, rep = null }) {
  jobCounter -= (3 + (jobCounter % 5));
  const i = JOBS.length;
  const desc = pick(JOB_DESCRIPTIONS, i);
  const daysAgo = 1 + (i * 3) % 60;
  const date = new Date(2026, 7, 12); // fixed "today" for this prototype (Aug 12, 2026)
  date.setDate(date.getDate() - daysAgo);
  const dateStr = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();

  let repName = rep, clientName = client;
  if (!repName) {
    const r = pick(SALES_REPS, i);
    repName = r.name;
    // Use a different stride than the rep pick so each rep's clients
    // actually rotate instead of every job landing on client[0].
    clientName = client || pick(r.clients, Math.floor(i / SALES_REPS.length) + i);
  }

  JOBS.push({
    job: jobCounter,
    desc,
    client: clientName,
    rep: repName,
    prodType: pick(PROD_TYPES, i),
    jobType: pick(JOB_TYPES, i + 1),
    dept: deptEntry ? deptEntry.deptDesc : (person ? person.dept : null),
    location: location.desc,
    statusId: location.statusId,
    person: person ? person.name : null,
    date: dateStr,
  });
}

// Seed 2-4 jobs at each person's location(s)
PEOPLE.forEach((p, pi) => {
  p.locations.forEach((loc, li) => {
    const count = 1 + ((pi + li) % 3); // 1-3 jobs per location
    for (let k = 0; k < count; k++) {
      addJob({ person: p, location: loc });
    }
  });
});

// Seed 2-5 jobs at each department location
DEPARTMENTS.forEach((d, di) => {
  d.locations.forEach((loc, li) => {
    const count = (di + li) % 3 === 0 ? 2 : 1; // most get 1, some get 2
    for (let k = 0; k < count; k++) {
      addJob({ deptEntry: { deptDesc: d.desc }, location: loc });
    }
  });
});

// A few extra jobs sitting "in production" generally, for sales-only variety
SALES_REPS.forEach((rep, ri) => {
  rep.clients.forEach((client, ci) => {
    addJob({
      location: { desc: 'In Production', statusId: 45 },
      client, rep: rep.name,
    });
    if ((ri + ci) % 2 === 0) {
      addJob({ location: { desc: 'Shipped', statusId: 85 }, client, rep: rep.name });
    }
  });
});
