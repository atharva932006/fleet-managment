# Atharva Enterprises - Fleet Management Web App

A complete, high-fidelity responsive Fleet Management Web App built with React (Vite) on the frontend, Node.js (Express) on the backend, and SQLite for database persistence. The system is designed to manage aggregator cabs (Ola, Uber, Rapido) and private trips, dividing dashboard experiences into **Owner/Admin** and **Driver** views. It is fully packaged as a Progressive Web App (PWA) that is installable on mobile devices.

## Features

### Owner/Admin Dashboard
- **Live KPIs**: Earnings (Today vs. Month), Expenses (Today vs. Month), Net profit margins, Active Fleet Count, and Registered Driver Count.
- **Aggregated Analytics Charts**:
  - Daily Earnings trend lines (30 Days)
  - Expense Category distribution (Doughnut chart)
  - Individual vehicle revenue vs. expense bars
- **Fleet Inventory Manager**: CRUD details for vehicles, tracking expletive alarms (Insurance, Permit, PUC, Service exps).
- **Driver registry**: Add, edit, remove driver profiles, customize share splits (40%, 50%, custom), and assign vehicles.
- **Approval Queue**: Authorize or reject driver-submitted expenses with receipt photo attachments.
- **Settlement Processor**: Automatically calculates earnings splits, deducts expenses, displays final payouts, logs payment transaction codes, and tracks settlement history.
- **Reporting Module**: Custom date-range reports for vehicle and driver performance. Includes instant exports to **CSV (Excel)** and **Print to PDF** layouts.

### Driver Dashboard (Mobile-First)
- **Big KPI counters**: Daily, weekly, monthly gross revenue generated, and unpaid settlement balances.
- **Assigned vehicle card**: Displays plate numbers, models, and real-time maintenance warnings.
- **PWA expense submission form**: Log fuel, tolls, and parking costs out of pocket, including receipt file/photo uploading and image previewing.
- **Logs checklist**: Tracking submitted expenses statuses (Pending, Approved, Rejected) and historic settlement payout slips.

### System-Wide
- **PWA support**: Registered Service Worker (`sw.js`) and manifest configuration (`manifest.json`) allow full standalone installation on Android and iOS devices.
- **Dynamic Themes**: Instant, fluid switching between Light Mode and Dark Mode.
- **Notifications**: Automated background date checkers that flag vehicle expiries and unpaid driver settlements.

---

## Directory Structure

```
fleet_manager/
├── database_schema.sql      # Database layout definition
├── README.md                # System documentation
├── backend/
│   ├── src/
│   │   ├── db.js            # SQLite connector and database seeder
│   │   ├── index.js         # Express app entrypoint
│   │   └── routes/
│   │       ├── auth.js      # JWT authentication and user routing
│   │       ├── owner.js     # Owner CRUD actions and statistics
│   │       └── driver.js    # Driver actions and multer uploads
│   ├── package.json
│   └── uploads/             # Stores receipt image uploads
└── frontend/
    ├── index.html           # Main PWA HTML, loads Inter font
    ├── package.json
    ├── public/
    │   ├── manifest.json    # PWA install config
    │   └── sw.js            # Service worker caching
    └── src/
        ├── App.jsx          # App layout and root routing
        ├── main.jsx         # Bootstrap entry
        ├── context/
        │   └── AuthContext.jsx # JWT state provider
        ├── styles/
        │   └── main.css     # CSS variable stylesheet and print layout rules
        └── pages/
            ├── OwnerDashboard.jsx # Full-featured Admin view
            └── DriverDashboard.jsx # Mobile-first Driver view
```

---

## Installation & Running

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **NPM** installed on your machine.

### 2. Backend Setup
1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. The dependencies (`express`, `sqlite3`, `bcryptjs`, `jsonwebtoken`, `multer`, `cors`, `dotenv`) are already installed. You can launch the server:
   ```bash
   node src/index.js
   ```
   *The server will initialize a SQLite database file `fleet.db`, seed it with initial credentials/logs, and start running on **http://localhost:5001**.*

### 3. Frontend Setup
1. Open a separate terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. The dependencies (`react`, `react-dom`, `react-chartjs-2`, `chart.js`, `lucide-react`) are already installed. Start the Vite server:
   ```bash
   npm run dev
   ```
   *Vite will compile and launch the hot-reload server (usually on **http://localhost:5173**).*

---

## Demo Login Credentials

### Owner Admin Account
- **Mobile Number**: `9876543210`
- **Password**: `admin123`

### Driver Accounts
- **Driver 1 (Assigned MH-12-PQ-1234)**:
  - **Mobile Number**: `9000000001`
  - **Password**: `driver123`
- **Driver 2 (Assigned MH-12-XY-5678 - Expiring Documents)**:
  - **Mobile Number**: `9000000002`
  - **Password**: `driver123`
