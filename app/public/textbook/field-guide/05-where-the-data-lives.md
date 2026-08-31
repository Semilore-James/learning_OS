# Where the data lives

## The one-sentence version

Company data sits in a handful of predictable places, and an analyst's first week on any job is mostly learning which place holds what.

## The usual places

**The production database.** The live system behind the app: orders, users, events, as they happen. Fast-changing, normalised into many small tables, and you usually do not query it directly because heavy analytics queries would slow the app.

**The data warehouse.** A separate database built for analysis: BigQuery, Snowflake, Redshift, Databricks. Production data is copied here on a schedule, often reshaped into wide, analysis-friendly tables. This is where you write most of your SQL.

**Spreadsheets.** Targets, budgets, mappings, and anything a business team maintains by hand. Lives in Google Sheets or Excel on a shared drive. Fragile (someone renames a column and your report breaks) but unavoidable.

**SaaS tools and their exports.** The CRM (Salesforce, HubSpot), the support desk (Zendesk), the analytics tool (GA, Amplitude), the ad platforms. Each has its own data, its own definitions, and an export button or an API.

**Files.** One-off CSVs someone emailed you, a partner's monthly data drop, a scraped dataset. Handle with care; you often do not know how they were produced.

**The BI layer.** Looker, Power BI, Tableau, or a metrics store, sitting on top of the warehouse with pre-defined metrics. Sometimes the fastest way to an answer; sometimes a black box whose definitions you need to check.

## Definitions differ by source

"Active user" in the product analytics tool, in the warehouse, and in the finance spreadsheet can be three different numbers, because each was defined by a different team for a different purpose. When two sources disagree, the disagreement is usually a definition mismatch, not a bug. Your job is to know which definition the question needs.

## Connecting to the rawest reliable source

Prefer the source closest to where the data is created, as long as it is stable. Connecting to a colleague's hand-maintained summary means your work breaks the day they reorganise it. Connecting to the warehouse table it was built from is durable. The exception: if the business logic (what counts as a "qualified lead") only exists in that spreadsheet, you may have to use it, and then you document the dependency.

## The move

On any new project, before writing a query, ask three questions: where does this data live, who owns it, and what is the canonical definition of the key metric. Write the answers down. That note is worth more than any single query, because it tells you where to go next time.
