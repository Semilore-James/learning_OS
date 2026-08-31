# Connecting to data sources

## The one-sentence version

Power BI connects to almost anything, and the two choices that matter at connection time are which connector to use and whether to import the data or query it live.

## What it is

**Get data** (the ribbon button) opens a catalogue of connectors: files (Excel, CSV, JSON, PDF, a whole folder), databases (SQL Server, PostgreSQL, Snowflake, BigQuery, and dozens more), online services (SharePoint, Dynamics, Salesforce, Google Analytics), and a generic web/OData option.

Each connection creates a **query** in Power Query. A report can have many queries from many sources, all combined in one model.

## Why it exists

Analyst data lives in scattered places: a database for transactions, a spreadsheet the finance team maintains by hand, a CSV export from a SaaS tool, a reference table on SharePoint. Power BI's job is to pull all of them into one model on a schedule, so the report is always current without anyone re-exporting anything.

## How it works

**Import vs DirectQuery** (you pick per source):

- **Import** — Power BI copies the data into the .pbix file (compressed, columnar, fast). Almost always the right choice. Reports are fast, all DAX works, and the data refreshes on a schedule. The limits: the model has to fit in memory, and the data is only as fresh as the last refresh.
- **DirectQuery** — Power BI leaves the data in the source and sends a query every time a visual renders. Use it only when the data is too big to import, or must be real-time, or governance forbids copying it. The cost: slower reports, some DAX unavailable, and load on the source database. Do not reach for it by default.

**Connecting to a file:**

- **Single file:** Get data > Text/CSV or Excel, browse, preview, then Transform (to shape first) or Load (if it is already clean).
- **A folder of files with the same shape** (monthly exports): Get data > Folder, point at the directory. Power BI combines every file into one query, and new files added to the folder appear on the next refresh. This is how you turn "12 monthly CSVs" into one growing table.

**Connecting to a database:**

- Enter the server and (optionally) database name. Choose Import.
- **Do not tick every table.** Select only the tables you need. Each table you import bloats the model.
- **Push work to the source.** If you only need last two years, filter in the connector or in a native SQL query (Advanced options > SQL statement) so the database does the filtering, not Power BI. This is called query folding and it keeps refreshes fast.

**Credentials** are stored by Power BI per source. For a published report to refresh, the Service needs its own copy of the credentials (set in the dataset settings) and, for on-premises databases, a **gateway** (a small program on a machine that can reach the database).

**The golden rule:** connect to the rawest reliable source you can. Connecting to someone's hand-maintained summary spreadsheet means your report breaks the day they rename a column. Connecting to the database table it came from is stable.

## When you use it

The first real step of every report, right after orientation. The import-vs-DirectQuery choice is worth two minutes of thought because switching later is disruptive; when in doubt, choose Import.

## A worked example

A report needs: transactions (in a Postgres database, millions of rows, updated hourly), a product reference table (in the same database, small), and a targets spreadsheet (maintained by finance in Excel on SharePoint).

- **Transactions:** Import, but filter to the last 24 months in the connector so you pull 2 million rows instead of 20 million. Schedule an hourly refresh.
- **Products:** Import, whole table, it is tiny.
- **Targets:** connect to the SharePoint Excel file. Import. Refreshes with the rest.

Three sources, one model. Nobody exports anything; the Monday dashboard is current because the dataset refreshed overnight.

> **Try This**
> Connect Power BI to a folder containing two or more CSVs with the same columns (use case datasets). Watch it combine them into one table. Add a third file to the folder and refresh; confirm the new rows appear.
