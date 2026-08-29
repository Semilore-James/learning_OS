/* ============================================================================
   SQL Dojo levels. One shared toy e-commerce schema; each level ships a prompt,
   a hint, and a reference query. The learner's output is checked against the
   reference query's output (order-insensitive unless `ordered`).
   v1 = 15 levels (SELECT -> filter -> sort -> JOIN -> GROUP BY -> HAVING ->
   subquery -> window). More levels are content work, not code.
   ========================================================================== */

export const SEED_SQL = `
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, signup_date TEXT);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT);
CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, qty INTEGER);

INSERT INTO customers VALUES
 (1,'Ada Lovelace','London','2023-01-05'),
 (2,'Grace Hopper','New York','2023-02-11'),
 (3,'Alan Turing','London','2023-02-27'),
 (4,'Katherine Johnson','Hampton','2023-03-15'),
 (5,'Edsger Dijkstra','Rotterdam','2023-04-02'),
 (6,'Barbara Liskov','New York','2023-05-19');

INSERT INTO products VALUES
 (1,'Mechanical Keyboard','peripherals',89.0),
 (2,'27in Monitor','displays',240.0),
 (3,'USB-C Hub','peripherals',45.0),
 (4,'Laptop Stand','accessories',30.0),
 (5,'Noise-cancelling Headphones','audio',180.0),
 (6,'Webcam 1080p','peripherals',60.0),
 (7,'Desk Mat','accessories',18.0);

INSERT INTO orders VALUES
 (1,1,'2023-03-01'),(2,1,'2023-04-10'),(3,2,'2023-03-05'),
 (4,3,'2023-04-01'),(5,3,'2023-04-20'),(6,4,'2023-05-02'),
 (7,2,'2023-06-01'),(8,6,'2023-06-15'),(9,1,'2023-06-20');

INSERT INTO order_items VALUES
 (1,1,1),(1,3,2),(2,2,1),(3,5,1),(3,4,1),(4,1,1),
 (5,6,2),(5,7,1),(6,2,1),(6,5,1),(7,3,1),(8,4,2),(9,1,1),(9,2,1);
`;

/* the shop the whole Dojo runs on — shown as a reference panel so you're never
   guessing what tables or columns exist */
export const SCHEMA_STORY =
  "A small online shop. Customers place orders; each order has one or more line items; each line item is a product and a quantity.";

export const SCHEMA: { table: string; columns: string[]; note: string }[] = [
  { table: "customers", columns: ["id", "name", "city", "signup_date"], note: "one row per customer" },
  { table: "products", columns: ["id", "name", "category", "price"], note: "the catalogue; price is per unit" },
  { table: "orders", columns: ["id", "customer_id", "order_date"], note: "customer_id → customers.id" },
  { table: "order_items", columns: ["order_id", "product_id", "qty"], note: "order_id → orders.id, product_id → products.id" },
];

export interface DojoLevel {
  n: number;
  title: string;
  brief: string;
  hint: string;
  reference: string;
  ordered?: boolean;
  concept: string;
}

export const DOJO_LEVELS: DojoLevel[] = [
  {
    n: 1,
    title: "Everyone in the room",
    concept: "SELECT *",
    brief: "Return every column of every customer.",
    hint: "SELECT * FROM <table>;",
    reference: "SELECT * FROM customers;",
  },
  {
    n: 2,
    title: "Just the names",
    concept: "column projection",
    brief: "Return only the name column from products.",
    hint: "Name the column instead of using *.",
    reference: "SELECT name FROM products;",
  },
  {
    n: 3,
    title: "Londoners",
    concept: "WHERE",
    brief: "Return the id and name of customers who live in London.",
    hint: "WHERE city = 'London'",
    reference: "SELECT id, name FROM customers WHERE city = 'London';",
  },
  {
    n: 4,
    title: "The pricey shelf",
    concept: "WHERE with a number",
    brief: "Return the name and price of products that cost more than 50.",
    hint: "price > 50",
    reference: "SELECT name, price FROM products WHERE price > 50;",
  },
  {
    n: 5,
    title: "Cheapest first",
    concept: "ORDER BY",
    brief: "Return every product's name and price, cheapest first.",
    hint: "ORDER BY price ASC",
    reference: "SELECT name, price FROM products ORDER BY price ASC;",
    ordered: true,
  },
  {
    n: 6,
    title: "Top three",
    concept: "ORDER BY + LIMIT",
    brief: "Return the three most expensive products (name, price), most expensive first.",
    hint: "ORDER BY price DESC LIMIT 3",
    reference: "SELECT name, price FROM products ORDER BY price DESC LIMIT 3;",
    ordered: true,
  },
  {
    n: 7,
    title: "How many customers?",
    concept: "COUNT",
    brief: "Return a single number: the total count of customers. Call the column total.",
    hint: "SELECT COUNT(*) AS total ...",
    reference: "SELECT COUNT(*) AS total FROM customers;",
  },
  {
    n: 8,
    title: "Spend per category",
    concept: "GROUP BY + SUM",
    brief:
      "For each product category, return the category and the sum of its product prices (call it total_price).",
    hint: "GROUP BY category, SUM(price) AS total_price",
    reference:
      "SELECT category, SUM(price) AS total_price FROM products GROUP BY category;",
  },
  {
    n: 9,
    title: "Who ordered what",
    concept: "INNER JOIN",
    brief:
      "Return customer name and order_date for every order, joining customers to orders.",
    hint: "FROM orders JOIN customers ON customers.id = orders.customer_id",
    reference:
      "SELECT c.name, o.order_date FROM orders o JOIN customers c ON c.id = o.customer_id;",
  },
  {
    n: 10,
    title: "Orders per customer",
    concept: "JOIN + GROUP BY + COUNT",
    brief:
      "Return every customer's name and how many orders they have placed (call it orders). Include customers with zero orders.",
    hint: "LEFT JOIN orders, COUNT(o.id) — not COUNT(*)",
    reference:
      "SELECT c.name, COUNT(o.id) AS orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id, c.name;",
  },
  {
    n: 11,
    title: "Frequent buyers",
    concept: "HAVING",
    brief:
      "Return the name of customers who have placed more than one order, plus their order count as orders.",
    hint: "GROUP BY ... HAVING COUNT(o.id) > 1",
    reference:
      "SELECT c.name, COUNT(o.id) AS orders FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id, c.name HAVING COUNT(o.id) > 1;",
  },
  {
    n: 12,
    title: "Units shipped",
    concept: "multi-table JOIN + SUM",
    brief:
      "Return each product's name and the total quantity ordered across all orders (call it units). Only products that were ordered.",
    hint: "products JOIN order_items ON product_id, SUM(qty)",
    reference:
      "SELECT p.name, SUM(oi.qty) AS units FROM products p JOIN order_items oi ON oi.product_id = p.id GROUP BY p.id, p.name;",
  },
  {
    n: 13,
    title: "Above the average price",
    concept: "scalar subquery",
    brief:
      "Return the name and price of products priced above the average product price.",
    hint: "WHERE price > (SELECT AVG(price) FROM products)",
    reference:
      "SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);",
  },
  {
    n: 14,
    title: "Revenue by customer",
    concept: "3-table JOIN + arithmetic",
    brief:
      "Return each customer's name and their total revenue (SUM of qty * price) as revenue, biggest spender first.",
    hint: "customers -> orders -> order_items -> products; SUM(oi.qty * p.price)",
    reference:
      "SELECT c.name, SUM(oi.qty * p.price) AS revenue FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id GROUP BY c.id, c.name ORDER BY revenue DESC;",
    ordered: true,
  },
  {
    n: 15,
    title: "Running rank",
    concept: "window function",
    brief:
      "Return product name, price, and the product's rank by price (most expensive = 1) as price_rank. Order by price_rank.",
    hint: "RANK() OVER (ORDER BY price DESC) AS price_rank",
    reference:
      "SELECT name, price, RANK() OVER (ORDER BY price DESC) AS price_rank FROM products ORDER BY price_rank;",
    ordered: true,
  },
];
