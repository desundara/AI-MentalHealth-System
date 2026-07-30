# MindCare — AI-Powered Mental Health Self-Assessment & Mood Tracking System

A web-based mental health self-assessment and mood tracking system built with React.js, Node.js, and Microsoft SQL Server. Users log daily mood data and receive AI-generated risk assessments and personalised coping suggestions powered by the LLaMA 3.1 model via the Groq API.

---

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@mindcare.com | SuperAdmin@123 |
| Counselor | counselor@mindcare.com | Counselor@123 |
| User | Register via /register | — |

---

## Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** v18 or above → https://nodejs.org
- **npm** v8 or above (comes with Node.js)
- **Microsoft SQL Server** 2019 or above (Developer or Express Edition)
  → https://www.microsoft.com/en-us/sql-server/sql-server-downloads
- **SQL Server Management Studio (SSMS)**
  → https://aka.ms/ssmsfullsetup
- A **Groq API key** (free) → https://console.groq.com
- A **Gmail account** with App Password enabled for email alerts

---

## Database Setup

### Step 1 — Find your SQL Server instance name
1. Open **SQL Server Management Studio (SSMS)**
2. At the top of the Object Explorer panel, note your server name
   (e.g. `LAPTOP-ABC\SQLEXPRESS` or just `LAPTOP-ABC`)

### Step 2 — Run the schema script
1. Open SSMS → File → Open → `backend/config/schema.sql`
2. Click **Execute** (or press F5)
3. You should see: `MentalHealthDB schema created successfully!`

---

## Backend Setup

### Step 1 — Install dependencies
```bash
cd backend
npm install
```

### Step 2 — Configure environment variables
1. Copy `.env.example` to `.env`
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values:

```env
PORT=5000

# Replace with your SQL Server instance name from SSMS
DB_SERVER=YOUR_SERVER_NAME
DB_PORT=1433
DB_NAME=MentalHealthDB
DB_USER=sa
DB_PASSWORD=YOUR_SA_PASSWORD
DB_TRUSTED_CONNECTION=true
DB_ENCRYPT=false

# Generate a secure random string (run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Get a free Groq API key from https://console.groq.com
OPENAI_API_KEY=your_groq_api_key_here

# Gmail address and App Password for email alerts
# To generate App Password: Google Account → Security → 2-Step Verification → App Passwords
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

CLIENT_URL=http://localhost:3000
```

### Step 3 — Start the backend server
```bash
npm run dev
```

You should see:
```
✅ MSSQL Connected: MentalHealthDB
🚀 Server running on http://localhost:5000
```

---

## Frontend Setup

### Step 1 — Install dependencies
```bash
cd frontend
npm install
```

### Step 2 — Configure environment
Create a `.env` file in the `frontend` folder:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3 — Start the frontend
```bash
npm start
```

The application will open at **http://localhost:3000**

---

## Running the Full Application

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

Then open your browser at **http://localhost:3000**

---

## Project Structure

```
AI-MentalHealth-System/
├── backend/
│   ├── config/
│   │   ├── db.js               # MSSQL connection
│   │   └── schema.sql          # Database schema & seed data
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── mood.controller.js
│   │   ├── counselor.controller.js
│   │   ├── admin.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── mood.routes.js
│   │   ├── counselor.routes.js
│   │   ├── admin.routes.js
│   │   └── user.routes.js
│   ├── utils/
│   │   ├── openai.util.js      # Groq/LLaMA AI integration
│   │   └── email.util.js       # Nodemailer email alerts
│   ├── .env                    # Environment variables (not in repo)
│   ├── .env.example            # Environment variables template
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   ├── charts/
    │   │   └── common/
    │   ├── context/
    │   ├── hooks/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    └── package.json
```

---

## Key Features

- **Daily Mood Logging** — mood score, stress, anxiety, sleep, symptoms, notes
- **AI Risk Assessment** — Low / Medium / High risk via LLaMA 3.1 (Groq API)
- **Counselor Dashboard** — alerts, user monitoring, mood history
- **Email Alerts** — automatic high-risk notifications to counselors
- **Mood Trend Charts** — interactive visualisation with Recharts
- **Weekly Summary** — average stats and risk breakdown
- **PDF Report** — downloadable mood history report
- **Auto Logout** — 15-minute idle timeout for security
- **Dark Mode** — full light/dark theme support
- **Role-Based Access** — User, Counselor, Super Admin roles

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, Tailwind CSS 3, Recharts |
| Backend | Node.js 20, Express 5 |
| Database | Microsoft SQL Server 2019 |
| AI | Groq API + LLaMA 3.1 8B Instant |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Email | Nodemailer (Gmail SMTP) |
| PDF | jsPDF + jspdf-autotable |

---

## Important Notes

- The `.env` file contains sensitive credentials and is **not included** in the submission
- You must generate your own **Groq API key** (free at console.groq.com)
- You must set up your own **Gmail App Password** for email alerts
- The system is a **self-assessment tool only** and is not a clinical diagnostic instrument

---

*Developed by M. Gayani Desundara Samaraweera | Student No: 25027290 | COM646 Computing Project | Glyndŵr University*
