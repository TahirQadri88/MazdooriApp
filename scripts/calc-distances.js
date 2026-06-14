#!/usr/bin/env node
// Calculates driving distances from R17 using coordinates + Haversine formula.
// Applies a 1.4x road-network multiplier for urban Karachi driving distances.
// Run: node scripts/calc-distances.js

const data = require('./area-coords.json');

const R17 = data._origin;   // { lat, lon }

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2
          + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180)
          * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Road multiplier: 1.3 for nearby/grid areas, 1.5 for outer/highway routes
function roadKm(straight, areaName) {
  const isHighway = areaName.includes('S/W') || areaName.includes('Gadap') || areaName.includes('DHA City');
  const mult = isHighway ? 1.5 : 1.35;
  return Math.round(straight * mult);
}

const results = {};
for (const [name, coords] of Object.entries(data.areas)) {
  const straight = haversineKm(R17.lat, R17.lon, coords.lat, coords.lon);
  results[name] = roadKm(straight, name);
  console.error(`  ${name}: ${straight.toFixed(1)} km straight → ${results[name]} km driving`);
}

// Known confirmed values — override calculated ones
const CONFIRMED = {
  'R17 Warehouse → Khyber Shop (Stock Transfer)': 9,
  'Sohrab Goth Bus Adda → R17 Warehouse': 9,
};
Object.assign(results, CONFIRMED);

// Output JS block
console.log('\n// AREA_DISTANCES — calculated from GPS coords + 1.35x road factor');
console.log('const AREA_DISTANCES = {');

const groups = [
  ['Landhi / East Karachi', ['Bhains Colony','Khurram Abad — Landhi','Army Land — Landhi','Navy Land — Landhi','Babar Market — Landhi']],
  ['Super Highway Cattle Farms (S/W)', ['Hashim Goth (S/W)','Dumba Goth (S/W)','Ramzan Piri (S/W)','Solangi Stop (S/W)','Jameel Memon Society (S/W)','52 Acre Scheme (S/W)','Nagori Society (S/W)','Areesha Cattle Society (S/W)','Karachi Dairy & Cattle City (S/W)']],
  ['Gadap', ['Abdullah Hotel — Gadap','TOMCL — Organic Meat Co. Gadap','Jumani Goth — Gadap','GFA Farms — Gadap']],
  ['West Karachi', ['Piyala Hotel — Gulberg','Orangi Town']],
  ['Saddar / Intercity Terminals', ['Cantt Train Station — Saddar','Daewoo Terminal — Saddar','Shalimar Terminal — Saddar','Faisal Movers — Saddar','Intercity Bus Terminal — Saddar']],
  ['Old City / Port', ['Kharadar Transport Area','Maripur / Hawksbay']],
  ['DHA', ['DHA Phase 1','DHA Phase 2','DHA Phase 3','DHA Phase 4','DHA Phase 5','DHA Phase 6','DHA Phase 7','DHA Phase 8','DHA City (Phase 9)']],
  ['Fixed Routes', ['R17 Warehouse → Khyber Shop (Stock Transfer)','Sohrab Goth Bus Adda → R17 Warehouse']],
  ['Northwest / Keamari', ['Naval Colony','Mach Goth','Mangopir']],
  ['Gulshan-e-Iqbal', ['Gulshan Block 1','Gulshan Block 2','Gulshan Block 3','Gulshan Block 4','Gulshan Block 5','Gulshan Block 6','Gulshan Block 7','Gulshan Block 8','Gulshan Block 9','Gulshan Block 10','Gulshan Block 11','Gulshan Block 12','Gulshan Block 13','Gulshan Block 14','Gulshan Block 15','Gulshan Block 16','Gulshan Block 17','Gulshan Block 18','Gulshan Block 19','Gulshan Block 20','Gulshan Block 21']],
  ['Korangi', ['Korangi No. 1','Korangi No. 2','Korangi No. 3','Korangi No. 4','Korangi No. 5','Korangi No. 6','Korangi Industrial Area','Korangi Causeway','Korangi Creek']],
];

for (const [comment, keys] of groups) {
  const pairs = keys.map(k => `'${k}':${results[k] ?? 0}`).join(',');
  console.log(`  // ${comment}`);
  console.log(`  ${pairs},`);
}
console.log('};');
