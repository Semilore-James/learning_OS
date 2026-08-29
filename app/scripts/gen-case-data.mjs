/* ============================================================================
   Generates the downloadable CSV datasets for Case Files. Deterministic (seeded)
   so re-running is stable. Each dataset carries a real story that only shows up
   once you look — not just dirt for dirt's sake.

   Run:  node scripts/gen-case-data.mjs
   Out:  public/cases/data/<case-id>/*.csv
   ========================================================================== */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "cases", "data");

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}
const pick = (r, a) => a[Math.floor(r() * a.length)];
const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
const csv = (rows) => rows.map((r) => r.map((c) => (String(c).includes(",") ? `"${c}"` : c)).join(",")).join("\n") + "\n";

function write(caseId, file, content) {
  const dir = join(OUT, caseId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, file), content);
  console.log(`  ${caseId}/${file}  (${content.split("\n").length - 1} rows)`);
}

/* ---------------------------------------------------------------- case-01 ---
   Retail Sales Audit. Six garden centres, one year of transactions.
   STORY: at one store (Lekki) a cashier is skimming — cash sales there carry a
   much higher "discount", and there's a run of units=0 "void" rows near close.
   Plus ordinary dirt: blank unit_price, misspelled store names, a few 0-unit
   rows elsewhere.
   Size: ~4,200 rows (rookie).
--------------------------------------------------------------------------- */
function case01() {
  const r = rng(101);
  const stores = ["Ikeja", "Lekki", "Yaba", "Surulere", "Ajah", "Maryland"];
  const misspell = { Lekki: "Leki", Surulere: "Surelere", Maryland: "Marylnd" };
  const cats = ["Plants", "Tools", "Soil", "Pots", "Furniture", "Other"];
  const pay = ["card", "cash", "transfer"];
  const rows = [["date", "store", "category", "units", "unit_price", "discount_pct", "payment_method"]];

  for (let day = 0; day < 365; day++) {
    const d = new Date(2024, 0, 1 + day).toISOString().slice(0, 10);
    for (const store of stores) {
      const n = int(r, 1, 3); // transactions per store per day
      for (let k = 0; k < n; k++) {
        const cat = pick(r, cats);
        let units = int(r, 1, 6);
        const price = { Plants: 4500, Tools: 8000, Soil: 2200, Pots: 3000, Furniture: 26000, Other: 1500 }[cat];
        let pm = pick(r, pay);
        let disc = pick(r, [0, 0, 0, 0.05, 0.1]);

        // the skim: Lekki, cash, inflated discount
        if (store === "Lekki" && pm === "cash" && r() < 0.55) disc = pick(r, [0.2, 0.25, 0.3, 0.35]);

        let storeName = store;
        if (misspell[store] && r() < 0.02) storeName = misspell[store];

        let unitPrice = price;
        if (r() < 0.015) unitPrice = ""; // blank price — ordinary dirt

        // a scatter of 0-unit rows everywhere (returns/voids); extra at Lekki near close
        if (r() < 0.004) units = 0;
        rows.push([d, storeName, cat, units, unitPrice, disc, pm]);
      }
      // Lekki end-of-day void run
      if (store === "Lekki" && r() < 0.25) {
        for (let v = 0; v < int(r, 1, 3); v++) {
          rows.push([d, "Lekki", pick(r, cats), 0, pick(r, [4500, 8000, 3000]), 0, "cash"]);
        }
      }
    }
  }
  write("case-01", "transactions.csv", csv(rows));
}

/* ---------------------------------------------------------------- case-04 ---
   SQL Customer Order Analysis. customers + orders + order_items.
   STORY: a batch of customers imported in Q3 have region that doesn't match
   their city (a bad mapping in the import), so "revenue by region" is wrong for
   ~15% of customers. Also a handful of orders have a negative-price line item
   (a refund booked as a sale).
   Size: customers ~600, orders ~2,400, order_items ~5,500 (rookie/analyst edge).
--------------------------------------------------------------------------- */
function case04() {
  const r = rng(404);
  const cityRegion = {
    Lagos: "South West", Ibadan: "South West", Abeokuta: "South West",
    Abuja: "North Central", Jos: "North Central", Ilorin: "North Central",
    "Port Harcourt": "South South", Benin: "South South", Calabar: "South South",
    Kano: "North West", Kaduna: "North West",
    Enugu: "South East", Onitsha: "South East",
  };
  const cities = Object.keys(cityRegion);
  const regions = [...new Set(Object.values(cityRegion))];
  const products = [
    ["P01", "Mechanical Keyboard", 89],
    ["P02", "27in Monitor", 240],
    ["P03", "USB-C Hub", 45],
    ["P04", "Laptop Stand", 30],
    ["P05", "Headphones", 180],
    ["P06", "Webcam", 60],
    ["P07", "Desk Mat", 18],
  ];

  const customers = [["customer_id", "name", "city", "region", "signup_date"]];
  const CN = 600;
  for (let i = 1; i <= CN; i++) {
    const city = pick(r, cities);
    const signup = new Date(2024, int(r, 0, 8), int(r, 1, 28)).toISOString().slice(0, 10);
    let region = cityRegion[city];
    // Q3 import bug: customers who signed up Jul-Sep get a shifted region
    if (signup >= "2024-07-01" && signup < "2024-10-01" && r() < 0.6) {
      region = regions[(regions.indexOf(cityRegion[city]) + 1) % regions.length];
    }
    customers.push([i, `Customer ${i}`, city, region, signup]);
  }

  const orders = [["order_id", "customer_id", "order_date"]];
  const items = [["order_id", "product_id", "qty", "unit_price"]];
  let oid = 1;
  for (let c = 1; c <= CN; c++) {
    const nOrders = int(r, 1, 8);
    for (let o = 0; o < nOrders; o++) {
      const od = new Date(2024, int(r, 0, 11), int(r, 1, 28)).toISOString().slice(0, 10);
      orders.push([oid, c, od]);
      const nLines = int(r, 1, 3);
      for (let l = 0; l < nLines; l++) {
        const p = pick(r, products);
        let price = p[2];
        let qty = int(r, 1, 4);
        // rare: a refund booked as a sale — negative unit_price
        if (r() < 0.004) price = -p[2];
        items.push([oid, p[0], qty, price]);
      }
      oid++;
    }
  }
  write("case-04", "customers.csv", csv(customers));
  write("case-04", "orders.csv", csv(orders));
  write("case-04", "order_items.csv", csv(items));
}

/* UTC date helper — day 0 = 2024-01-01 */
const D = (day) => new Date(Date.UTC(2024, 0, 1 + day)).toISOString().slice(0, 10);
const gauss = (r) => (r() + r() + r() + r() - 2) / 2; // ~N(0,1)-ish

/* ---------------------------------------------------------------- case-02 ---
   Social Media Engagement Report. A media brand, 4 platforms, a year of posts.
   STORY: engagement_rate looks like it collapsed in spring — but it's an
   artefact: 'reach' wasn't tracked for Jan-Feb (blank), so early rate was
   computed on a smaller denominator. The real trend is flat.
--------------------------------------------------------------------------- */
function case02() {
  const r = rng(202);
  const platforms = ["Instagram", "TikTok", "LinkedIn", "X"];
  const types = ["photo", "video", "carousel", "text"];
  const rows = [["date", "platform", "post_type", "impressions", "reach", "likes", "comments", "shares"]];
  for (let day = 0; day < 365; day++) {
    for (const p of platforms) {
      const impr = int(r, 2000, 40000);
      const reach = Math.round(impr * (0.55 + r() * 0.3));
      const eng = Math.round(impr * (0.02 + r() * 0.03));
      const likes = Math.round(eng * 0.8);
      const comments = Math.round(eng * 0.12);
      const shares = eng - likes - comments;
      // reach not tracked for the first two months
      const reachOut = day < 59 ? "" : reach;
      rows.push([D(day), p, pick(r, types), impr, reachOut, likes, comments, Math.max(0, shares)]);
    }
  }
  write("case-02", "posts.csv", csv(rows));
}

/* ---------------------------------------------------------------- case-03 ---
   Restaurant Revenue by Location. 4 branches, POS tickets.
   STORY: one branch (Riverside) reports much higher card tips as a % of the
   bill — a server pooling adjustment being keyed as a tip. Plus dirt: some tips
   negative (voids), a few tickets with blank location.
--------------------------------------------------------------------------- */
function case03() {
  const r = rng(303);
  const branches = ["Downtown", "Riverside", "Airport", "Mall"];
  const rows = [["ticket_id", "date", "location", "covers", "food", "drink", "tip", "payment"]];
  let id = 1;
  for (let day = 0; day < 365; day++) {
    for (const b of branches) {
      const n = int(r, 3, 6);
      for (let k = 0; k < n; k++) {
        const covers = int(r, 1, 6);
        const food = covers * int(r, 12, 30);
        const drink = covers * int(r, 3, 14);
        const pm = pick(r, ["card", "card", "cash"]);
        let tipRate = pm === "card" ? 0.1 + r() * 0.1 : 0.05 + r() * 0.08;
        if (b === "Riverside" && pm === "card" && r() < 0.5) tipRate = 0.28 + r() * 0.15;
        let tip = Math.round((food + drink) * tipRate * 100) / 100;
        if (r() < 0.008) tip = -Math.round(r() * 20 * 100) / 100; // void
        const loc = r() < 0.01 ? "" : b;
        rows.push([id++, D(day), loc, covers, food, drink, tip, pm]);
      }
    }
  }
  write("case-03", "tickets.csv", csv(rows));
}

/* ---------------------------------------------------------------- case-05 ---
   Fintech Churn Analysis. 5,000 users, ~61k transactions over a year.
   STORY: users on app_version 3.2 (rolled out to a random ~20%) go quiet ~2
   weeks after upgrading — a bug in that version. "Churn" spikes for them.
--------------------------------------------------------------------------- */
function case05() {
  const r = rng(505);
  const N = 5000;
  const users = [["user_id", "signup_date", "plan", "acquisition", "app_version"]];
  const meta = [];
  for (let i = 1; i <= N; i++) {
    const signup = int(r, 0, 200);
    const bad = r() < 0.2;
    users.push([
      i,
      D(signup),
      pick(r, ["free", "free", "plus", "pro"]),
      pick(r, ["organic", "paid", "referral"]),
      bad ? "3.2" : pick(r, ["3.0", "3.1", "3.1"]),
    ]);
    meta.push({ signup, bad, upgradeDay: signup + int(r, 20, 120) });
  }
  const tx = [["user_id", "date", "type", "amount"]];
  for (let i = 1; i <= N; i++) {
    const m = meta[i - 1];
    let day = m.signup;
    while (day < 365) {
      day += int(r, 2, 12);
      if (day >= 365) break;
      // the bug: after the 3.2 upgrade + ~14 days, activity stops
      if (m.bad && day > m.upgradeDay + 14 && r() < 0.9) break;
      tx.push([i, D(day), pick(r, ["transfer", "topup", "bill", "withdraw"]), int(r, 5, 900)]);
    }
  }
  write("case-05", "users.csv", csv(users));
  write("case-05", "transactions.csv", csv(tx));
}

/* ---------------------------------------------------------------- case-06 ---
   Logistics Route Efficiency. ~14k deliveries across regions/drivers.
   STORY: one depot (South) has a cluster of deliveries where arrival is before
   dispatch — a timezone bug in that depot's scanner. It makes their average
   delivery time look impossibly fast. Plus duplicate delivery_ids.
--------------------------------------------------------------------------- */
function case06() {
  const r = rng(606);
  const depots = ["North", "South", "East", "West"];
  const rows = [["delivery_id", "depot", "driver_id", "dispatch_ts", "arrival_ts", "distance_km", "parcels"]];
  let id = 1000;
  for (let k = 0; k < 14000; k++) {
    const depot = pick(r, depots);
    const day = int(r, 0, 200);
    const dispatchH = int(r, 6, 16);
    const durMin = int(r, 20, 180);
    let arrMin = dispatchH * 60 + durMin;
    // South depot timezone bug: subtract an hour, sometimes past dispatch
    if (depot === "South" && r() < 0.15) arrMin = dispatchH * 60 - int(r, 5, 55);
    const dts = `${D(day)}T${String(Math.floor((dispatchH * 60) / 60)).padStart(2, "0")}:${String((dispatchH * 60) % 60).padStart(2, "0")}`;
    const ats = `${D(day)}T${String(Math.floor(arrMin / 60)).padStart(2, "0")}:${String(((arrMin % 60) + 60) % 60).padStart(2, "0")}`;
    const did = r() < 0.005 ? id : id++; // occasional duplicate id
    rows.push([did, depot, int(r, 1, 120), dts, ats, int(r, 2, 60), int(r, 1, 12)]);
  }
  write("case-06", "deliveries.csv", csv(rows));
}

/* ---------------------------------------------------------------- case-07 ---
   E-commerce Funnel Drop. Event log: view -> cart -> checkout -> payment.
   STORY: iOS 'payment' events stop firing on day ~190 (a broken SDK release), so
   iOS "conversion" craters even though revenue from iOS is steady (server data
   would show it). The funnel drop is a tracking bug, not a UX problem.
--------------------------------------------------------------------------- */
function case07() {
  const r = rng(707);
  const devices = ["ios", "android", "web"];
  const steps = ["view", "cart", "checkout", "payment"];
  const rows = [["session_id", "date", "device", "step", "ts_offset_s"]];
  let sid = 1;
  for (let k = 0; k < 16000; k++) {
    const day = int(r, 0, 240);
    const device = pick(r, devices);
    const depth = r() < 0.55 ? 1 : r() < 0.75 ? 2 : r() < 0.9 ? 3 : 4;
    for (let s = 0; s < depth; s++) {
      // the bug: iOS payment events missing after day 190
      if (steps[s] === "payment" && device === "ios" && day > 190 && r() < 0.92) continue;
      rows.push([sid, D(day), device, steps[s], s * int(r, 10, 90)]);
    }
    sid++;
  }
  write("case-07", "events.csv", csv(rows));
}

/* ---------------------------------------------------------------- case-08 ---
   Hospital Readmission Patterns. Admissions with a 30-day readmit flag.
   STORY: readmission rate looks high for one unit (Cardiology) — but discharge
   time is blank for weekend discharges, and a naive "length of stay" calc
   treats blank as same-day, understating stay and correlating with readmits.
   The real driver is discharge-day, not the unit.
--------------------------------------------------------------------------- */
function case08() {
  const r = rng(808);
  const units = ["Cardiology", "Ortho", "General", "Neuro"];
  const rows = [["admission_id", "unit", "admit_date", "discharge_date", "discharge_time", "age", "readmit_30d"]];
  for (let k = 0; k < 12000; k++) {
    const admit = int(r, 0, 300);
    const los = Math.max(1, Math.round(2 + gauss(r) * 3));
    const dis = admit + los;
    const dow = (new Date(Date.UTC(2024, 0, 1 + dis)).getUTCDay());
    const weekend = dow === 0 || dow === 6;
    const dtime = weekend ? "" : `${String(int(r, 9, 18)).padStart(2, "0")}:${String(int(r, 0, 59)).padStart(2, "0")}`;
    // real readmit driver: weekend discharge + age
    const age = int(r, 20, 92);
    const p = 0.06 + (weekend ? 0.05 : 0) + (age > 70 ? 0.04 : 0);
    rows.push([k + 1, pick(r, units), D(admit), D(dis), dtime, age, r() < p ? 1 : 0]);
  }
  write("case-08", "admissions.csv", csv(rows));
}

/* ---------------------------------------------------------------- case-09 ---
   Telecom Customer Segments. 15k subscribers, usage + billing.
   STORY: a "high value at risk" segment turns out to be mostly data errors —
   tenure_months has impossible values (700+), inflating lifetime value. Clean
   those and the segment shrinks to something real but much smaller.
--------------------------------------------------------------------------- */
function case09() {
  const r = rng(909);
  const rows = [["subscriber_id", "plan", "tenure_months", "monthly_gb", "monthly_bill", "support_tickets", "churned"]];
  for (let k = 0; k < 15000; k++) {
    let tenure = int(r, 1, 72);
    if (r() < 0.02) tenure = int(r, 600, 900); // impossible
    const gb = Math.max(0.5, 8 + gauss(r) * 6);
    const bill = 15 + gb * 1.2 + (tenure > 24 ? -3 : 0);
    rows.push([
      k + 1,
      pick(r, ["S", "M", "L", "L", "XL"]),
      tenure,
      Math.round(gb * 10) / 10,
      Math.round(bill * 100) / 100,
      int(r, 0, 6),
      r() < 0.12 ? 1 : 0,
    ]);
  }
  write("case-09", "subscribers.csv", csv(rows));
}

/* ---------------------------------------------------------------- case-10 ---
   Real Estate Price Trends. 9k listings over 3 years.
   STORY: "prices fell in 2024" is an artefact — a batch of listings has area in
   sqft mislabelled as sqm (so price/area looks tiny), and some sold_date is
   before listed_date. Fix the units + bad dates and the trend is up, not down.
--------------------------------------------------------------------------- */
function case10() {
  const r = rng(1010);
  const cities = ["Lagos", "Abuja", "PH", "Ibadan"];
  const rows = [["listing_id", "city", "listed_date", "sold_date", "bedrooms", "area", "price"]];
  for (let k = 0; k < 9000; k++) {
    const listed = int(r, 0, 1000);
    let sold = listed + int(r, 10, 180);
    if (r() < 0.03) sold = listed - int(r, 1, 20); // sold before listed
    const beds = int(r, 1, 5);
    let area = beds * 40 + int(r, -10, 40); // sqm
    let price = Math.round((area * (2500 + listed * 3) + gauss(r) * 200000) / 1000) * 1000;
    if (r() < 0.06) area = Math.round(area * 10.764); // sqft mislabel
    if (r() < 0.01) price = Math.round(price * pick(r, [10, 0.1])); // outlier
    rows.push([k + 1, pick(r, cities), D(listed % 365), D(sold % 365), beds, area, price]);
  }
  write("case-10", "listings.csv", csv(rows));
}

/* ---------------------------------------------------------------- case-11 ---
   HR Attrition. 3,200 employees, 540 exits.
   STORY: attrition is concentrated in one department (Support) among people
   with 12-18 months tenure and no promotion — a career-path problem. exit_reason
   is free text ("pay", "compensation", "salary", "$$$") and needs bucketing.
--------------------------------------------------------------------------- */
function case11() {
  const r = rng(1111);
  const depts = ["Support", "Engineering", "Sales", "Ops", "Marketing"];
  const emp = [["employee_id", "department", "hire_date", "level", "last_promo_date", "salary", "status"]];
  const exits = [["employee_id", "exit_date", "exit_reason"]];
  const reasonsPay = ["pay", "compensation", "salary", "better offer $$$", "comp"];
  const reasonsOther = ["relocation", "manager", "burnout", "role change", "family"];
  for (let i = 1; i <= 3200; i++) {
    const dept = pick(r, depts);
    const hire = -int(r, 100, 1400);
    const tenureM = Math.round(-hire / 30);
    const promo = tenureM > 18 && r() < 0.5 ? hire + int(r, 300, 600) : "";
    const salary = 40000 + int(r, 0, 60000) + (dept === "Engineering" ? 20000 : 0);
    // Support, 12-18mo, no promo -> likely to leave
    const risk = dept === "Support" && tenureM >= 12 && tenureM <= 20 && promo === "" ? 0.4 : 0.08;
    const left = r() < risk;
    emp.push([i, dept, D(((hire % 365) + 365) % 365), pick(r, ["1", "2", "3"]), promo === "" ? "" : D(((promo % 365) + 365) % 365), salary, left ? "left" : "active"]);
    if (left) exits.push([i, D(int(r, 0, 300)), risk > 0.2 ? pick(r, reasonsPay) : pick(r, [...reasonsPay, ...reasonsOther])]);
  }
  write("case-11", "employees.csv", csv(emp));
  write("case-11", "exits.csv", csv(exits));
}

/* ---------------------------------------------------------------- case-12 ---
   EdTech Completion Drop. 20k enrolments, 140k lesson-progress rows.
   STORY: overall completion dropped in Q3. Trace it to a single lesson (Lesson
   7) whose completion rate falls from ~85% to ~30% right after a content update
   on a specific date. Everything downstream of Lesson 7 also drops.
--------------------------------------------------------------------------- */
function case12() {
  const r = rng(1212);
  const enr = [["enrolment_id", "course", "enrolled_date", "plan"]];
  const prog = [["enrolment_id", "lesson_no", "completed", "completed_date"]];
  const UPDATE_DAY = 200;
  for (let i = 1; i <= 20000; i++) {
    const start = int(r, 0, 300);
    enr.push([i, pick(r, ["Data 101", "SQL Basics", "Python Intro"]), D(start), pick(r, ["free", "paid"])]);
    let day = start;
    for (let L = 1; L <= 12; L++) {
      day += int(r, 1, 6);
      let pComplete = 0.9 - L * 0.02;
      if (L === 7 && day > UPDATE_DAY) pComplete = 0.3; // the broken lesson
      const done = r() < pComplete;
      prog.push([i, L, done ? 1 : 0, done ? D(day % 365) : ""]);
      if (!done) break; // stop at first incomplete
    }
  }
  write("case-12", "enrolments.csv", csv(enr));
  write("case-12", "lesson_progress.csv", csv(prog));
}

/* ---------------------------------------------------------------- case-13 ---
   Ride-hailing Driver Efficiency. 30k trips.
   STORY: a "top earner" leaderboard is gamed — a small set of drivers have many
   trips with distance_km = 0 but a full fare (cancelled-then-charged, or a
   meter exploit). Rank drivers by earnings/hour and those drivers fall away.
--------------------------------------------------------------------------- */
function case13() {
  const r = rng(1313);
  const rows = [["trip_id", "driver_id", "start_ts", "end_ts", "distance_km", "fare", "rating"]];
  for (let k = 0; k < 30000; k++) {
    const driver = int(r, 1, 400);
    const day = int(r, 0, 120);
    const startMin = int(r, 300, 1300);
    const durMin = int(r, 5, 55);
    let dist = Math.round((durMin * (0.3 + r() * 0.4)) * 10) / 10;
    let fare = Math.round((2 + dist * 1.1 + durMin * 0.15) * 100) / 100;
    // exploit: a few drivers, 0 distance, full fare
    if (driver <= 12 && r() < 0.35) {
      dist = 0;
      fare = Math.round((5 + r() * 20) * 100) / 100;
    }
    const s = `${D(day)}T${String(Math.floor(startMin / 60)).padStart(2, "0")}:${String(startMin % 60).padStart(2, "0")}`;
    const e = `${D(day)}T${String(Math.floor((startMin + durMin) / 60)).padStart(2, "0")}:${String((startMin + durMin) % 60).padStart(2, "0")}`;
    rows.push([k + 1, driver, s, e, dist, fare, (3 + r() * 2).toFixed(1)]);
  }
  write("case-13", "trips.csv", csv(rows));
}

/* ---------------------------------------------------------------- case-14 ---
   Retail Inventory Shrinkage. 22k stock movements across 5 stores.
   STORY: one store's counted stock drifts below expected stock over the year
   for a specific high-value category (Electronics) — steady internal shrinkage.
   Other stores reconcile fine.
--------------------------------------------------------------------------- */
function case14() {
  const r = rng(1414);
  const stores = ["S1", "S2", "S3", "S4", "S5"];
  const cats = ["Electronics", "Home", "Apparel", "Grocery"];
  const rows = [["date", "store", "category", "sku", "movement_type", "qty", "counted_delta"]];
  for (let day = 0; day < 300; day++) {
    for (const store of stores) {
      const n = int(r, 8, 16);
      for (let k = 0; k < n; k++) {
        const cat = pick(r, cats);
        const type = pick(r, ["sale", "sale", "sale", "receipt", "return", "count"]);
        let qty = type === "receipt" ? int(r, 10, 60) : type === "sale" ? -int(r, 1, 6) : type === "return" ? int(r, 1, 3) : 0;
        let countedDelta = 0;
        if (type === "count") {
          countedDelta = int(r, -2, 2);
          // the shrink: S3 electronics counts run short
          if (store === "S3" && cat === "Electronics") countedDelta = -int(r, 2, 6);
        }
        rows.push([D(day), store, cat, `${cat.slice(0, 2).toUpperCase()}-${int(r, 100, 999)}`, type, qty, countedDelta]);
      }
    }
  }
  write("case-14", "stock_movements.csv", csv(rows));
}

/* ---------------------------------------------------------------- case-15 ---
   SaaS Cohort Retention. 8k accounts, 46k subscription events.
   STORY: retention looks terrible for the Q2 cohort — but a chunk of those
   accounts have 'pause' events (seasonal customers) that a naive churn calc
   counts as churn. Separate pause from cancel and Q2 retention is normal.
--------------------------------------------------------------------------- */
function case15() {
  const r = rng(1515);
  const acc = [["account_id", "signup_date", "plan", "seats"]];
  const ev = [["account_id", "event_date", "event_type"]];
  for (let i = 1; i <= 8000; i++) {
    const signup = int(r, 0, 330);
    const q2 = signup >= 90 && signup < 181;
    acc.push([i, D(signup), pick(r, ["team", "team", "business", "enterprise"]), int(r, 2, 40)]);
    ev.push([i, D(signup), "start"]);
    let day = signup;
    let active = true;
    while (active && day < 360) {
      day += int(r, 20, 90);
      if (day >= 360) break;
      const seasonal = q2 && r() < 0.4;
      if (seasonal) {
        ev.push([i, D(day), "pause"]);
        day += int(r, 30, 90);
        if (day < 360) ev.push([i, D(day % 360), "resume"]);
      } else if (r() < 0.12) {
        ev.push([i, D(day), "cancel"]);
        active = false;
      }
    }
  }
  write("case-15", "accounts.csv", csv(acc));
  write("case-15", "subscription_events.csv", csv(ev));
}

/* ---------------------------------------------------------------- case-16 ---
   Supply Chain Delay Tracker. 26k purchase orders.
   STORY: "supplier X is our worst for on-time delivery" is wrong — supplier
   names aren't standardised ("Acme", "ACME Ltd", "Acme  Limited") so their
   volume is split and each fragment looks small/bad. Consolidate names first.
   Also some promised_date is in the past at creation (data entry).
--------------------------------------------------------------------------- */
function case16() {
  const r = rng(1616);
  const base = ["Acme", "Globex", "Initech", "Umbrella", "Soylent", "Stark"];
  const variants = (n) => [n, `${n} Ltd`, `${n} Limited`, `${n}  Ltd.`, n.toUpperCase()];
  const rows = [["po_id", "supplier", "created_date", "promised_date", "received_date", "value", "on_time"]];
  for (let k = 0; k < 26000; k++) {
    const b = pick(r, base);
    const supplier = pick(r, variants(b));
    const created = int(r, 0, 300);
    let promised = created + int(r, 7, 45);
    if (r() < 0.03) promised = created - int(r, 1, 10); // impossible
    const late = b === "Globex" ? r() < 0.4 : r() < 0.15;
    const received = promised + (late ? int(r, 1, 20) : -int(r, 0, 5));
    rows.push([k + 1, supplier, D(created % 365), D(promised % 365), D(((received % 365) + 365) % 365), int(r, 500, 90000), received <= promised ? 1 : 0]);
  }
  write("case-16", "purchase_orders.csv", csv(rows));
}

/* ---------------------------------------------------------------- case-17 ---
   Bank Transaction Anomaly Detection. 90k transfers.
   STORY: ~30 accounts show 'structuring' — many transfers just under a 1,000,000
   reporting threshold (900k-999k), clustered in time, to a few beneficiary
   accounts. Everyone else's transfers are smoothly distributed.
--------------------------------------------------------------------------- */
function case17() {
  const r = rng(1717);
  const rows = [["txn_id", "date", "account_id", "beneficiary_id", "amount", "channel"]];
  const flagged = new Set(Array.from({ length: 30 }, () => int(r, 1, 4000)));
  for (let k = 0; k < 90000; k++) {
    const acc = int(r, 1, 4000);
    const day = int(r, 0, 180);
    let amount;
    let ben = int(r, 5000, 9000);
    if (flagged.has(acc) && r() < 0.6) {
      amount = int(r, 900000, 999000); // just under threshold
      ben = 5000 + (acc % 20); // few repeat beneficiaries
    } else {
      amount = Math.round(Math.exp(9 + r() * 4)); // broad
    }
    rows.push([k + 1, D(day), acc, ben, amount, pick(r, ["mobile", "web", "branch"])]);
  }
  write("case-17", "transactions.csv", csv(rows));
}

/* ---------------------------------------------------------------- case-18 ---
   Insurance Claims Pattern. 34k claims.
   STORY: average claim amount looks like it jumped — but ~8% of amounts are
   strings with currency symbols ("$4,200", "USD 3100") that sort/aggregate
   wrong. Clean the type and the jump disappears; the real signal is a rise in
   claim *frequency* for one region after a policy change.
--------------------------------------------------------------------------- */
function case18() {
  const r = rng(1818);
  const regions = ["N", "S", "E", "W"];
  const rows = [["claim_id", "policy_region", "claim_date", "claim_type", "amount"]];
  for (let k = 0; k < 34000; k++) {
    const region = pick(r, regions);
    const day = int(r, 0, 330);
    const base = Math.round(Math.exp(6.5 + gauss(r) * 0.8));
    // region S frequency rises after day 180 (policy change)
    if (region === "S" && day > 180 && r() > 0.5 && r() < 0.7) continue;
    let amount = String(base);
    const g = r();
    if (g < 0.05) amount = `$${base.toLocaleString("en-US")}`;
    else if (g < 0.08) amount = `USD ${base}`;
    rows.push([k + 1, region, D(day), pick(r, ["auto", "home", "health", "travel"]), amount]);
  }
  write("case-18", "claims.csv", csv(rows));
}

/* ---------------------------------------------------------------- case-19 ---
   Marketplace Take-rate Analysis. 55k orders.
   STORY: blended take-rate is drifting down. Cause: sellers on the new "Pro"
   tier were meant to pay 12% but a config bug charges them 8%. Pro volume is
   growing, dragging the blended rate. Per-tier rates are otherwise stable.
--------------------------------------------------------------------------- */
function case19() {
  const r = rng(1919);
  const rows = [["order_id", "date", "seller_id", "seller_tier", "gmv", "fee"]];
  for (let k = 0; k < 55000; k++) {
    const day = int(r, 0, 300);
    // Pro tier share grows over the year
    const proChance = 0.1 + (day / 300) * 0.4;
    const tier = r() < proChance ? "pro" : pick(r, ["standard", "standard", "plus"]);
    const gmv = Math.round(Math.exp(3 + r() * 3) * 100) / 100;
    const rate = tier === "standard" ? 0.15 : tier === "plus" ? 0.13 : r() < 0.9 ? 0.08 : 0.12; // pro bug
    rows.push([k + 1, D(day), int(r, 1, 3000), tier, gmv, Math.round(gmv * rate * 100) / 100]);
  }
  write("case-19", "orders.csv", csv(rows));
}

console.log("Generating case datasets…");
[case01, case02, case03, case04, case05, case06, case07, case08, case09, case10,
 case11, case12, case13, case14, case15, case16, case17, case18, case19].forEach((f) => f());
console.log("done.");
