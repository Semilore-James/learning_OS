# Case 04 — SQL Customer Order Analysis

**Industry:** E-commerce · **Difficulty:** ROOKIE

## The situation

You have joined a mid-size online homeware retailer as their first analyst. The head of growth stops by your desk: "We spend a lot on acquiring customers and I have a feeling most of them buy once and vanish. I also want to know which customers are actually worth keeping in touch with. Can you pull the numbers?"

That is two questions wearing one sentence. Your job is to make them precise and answer them.

## The data

One database, three tables.

**customers**

| column | type | notes |
|---|---|---|
| id | integer | primary key |
| email | text | |
| country | text | |
| created_at | date | when they signed up |
| acquisition_channel | text | 'paid_search', 'organic', 'referral', 'email' |

Sample rows:

| id | email | country | created_at | acquisition_channel |
|---|---|---|---|---|
| 1 | ada@example.com | NG | 2025-01-14 | paid_search |
| 2 | ben@example.com | GB | 2025-01-15 | organic |
| 3 | cora@example.com | NG | 2025-02-02 | referral |

**orders**

| column | type | notes |
|---|---|---|
| id | integer | primary key |
| customer_id | integer | references customers.id |
| order_date | date | |
| status | text | 'completed', 'refunded', 'cancelled' |

**order_items**

| column | type | notes |
|---|---|---|
| order_id | integer | references orders.id |
| product_name | text | |
| quantity | integer | |
| unit_price | numeric | in USD |

## Deliverables

1. **One-and-done rate.** Of customers who signed up in 2025 and placed at least one completed order, what percentage placed exactly one? Give the number and the SQL.
2. **Lifetime value by channel.** For each acquisition channel, the average total spend per customer (completed orders only). Which channel brings the most valuable customers?
3. **A keep-in-touch list.** The 20 customers with the highest lifetime spend who have not ordered in the last 90 days. Name, email, lifetime spend, days since last order.

## What "done" looks like

Three result sets, each with the query that produced it, and two or three sentences telling the head of growth what to actually do with the answer. Do not just hand over tables.

## Submit

Paste your queries and findings below, then submit for PM-AI review. PM-AI will not fix your SQL; it will tell you what is missing or wrong and ask you one question.
