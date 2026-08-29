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

console.log("Generating case datasets…");
case01();
case04();
console.log("done.");
