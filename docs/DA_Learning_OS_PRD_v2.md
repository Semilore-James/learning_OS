# DA // LEARNING OS
## Product Requirements Document v0.2

**Author:** Semilore James  
**Status:** Pre-Build Planning  
**Updated:** August 2026  

---

## 1. Product Overview

### 1.1 What It Is

DA // LEARNING OS is a self-directed learning environment for people transitioning into data analytics. It runs as a desktop OS metaphor: a wallpapered environment where every tool for the learning journey lives inside launchable windows. Roadmap, videos, cases, AI advisor, tracker, canvas, textbooks, cheatcodes, and games all live here.

The goal is not to teach gently. It is to grind the learner into competence through volume, repetition, and real analytical thinking. SQL is not introduced and moved on from. It is drilled, revisited, and embedded everywhere.

### 1.2 What It Is Not

- Not a course platform with certificates
- Not a content aggregator
- Not a social or community product (v1)
- Not mobile-first (desktop-first; responsive is v2)

### 1.3 Design Philosophy

Two fixed modes: dark and light. No custom palette picker. Colors are chosen for cognitive science reasons and locked to the neobrutalist space theme. Dark mode feels like a mission control room. Light mode follows science-backed defaults for sustained reading and focus (see Section 5).

### 1.4 The Problem It Solves

| Problem | How the OS Addresses It |
|---|---|
| Learners have a roadmap but no momentum | Heatmap, XP, streak, and daily log make progress visible and persistent |
| Resources are scattered everywhere | Every resource lives inside one environment |
| SQL is covered at surface level everywhere | SQL has its own deep sub-constellation with dozens of nodes and a full textbook |
| Generic AI tools do not push back | PM-AI declines, challenges, and logs disagreements |
| Learning stays passive | Games, cases, and canvas force active output |
| Progress resets when you switch devices | Proper backend accounts sync everything |

---

## 2. Users

### 2.1 Primary User

Career transitioner, 22 to 35, moving into data analytics from an unrelated field. Has digital literacy. Self-directed but inconsistent. Learns by doing. Time-constrained to evenings and weekends.

### 2.2 Secondary User (v2)

Recent graduate exploring data as a career path with no prior experience.

---

## 3. Authentication and Accounts

### 3.1 Backend Choice

Supabase (preferred): handles auth, database, and file storage in one platform. Open source, generous free tier, works well with a Node or Next.js frontend.

### 3.2 Auth Flows

- Sign up: email and password. Verification via a 6-digit OTP code sent to the user's email (not a magic link). Code expires after 10 minutes. Resend available after 60 seconds. On successful code entry, account is active and user is auto-logged in with no second step.
- Login: email and password. Remember me toggle (30-day session).
- Forgot password: email reset link.
- Logout: clears session, returns to login screen.
- One account per email. No social login in v1.
- Guest mode: no account required. Full access to all modules except PM-AI (which requires persistent history from Supabase to function correctly). All guest progress is stored in localStorage. A persistent banner in the taskbar prompts account creation. On sign-up from guest mode, localStorage data is migrated to Supabase so no progress is lost.

### 3.3 What Is Synced Per Account

| Data | Synced |
|---|---|
| Node progress (state per node) | Yes |
| XP total | Yes |
| Streak and heatmap activity | Yes |
| Case File submissions and status | Yes |
| Daily log entries | Yes |
| PM-AI decline log | Yes |
| Canvas named boards | Yes |
| Video watched status | Yes |
| Game scores and levels | Yes |
| Theme preference (dark or light) | Yes |

### 3.4 Session Behavior

On login, all synced data loads from Supabase. Local state is a cache. Any action writes to Supabase immediately (optimistic UI, rollback on failure). Offline behavior in v1: read-only from cache. No offline writes.

---

## 4. Desktop (Homepage)

The root layer. A wallpapered environment with icon tiles and a taskbar. No functional content visible here. Everything is behind a window.

### 4.1 Wallpaper

Dark mode: deep space background, faint white star field at 3 to 6 percent opacity, subtle radial gradient lighter at center.

Light mode: off-white background with a very faint dot grid. No star field. Clean and paper-like.

### 4.2 Desktop Icons (9 tiles)

Arranged in a grid, left side of screen.

1. Constellation Map ("Your learning path")
2. Video Library ("Watch and learn")
3. Case Files ("20 real scenarios")
4. PM-AI ("Your advisor")
5. Heatmap ("Your activity")
6. Canvas ("Think on paper")
7. Games ("SQL, logic, data")
8. Cheatcodes ("SQL and Excel quick reference")
9. Daily Log ("One line a day")

Icon tile states: default has muted icon and border. Hover shows primary color border and icon. Open window shows a persistent colored indicator dot on the tile.

### 4.3 Taskbar (bottom, full width)

Left: DA // OS logo in monospace.
Center: live clock.
Right: XP chip, streak counter, theme toggle (moon or sun icon), account avatar with dropdown (profile, settings, logout).

---

## 5. Color System and Theme

### 5.1 Why These Colors

Research on learning environments consistently points to a few principles. High contrast without harsh pure white. Warm tones for reading comfort. Blue-adjacent tones for focus and reduced eye fatigue. Amber and green as progress signals. The palette below is built from these and locked to the neobrutalist space identity of the product.

### 5.2 Dark Mode Tokens (Default)

| Token | Value | Role |
|---|---|---|
| `--bg` | `#080b14` | Desktop wallpaper, window body |
| `--surface` | `#111a28` | Taskbar, sidebar, window chrome |
| `--surface-raised` | `#1a2637` | Cards, panels, hover states |
| `--primary` | `#5b8dee` | Active elements, borders, CTAs |
| `--accent-1` | `#eebc5b` | XP, streak, alerts (amber) |
| `--accent-2` | `#5beeb0` | Completed states, node glow (green) |
| `--accent-3` | `#8d5bee` | Available states, secondary highlights (violet) |
| `--text` | `#e8ecf4` | All readable text |
| `--muted` | `#63718c` | Labels, metadata, disabled |
| `--border` | `#26344a` | All borders and dividers |

### 5.3 Light Mode Tokens

Cognitive science basis: off-white backgrounds reduce glare compared to pure white. Warm ink tones are easier to sustain reading. Blue primary is retained for brand continuity. Amber and green are naturally readable on light surfaces.

| Token | Value | Role |
|---|---|---|
| `--bg` | `#f5f2eb` | Desktop wallpaper, window body (warm off-white) |
| `--surface` | `#edeae0` | Taskbar, sidebar, window chrome |
| `--surface-raised` | `#e4e0d4` | Cards, panels, hover states |
| `--primary` | `#3a6fd4` | Active elements, CTAs (deeper blue for light bg legibility) |
| `--accent-1` | `#c48a10` | XP, streak, alerts (deep amber) |
| `--accent-2` | `#1a9e6e` | Completed states (deep green) |
| `--accent-3` | `#6b3ec4` | Available states (deep violet) |
| `--text` | `#1a1f2e` | All readable text (warm near-black) |
| `--muted` | `#6b6a62` | Labels, metadata, disabled |
| `--border` | `#c8c4b8` | All borders and dividers |

### 5.4 Toggle Behavior

Moon or sun icon in taskbar tray. Applies instantly by swapping `data-theme` on the html element. All components reference tokens only. No hardcoded colors anywhere. Preference saved to Supabase account.

---

## 6. Constellation Map

### 6.1 Two-Level Structure

**Level 1: Topic Nodes (the main map)**
Big clickable star nodes representing major skill areas. These are the constellations.

**Level 2: Sub-constellation (opens on click)**
Each topic node opens its own inner star map showing individual skill nodes for that topic. This is where the real depth lives. SQL alone has over 20 sub-nodes. Completing all sub-nodes in a topic marks the topic node as complete.

### 6.2 Level 1 Topic Nodes

1. Excel and Spreadsheets
2. SQL
3. Python
4. Statistics and Probability
5. Data Cleaning
6. Data Visualization
7. Power BI and Dashboards
8. Storytelling with Data
9. Textbooks (special node, see Section 10)
10. Portfolio and Capstone

### 6.3 Level 2 Sub-nodes by Topic

**Excel and Spreadsheets**
Navigation and keyboard shortcuts, Cell referencing (relative, absolute, mixed), Formulas and functions (SUM, IF, VLOOKUP, INDEX-MATCH), Pivot tables, Data validation, Conditional formatting, Charts (bar, line, scatter, combo), Power Query basics, Named ranges, Data cleaning in Excel

**SQL (deep track)**
What databases are and how they work, SELECT and FROM, WHERE and filtering, ORDER BY and LIMIT, Aggregate functions (COUNT, SUM, AVG, MIN, MAX), GROUP BY and HAVING, DISTINCT and aliases, JOINs (INNER, LEFT, RIGHT, FULL), UNION and UNION ALL, Subqueries (correlated and non-correlated), CTEs (Common Table Expressions), Window functions (ROW_NUMBER, RANK, DENSE_RANK), Window functions (LAG, LEAD, FIRST_VALUE), Window functions (SUM OVER, AVG OVER, PARTITION BY), String functions (CONCAT, LIKE, TRIM, UPPER, LOWER), Date and time functions, CASE statements, NULL handling (IS NULL, COALESCE, NULLIF), Indexes and query performance, Temporary tables and views, Stored procedures (awareness level), Data types and casting, Real-world query patterns (cohort analysis, retention, funnels), SQL for reporting, Writing clean readable SQL (formatting standards)

**Python**
Why Python for data, Setting up environment (Jupyter, VS Code), Variables and data types, Lists, tuples, dictionaries, Control flow (if, for, while), Functions and scope, Importing libraries, NumPy basics, Pandas: loading data, Pandas: exploring data (head, info, describe), Pandas: selecting and filtering, Pandas: groupby and aggregation, Pandas: merging and joining, Pandas: cleaning data, Matplotlib basics, Seaborn for statistical charts, Plotly for interactive charts, Reading CSVs and Excel files, Writing cleaned data to file, End-to-end mini project structure

**Statistics and Probability**
Types of data (nominal, ordinal, interval, ratio), Measures of central tendency, Measures of spread (variance, standard deviation, IQR), Distributions (normal, skewed, uniform), Probability basics, Conditional probability, Sampling and sampling bias, Hypothesis testing (what it is and why), T-tests, Chi-square tests, Correlation vs causation, Regression basics (linear), Interpreting p-values, Confidence intervals, A/B testing fundamentals

**Data Cleaning**
What dirty data looks like, Identifying missing values, Strategies for handling nulls, Duplicate detection and removal, Standardizing formats (dates, strings, numbers), Outlier detection, Data type correction, Validation rules, Documenting cleaning decisions, Reproducible cleaning pipelines

**Data Visualization**
Choosing the right chart type, Principles of visual hierarchy, Color use in charts, Avoiding misleading charts, Bar charts done right, Line charts done right, Scatter plots and correlation, Heatmaps for data, Tables as visualization, Annotations and callouts, Dashboard layout principles, Accessibility in charts

**Power BI and Dashboards**
Power BI interface orientation, Connecting to data sources, Data model basics (tables, relationships), DAX basics (calculated columns, measures), DAX intermediate (CALCULATE, FILTER, ALL), Building visuals in Power BI, Slicers and filters, Drill-through and report navigation, Publishing and sharing, Dashboard design principles

**Storytelling with Data**
Who is your audience, What is the one insight, Structuring a data narrative, Slide design for data, Executive summary writing, Choosing what NOT to show, Annotation and context, Presenting uncertainty, Before and after: chart rewrites, Case study: real presentation deconstruction

**Portfolio and Capstone**
What makes a strong DA portfolio, Project structure and documentation, Writing a case study in plain English, GitHub for analysts, Building a portfolio site (optional), Capstone project brief, Submission and self-review, Peer review framework

### 6.4 Node States

| State | Visual |
|---|---|
| Locked | Surface-raised fill, dashed muted border, faint lock icon |
| Available | Surface-raised fill, solid accent-3 border |
| Active | Primary fill, slow pulse ring animation |
| Completed | Accent-2 fill, glow ring, 4-point star overlay, breathe animation |

### 6.5 Connection Lines

Completed segments: solid accent-2 stroke with a traveling signal dot (animateMotion).
Incomplete segments: dashed border-color stroke.
Curved paths, not straight lines. Organic layout, not a grid.

### 6.6 Node Drawer (on click)

Opens from right side. Contains:
- Skill name and topic badge
- Description and estimated hours
- Tabs: Resources | Tasks | Notes | Textbook Reference
- Resources tab: curated YouTube videos for this specific sub-node (see Section 7)
- Tasks tab: linked Case Files entries
- Notes tab: freeform, synced to account
- Textbook Reference tab: opens the relevant chapter in the in-app textbook

---

## 7. Video Library

### 7.1 Source Policy

All videos are from YouTube. Embedded in-app via official YouTube iframe embed API (fully legal, standard practice). Each card also shows an "Open in YouTube" button for users who prefer that.

No videos are downloaded, hosted, or redistributed. The app stores only the video ID and metadata (title, channel, duration, skill tag).

### 7.2 Curated Channels

Video links are sourced from a spreadsheet supplied by Semilore. The spreadsheet maps each video to a skill tag (topic and sub-node), channel name, title, duration, and difficulty. The app imports this spreadsheet at build time and generates the full video config from it. No video metadata is hardcoded. To add or remove videos, the spreadsheet is updated and the config is regenerated. The following are the recognized channel sources per topic area:

SQL: Alex the Analyst, Luke Barousse, Data with Mo, Leila Gharani, Programming with Mosh, techTFQ, Ankit Bansal
Python: Alex the Analyst, Luke Barousse, Keith Galli, Corey Schafer, Rob Mulla, Data Professor
Excel: Leila Gharani, Kevin Stratvert, MyOnlineTrainingHub, Chandoo, Excel Campus
Statistics: StatQuest with Josh Starmer, zedstatistics, 3Blue1Brown, CrashCourse Statistics
Power BI: Guy in a Cube, Avi Singh, SQLBI, Kevin Stratvert
Visualization: Storytelling with Data (Cole Nussbaumer Knaflic channel), Data Visualization Society, The Functional Art

### 7.3 Library Features

- Filter by skill node, topic, channel, duration, watched status
- Search by title or channel
- In-app YouTube iframe embed with note field below player
- Mark as watched button (awards XP, logs heatmap activity)
- "Open in YouTube" link on every video card
- Watch queue (add videos to a personal list)
- Progress indicator per skill node: X of Y videos watched

---

## 8. Case Files

20 real-world analytics scenarios. Each is a self-contained analytical problem drawn from a real industry. Learner works through it manually, submits findings, and gets PM-AI feedback.

### 8.1 Structure Per Case

- Case number and title
- Industry and context
- Scenario description (2 to 3 paragraphs, realistic business situation)
- Dataset: described table structure with sample rows in v1, downloadable CSV in v2
- Deliverable: what the learner must produce
- Difficulty: ROOKIE, ANALYST, or SENIOR
- Status: OPEN, IN PROGRESS, or COMPLETE
- Submission field: learner writes findings and links work
- PM-AI review: automated on submission

### 8.2 The 20 Cases

1. Retail Sales Audit (Excel pivot tables) - ROOKIE
2. Social Media Engagement Report (Excel charts) - ROOKIE
3. Restaurant Revenue by Location (pivot and dashboard) - ROOKIE
4. SQL Customer Order Analysis (basic SQL) - ROOKIE
5. Fintech Churn Analysis (SQL joins and aggregation) - ANALYST
6. Logistics Route Efficiency (SQL and visualization) - ANALYST
7. E-commerce Funnel Drop (visualization) - ANALYST
8. Hospital Readmission Patterns (statistics) - ANALYST
9. Telecom Customer Segments (Python pandas) - ANALYST
10. Real Estate Price Trends (Python and visualization) - ANALYST
11. HR Attrition Analysis (Power BI) - ANALYST
12. EdTech Completion Rate Drop (storytelling) - ANALYST
13. Ride-hailing Driver Efficiency (SQL window functions) - ANALYST
14. Retail Inventory Shrinkage (SQL and Excel combined) - ANALYST
15. SQL Cohort Retention Analysis (advanced SQL) - SENIOR
16. Supply Chain Delay Tracker (SQL and dashboard) - SENIOR
17. Bank Transaction Anomaly Detection (Python) - SENIOR
18. Insurance Claims Pattern (statistics and Python) - SENIOR
19. Startup Cohort Retention (SQL and Python combined) - SENIOR
20. Portfolio Capstone (learner-defined, open brief) - SENIOR

---

## 9. PM-AI

An AI advisor with a strict operating mandate. Not a tutor. Not a cheerleader.

### 9.1 Operating Rules (Hardcoded System Prompt)

- Will not explain concepts the learner can find in the textbook
- Will not validate a submission without identifying at least one specific problem
- Will not give step-by-step solutions
- Will ask a clarifying question before giving any direction
- Will decline requests outside its mandate and log every decline
- Will note disagreements even when the learner overrides
- Can suggest the next node or case based on current progress
- Can review a submission and say what is missing, not how to fix it
- Responses are direct. No padding. No "Great question." No excessive caveats.

### 9.2 Decline Log

All declined requests are stored per account in Supabase. At the end of the program (all 20 cases complete) the learner sees a full Decline Log: what they tried to shortcut, when, and what the PM-AI said.

### 9.3 Suggested Prompt Chips

Shown at the top of the chat window as quick-tap options:
- "Review my last case submission"
- "What should I focus on next?"
- "Is my approach correct?"
- "I'm stuck, what question should I be asking?"

---

## 10. Textbooks

### 10.1 Structure

One master book: The DA // Field Guide. It is the connective tissue across all topics. It links into five individual topic books.

Individual topic books:
1. SQL: The Complete Playbook
2. Python for Analysts
3. Excel Mastery
4. Statistics Without Fear
5. Data Visualization Field Manual

### 10.2 Writing Style

All textbooks are written inside the app. No external PDFs. Written with these rules:

- Clear simple words used by default. Complex technical terms always included but placed in brackets after the plain version. Example: "the average (mean) of a dataset tells you the central value."
- No em dashes anywhere.
- Explanations are thorough, not terse. Every concept gets the full treatment: what it is, why it exists, how it works, and when to use it (with a realistic use case). A learner should be able to read a chapter and walk away knowing not just the syntax but the reasoning behind it. For example, explaining GROUP BY does not stop at "groups rows by a column." It explains why you need it (aggregates collapse many rows into one, and you need to tell the database which column defines those groups), how it interacts with WHERE and HAVING (WHERE filters before grouping, HAVING filters after), and when to reach for it over a subquery or window function. White space and paragraph breaks are used generously to aid readability, but depth is never sacrificed for brevity.
- Every concept has a worked example using realistic data scenarios.
- Every chapter ends with a "Try This" prompt that links to a relevant Case File or game.
- SQL syntax is shown in clean formatted code blocks. Every clause is commented.

### 10.3 Textbook Node on Constellation Map

"Textbooks" is its own node on the Level 1 map. Clicking it opens the Textbooks window. Every other node in the map also has a "Textbook Reference" tab in its drawer that deep-links to the relevant chapter. References to the textbook appear contextually across Case Files, Games, and the PM-AI responses.

### 10.4 Textbook Window Features

- Master book landing page with links to all five topic books
- Chapter sidebar with progress indicators (read or unread)
- Clean reading view with generous line height and a serif reading font
- Code blocks with syntax highlighting for SQL and Python
- Inline "Try This" prompts that link directly to relevant cases or games
- Search within textbook
- Bookmark any page

---

## 11. Cheatcodes

A separate desktop icon that opens a quick-reference window.

### 11.1 SQL Cheatcodes

Organized sections:
- SELECT syntax patterns
- JOIN patterns with visual diagrams
- Aggregate function quick reference
- Window function syntax (with examples of OVER, PARTITION BY, ORDER BY)
- CTE structure template
- CASE statement templates
- Date function reference by database (MySQL, PostgreSQL, SQLite)
- String function quick reference
- NULL handling patterns
- Query formatting standards

### 11.2 Excel Cheatcodes

Organized sections:
- Essential keyboard shortcuts (Windows and Mac)
- Most-used formula patterns (VLOOKUP, INDEX-MATCH, IF, SUMIF, COUNTIF)
- Pivot table quick-build steps
- Power Query common transformations
- Conditional formatting rules
- Chart type quick selector (what data needs what chart)
- Data cleaning shortcuts

### 11.3 Format

All cheatcodes are inside the app, not downloadable PDFs. Printable view available (browser print dialog). Searchable within the window.

---

## 12. Heatmap

GitHub-style 52-week activity grid.

### 12.1 Activity Sources and Weights

| Activity | Level |
|---|---|
| Daily log written | 1 |
| Video marked watched | 2 |
| Game completed | 2 |
| Canvas session over 2 minutes | 1 |
| Case File started | 2 |
| Case File submitted | 3 |
| Node marked complete | 4 |

### 12.2 Color Scale

Dark mode: level 0 = surface-raised, levels 1 to 4 graduate from accent-3 low opacity to accent-1 full opacity with a slight glow at level 4.

Light mode: same logic, adjusted for legibility on the warm off-white background.

### 12.3 Features

- Hover on any cell: date and activity breakdown tooltip
- Streak counter displayed prominently
- Total active days count
- Monthly labels above grid
- All data synced to Supabase

---

## 13. Canvas

Freeform drag-and-drop thinking space. Built custom, no Excalidraw dependency.

### 13.1 Tools

Pen (freehand), text block, rectangle, circle, arrow, sticky note (color-tagged), image drop (paste or drag from desktop), eraser, pan, zoom.

### 13.2 Persistence

Multiple named canvases per account. Auto-saves every 30 seconds to Supabase. Export as PNG.

### 13.3 Theme Behavior

Dark mode: dark canvas background, light strokes. Light mode: near-white canvas, dark strokes. Sticky note colors adapt to maintain legibility in both modes.

---

## 14. Games

### 14.1 SQL Dojo
Table schema plus a business question. Learner writes a SQL query. Validated against expected output. 30 levels, difficulty escalates. Hints available at a cost of 50 XP. Levels span all SQL sub-nodes from basic SELECT to window functions and CTEs.

### 14.2 Data Detective
A chart or table with 3 seeded errors (wrong aggregation, ignored outlier, misleading axis, incorrect percentage, others). Learner flags errors by clicking. Timed. Score based on accuracy and speed.

### 14.3 Pivot Puzzle
Raw tabular data. 5 questions answered without any tool. Mental pivoting and estimation. Multiple choice. Tests analytical instinct.

### 14.4 Chart Critiquer
A badly designed real-world chart. Learner writes specific criticisms and suggested fixes. PM-AI scores the response out of 9.

### 14.5 Scoring
All games contribute XP and a heatmap activity unit.

---

## 15. Daily Log

One line per day, maximum 280 characters. Cannot edit after midnight. Entries tagged to active skill node. Feeds heatmap. Synced to Supabase. Exportable as plain text. Accessible from desktop icon and as a shortcut input in the taskbar.

---

## 16. Analytics (PostHog)

### 16.1 Events

| Event | Properties |
|---|---|
| `session_start` | `theme`, `current_node`, `xp_total` |
| `module_opened` | `module_name` |
| `node_clicked` | `node_name`, `node_level`, `node_state` |
| `sub_node_clicked` | `topic`, `sub_node_name`, `state` |
| `video_watched` | `video_id`, `channel`, `skill_tag`, `duration_minutes` |
| `case_started` | `case_id`, `difficulty` |
| `case_submitted` | `case_id`, `difficulty`, `days_in_progress` |
| `pm_ai_prompt` | `prompt_category` |
| `pm_ai_declined` | `decline_reason` |
| `game_completed` | `game_name`, `score`, `difficulty_level` |
| `daily_log_written` | `char_count`, `active_node` |
| `canvas_session` | `canvas_name`, `duration_minutes` |
| `textbook_chapter_read` | `book_title`, `chapter_title` |
| `cheatcode_opened` | `cheatcode_type` |
| `theme_toggled` | `new_theme` |
| `streak_milestone` | `streak_days` |
| `xp_milestone` | `xp_total` |
| `node_completed` | `node_name`, `topic` |

### 16.2 Key Metrics

- Module open rate across all 9 desktop icons
- Case completion funnel (started to submitted drop-off)
- SQL Dojo level progression rate
- Textbook chapter read rate per topic
- PM-AI decline rate
- Daily log consistency per account
- Node progression velocity (days between completions)

---

## 17. XP System

| Action | XP |
|---|---|
| Daily log written | +20 |
| Video watched | +30 |
| Textbook chapter read | +25 |
| Case started | +10 |
| Case submitted | +80 |
| PM-AI review accepted | +50 |
| Sub-node completed | +100 |
| Topic node completed | +300 |
| Game level completed | +40 |
| Canvas session over 2 min | +15 |
| 7-day streak | +150 |
| 30-day streak | +500 |

XP is a progress signal in v1. No content is locked behind it.

---

## 18. Technical Architecture

### 18.1 Frontend

React (Next.js recommended for routing and SSR potential in v2). CSS custom properties for the full token system. No UI component library: all components custom-built to match the neobrutalist aesthetic.

### 18.2 Backend

Supabase: auth, PostgreSQL database, file storage for canvas exports and future CSV downloads.

### 18.3 AI

Grok (xAI) free tier as primary AI provider in v1 to manage cost. Because the free tier has tighter constraints than a paid API, the PM-AI system prompt must do heavy lifting. Requirements for the prompt engineering work:

- **Safety:** Explicit refusal rules baked into the system prompt. PM-AI must not give direct solutions, must not validate incorrect work, and must not be talked out of its mandate by the learner rephrasing a request. Edge cases (flattery, hypotheticals, "just this once" framing) must be anticipated and blocked in the prompt itself.
- **Memory loops:** Grok does not retain state between API calls. Every call must include a structured context block assembled server-side: current node, sub-node, XP, cases completed, recent submissions, and the current decline log count. This context is pulled from Supabase before each request and injected into the system prompt. Without this, PM-AI has no continuity.
- **Syntax discipline:** The system prompt must specify the exact response format PM-AI uses. Structure, length, and tone must be locked down so responses are consistent regardless of what the learner sends. No preamble. No filler. Structured output where needed (review responses should follow a fixed schema: strength, gap, question).
- **Prompt versioning:** The system prompt is treated as a versioned artifact. Changes are tracked. Any update is tested against a set of known edge case inputs before deployment.

API calls are made server-side via a Next.js API route to keep credentials off the client. If Grok free tier limits are hit at scale, the architecture supports swapping to a paid provider (Anthropic or OpenAI) by updating the API route only.

### 18.4 Analytics

PostHog JS SDK, initialized client-side. Anonymous events tied to Supabase user ID (hashed, not raw). Session recordings enabled on Constellation Map and Case Files only.

### 18.5 Video

YouTube Data API v3 for fetching video metadata (title, thumbnail, duration, channel). Playback via standard YouTube iframe embed. No video is downloaded or hosted.

---

## 19. Out of Scope (v1)

- Mobile layout
- Social or community features
- Custom roadmap builder by the user
- Instructor mode or cohort management
- Certificate or credential output
- Content upload by learner
- Offline writes
- Multiple learning tracks beyond data analytics

---

## 20. Decisions Logged

All prior open questions are now resolved.

| Question | Decision |
|---|---|
| Which Supabase tier? | Free tier for v1. |
| How are video links sourced? | Imported from a spreadsheet. The app reads video ID and metadata from a structured spreadsheet file. No manual entry in code. |
| Target launch date? | Before end of this weekend. |
| PM-AI context scope? | Full context. Every call to Grok includes the learner's complete history: all nodes and sub-node states, every case submission and its PM-AI response, the full decline log, XP total, streak, and current active skill. Nothing is trimmed. This is assembled server-side from Supabase before each request. |
| How many textbook chapters per topic book? | As many as the topic requires. No artificial cap. Each sub-node in the constellation map maps to at least one textbook chapter. SQL alone will produce 26 or more chapters. Chapters are written to completion, not cut for scope. |

