# Publishing and sharing

## The one-sentence version

Publishing pushes your .pbix to the Power BI Service, where a dataset refreshes on a schedule and a report is shared through a workspace and an app, and the parts that trip people up are the gateway and row-level security.

## What it is

- **Power BI Service** — the website (app.powerbi.com) where reports live once published.
- **Workspace** — a container for related content (datasets, reports, dashboards). Teams work in a shared workspace; there is also "My workspace" for personal drafts.
- **Dataset (semantic model)** — the data + model + measures, separated from the report. Multiple reports can connect to one dataset.
- **Dashboard** — a Service-only artifact: a single page of pinned tiles from one or more reports. Different from a report page.
- **App** — a packaged, read-only distribution of a workspace's content for a wider audience.
- **Gateway** — a program installed on a machine with access to on-premises data sources, so the Service can refresh from them.

## Why it exists

Desktop is single-player. The point of Power BI is that you build once and a team sees current numbers without you doing anything each morning. Publishing sets up the scheduled refresh and the access model that makes that happen.

## How it works

**Publishing:** in Desktop, Home > Publish, pick a workspace. This uploads the dataset and the report. Republishing overwrites (it warns you).

**Scheduled refresh:**

1. In the Service, go to the dataset > Settings.
2. **Data source credentials** — the Service needs its own copy (Desktop's are not sent). Enter them per source.
3. **Gateway** — if any source is on-premises (a local SQL Server, a file on a network share), you need a gateway. Install "On-premises data gateway (standard mode)" on a machine that stays on and can reach the source, sign in, and map the data source to it. Cloud sources (SharePoint Online, Snowflake, BigQuery) do not need a gateway.
4. **Schedule** — set refresh times (up to 8/day on Pro, 48 on Premium). Add a failure notification email.

**Sharing, in order of scale:**

- **Workspace roles** (Admin, Member, Contributor, Viewer) — for the team that builds and maintains the content.
- **App** — for the audience. Publish the workspace as an app, choose which items are included, and grant access to individuals or groups. Viewers get a clean, read-only experience and do not see the workspace clutter. Update the app to push changes.
- **Direct share** of a single report — quick, but harder to manage at scale; prefer apps.
- **Share link** with options (specific people / people in your org / people with existing access).

**Licensing** (this changes, check current terms): building and sharing generally needs **Power BI Pro** per user; viewers of shared content also need Pro unless the workspace is on **Premium capacity** (or Fabric capacity), which lets unlicensed users view. Personal use in "My workspace" is free.

**Row-level security (RLS):** if different viewers should see different rows (each regional manager sees only their region):

1. In Desktop, Modeling > Manage roles. Create a role "Region Manager" with a DAX filter on the Stores table: `[region] = LOOKUPVALUE(UserRegion[region], UserRegion[email], USERPRINCIPALNAME())` (or a simpler static filter per role).
2. Test with "View as" role.
3. Publish. In the Service, dataset > Security, add users/groups to the role.
4. Now the report filters itself per viewer. RLS is applied on the dataset, so every report on it inherits it.

**Deployment pipelines** (Premium) move content through Dev -> Test -> Prod. Without them, be disciplined: a separate workspace for development, publish to the shared one only when ready.

## When you use it

Once the report is done and someone else needs to see it on a schedule. Set up the refresh and test it (trigger a manual refresh, confirm it succeeds). Set up sharing via an app, not one-off links. Add RLS before sharing if the audience should see different slices, because retrofitting it after people have seen everything is awkward.

## A worked example

A finance report built in Desktop, sourced from a cloud data warehouse (Snowflake) and a SharePoint Excel file.

1. **Publish** to a "Finance - Prod" workspace.
2. **Dataset settings:** enter Snowflake credentials and SharePoint credentials. No gateway needed (both are cloud).
3. **Schedule:** refresh at 6am and 1pm on weekdays, failure emails to the analyst.
4. **RLS:** a "Business Unit Lead" role filtering the model to the viewer's BU via their email. Tested with "View as".
5. **App:** publish the workspace as the "Finance Reporting" app, include the one report, grant the "Finance Leads" security group. Add "Business Unit Lead" role members in dataset > Security.
6. Each lead opens the app, signs in, and sees the report filtered to their unit, refreshed twice a day, and the analyst has not touched it since.

> **Try This**
> Publish a case report to a workspace. Set up scheduled refresh with your source credentials and trigger a manual refresh to confirm it works. Create one RLS role with a static region filter, test it with "View as", and note how the report changes.
