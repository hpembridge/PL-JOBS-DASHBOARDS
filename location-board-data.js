/**
 * Location Board — mock data
 * ─────────────────────────────────────────────────────────────
 * LOCATIONS is the real contents of Loc_tab.xlsx (177 rows), trimmed to
 * the columns the board needs:
 *   id        LOCATION_ID
 *   name      LOCATION_DESC
 *   code      LOCATION_NUM (scanner barcode value)
 *   deptId    DEPARTMENT_ID (null where the source says NULL)
 *   statusId  JOB_STATUS_ID
 *   locked    HideLocationFromScannerFlg === 1 → column can't be dropped onto
 *
 * Source clean-up, flagged rather than silently fixed in the database:
 *   • id 46 "Outside Services" — LOCATION_NUM came through Excel as 4e+44;
 *     restored here as '4E44'.
 *   • id 111 "Laminator" — trailing non-breaking space removed.
 *   • Duplicate names with different ids (Secondary Shipping 37/81, the four
 *     DJ/Mitch/Mike/Barons Proof Outs) are kept as separate locations.
 *
 * Everything else — JOBS, notes, details, time entries, VIEWS — is
 * INVENTED for the prototype. In Angular these come from the API.
 */

/* Department names are NOT in Loc_tab.xlsx — only DEPARTMENT_ID. These
   are matched by hand against the department names in mock-data.js.
   5, 12, -7 and -1 have no confident match and show as "Dept <id>" /
   "No department". Confirm before build. */
const DEPARTMENTS = {
  1:  'Sales',
  2:  'Office',
  3:  'Creative Services',
  4:  'Accounting',
  6:  'Press',
  7:  'Bindery',
  8:  'Woodshop',
  9:  'Pre-Press',
  10: 'Shipping',
};

const LOCATIONS = [
  { id: 1, name: "Bindery Allocation", code: 'AAAA', deptId: 3, statusId: 901, locked: false },
  { id: 2, name: "Proof Out", code: 'CCCC', deptId: 12, statusId: 18, locked: false },
  { id: 4, name: "Pre-Press", code: 'VVVV', deptId: 9, statusId: 20, locked: true },
  { id: 9, name: "To Be Figured", code: 'PPPP', deptId: 7, statusId: 25, locked: true },
  { id: 10, name: "In Production", code: 'QQQQ', deptId: 6, statusId: 45, locked: true },
  { id: 11, name: "Bindery On Cart", code: 'RRRR', deptId: 7, statusId: 2, locked: true },
  { id: 12, name: "Bindery Staging", code: 'SSSS', deptId: 7, statusId: 28, locked: true },
  { id: 13, name: "Mix Master Mike Proof Out", code: 'TTTT', deptId: 9, statusId: 909, locked: true },
  { id: 14, name: "Wood Shop", code: 'UUUU', deptId: 8, statusId: 800, locked: true },
  { id: 23, name: "Page Layout Allocation", code: 'BBBB', deptId: 3, statusId: 903, locked: false },
  { id: 25, name: "Megan", code: 'DDDD', deptId: 3, statusId: 921, locked: true },
  { id: 26, name: "Jayne", code: 'EEEE', deptId: 3, statusId: 906, locked: false },
  { id: 28, name: "Money Mitch Proof Out", code: 'GGGG', deptId: 9, statusId: 908, locked: true },
  { id: 29, name: "Logo Decoration", code: 'HHHH', deptId: 7, statusId: 55, locked: true },
  { id: 30, name: "Matt B", code: 'IIII', deptId: 3, statusId: 910, locked: false },
  { id: 31, name: "Healey", code: 'JJJJ', deptId: -1, statusId: 911, locked: false },
  { id: 32, name: "Prototype Out", code: 'KKKK', deptId: -1, statusId: 912, locked: true },
  { id: 33, name: "Da Barons Proof Out", code: 'LLLL', deptId: -1, statusId: 913, locked: true },
  { id: 34, name: "Proofreading", code: 'MMMM', deptId: -1, statusId: 914, locked: false },
  { id: 35, name: "Art Hold", code: 'NNNN', deptId: -1, statusId: 915, locked: false },
  { id: 36, name: "Prototype Production", code: 'OOOO', deptId: 7, statusId: 916, locked: true },
  { id: 37, name: "Secondary Shipping", code: 'WWWW', deptId: -1, statusId: 80, locked: true },
  { id: 38, name: "Joe", code: 'XXXX', deptId: -1, statusId: 917, locked: false },
  { id: 39, name: "Digital", code: 'YYYY', deptId: -1, statusId: 918, locked: true },
  { id: 40, name: "UV Press", code: 'ZZZZ', deptId: -1, statusId: 919, locked: true },
  { id: 42, name: "Plated", code: 'AB12', deptId: -1, statusId: 920, locked: true },
  { id: 43, name: "Russell", code: '1B11', deptId: -1, statusId: 905, locked: false },
  { id: 44, name: "Prepress Hold", code: '2C22', deptId: -1, statusId: 922, locked: true },
  { id: 45, name: "UV Coating", code: '3D33', deptId: -1, statusId: 923, locked: true },
  { id: 46, name: "Outside Services", code: '4E44', deptId: -1, statusId: 1, locked: false },
  { id: 47, name: "Die Cutter", code: '5F55', deptId: -1, statusId: 65, locked: true },
  { id: 48, name: "Duplo/Folder/Stitcher", code: '6G66', deptId: -1, statusId: 924, locked: true },
  { id: 49, name: "Pelz Room", code: '7H77', deptId: -1, statusId: 925, locked: true },
  { id: 50, name: "Leather Ordered", code: '8I88', deptId: 7, statusId: 926, locked: true },
  { id: 51, name: "Paper on Order", code: '9J99', deptId: -1, statusId: 927, locked: true },
  { id: 56, name: "Master Production Ticket", code: 'A1A1', deptId: -1, statusId: 930, locked: false },
  { id: 57, name: "DJ Skittles Proof Out", code: 'B1B1', deptId: -1, statusId: 931, locked: true },
  { id: 59, name: "Brittany Backus", code: 'D1D1', deptId: -1, statusId: 933, locked: false },
  { id: 60, name: "Tape Machine", code: 'E1E1', deptId: -1, statusId: 934, locked: true },
  { id: 61, name: "Jordan Stephens", code: 'F1F1', deptId: -1, statusId: 935, locked: false },
  { id: 62, name: "Distro TBF", code: 'G1G1', deptId: 7, statusId: 936, locked: true },
  { id: 63, name: "Accounting", code: 'H1H1', deptId: -1, statusId: 937, locked: false },
  { id: 64, name: "Colin Dunn", code: 'I1I1', deptId: -1, statusId: 938, locked: false },
  { id: 66, name: "Kaylee Compeli", code: 'K1K1', deptId: -1, statusId: 940, locked: false },
  { id: 68, name: "Sara Sandman", code: 'M1M1', deptId: -1, statusId: 942, locked: false },
  { id: 69, name: "Digital Solutions", code: 'N1N1', deptId: -1, statusId: 950, locked: false },
  { id: 70, name: "Shipping", code: 'O1O1', deptId: -1, statusId: 3, locked: true },
  { id: 71, name: "Shipping Inventory Release", code: 'P1P1', deptId: -1, statusId: 81, locked: true },
  { id: 72, name: "Distro In Production", code: 'Q1Q1', deptId: 7, statusId: 953, locked: true },
  { id: 76, name: "Bindery Finishing", code: 'R1R1', deptId: 7, statusId: 954, locked: true },
  { id: 77, name: "Woodshop Prototype", code: 'S1S1', deptId: -1, statusId: 801, locked: true },
  { id: 81, name: "Secondary Shipping", code: 'W1W1', deptId: -1, statusId: 80, locked: true },
  { id: 83, name: "Joe C - Proof Out", code: 'Z1Z1', deptId: -1, statusId: 960, locked: false },
  { id: 84, name: "Matt B - Proof Out", code: 'A2A2', deptId: -1, statusId: 961, locked: false },
  { id: 85, name: "Brittany B - Proof Out", code: 'B2B2', deptId: -1, statusId: 962, locked: false },
  { id: 86, name: "Sara S - Proof Out", code: 'C2C2', deptId: -1, statusId: 963, locked: false },
  { id: 88, name: "Jayne E - Proof Out", code: 'E2E2', deptId: -1, statusId: 965, locked: false },
  { id: 89, name: "Russell B - Proof Out", code: 'F2F2', deptId: -1, statusId: 966, locked: false },
  { id: 91, name: "Kaylee C - Proof Out", code: 'H2H2', deptId: -1, statusId: 968, locked: false },
  { id: 93, name: "Colin D - Proof Out", code: 'J2J2', deptId: -1, statusId: 970, locked: false },
  { id: 95, name: "Megan O - Proof Out", code: 'L2L2', deptId: -1, statusId: 972, locked: true },
  { id: 96, name: "Shipping Priority", code: 'M2M2', deptId: -1, statusId: 973, locked: true },
  { id: 97, name: "Shipped", code: 'N2N2', deptId: -1, statusId: 85, locked: true },
  { id: 98, name: "BIP Fast Track", code: 'O2O2', deptId: 7, statusId: 974, locked: true },
  { id: 99, name: "BIP Viscore", code: 'P2P2', deptId: 7, statusId: 975, locked: true },
  { id: 100, name: "Woodshop Complete", code: 'Q2Q2', deptId: 7, statusId: 976, locked: true },
  { id: 101, name: "BIP Glue Stamp", code: 'R2R2', deptId: 7, statusId: 977, locked: true },
  { id: 102, name: "BIP Glue Logojet", code: 'S2S2', deptId: 7, statusId: 978, locked: true },
  { id: 103, name: "BIP Viscore Logojet", code: 'T2T2', deptId: 7, statusId: 979, locked: true },
  { id: 104, name: "BIP Finish Work", code: 'U2U2', deptId: 7, statusId: 980, locked: true },
  { id: 105, name: "BIP Complex", code: 'V2V2', deptId: 7, statusId: 990, locked: true },
  { id: 106, name: "Press Proof", code: 'W2W2', deptId: -1, statusId: 998, locked: true },
  { id: 107, name: "Jordan S - Proof Out", code: 'X2X2', deptId: -1, statusId: 999, locked: false },
  { id: 108, name: "Cutter/Pelz", code: 'Y2Y2', deptId: -1, statusId: 67, locked: true },
  { id: 109, name: "Cutter 1", code: 'Z2Z2', deptId: -1, statusId: 70, locked: true },
  { id: 110, name: "UV Cart/Digital room", code: 'A3A3', deptId: -1, statusId: 71, locked: true },
  { id: 111, name: "Laminator", code: 'B3B3', deptId: -1, statusId: 75, locked: true },
  { id: 112, name: "Laminating Cart/Digital Room", code: 'C3C3', deptId: -1, statusId: 77, locked: true },
  { id: 113, name: "Money Mitch Proof Out", code: 'D3D3', deptId: 9, statusId: 908, locked: true },
  { id: 114, name: "Mix Master Mike Proof Out", code: 'E3E3', deptId: 9, statusId: 909, locked: true },
  { id: 115, name: "Da Barons Proof Out", code: 'F3F3', deptId: 9, statusId: 913, locked: true },
  { id: 116, name: "DJ Skittles Proof Out", code: 'G3G3', deptId: 9, statusId: 931, locked: true },
  { id: 117, name: "Jobs On Hold", code: 'H3H3', deptId: 6, statusId: 78, locked: false },
  { id: 118, name: "BIP Rowmark", code: 'I3I3', deptId: 7, statusId: 700, locked: true },
  { id: 119, name: "BIP Litho", code: 'J3J3', deptId: 7, statusId: 701, locked: true },
  { id: 120, name: "Pull Table", code: 'K3K3', deptId: 7, statusId: 702, locked: true },
  { id: 121, name: "Material on Order", code: 'L3L3', deptId: 7, statusId: 703, locked: true },
  { id: 122, name: "Bindery Sewing", code: 'M3M3', deptId: 7, statusId: 704, locked: true },
  { id: 123, name: "Bindery Drilling", code: 'N3N3', deptId: 7, statusId: 705, locked: true },
  { id: 124, name: "Bindery Diecutting", code: 'O3O3', deptId: 7, statusId: 706, locked: true },
  { id: 125, name: "Table 1 - The Power Team", code: 'P3P3', deptId: 7, statusId: 707, locked: true },
  { id: 126, name: "Table 2 - Double Trouble", code: 'Q3Q3', deptId: 7, statusId: 708, locked: true },
  { id: 127, name: "Table 3 - Glue Lagoon", code: 'R3R3', deptId: 7, statusId: 709, locked: true },
  { id: 128, name: "Table 4 - Stick em up", code: 'S3S3', deptId: 7, statusId: 710, locked: true },
  { id: 129, name: "Table 5 - Viscor Vikings", code: 'T3T3', deptId: 7, statusId: 711, locked: true },
  { id: 130, name: "Repair Jobs", code: 'U3U3', deptId: 7, statusId: 712, locked: true },
  { id: 131, name: "Megan Doctor", code: 'V3V3', deptId: 3, statusId: 300, locked: false },
  { id: 132, name: "Megan Doctor - Proof Out", code: 'W3W3', deptId: 3, statusId: 301, locked: false },
  { id: 133, name: "Kendra Taylor", code: 'X3X3', deptId: 3, statusId: 302, locked: false },
  { id: 134, name: "Kendra Taylor - Proof Out", code: 'Y3Y3', deptId: 3, statusId: 303, locked: false },
  { id: 135, name: "Bindery Stock Release", code: 'Z3Z3', deptId: 7, statusId: 713, locked: true },
  { id: 136, name: "Bindery Metal", code: 'A4A4', deptId: 7, statusId: 714, locked: true },
  { id: 137, name: "Bindery Wrapped", code: 'B4B4', deptId: 7, statusId: 715, locked: true },
  { id: 138, name: "Dawn L - Proof Out", code: 'C4C4', deptId: 2, statusId: 200, locked: true },
  { id: 139, name: "Prototype Table 1", code: 'D4D4', deptId: -7, statusId: 957, locked: true },
  { id: 140, name: "Prototype Table 2", code: 'E4E4', deptId: -7, statusId: 716, locked: true },
  { id: 141, name: "Prototype Logojet/Stamping", code: 'F4F4', deptId: -7, statusId: 717, locked: true },
  { id: 142, name: "Shipping Inventory", code: 'G4G4', deptId: -1, statusId: 100, locked: true },
  { id: 143, name: "Pull Plate Inbox", code: 'H4H4', deptId: 3, statusId: 902, locked: false },
  { id: 144, name: "Bindery Coiling", code: 'I4I4', deptId: 7, statusId: 718, locked: true },
  { id: 145, name: "Billed", code: 'J4J4', deptId: -1, statusId: 95, locked: false },
  { id: 146, name: "No Charge", code: 'K4K4', deptId: -1, statusId: 96, locked: false },
  { id: 147, name: "Cancelled", code: 'L4L4', deptId: -1, statusId: 99, locked: false },
  { id: 148, name: "Peyton", code: 'M4M4', deptId: 2, statusId: 201, locked: true },
  { id: 149, name: "Bindery Preproduction Quality Check", code: 'N4N4', deptId: 7, statusId: 719, locked: true },
  { id: 150, name: "Final Proofreading", code: 'O4O4', deptId: 3, statusId: 304, locked: false },
  { id: 151, name: "Not Scanned In", code: 'P4P4', deptId: -1, statusId: 9, locked: true },
  { id: 152, name: "Ready for Preassembly", code: 'Q4Q4', deptId: 7, statusId: 720, locked: true },
  { id: 155, name: "Woodshop CNC", code: 'T4T4', deptId: 8, statusId: 802, locked: true },
  { id: 156, name: "Woodshop Laser", code: 'U4U4', deptId: 8, statusId: 803, locked: true },
  { id: 157, name: "Woodshop Sanding", code: 'V4V4', deptId: 8, statusId: 804, locked: true },
  { id: 158, name: "Woodshop Spray", code: 'W4W4', deptId: 8, statusId: 805, locked: true },
  { id: 159, name: "Woodshop Cleaning", code: 'X4X4', deptId: 8, statusId: 806, locked: true },
  { id: 160, name: "Woodshop Finishing", code: 'Y4Y4', deptId: 8, statusId: 807, locked: true },
  { id: 161, name: "Kristen M - Proof Out", code: 'Z4Z4', deptId: 6, statusId: 601, locked: false },
  { id: 162, name: "Mike-Plated", code: 'A5A5', deptId: 6, statusId: 602, locked: false },
  { id: 163, name: "Barry-Plated", code: 'B5B5', deptId: 6, statusId: 603, locked: false },
  { id: 164, name: "David-Plated", code: 'C5C5', deptId: 6, statusId: 604, locked: false },
  { id: 165, name: "Kristen M - Plated", code: 'D5D5', deptId: 6, statusId: 605, locked: false },
  { id: 166, name: "Purchasing", code: 'E5E5', deptId: 2, statusId: 202, locked: true },
  { id: 167, name: "Hannah Barnes", code: 'F5F5', deptId: 3, statusId: 307, locked: false },
  { id: 168, name: "Hannah Barnes - Proof Out", code: 'G5G5', deptId: 3, statusId: 308, locked: false },
  { id: 169, name: "Abigail Muny", code: 'H5H5', deptId: 3, statusId: 309, locked: false },
  { id: 170, name: "Abigial Muny - Proof Out", code: 'I5I5', deptId: 3, statusId: 310, locked: false },
  { id: 171, name: "Lauren Laudato", code: 'J5J5', deptId: 3, statusId: 311, locked: false },
  { id: 172, name: "Lauren Laudato - Proof Out", code: 'K5K5', deptId: 3, statusId: 312, locked: false },
  { id: 173, name: "Epson Printer", code: 'L5L5', deptId: 3, statusId: 606, locked: true },
  { id: 174, name: "Litho Complete", code: 'M5M5', deptId: 7, statusId: 721, locked: true },
  { id: 175, name: "BIP - Material on Order", code: 'N5N5', deptId: 7, statusId: 722, locked: true },
  { id: 176, name: "Bindery Quality Check", code: 'O5O5', deptId: 7, statusId: 723, locked: true },
  { id: 177, name: "1/4 Round Corner Machine", code: 'P5P5', deptId: 5, statusId: 500, locked: true },
  { id: 178, name: "1/8 Round Corner Machine", code: 'Q5Q5', deptId: 5, statusId: 501, locked: true },
  { id: 179, name: "Cold Order", code: 'R5R5', deptId: 1, statusId: 101, locked: false },
  { id: 180, name: "St Clair Warehouse", code: 'S5S5', deptId: 10, statusId: 102, locked: true },
  { id: 181, name: "Accounting Hold", code: 'T5T5', deptId: 4, statusId: 400, locked: false },
  { id: 182, name: "Shipping - Hold CSR", code: 'U5U5', deptId: 10, statusId: 103, locked: true },
  { id: 183, name: "Shipping - Hold Partial Order", code: 'V5V5', deptId: 10, statusId: 104, locked: true },
  { id: 184, name: "Quality Control", code: 'W5W5', deptId: -1, statusId: 105, locked: true },
  { id: 185, name: "Prototype Completed", code: 'X5X5', deptId: 3, statusId: 313, locked: true },
  { id: 186, name: "Bindery PreProduction", code: 'Y5Y5', deptId: 7, statusId: 724, locked: true },
  { id: 187, name: "Material Inventory Check", code: 'Z5Z5', deptId: 7, statusId: 725, locked: true },
  { id: 188, name: "Ready for Production", code: 'A6A6', deptId: 7, statusId: 726, locked: true },
  { id: 189, name: "Mimaki", code: 'B6B6', deptId: 7, statusId: 727, locked: true },
  { id: 190, name: "Kevin Holowenko", code: 'C6C6', deptId: -1, statusId: 4, locked: true },
  { id: 191, name: "Woodshop Check-Out", code: 'D6D6', deptId: 8, statusId: 808, locked: true },
  { id: 192, name: "Jenna Fioritto", code: 'E6E6', deptId: 3, statusId: 314, locked: false },
  { id: 193, name: "Jenna Fioritto - Proof Out", code: 'F6F6', deptId: 3, statusId: 315, locked: false },
  { id: 194, name: "Evan Markos", code: 'G6G6', deptId: 3, statusId: 316, locked: false },
  { id: 195, name: "Evan Markos - Proof Out", code: 'H6H6', deptId: 3, statusId: 317, locked: false },
  { id: 196, name: "Marissa Lee", code: 'I6I6', deptId: 3, statusId: 318, locked: false },
  { id: 197, name: "Marissa Lee - Proof Out", code: 'J6J6', deptId: 3, statusId: 319, locked: false },
  { id: 198, name: "Woodshop Staining", code: 'K6K6', deptId: 8, statusId: 809, locked: true },
  { id: 199, name: "Lake Erie Graphics", code: 'L6L6', deptId: null, statusId: 5, locked: true },
  { id: 200, name: "United Finishing", code: 'M6M6', deptId: null, statusId: 6, locked: true },
  { id: 201, name: "Tony Stetzik - Proof Out", code: 'N6N6', deptId: 6, statusId: 607, locked: false },
  { id: 202, name: "Rubber Band Orders", code: 'O6O6', deptId: 8, statusId: 810, locked: true },
  { id: 203, name: "Shipping - Rollout", code: 'P6P6', deptId: 10, statusId: 106, locked: true },
  { id: 204, name: "Master Ticket \u2013 Creative", code: 'Q6Q6', deptId: 3, statusId: 320, locked: true },
  { id: 205, name: "Kassandra", code: 'R6R6', deptId: 2, statusId: 203, locked: false },
  { id: 206, name: "Bridgette Demko", code: 'S6S6', deptId: 3, statusId: 321, locked: false },
  { id: 207, name: "Bridgette Demko - Proof Out", code: 'T6T6', deptId: 3, statusId: 322, locked: false },
  { id: 208, name: "Lydia Reiss", code: 'U6U6', deptId: 3, statusId: 323, locked: false },
  { id: 209, name: "Lydia Reiss - Proof Out", code: 'V6V6', deptId: 3, statusId: 324, locked: false },
  { id: 210, name: "Christina Kline", code: 'W6W6', deptId: 3, statusId: 325, locked: false },
  { id: 211, name: "Christina Kline - Proof Out", code: 'X6X6', deptId: 3, statusId: 326, locked: false },
  { id: 212, name: "PrePress - Internal Design", code: 'Y6Y6', deptId: 9, statusId: 943, locked: false },
  { id: 213, name: "PrePress - Customer Supplied", code: 'Z6Z6', deptId: 9, statusId: 944, locked: false },
];

/* ── Production type → card stripe class (jobs-dashboard.css) ── */
const PROD_CLASS = {
  'Bindery':       'prod-bindery',
  'Printing':      'prod-printing',
  'PDF Only':      'prod-pdf',
  'Paper':         'prod-paper',
  'Woodshop Only': 'prod-wood',
  'Menu Hardware': 'prod-hardware',
  'Press Proof':   'prod-pressproof',
};

/* ── Job detail presets ──
   Detail cards are the same shape as the production tab on the job
   detail page (PL-8.0-JM-New-jobs): a numbered card, then labelled
   spec tiles grouped into sections. Presets keep the mock data short. */
const DETAIL_PRESETS = {
  'Printing': [
    { title: 'Dinner Menu — Single Panel', sections: [
      { name: 'General', specs: [['Quantity', '300'], ['Panels', '1'], ['Sides', '2']] },
      { name: 'Paper',   specs: [['Size', '8.5 x 14'], ['Type', 'Durapoly'], ['Weight', '14pt']] },
    ], note: 'Round corners 1/4".' },
  ],
  'Bindery': [
    { title: 'Leather Cover — 2 View', sections: [
      { name: 'General', specs: [['Quantity', '120'], ['Views', '2']] },
      { name: 'Cover',   specs: [['Material', 'Bonded Leather'], ['Color', 'Espresso'], ['Size', '9.25 x 12.25']] },
      { name: 'Decoration', specs: [['Method', 'Blind Deboss'], ['Location', 'Front center']] },
    ], note: 'Logo art approved 10/14.' },
    { title: 'Interior Inserts', sections: [
      { name: 'General', specs: [['Quantity', '240'], ['Sides', '2']] },
      { name: 'Paper',   specs: [['Size', '8.5 x 11'], ['Type', 'Synthetic'], ['Weight', '10pt']] },
    ], note: '' },
  ],
  'PDF Only': [
    { title: 'Digital Menu PDF', sections: [
      { name: 'General', specs: [['Pages', '4'], ['Format', 'Web + Print']] },
    ], note: 'Tagged/accessible PDF required.' },
  ],
  'Woodshop Only': [
    { title: 'Wood Menu Board', sections: [
      { name: 'General', specs: [['Quantity', '12'], ['Size', '9 x 14']] },
      { name: 'Wood',    specs: [['Species', 'Walnut'], ['Finish', 'Satin'], ['Engrave', 'Laser']] },
    ], note: '' },
  ],
  'Menu Hardware': [
    { title: 'Aluminum Cover — 4 View', sections: [
      { name: 'General',  specs: [['Quantity', '60'], ['Views', '4']] },
      { name: 'Hardware', specs: [['Finish', 'Brushed'], ['Corners', 'Gold']] },
    ], note: '' },
  ],
  'Paper': [
    { title: 'Table Tent', sections: [
      { name: 'General', specs: [['Quantity', '500'], ['Panels', '2']] },
      { name: 'Paper',   specs: [['Size', '4 x 6'], ['Type', 'Cover Stock'], ['Weight', '100#']] },
    ], note: '' },
  ],
  'Press Proof': [
    { title: 'Press Proof', sections: [
      { name: 'General', specs: [['Quantity', '2'], ['Sides', '2']] },
    ], note: 'Customer to sign off on color.' },
  ],
};

/* ── Jobs ──
   jobType values come from JOB_TYPES in mock-data.js.
   One current location each. `details` points at a preset above. */
const JOBS = [
  // Creative — allocation queues
  { number: 118392, description: 'Dinner Menu — Spring Refresh',          customerNumber: 10234, customer: 'The Bellwether Hotel',     mgmtGroup: 'Bellwether Hospitality', jobType: 'New Job', prodType: 'Printing',      locationId: 23 },
  { number: 118388, description: 'Wine List — Revised Covers',            customerNumber: 10871, customer: 'Harbor & Vine',            mgmtGroup: 'Independent',            jobType: 'Rerun w/ Changes', prodType: 'Bindery',       locationId: 23 },
  { number: 118385, description: 'Kids Menu — Activity Back',             customerNumber: 11502, customer: 'Lakeview Grill',           mgmtGroup: 'Northcoast Restaurant Group', jobType: 'New Job', prodType: 'Paper',    locationId: 23 },
  { number: 118381, description: 'Breakfast Menu — Weekday',              customerNumber: 10234, customer: 'The Bellwether Hotel',     mgmtGroup: 'Bellwether Hospitality', jobType: 'Pull-Plate', prodType: 'Printing',      locationId: 143 },
  { number: 118377, description: 'Allergen Card — Reprint',               customerNumber: 12044, customer: 'Copper Kettle Diner',      mgmtGroup: 'Kettle Brands',          jobType: 'Replacement Ticket', prodType: 'Paper',         locationId: 143 },
  // Creative — designers
  { number: 118372, description: 'Banquet Menu — Plated Dinner',          customerNumber: 10990, customer: 'Riverside Conference Ctr', mgmtGroup: 'Riverside Venues',       jobType: 'New Job', prodType: 'Printing',      locationId: 131 },
  { number: 118369, description: 'Cocktail List — Seasonal',              customerNumber: 11320, customer: 'The Gilded Fox',           mgmtGroup: 'Independent',            jobType: 'Rerun w/ Changes', prodType: 'Printing',      locationId: 131 },
  { number: 118365, description: 'Room Service Door Hanger',              customerNumber: 10234, customer: 'The Bellwether Hotel',     mgmtGroup: 'Bellwether Hospitality', jobType: 'Inventory Release', prodType: 'Paper',         locationId: 133 },
  { number: 118361, description: 'Leather Menu Covers — Qty 120',         customerNumber: 10871, customer: 'Harbor & Vine',            mgmtGroup: 'Independent',            jobType: 'New Job', prodType: 'Bindery',       locationId: 167 },
  { number: 118358, description: 'Digital Menu Board Artwork',            customerNumber: 12210, customer: 'Summit Coffee Co.',        mgmtGroup: 'Summit Brands',          jobType: 'Rerun w/ Changes', prodType: 'PDF Only',      locationId: 167 },
  { number: 118354, description: 'Happy Hour Menu — Table Tent',          customerNumber: 11502, customer: 'Lakeview Grill',           mgmtGroup: 'Northcoast Restaurant Group', jobType: 'New Job', prodType: 'Paper',    locationId: 171 },
  { number: 118350, description: 'Private Dining Menu — Custom Cover',    customerNumber: 11320, customer: 'The Gilded Fox',           mgmtGroup: 'Independent',            jobType: 'Pull-Plate', prodType: 'Bindery',       locationId: 192 },
  // Creative — proofing
  { number: 118347, description: 'Brunch Menu — Weekend',                 customerNumber: 12044, customer: 'Copper Kettle Diner',      mgmtGroup: 'Kettle Brands',          jobType: 'Replacement Ticket', prodType: 'Printing',      locationId: 34 },
  { number: 118343, description: 'Dessert Menu — Insert Card',            customerNumber: 10990, customer: 'Riverside Conference Ctr', mgmtGroup: 'Riverside Venues',       jobType: 'New Job', prodType: 'Paper',         locationId: 34 },
  { number: 118340, description: 'In-Room Dining Menu — Refresh',         customerNumber: 10234, customer: 'The Bellwether Hotel',     mgmtGroup: 'Bellwether Hospitality', jobType: 'Rerun w/ Changes', prodType: 'Printing',      locationId: 150 },
  { number: 118336, description: 'Catering Menu — Corporate Package',     customerNumber: 12210, customer: 'Summit Coffee Co.',        mgmtGroup: 'Summit Brands',          jobType: 'Inventory Release', prodType: 'PDF Only',      locationId: 2 },
  { number: 118333, description: 'Poolside Menu — Laminated',             customerNumber: 11810, customer: 'Sandpiper Resort',         mgmtGroup: 'Coastal Resorts',        jobType: 'New Job', prodType: 'Printing',      locationId: 2 },
  { number: 118329, description: 'VIP Menu — Gold Foil Cover',           customerNumber: 11810, customer: 'Sandpiper Resort',         mgmtGroup: 'Coastal Resorts',        jobType: 'Rerun w/ Changes', prodType: 'Bindery',       locationId: 204 },
  // Healey
  { number: 118326, description: 'Two Panel Aluminum Cover — 4 Views',    customerNumber: 11320, customer: 'The Gilded Fox',           mgmtGroup: 'Independent',            jobType: 'New Job', prodType: 'Menu Hardware', locationId: 31 },
  { number: 118322, description: 'Accessible PDF — Full Menu Set',        customerNumber: 12210, customer: 'Summit Coffee Co.',        mgmtGroup: 'Summit Brands',          jobType: 'Pull-Plate', prodType: 'PDF Only',      locationId: 31 },
  { number: 118319, description: 'Wooden Menu Board — Lobby Display',     customerNumber: 10990, customer: 'Riverside Conference Ctr', mgmtGroup: 'Riverside Venues',       jobType: 'Replacement Ticket', prodType: 'Woodshop Only', locationId: 35 },
  { number: 118315, description: 'Menu Cover — Stitched Leather Proto',   customerNumber: 10871, customer: 'Harbor & Vine',            mgmtGroup: 'Independent',            jobType: 'New Job', prodType: 'Bindery',       locationId: 32 },
  { number: 118312, description: 'Wine List Holder — Wood Proto',         customerNumber: 11810, customer: 'Sandpiper Resort',         mgmtGroup: 'Coastal Resorts',        jobType: 'Rerun w/ Changes', prodType: 'Woodshop Only', locationId: 185 },
  // Bindery
  { number: 118308, description: 'Menu Binder — Refill Pages',            customerNumber: 11502, customer: 'Lakeview Grill',           mgmtGroup: 'Northcoast Restaurant Group', jobType: 'Inventory Release', prodType: 'Bindery',  locationId: 1 },
  { number: 118305, description: 'Seasonal Cover Wrap',                   customerNumber: 12044, customer: 'Copper Kettle Diner',      mgmtGroup: 'Kettle Brands',          jobType: 'New Job', prodType: 'Bindery',       locationId: 1 },
  { number: 118301, description: 'Press Proof — Wine List',               customerNumber: 10871, customer: 'Harbor & Vine',            mgmtGroup: 'Independent',            jobType: 'Rerun w/ Changes', prodType: 'Press Proof',   locationId: 186 },
  { number: 118298, description: 'Leather Cover — Banquet',               customerNumber: 10990, customer: 'Riverside Conference Ctr', mgmtGroup: 'Riverside Venues',       jobType: 'New Job', prodType: 'Bindery',       locationId: 12 },
  { number: 118294, description: 'Bar Menu — Laminated Insert',           customerNumber: 11320, customer: 'The Gilded Fox',           mgmtGroup: 'Independent',            jobType: 'Pull-Plate', prodType: 'Bindery',       locationId: 125 },
  { number: 118291, description: 'Aluminum Cover — Lobby Bar',            customerNumber: 10234, customer: 'The Bellwether Hotel',     mgmtGroup: 'Bellwether Hospitality', jobType: 'Replacement Ticket', prodType: 'Menu Hardware', locationId: 126 },
  { number: 118287, description: 'Room Service Folio',                    customerNumber: 11810, customer: 'Sandpiper Resort',         mgmtGroup: 'Coastal Resorts',        jobType: 'New Job', prodType: 'Bindery',       locationId: 127 },
  { number: 118284, description: 'Wine Spiral — Reprint',                 customerNumber: 12044, customer: 'Copper Kettle Diner',      mgmtGroup: 'Kettle Brands',          jobType: 'Rerun w/ Changes', prodType: 'Bindery',       locationId: 176 },
  { number: 118280, description: 'Event Signage — A-Frame',               customerNumber: 12210, customer: 'Summit Coffee Co.',        mgmtGroup: 'Summit Brands',          jobType: 'Inventory Release', prodType: 'Paper',         locationId: 70 },
];

/* ── General notes, by job number ── */
const NOTES = {
  118392: [
    { text: 'Customer wants the seasonal section moved above entrées.', author: 'Jayne E', date: '10/22/26' },
    { text: 'Use the 2025 logo lockup — new one isn\u2019t approved yet.', author: 'Colin D', date: '10/23/26' },
  ],
  118388: [ { text: 'Match cover color to the 2024 run (ticket 112960).', author: 'Megan D', date: '10/20/26' } ],
  118326: [ { text: 'Views are landscape on the back two panels.', author: 'Healey P', date: '10/24/26' } ],
  118298: [ { text: 'Ship with the inserts from 118294 if both finish Friday.', author: 'Peyton', date: '10/25/26' } ],
};

/* ── Activity, by job number ──
   The Activity tab merges these two into one timeline, newest first.
   `at` is an ISO timestamp so same-day events order correctly.

   SCANS — location history. `via` is 'scanner' (handheld) or 'board'
   (dragged on this board). The last scan is the job's current location.
   Jobs with no entry here get one scan at their current location. */
const SCANS = {
  118392: [
    { locationId: 179, who: 'Peyton',   via: 'scanner', at: '2026-10-19T09:12' },
    { locationId: 23,  who: 'Colin D',  via: 'scanner', at: '2026-10-21T14:40' },
  ],
  118388: [
    { locationId: 179, who: 'Peyton',   via: 'scanner', at: '2026-10-15T10:02' },
    { locationId: 26,  who: 'Colin D',  via: 'board',   at: '2026-10-16T08:30' },
    { locationId: 88,  who: 'Jayne E',  via: 'scanner', at: '2026-10-18T16:05' },
    { locationId: 23,  who: 'Colin D',  via: 'scanner', at: '2026-10-22T11:20' },
  ],
  118326: [
    { locationId: 179, who: 'Peyton',   via: 'scanner', at: '2026-10-20T13:00' },
    { locationId: 31,  who: 'Colin D',  via: 'board',   at: '2026-10-21T09:45' },
  ],
  118298: [
    { locationId: 2,   who: 'Kendra T', via: 'scanner', at: '2026-10-10T15:30' },
    { locationId: 1,   who: 'Megan D',  via: 'scanner', at: '2026-10-14T08:10' },
    { locationId: 12,  who: 'Barry',    via: 'scanner', at: '2026-10-23T07:55' },
  ],
};

/* TIME_ENTRIES — time logged.
   task  = work type name (the Task datalist in location-board.html)
   proof = 'yes' | 'no' | 'revised' — "Sent proof?" */
const TIME_ENTRIES = {
  118392: [
    { who: 'Healey P', minutes: 45, task: 'Typesetting', proof: 'yes',     at: '2026-10-24T15:10' },
    { who: 'Kendra T', minutes: 80, task: 'Design',      proof: 'no',      at: '2026-10-23T11:00' },
  ],
  118388: [
    { who: 'Jayne E',  minutes: 60, task: 'Design',      proof: 'yes',     at: '2026-10-18T15:50' },
    { who: 'Jayne E',  minutes: 25, task: 'Typesetting', proof: 'revised', at: '2026-10-20T10:15' },
  ],
  118326: [ { who: 'Healey P', minutes: 95, task: 'Design',       proof: 'revised', at: '2026-10-25T16:20' } ],
  118361: [ { who: 'Hannah B', minutes: 30, task: 'Double Check', proof: 'no',      at: '2026-10-22T09:40' } ],
};

/* ── Views ──
   A view is a named, ordered list of location ids. Each person keeps
   their own. These three show the range: a creative allocation board,
   a personal board, and a bindery floor that's mostly locked columns. */
const VIEWS = [
  { id: 'v-creative', name: 'Creative Allocation', locationIds: [23, 143, 131, 133, 167, 171, 192, 34, 150, 204, 2] },
  { id: 'v-mine',     name: 'My Jobs',             locationIds: [31, 35, 34, 32, 185] },
  { id: 'v-bindery',  name: 'Bindery Floor',       locationIds: [1, 186, 12, 125, 126, 127, 176, 70] },
];
