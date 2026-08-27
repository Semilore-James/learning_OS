# DA // LEARNING OS — User Flow v2

**Version:** 0.2  
**Backend:** Supabase  
**Auth:** Email and password  

---

## Flow 1: First Visit (New User)

```
LAND ON APP URL
    |
    v
LOGIN SCREEN
    Two options visible:
    [Sign In]  [Create Account]  [Continue as Guest]
    |
    |-- "Create Account" clicked
    |       v
    |   SIGN UP SCREEN
    |       Email input
    |       Password input
    |       Confirm password input
    |       "Create Account" button
    |       v
    |   VERIFICATION CODE SCREEN
    |       6-digit OTP sent to email (Supabase OTP, not a magic link)
    |       Screen shows: "Enter the 6-digit code sent to [email]"
    |       Code input: 6 individual digit boxes
    |       "Resend code" link (available after 60 seconds)
    |       Code expires after 10 minutes
    |       v
    |   CODE CONFIRMED
    |       Account active, auto-logged in
    |       Goes straight to Boot Sequence (no second login step)
    |
    |-- "Continue as Guest" clicked
    |       v
    |   GUEST MODE
    |       No account created. No Supabase calls.
    |       All data stored in localStorage only.
    |       Guest banner visible in taskbar:
    |       "Guest mode. Progress saves locally only."
    |       [Create account to save your progress] link in banner
    |       Full access to all modules EXCEPT:
    |           PM-AI (requires account -- AI context needs persistent history)
    |           Heatmap sync (local only, resets if browser data cleared)
    |       If guest clicks "Create account to save":
    |           Sign Up screen opens
    |           On account creation, guest localStorage data is migrated
    |           to Supabase so no progress is lost
    |
    v
BOOT SEQUENCE (2 seconds, first time only)
    Animated terminal log lines scrolling
    Progress bar fills
    "Initializing your OS..."
    v
DESKTOP (Homepage)
    Dark mode by default
    All 9 icon tiles appear with stagger animation
    XP shows 0, Streak shows 0
    First-time tooltip over Constellation Map icon:
    "Start here. Open your learning map."
```

---

## Flow 2: Returning User (Daily Session)

```
LAND ON APP URL
    |
    v
LOGIN SCREEN
    Email + password
    "Remember me" toggle (30-day session if checked)
    |
    v
BOOT SEQUENCE (1 second, shortened for returning users)
    Pulls account data from Supabase
    XP, streak, node states, heatmap all loaded
    |
    v
DESKTOP
    Palette and theme restored from account
    Active window states restored if user had open windows on last session
    |
    |-- If streak is at risk (no activity logged yesterday):
    |       Taskbar shows a soft amber indicator
    |       Tooltip: "No activity yesterday. Streak paused."
    |
    v
[User opens a module]
```

---

## Flow 3: Forgot Password

```
LOGIN SCREEN
    "Forgot password?" link
    |
    v
RESET SCREEN
    Email input
    "Send reset link" button
    |
    v
EMAIL SENT CONFIRMATION
    |
    v
USER CLICKS LINK IN EMAIL
    |
    v
NEW PASSWORD SCREEN
    New password input
    Confirm input
    "Update password" button
    |
    v
LOGIN SCREEN
    Success message: "Password updated. Sign in."
```

---

## Flow 4: Constellation Map (Level 1 Topics)

```
DESKTOP -- click "Constellation Map" icon
    |
    v
WINDOW OPENS (slide-in from bottom with slight overshoot)
    Atmospheric canvas renders
    10 topic nodes in correct states loaded from account
    Traveling signal dots animate on completed paths
    |
    |-- CLICK LOCKED NODE
    |       Tooltip appears: "Complete [prerequisite] first"
    |       No drawer opens
    |
    |-- CLICK AVAILABLE NODE
    |       Right drawer slides in
    |       Shows: topic name, description, estimated total hours
    |       Tabs: Resources | Tasks | Notes | Textbook Reference
    |       Resources: top videos for this topic
    |       Tasks: linked Case Files for this topic
    |       CTA button: "Enter this track"
    |       -- click "Enter this track"
    |               Node state -> ACTIVE
    |               Sub-constellation window opens (see Flow 5)
    |
    |-- CLICK ACTIVE NODE
    |       Right drawer slides in
    |       Progress bar: X of Y sub-nodes completed
    |       Links to the sub-constellation
    |       CTA: "Continue track"
    |
    |-- CLICK COMPLETED NODE
            Right drawer slides in
            Shows: completion date, XP earned, notes
            Read-only except notes field
```

---

## Flow 5: Sub-Constellation (SQL Example)

```
SQL TOPIC NODE clicked (active state)
    |
    v
SUB-CONSTELLATION WINDOW OPENS
    Title bar: "SQL // Sub-constellation  26 NODES"
    Atmospheric canvas, denser layout
    Nodes arranged in clusters: Core, Relationships, Advanced, Performance
    |
    |-- CLICK LOCKED SUB-NODE
    |       Tooltip: "Complete [prerequisite sub-node] first"
    |
    |-- CLICK AVAILABLE SUB-NODE
    |       Right drawer slides in
    |       Sub-node name + description
    |       Estimated hours for this specific skill
    |       Tabs: Resources | Tasks | Notes | Textbook Reference
    |       Resources: 4 to 6 YouTube videos specific to this sub-node
    |               Each card: thumbnail, title, channel, duration
    |               Two buttons: "Play in app" and "Open in YouTube"
    |       Tasks: 1 to 2 Case Files that use this skill
    |       Notes: freeform, synced to account
    |       Textbook Reference: button that opens the relevant chapter
    |       CTA: "Start this skill"
    |       -- click "Start this skill"
    |               Sub-node state -> ACTIVE
    |
    |-- CLICK ACTIVE SUB-NODE
    |       Drawer shows current progress
    |       Tasks tab shows IN PROGRESS items
    |       CTA: "Mark as complete"
    |       -- only enabled when at least 1 linked task submitted
    |       -- click "Mark as complete"
    |               Sub-node state -> COMPLETED
    |               +100 XP awarded
    |               Connected sub-nodes unlock to AVAILABLE
    |               Heatmap: level 4 activity credit
    |               If all sub-nodes in topic complete:
    |                   Topic node on Level 1 map -> COMPLETED
    |                   +300 XP awarded
    |                   Toast notification: "SQL track complete"
    |
    |-- CLICK COMPLETED SUB-NODE
            Drawer shows: completion date, XP, notes
            Still editable notes field
```

---

## Flow 6: Video Library

```
DESKTOP -- click "Video Library" icon
    |
    v
WINDOW OPENS
    Default filter: current active sub-node skill tag
    Video list loads from config (YouTube metadata)
    |
    |-- FILTER
    |       Left sidebar: Topic checkboxes, Duration chips, Watched status
    |       Search bar: title or channel name
    |       Results update as filters change
    |
    |-- CLICK VIDEO CARD
    |       YouTube iframe loads in expanded view within window
    |       Video plays in-app
    |       Note field appears below player (freeform, synced to account)
    |       "Open in YouTube" button: opens youtube.com in new tab
    |
    |-- MARK AS WATCHED
            Button below player
            Video card updates: watched badge appears
            +30 XP
            Heatmap: +1 activity unit
            If video tagged to active sub-node:
                Node drawer Resources tab updates watched count
```

---

## Flow 7: Case Files

```
DESKTOP -- click "Case Files" icon
    |
    v
WINDOW OPENS
    20 case cards in scrollable list
    Filter bar: difficulty (ROOKIE / ANALYST / SENIOR), status
    |
    |-- CLICK CASE CARD
    |       Case detail panel expands below card
    |       Shows: scenario description, dataset description, deliverable
    |       Status: OPEN
    |       CTA: "Start this case"
    |       -- click "Start this case"
    |               Status -> IN PROGRESS
    |               +10 XP
    |               Timer starts (days since started shown on card)
    |
    |-- IN PROGRESS CASE
    |       Submission text area visible
    |       Days-open counter shown
    |       "Textbook reference" link: opens relevant chapter
    |       "Cheatcodes" link: opens Cheatcodes window to relevant section
    |       CTA: "Submit to PM-AI for review"
    |       -- click submit
    |               PM-AI reads submission + full case context
    |               Returns: what is working, what is missing, one question
    |               Will not give the answer
    |               Two learner options appear:
    |
    |               OPTION A: Revise and resubmit
    |                   Submission field stays editable
    |                   Can resubmit as many times as needed
    |
    |               OPTION B: Accept and mark complete
    |                   Status -> COMPLETE
    |                   +80 XP (submission) + +50 XP (review accepted)
    |                   Heatmap: level 3 activity credit
    |                   Linked sub-node task ticked
    |
    |               OPTION C: Override and mark complete (ignoring PM-AI)
    |                   Warning message: "PM-AI disagreement will be logged"
    |                   Confirm button
    |                   Status -> COMPLETE
    |                   PM-AI disagreement written to Decline Log
    |                   +80 XP only (no review bonus)
    |
    |-- END OF PROGRAM (all 20 cases complete)
            Decline Log surfaces automatically
            Shows: every declined request and override, with timestamps
            Option to export as plain text
```

---

## Flow 8: PM-AI

```
DESKTOP -- click "PM-AI" icon
    |
    v
WINDOW OPENS
    Chat interface
    Context loaded from account:
        current active node and sub-node
        XP total
        cases completed
        recent activity
        decline log count
    Suggested prompt chips shown at top:
        "Review my last case submission"
        "What should I focus on next?"
        "Is my approach correct?"
        "I am stuck. What should I be asking?"
    |
    |-- SEND MESSAGE
    |       PM-AI reads context + message
    |       Responds within mandate:
    |           Reviews: identifies gaps, does not fix them
    |           Direction: asks clarifying question first, then responds
    |           Stuck: returns a question, not an answer
    |           Approach: challenges assumptions, does not blindly validate
    |
    |-- PM-AI DECLINES
    |       Response: "That is outside what I will help with here. [One line reason]."
    |       Decline logged to Decline Log: timestamp + prompt summary
    |
    |-- PM-AI NOTES DISAGREEMENT (after learner override on case)
            PM-AI acknowledges the override in next session if relevant
            "You marked Case 007 complete without addressing [specific gap].
             That gap will matter in Case 012. Flagged."
```

---

## Flow 9: Heatmap

```
DESKTOP -- click "Heatmap" icon
    |
    v
WINDOW OPENS
    52-week grid renders, loaded from Supabase
    Current week highlighted with primary border
    Streak counter shown prominently above grid
    Total active days shown
    Monthly labels above columns
    |
    |-- HOVER CELL
    |       Tooltip: date + activity breakdown
    |       Example: "Aug 14 -- Video watched (2), Case submitted (1)"
    |
    |-- CLICK PAST DATE CELL
            If daily log entry exists: shows that day's entry text
            Full activity breakdown listed
```

---

## Flow 10: Canvas

```
DESKTOP -- click "Canvas" icon
    |
    v
WINDOW OPENS
    |
    |-- FIRST TIME (no canvases exist)
    |       Blank canvas created: "Untitled Canvas 1"
    |
    |-- RETURNING USER
    |       Canvas picker shown: list of named boards
    |       "New canvas" button at top
    |
    v
CANVAS ACTIVE
    Tool palette on left edge of window
    Tools: pen, text, rectangle, circle, arrow, sticky note, image drop, eraser
    Pan: spacebar + drag
    Zoom: scroll wheel
    Auto-save: every 30 seconds, "Saved" flashes in corner
    Activity threshold: 2 minutes of use = heatmap level 1 credit + 15 XP
    |
    |-- RENAME CANVAS
    |       Double-click canvas name in title bar
    |
    |-- EXPORT
    |       "Export PNG" button in window chrome
    |       Downloads to user's device
    |
    |-- DELETE CANVAS
            Right-click canvas in picker -> Delete
            Confirmation required
```

---

## Flow 11: Games

```
DESKTOP -- click "Games" icon
    |
    v
WINDOW OPENS -- Game Selector
    4 game tiles: SQL Dojo, Data Detective, Pivot Puzzle, Chart Critiquer
    Each tile shows: best score, levels or rounds completed, last played date
    |
    |-- SQL DOJO
    |       Puzzle: table schema described + business question shown
    |       Learner writes SQL in text area (syntax highlighted)
    |       Submit button
    |       -- pass: +40 XP, next level unlocked
    |       -- fail: specific feedback on what is wrong (not the answer)
    |             Hint available: costs 50 XP, shows one keyword or clause
    |       30 total levels. Scope covers every SQL sub-node.
    |       Difficulty by level bracket:
    |           Levels 1 to 8: SELECT, WHERE, ORDER BY, basic aggregates
    |           Levels 9 to 16: JOINs, UNION, subqueries, CTEs
    |           Levels 17 to 24: window functions, string and date functions
    |           Levels 25 to 30: performance patterns, real-world query scenarios
    |
    |-- DATA DETECTIVE
    |       Chart or table with 3 seeded errors
    |       Learner clicks to flag errors
    |       Timer visible
    |       Submit: score based on accuracy and speed
    |       +40 XP per correct error found
    |
    |-- PIVOT PUZZLE
    |       Raw tabular data shown
    |       5 multiple-choice questions, no tool allowed
    |       +40 XP for full correct score, scaled for partial
    |
    |-- CHART CRITIQUER
            Badly designed chart shown
            Learner types 3 criticisms and suggested fixes
            Submit to PM-AI
            PM-AI scores: 1 to 3 per criticism, maximum 9
            Feedback returned in window
            +40 XP base, scales with score
```

---

## Flow 12: Cheatcodes

```
DESKTOP -- click "Cheatcodes" icon
    |
    v
WINDOW OPENS
    Two tabs at top: SQL and Excel
    Default: SQL tab active
    |
    |-- SQL TAB
    |       Left: section list (SELECT, JOINs, Window Functions, CTEs, etc.)
    |       Right: cheatcode content for selected section
    |       Code blocks with copy button
    |       JOIN section shows Venn-style SVG diagrams
    |       Search bar: search across all SQL cheatcodes
    |
    |-- EXCEL TAB
    |       Left: section list (Shortcuts, Formulas, Pivot Tables, etc.)
    |       Right: content for selected section
    |       Keyboard shortcut tables shown as structured grids
    |
    |-- PRINTABLE VIEW
            Button in window chrome
            Opens browser print dialog
            Renders clean version without window chrome
```

---

## Flow 13: Textbooks

```
DESKTOP -- click "Textbooks" node on Constellation Map
OR
NODE DRAWER -- "Textbook Reference" tab -- click chapter link
    |
    v
TEXTBOOKS WINDOW OPENS
    Left sidebar: book list at top
        - DA // Field Guide (master)
        - SQL: The Complete Playbook
        - Python for Analysts
        - Excel Mastery
        - Statistics Without Fear
        - Data Visualization Field Manual
    Below book list: chapter list for current book
    Read / unread indicator dot per chapter
    |
    |-- READING A CHAPTER
    |       Clean reading view: Outfit 400, 17px, 1.7 line height
    |       Technical terms shown as: plain word (technical term)
    |       Code blocks: JetBrains Mono, keyword highlighting
    |       "Try This" prompt at chapter end: links to Case File or Game
    |       Bookmark button: saves current page to account
    |
    |-- SEARCH
    |       Search bar in window chrome
    |       Results highlight matching terms across all books
    |
    |-- CHAPTER COMPLETE
            Reading to the end of a chapter: +25 XP
            Chapter dot switches from unread to read
            Heatmap: level 2 activity credit
```

---

## Flow 14: Daily Log

```
DESKTOP -- click "Daily Log" icon
OR
TASKBAR -- click log shortcut input (right side of taskbar)
    |
    v
WINDOW OPENS (or inline taskbar input activates)
    Today's entry field at top: 280 character max
    Character counter shown
    Current active sub-node auto-tagged below input
    Previous entries scrollable below (most recent first)
    |
    |-- WRITE AND SAVE
    |       Save button or Enter key
    |       Entry locked after midnight (cannot edit yesterday's log)
    |       +20 XP
    |       Heatmap: level 1 minimum activity credit
    |       Streak: maintained if this is first activity of the day
    |
    |-- VIEW PAST ENTRIES
    |       Filter by skill node tag
    |       Entries show: date, node tag, entry text
    |
    |-- EXPORT
            "Export all" button
            Downloads as plain text file: one entry per line with date prefix
```

---

## Flow 15: Account and Settings

```
TASKBAR -- avatar icon (right side) -- dropdown
    |
    |-- Profile
    |       Display name edit
    |       Email shown (not editable in v1)
    |       Account created date
    |       Total XP and streak shown
    |
    |-- Settings
    |       Theme toggle: Dark / Light
    |       Data export: download all account data as JSON
    |       Reset progress: wipe all progress (double confirmation required)
    |
    |-- Logout
            Session cleared
            Redirected to Login screen
```

---

## Node State Machine

```
LOCKED
    prerequisite node or sub-node completed
    |
    v
AVAILABLE
    learner clicks "Start this skill" or "Enter this track"
    |
    v
ACTIVE
    learner completes at least one linked task and clicks "Mark as complete"
    |
    v
COMPLETED (terminal)
    unlocks connected nodes to AVAILABLE
    contributes to parent topic node progress
```

---

## XP Reference

| Action | XP |
|---|---|
| Daily log written | +20 |
| Textbook chapter read | +25 |
| Video watched | +30 |
| Game level or round completed | +40 |
| Canvas session over 2 min | +15 |
| Case started | +10 |
| Case submitted | +80 |
| PM-AI review accepted | +50 |
| Sub-node completed | +100 |
| Topic node completed | +300 |
| 7-day streak milestone | +150 |
| 30-day streak milestone | +500 |

