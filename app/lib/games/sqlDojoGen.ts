/* ============================================================================
   SQL Dojo — procedural level generator. The 15 hand-authored levels in
   sqlDojo.ts are the guided intro; from level 16 onward getLevel(n) synthesises
   a level deterministically from n (same n always gives the same task), so the
   Dojo has effectively unlimited levels. Every generated level ships a
   reference query that the sql.js engine runs to grade the learner's answer.
   ========================================================================== */
import { DOJO_LEVELS, SEED_SQL, type DojoLevel } from "./sqlDojo";

export { SEED_SQL };

/** deterministic RNG so level N is stable */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}
const pick = <T>(r: () => number, arr: readonly T[]): T => arr[Math.floor(r() * arr.length)];

const NUM_OPS = [">", ">=", "<", "<="] as const;
const PRICES = [30, 45, 50, 60, 90, 100, 180];
const CITIES = ["London", "New York", "Hampton", "Rotterdam"];

interface Template {
  tier: 1 | 2 | 3;
  concept: string;
  build: (r: () => number, n: number) => Omit<DojoLevel, "n">;
}

const TEMPLATES: Template[] = [
  {
    tier: 1,
    concept: "projection + filter",
    build: (r) => {
      const op = pick(r, NUM_OPS);
      const v = pick(r, PRICES);
      return {
        title: "Filter the catalogue",
        concept: "WHERE",
        brief: `Return the name and price of products whose price is ${op} ${v}.`,
        hint: `WHERE price ${op} ${v}`,
        reference: `SELECT name, price FROM products WHERE price ${op} ${v};`,
      };
    },
  },
  {
    tier: 1,
    concept: "filter by text",
    build: (r) => {
      const city = pick(r, CITIES);
      return {
        title: `Customers in ${city}`,
        concept: "WHERE =",
        brief: `Return the id and name of every customer whose city is ${city}.`,
        hint: `WHERE city = '${city}'`,
        reference: `SELECT id, name FROM customers WHERE city = '${city}';`,
      };
    },
  },
  {
    tier: 1,
    concept: "sort + limit",
    build: (r) => {
      const col = pick(r, ["price"]);
      const dir = pick(r, ["ASC", "DESC"]);
      const k = 2 + Math.floor(r() * 4);
      return {
        title: dir === "DESC" ? `Top ${k} by ${col}` : `Bottom ${k} by ${col}`,
        concept: "ORDER BY + LIMIT",
        brief: `Return the ${k} products with the ${dir === "DESC" ? "highest" : "lowest"} ${col} (name, ${col}), ordered accordingly.`,
        hint: `ORDER BY ${col} ${dir} LIMIT ${k}`,
        reference: `SELECT name, ${col} FROM products ORDER BY ${col} ${dir} LIMIT ${k};`,
        ordered: true,
      };
    },
  },
  {
    tier: 2,
    concept: "group + aggregate",
    build: (r) => {
      const agg = pick(r, ["COUNT", "AVG", "SUM", "MAX", "MIN"]);
      const expr = agg === "COUNT" ? "*" : "price";
      const alias = `${agg.toLowerCase()}_price`;
      return {
        title: `${agg} per category`,
        concept: "GROUP BY",
        brief: `For each product category, return the category and ${agg}(${expr}) as ${agg === "COUNT" ? "n" : alias}.`,
        hint: `GROUP BY category, ${agg}(${expr})`,
        reference: `SELECT category, ${agg}(${expr}) AS ${agg === "COUNT" ? "n" : alias} FROM products GROUP BY category;`,
      };
    },
  },
  {
    tier: 2,
    concept: "having",
    build: (r) => {
      const min = 1 + Math.floor(r() * 3);
      return {
        title: "Categories with depth",
        concept: "HAVING",
        brief: `Return each category that has more than ${min} product${min === 1 ? "" : "s"}, with its product count as n.`,
        hint: `GROUP BY category HAVING COUNT(*) > ${min}`,
        reference: `SELECT category, COUNT(*) AS n FROM products GROUP BY category HAVING COUNT(*) > ${min};`,
      };
    },
  },
  {
    tier: 2,
    concept: "inner join",
    build: (r) => {
      const withCity = r() < 0.5;
      return {
        title: "Orders, with the customer",
        concept: "JOIN",
        brief: `Return the customer name${withCity ? ", city," : ""} and order_date for every order.`,
        hint: "FROM orders o JOIN customers c ON c.id = o.customer_id",
        reference: `SELECT c.name,${withCity ? " c.city," : ""} o.order_date FROM orders o JOIN customers c ON c.id = o.customer_id;`,
      };
    },
  },
  {
    tier: 3,
    concept: "join + group + count",
    build: () => ({
      title: "Order count per customer",
      concept: "LEFT JOIN + GROUP BY",
      brief:
        "Return every customer's name and how many orders they have placed (as orders), including customers with none.",
      hint: "LEFT JOIN orders, COUNT(o.id) — not COUNT(*)",
      reference:
        "SELECT c.name, COUNT(o.id) AS orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id, c.name;",
    }),
  },
  {
    tier: 3,
    concept: "3-table join + revenue",
    build: () => ({
      title: "Revenue by customer",
      concept: "multi-JOIN + SUM(qty*price)",
      brief:
        "Return each customer's name and total revenue (SUM of qty * price) as revenue, biggest spender first.",
      hint: "customers -> orders -> order_items -> products",
      reference:
        "SELECT c.name, SUM(oi.qty * p.price) AS revenue FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id GROUP BY c.id, c.name ORDER BY revenue DESC;",
      ordered: true,
    }),
  },
  {
    tier: 3,
    concept: "scalar subquery",
    build: (r) => {
      const which = pick(r, ["AVG", "MAX", "MIN"]);
      const op = which === "MIN" ? "=" : which === "MAX" ? "=" : ">";
      return {
        title: which === "AVG" ? "Above the average price" : `The ${which === "MAX" ? "priciest" : "cheapest"} product`,
        concept: "subquery in WHERE",
        brief:
          which === "AVG"
            ? "Return the name and price of products priced above the average product price."
            : `Return the name and price of the product whose price equals the ${which === "MAX" ? "maximum" : "minimum"} price.`,
        hint: `WHERE price ${op} (SELECT ${which}(price) FROM products)`,
        reference: `SELECT name, price FROM products WHERE price ${op} (SELECT ${which}(price) FROM products);`,
      };
    },
  },
  {
    tier: 3,
    concept: "window function",
    build: (r) => {
      const fn = pick(r, ["RANK", "DENSE_RANK", "ROW_NUMBER"]);
      return {
        title: "Rank by price",
        concept: `${fn}() OVER`,
        brief: `Return product name, price, and its ${fn === "ROW_NUMBER" ? "row number" : "rank"} by price (most expensive first) as pos. Order by pos.`,
        hint: `${fn}() OVER (ORDER BY price DESC) AS pos`,
        reference: `SELECT name, price, ${fn}() OVER (ORDER BY price DESC) AS pos FROM products ORDER BY pos;`,
        ordered: true,
      };
    },
  },
];

/** which templates are unlocked at a given level number (ramps difficulty) */
function poolFor(n: number): Template[] {
  if (n < 25) return TEMPLATES.filter((t) => t.tier <= 1);
  if (n < 45) return TEMPLATES.filter((t) => t.tier <= 2);
  return TEMPLATES;
}

export function getLevel(n: number): DojoLevel {
  if (n <= DOJO_LEVELS.length) return DOJO_LEVELS[n - 1];
  const r = rng(n * 2654435761);
  const pool = poolFor(n);
  const tpl = pool[Math.floor(r() * pool.length)];
  const body = tpl.build(r, n);
  return { n, ...body };
}

/** hand-authored count — the generator takes over after this */
export const AUTHORED_LEVELS = DOJO_LEVELS.length;
