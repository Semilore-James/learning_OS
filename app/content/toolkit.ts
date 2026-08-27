/* ============================================================================
   DA // LEARNING OS  —  Toolkit (a.k.a. "The Loadout")
   ----------------------------------------------------------------------------
   Powers the Toolkit desktop window (icon #10, the empty grid slot in the
   mockup). Every tool a data analyst installs to practice, with: what it is,
   why the job needs it, where to get it (official source only), install steps
   per operating system, a verification step, and the problems people actually
   hit.

   Marking a tool "installed" writes a heatmap unit + XP (setting up your
   environment is real progress, not busywork). Several constellation sub-nodes
   deep-link here (e.g. SQL > db-basics, GIT > install-git, PYTHON > setup-env).

   Nothing here is downloaded or proxied by the app. These are pointers to
   first-party download pages. Links are checked at build time by
   scripts/check-toolkit-links.mjs.
   ========================================================================== */

export type OS = "windows" | "mac" | "linux";

export interface InstallStep {
  os: OS[];
  steps: string[];
  /** command or action that proves the install worked */
  verify?: string;
}

export interface CommonProblem {
  symptom: string;
  cause: string;
  fix: string;
  os?: OS[];
}

export interface Tool {
  id: string;
  name: string;
  category:
    | "spreadsheets"
    | "sql"
    | "bi"
    | "python"
    | "version-control"
    | "no-code-db";
  /** which constellation topics this tool supports */
  topics: string[];
  cost: "free" | "free-tier" | "paid" | "paid-or-student";
  platforms: OS[];
  what: string;
  why: string;
  /** official download page ONLY */
  source: string;
  install: InstallStep[];
  problems: CommonProblem[];
  /** shown when a tool is Windows-only etc. */
  note?: string;
}

export const TOOLS: Tool[] = [
  /* ---------------------------------------------------------------- SQL --- */
  {
    id: "postgres",
    name: "PostgreSQL + a client",
    category: "sql",
    topics: ["sql", "data-cleaning"],
    cost: "free",
    platforms: ["windows", "mac", "linux"],
    what: "A full open-source relational database you run on your own machine. The SQL you write here is the same SQL used in industry.",
    why: "You need a real database to practice against, not a toy. Postgres is free, standards-compliant, and what a large share of data teams actually use.",
    source: "https://www.postgresql.org/download/",
    install: [
      {
        os: ["windows"],
        steps: [
          "Download the Windows installer from the EDB link on postgresql.org/download/windows.",
          "Run it. When asked, set a password for the 'postgres' superuser and WRITE IT DOWN. You cannot recover it later without extra steps.",
          "Keep the default port 5432 unless it is taken.",
          "Let it install pgAdmin 4 (the bundled GUI client) as well.",
        ],
        verify: 'Open "SQL Shell (psql)" from the Start menu, press Enter through the prompts, type the password, and run: SELECT version();',
      },
      {
        os: ["mac"],
        steps: [
          "Easiest: install Postgres.app from postgresapp.com (it is the official recommendation on the Postgres site for Mac).",
          "Drag it to Applications, open it, click Initialize.",
          "Or with Homebrew: brew install postgresql@16 then brew services start postgresql@16.",
        ],
        verify: "In Terminal run: psql postgres -c 'SELECT version();'",
      },
      {
        os: ["linux"],
        steps: [
          "Debian/Ubuntu: sudo apt install postgresql postgresql-client",
          "Start it: sudo systemctl enable --now postgresql",
          "Switch to the postgres user to create your own login role: sudo -u postgres psql",
        ],
        verify: "psql -U postgres -c 'SELECT version();'",
      },
    ],
    problems: [
      {
        symptom: "'psql' is not recognized as a command",
        cause: "The Postgres bin folder is not on your PATH (common on Windows).",
        fix: "Add C:\\Program Files\\PostgreSQL\\16\\bin to your PATH environment variable, then open a new terminal. On Mac with Homebrew, run the 'echo export PATH' line brew prints after install.",
        os: ["windows", "mac"],
      },
      {
        symptom: "port 5432 already in use / install fails on the port step",
        cause: "Another Postgres (or a Docker container) is already listening there.",
        fix: "Either stop the other service, or let the installer use 5433 and remember to pass -p 5433 when you connect.",
      },
      {
        symptom: "you forgot the postgres superuser password",
        cause: "It is set once at install and not shown again.",
        fix: "Edit pg_hba.conf to set the local method to 'trust' temporarily, restart Postgres, connect with no password, run ALTER USER postgres PASSWORD 'newpass', then set pg_hba.conf back to 'scram-sha-256' and restart.",
      },
    ],
  },
  {
    id: "dbeaver",
    name: "DBeaver Community",
    category: "sql",
    topics: ["sql"],
    cost: "free",
    platforms: ["windows", "mac", "linux"],
    what: "A free, cross-platform database GUI. Connects to Postgres, MySQL, SQL Server, SQLite, and dozens more with one interface.",
    why: "One client for every database you will ever touch. If you use a Mac, this is your replacement for SSMS.",
    source: "https://dbeaver.io/download/",
    install: [
      {
        os: ["windows", "mac", "linux"],
        steps: [
          "Download the Community Edition installer for your OS from dbeaver.io/download.",
          "Install and open it.",
          "Click the plug icon (New Connection), pick your database type, enter host localhost, port, database name, user, password.",
          "Click 'Test Connection'. DBeaver will offer to download the driver the first time. Let it.",
        ],
        verify: "Expand the connection tree, open a SQL editor (SQL button), run: SELECT 1;",
      },
    ],
    problems: [
      {
        symptom: "'Test Connection' fails with a driver error",
        cause: "The JDBC driver for that database has not been downloaded yet.",
        fix: "Click the 'Download' button in the driver prompt. If you are offline or behind a proxy, use Database > Driver Manager to point at a local driver jar.",
      },
      {
        symptom: "connection refused to localhost",
        cause: "The database service is not running, or it is only listening on a socket, not TCP.",
        fix: "Start the DB service. For Postgres, confirm 'listen_addresses' in postgresql.conf includes localhost and the service is up.",
      },
    ],
  },
  {
    id: "ssms",
    name: "SQL Server Express + SSMS",
    category: "sql",
    topics: ["sql"],
    cost: "free",
    platforms: ["windows"],
    note: "Windows only. On Mac or Linux use Azure Data Studio or DBeaver against SQL Server in Docker.",
    what: "Microsoft SQL Server Express is a free edition of Microsoft's database. SSMS (SQL Server Management Studio) is the Windows tool for managing it.",
    why: "A lot of enterprise and finance shops run Microsoft SQL Server. Knowing SSMS and T-SQL is a common job requirement.",
    source: "https://learn.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms",
    install: [
      {
        os: ["windows"],
        steps: [
          "Install SQL Server Express first: get it from microsoft.com/sql-server/sql-server-downloads (choose the Express package). Pick 'Basic' install.",
          "Note the instance name it gives you, usually localhost\\SQLEXPRESS.",
          "Then install SSMS from the Microsoft Learn link above (it is a separate download from the engine).",
          "Open SSMS, in the Connect dialog set Server name to localhost\\SQLEXPRESS, Authentication to 'Windows Authentication', click Connect.",
        ],
        verify: "In a new query window run: SELECT @@VERSION;",
      },
    ],
    problems: [
      {
        symptom: "SSMS cannot connect to localhost\\SQLEXPRESS",
        cause: "The SQL Server service is stopped, or the instance name is wrong.",
        fix: "Open 'SQL Server Configuration Manager', confirm 'SQL Server (SQLEXPRESS)' is Running. Confirm the exact instance name there.",
        os: ["windows"],
      },
      {
        symptom: "login works for you but not for an app / connection string",
        cause: "SQL Server Express installs with only Windows Auth by default; TCP/IP is also often disabled.",
        fix: "In Configuration Manager enable 'TCP/IP' under SQL Server Network Configuration and restart the service. To allow username/password logins, set the server to 'Mixed Mode' in SSMS > server Properties > Security, then restart.",
        os: ["windows"],
      },
      {
        symptom: "you are on a Mac and cannot install any of this",
        cause: "SQL Server Express and SSMS are Windows-only executables.",
        fix: "Run SQL Server in Docker (mcr.microsoft.com/mssql/server image) and connect with Azure Data Studio or DBeaver. Same T-SQL, no Windows needed.",
        os: ["mac"],
      },
    ],
  },
  {
    id: "sqlite",
    name: "DB Browser for SQLite",
    category: "sql",
    topics: ["sql"],
    cost: "free",
    platforms: ["windows", "mac", "linux"],
    what: "SQLite is a database that lives in a single file with no server to run. DB Browser is a light GUI for it.",
    why: "Zero setup. Perfect for the first SQL lessons and for the in-app SQL Dojo game, which runs SQLite in your browser.",
    source: "https://sqlitebrowser.org/dl/",
    install: [
      {
        os: ["windows", "mac", "linux"],
        steps: [
          "Download the build for your OS from sqlitebrowser.org/dl.",
          "Install and open it.",
          "File > New Database to create a .db file, or File > Open Database to load a sample.",
        ],
        verify: "Open the 'Execute SQL' tab and run: SELECT sqlite_version();",
      },
    ],
    problems: [
      {
        symptom: "macOS says the app is damaged or from an unidentified developer",
        cause: "Gatekeeper quarantine on downloaded apps.",
        fix: "Right-click the app > Open, then confirm. Or run: xattr -dr com.apple.quarantine /Applications/DB\\ Browser\\ for\\ SQLite.app",
        os: ["mac"],
      },
    ],
  },
  /* ---------------------------------------------------------- spreadsheets */
  {
    id: "excel",
    name: "Microsoft Excel",
    category: "spreadsheets",
    topics: ["excel", "data-cleaning"],
    cost: "paid-or-student",
    platforms: ["windows", "mac"],
    note: "Power Query and the full pivot feature set are strongest on Excel for Windows. Excel for Mac is missing some Power Query UI. The free web version is missing more.",
    what: "The spreadsheet program. Part of a Microsoft 365 subscription.",
    why: "Still the most common analytics tool in the world. Most Case Files here assume you can build a pivot table and write VLOOKUP / INDEX-MATCH.",
    source: "https://www.microsoft.com/microsoft-365/excel",
    install: [
      {
        os: ["windows", "mac"],
        steps: [
          "If your school or employer has Microsoft 365, sign in at office.com and install from there first, it is free to you.",
          "Otherwise: Microsoft 365 Personal is a monthly or yearly subscription from microsoft.com/microsoft-365.",
          "Free alternative with no subscription: Excel on the web (office.com, needs a free Microsoft account), or LibreOffice Calc from libreoffice.org.",
        ],
        verify: "Open Excel, press Alt then check the Data tab shows 'Get Data' (that is Power Query).",
      },
    ],
    problems: [
      {
        symptom: "'Get Data' / Power Query is missing",
        cause: "You are on Excel for the web, an old version, or Excel for Mac (limited).",
        fix: "Use Excel for Windows desktop (2016 or newer). For the Mac, some Power Query editing must be done on Windows or the web.",
      },
      {
        symptom: "Analysis ToolPak / Solver not showing up",
        cause: "They are add-ins that ship disabled.",
        fix: "File > Options > Add-ins > Manage: Excel Add-ins > Go, tick 'Analysis ToolPak' and 'Solver Add-in'.",
      },
    ],
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    category: "spreadsheets",
    topics: ["excel"],
    cost: "free",
    platforms: ["windows", "mac", "linux"],
    what: "A free browser-based spreadsheet tied to a Google account.",
    why: "No install, works anywhere, and its formula language is close enough to Excel that most lessons transfer. A fine starting point if you cannot get Excel.",
    source: "https://sheets.google.com",
    install: [
      {
        os: ["windows", "mac", "linux"],
        steps: [
          "Go to sheets.google.com and sign in with a free Google account.",
          "Nothing to install. Optionally install the Google Sheets Chrome app for offline editing.",
        ],
        verify: "Create a blank sheet, type =SUM(1,2) in a cell, confirm it shows 3.",
      },
    ],
    problems: [
      {
        symptom: "large files are slow or hit a cell limit",
        cause: "Sheets caps at 10 million cells and struggles well before that.",
        fix: "For anything above ~50k rows move to Excel desktop or load the data into a database.",
      },
    ],
  },
  /* --------------------------------------------------------------------- BI */
  {
    id: "power-bi",
    name: "Power BI Desktop",
    category: "bi",
    topics: ["power-bi", "visualization"],
    cost: "free",
    platforms: ["windows"],
    note: "Windows only. On a Mac you must run Windows in a virtual machine (Parallels, UTM, Boot Camp on Intel) or use a cloud Windows desktop. The Power BI Service (browser) can build simple reports but not the full model.",
    what: "Microsoft's dashboard and reporting tool. Desktop authoring is free; sharing through the Power BI Service needs a paid license.",
    why: "One of the two dominant BI tools in job listings. The Power BI Case File and the dashboard sub-nodes need it.",
    source: "https://www.microsoft.com/download/details.aspx?id=58494",
    install: [
      {
        os: ["windows"],
        steps: [
          "Best path: install 'Power BI Desktop' from the Microsoft Store (it then auto-updates monthly).",
          "Or download the standalone installer from the link above (aka.ms/pbidesktopstore redirects there).",
          "Open it, skip the sign-in for now, choose 'Get data' to connect to a CSV or database.",
        ],
        verify: "Load any CSV, drag a text column and a number column onto the canvas, confirm a bar chart appears.",
      },
    ],
    problems: [
      {
        symptom: "no Power BI Desktop download for Mac",
        cause: "It is a Windows-only application, by design.",
        fix: "Run it inside a Windows VM, or use a free Microsoft Fabric / Power BI Service trial in the browser for lighter work.",
        os: ["mac"],
      },
      {
        symptom: "'can't publish' or sign-in rejected",
        cause: "Publishing needs a work or school account with a Power BI (Fabric) license; personal Microsoft accounts cannot publish.",
        fix: "For learning, you do not need to publish. Save .pbix files locally. If you want the Service, start a free Fabric trial with a work-style account.",
      },
    ],
  },
  {
    id: "tableau-public",
    name: "Tableau Public",
    category: "bi",
    topics: ["visualization", "storytelling"],
    cost: "free",
    platforms: ["windows", "mac"],
    note: "Tableau Public saves your workbooks to a public web profile only. That is fine, and good for a portfolio. There is no private-save option in the free edition.",
    what: "A free edition of Tableau, the other dominant BI tool. Full authoring, with the catch that everything you publish is public.",
    why: "A published Tableau Public profile is itself a portfolio piece. Recruiters look at them.",
    source: "https://www.tableau.com/products/public/download",
    install: [
      {
        os: ["windows", "mac"],
        steps: [
          "Download from tableau.com/products/public/download (you enter an email, then get the installer).",
          "Install and open. Create a free Tableau Public account when prompted, that is where your work saves.",
          "Connect to a CSV or Excel file to start.",
        ],
        verify: "Drag a dimension to Columns and a measure to Rows, confirm a chart renders in the view.",
      },
    ],
    problems: [
      {
        symptom: "you cannot save your work locally / privately",
        cause: "Tableau Public only saves to your public profile online.",
        fix: "Accept it for learning. If you need private/local saves you need Tableau Desktop (paid, but free for one year via the Tableau for Students program if you are enrolled).",
      },
      {
        symptom: "connector for your database is missing",
        cause: "Tableau Public supports fewer connectors than Tableau Desktop (mostly files and a few cloud sources).",
        fix: "Export your query result to CSV and connect to that, or upgrade to Desktop.",
      },
    ],
  },
  /* ------------------------------------------------------------ no-code db */
  {
    id: "airtable",
    name: "Airtable",
    category: "no-code-db",
    topics: ["data-cleaning", "excel"],
    cost: "free-tier",
    platforms: ["windows", "mac", "linux"],
    what: "A hybrid of a spreadsheet and a database in the browser. Rows, typed columns, links between tables, views.",
    why: "Good for understanding relational thinking (linked records, one-to-many) without SQL syntax. Some teams run real ops on it.",
    source: "https://airtable.com/signup",
    install: [
      {
        os: ["windows", "mac", "linux"],
        steps: [
          "Sign up free at airtable.com/signup.",
          "Nothing to install (a desktop and mobile app exist but are optional).",
          "Start from a template or create a base, add a table, set column types (single select, link to another record, date, formula).",
        ],
        verify: "Create two tables and add a 'Link to another record' field between them; confirm you can pick records from the other table.",
      },
    ],
    problems: [
      {
        symptom: "hit a record limit or run out of automation runs",
        cause: "The free plan caps records per base (1,000 on the current free tier) and monthly automation runs.",
        fix: "Keep practice bases small, or archive old rows. You do not need a paid plan to learn the concepts.",
      },
    ],
  },
  /* ----------------------------------------------------------------- python */
  {
    id: "python",
    name: "Python + VS Code",
    category: "python",
    topics: ["python", "statistics", "visualization"],
    cost: "free",
    platforms: ["windows", "mac", "linux"],
    what: "The Python language plus VS Code, a free code editor, plus the Jupyter extension for notebook-style analysis.",
    why: "Everything in the Python track runs here. Notebooks are how most analysts do exploratory work in Python.",
    source: "https://www.python.org/downloads/",
    install: [
      {
        os: ["windows"],
        steps: [
          "Download the latest 3.x installer from python.org/downloads.",
          "CRITICAL: on the first screen of the installer, tick 'Add python.exe to PATH' before clicking Install.",
          "Install VS Code from code.visualstudio.com.",
          "In VS Code, install the 'Python' and 'Jupyter' extensions from Microsoft.",
          "Create a project folder, open it in VS Code, and create a virtual environment: open a terminal and run  py -m venv .venv  then select it as the interpreter (Ctrl+Shift+P > Python: Select Interpreter).",
        ],
        verify: "In the VS Code terminal with .venv active, run: python -c \"import sys; print(sys.version)\"",
      },
      {
        os: ["mac", "linux"],
        steps: [
          "Mac: install via python.org installer, or 'brew install python'. Linux usually has Python 3 already.",
          "Install VS Code from code.visualstudio.com, add the Python and Jupyter extensions.",
          "Make a project folder and a virtual environment: python3 -m venv .venv  then  source .venv/bin/activate",
          "Install the core stack: pip install pandas numpy matplotlib seaborn jupyter",
        ],
        verify: "source .venv/bin/activate then: python -c \"import pandas; print(pandas.__version__)\"",
      },
    ],
    problems: [
      {
        symptom: "typing 'python' on Windows opens the Microsoft Store",
        cause: "Python was not added to PATH, so Windows falls back to its Store stub.",
        fix: "Re-run the installer, choose Modify, or reinstall with 'Add to PATH' ticked. Meanwhile use the 'py' launcher instead of 'python'.",
        os: ["windows"],
      },
      {
        symptom: "'pip' installs a package but the import still fails",
        cause: "You have more than one Python and pip installed into a different one than you are running.",
        fix: "Always work inside a virtual environment, and install with  python -m pip install X  (not bare 'pip') so it matches the interpreter you run.",
      },
      {
        symptom: "Jupyter notebook will not pick up your packages",
        cause: "The notebook kernel points at a different environment.",
        fix: "In VS Code, click the kernel picker top-right of the notebook and select your .venv. Or run  python -m ipykernel install --user --name myproject",
      },
      {
        symptom: "Anaconda and system Python fight on the PATH",
        cause: "Both put themselves first; 'conda' and 'venv' environments get crossed.",
        fix: "Pick one. If you use Anaconda, do everything through 'conda create' / 'conda activate' and do not also use pip venvs in the same shell.",
      },
    ],
  },
  /* ---------------------------------------------------------- version control */
  {
    id: "git",
    name: "Git + a GitHub account",
    category: "version-control",
    topics: ["git", "portfolio", "python", "sql"],
    cost: "free",
    platforms: ["windows", "mac", "linux"],
    what: "Git is the version-control program that runs on your machine. GitHub is a website that hosts Git repositories and is where your portfolio will live.",
    why: "The entire Git track needs it, and every portfolio project you publish goes through it. This is also step one of the Git sub-constellation.",
    source: "https://git-scm.com/downloads",
    install: [
      {
        os: ["windows"],
        steps: [
          "Download 'Git for Windows' from git-scm.com/downloads. This also gives you 'Git Bash', a Unix-style terminal.",
          "Run the installer. The defaults are fine. Two screens worth a look: choose VS Code (or your editor) as Git's default editor, and leave the line-ending option on 'Checkout Windows-style, commit Unix-style'.",
          "Create a free account at github.com.",
          "Set your identity: git config --global user.name \"Your Name\"  and  git config --global user.email \"you@example.com\"  (use the email on your GitHub account).",
        ],
        verify: "Open Git Bash and run: git --version  then  git config --global --list",
      },
      {
        os: ["mac"],
        steps: [
          "Run  git --version  in Terminal. If Git is missing, macOS offers to install the Command Line Tools, accept.",
          "Or install a newer Git with  brew install git.",
          "Create a free account at github.com.",
          "Set identity: git config --global user.name \"Your Name\"  and  git config --global user.email \"you@example.com\".",
        ],
        verify: "git --version  then  git config --global --list",
      },
      {
        os: ["linux"],
        steps: [
          "Debian/Ubuntu: sudo apt install git. Fedora: sudo dnf install git.",
          "Create a free account at github.com.",
          "Set identity with the two git config --global commands.",
        ],
        verify: "git --version",
      },
    ],
    problems: [
      {
        symptom: "GitHub rejects your password when you push",
        cause: "GitHub removed password auth for Git in 2021.",
        fix: "Use a Personal Access Token as the password (github.com > Settings > Developer settings > Personal access tokens), or install the GitHub CLI ('gh auth login'), or set up an SSH key. GitHub Desktop handles this for you.",
      },
      {
        symptom: "'fatal: not a git repository'",
        cause: "You are running git in a folder that was never initialized.",
        fix: "Run  git init  in the project folder, or  cd  into the folder that actually contains the .git directory.",
      },
      {
        symptom: "every file shows as modified right after checkout (Windows)",
        cause: "Line-ending conversion (CRLF vs LF) is misconfigured.",
        fix: "Run  git config --global core.autocrlf true  on Windows, and add a .gitattributes file with  * text=auto  to the repo.",
        os: ["windows"],
      },
      {
        symptom: "you committed a data file or a secret by accident",
        cause: "No .gitignore, or it was added after the fact.",
        fix: "Add the path to .gitignore, then  git rm --cached <file>  and commit. If it was a secret, rotate it, it is still in history. This is exactly what the GIT > gitignore-and-secrets chapter covers.",
      },
      {
        symptom: "stuck in a screen you cannot exit after a commit or merge",
        cause: "Git opened the Vim editor for a commit message.",
        fix: "Press  Esc , type  :wq , press Enter. Then set a friendlier editor:  git config --global core.editor \"code --wait\".",
      },
    ],
  },
  {
    id: "github-desktop",
    name: "GitHub Desktop",
    category: "version-control",
    topics: ["git", "portfolio"],
    cost: "free",
    platforms: ["windows", "mac"],
    what: "A free graphical app for the everyday Git actions: stage, commit, branch, push, pull, open a pull request.",
    why: "Lowers the barrier while you are learning. You can watch what each button does and cross-reference it with the command-line lessons.",
    source: "https://desktop.github.com/",
    install: [
      {
        os: ["windows", "mac"],
        steps: [
          "Download from desktop.github.com and install.",
          "Sign in with your GitHub account, it handles authentication for you (no token setup).",
          "File > Clone repository, or File > New repository to start one.",
        ],
        verify: "Clone one of your repos, make a small edit, and confirm the change appears in the 'Changes' tab ready to commit.",
      },
    ],
    problems: [
      {
        symptom: "not available on Linux",
        cause: "GitHub Desktop has no official Linux build.",
        fix: "On Linux use the command line, or a third-party GUI like GitKraken or the community 'github-desktop' fork.",
        os: ["linux"],
      },
    ],
  },
];

export const TOOLS_BY_ID: Record<string, Tool> = Object.fromEntries(
  TOOLS.map((t) => [t.id, t]),
);

export const TOOL_CATEGORIES: Array<{ id: Tool["category"]; label: string }> = [
  { id: "spreadsheets", label: "Spreadsheets" },
  { id: "sql", label: "Databases and SQL" },
  { id: "bi", label: "BI and dashboards" },
  { id: "python", label: "Python" },
  { id: "version-control", label: "Version control" },
  { id: "no-code-db", label: "No-code databases" },
];
