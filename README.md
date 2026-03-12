# ContractPilot ⚖️
### AI-Powered Contract Review & Clause Analyzer for Freelancers

---

## 🔗 Live Demo
**[https://contract-pilot.onrender.com](https://contract-pilot.onrender.com)**

> ⚠️ **Note:** The app is hosted on Render's free tier which spins down after inactivity. If you see a loading screen when you first open the link, just wait 30–60 seconds for the server to start up. It will load normally after that.

---

## 🧠 What I Built

ContractPilot is a SaaS web application that solves a real problem for freelancers — signing contracts without understanding the risks. Users upload a contract PDF and instantly get an AI-powered analysis that identifies risky clauses, scores risk level, explains legal jargon in plain English, and suggests exactly what to negotiate.

### Core Features (MVP)
- ✅ Google OAuth authentication with per-user contract isolation
- ✅ Contract dashboard with full upload history
- ✅ PDF upload with server-side text extraction
- ✅ AI clause analysis across 6 categories:
  - Payment Terms, IP Rights, Termination, Liability, Non-Compete, Confidentiality
- ✅ Risk scoring per clause (Low / Medium / High) with plain-English explanations
- ✅ Overall contract risk score + executive summary
- ✅ Side-by-side view: original contract text with color-coded highlights + AI annotation cards

### Bonus Features
- ✅ **Compare two contracts** side by side — clause-by-clause breakdown with a winner verdict
- ✅ **Counter-proposal generator** — AI rewrites all risky clauses into freelancer-friendly alternatives

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes |
| AI Engine | Google Gemini API (gemini-1.5-flash) |
| PDF Parsing | pdf-parse |
| Authentication | NextAuth.js with Google OAuth |
| Database | Supabase (PostgreSQL) |
| Deployment | Render |

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Drishti84/Contract-pilot.git
cd Contract-pilot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env.local` in the project root
```bash
GEMINI_API_KEY=your_gemini_api_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Set up Supabase tables
Run this SQL in your Supabase SQL Editor:
```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  created_at timestamp default now()
);

create table contracts (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  filename text not null,
  raw_text text,
  status text default 'pending',
  uploaded_at timestamp default now()
);

create table analyses (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid references contracts(id) on delete cascade,
  overall_score text,
  summary text,
  clauses jsonb,
  created_at timestamp default now()
);
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗂 Project Structure

```
contractpilot/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── dashboard/page.tsx              # Contract dashboard
│   ├── contract/[id]/page.tsx          # Analysis results page
│   ├── compare/page.tsx                # Contract comparison page
│   ├── counter-proposal/[id]/page.tsx  # Counter-proposal page
│   └── api/
│       ├── auth/[...nextauth]/         # Google OAuth
│       ├── upload/                     # PDF upload + text extraction
│       ├── analyze/                    # Gemini AI analysis
│       ├── compare/                    # Contract comparison
│       └── counter-proposal/           # Counter-proposal generation
├── components/
│   ├── ContractUploader.tsx            # Drag & drop upload widget
│   ├── SideBySideView.tsx             # Original text + AI annotations
│   ├── ClauseCard.tsx                 # Single clause with risk badge
│   ├── RiskBadge.tsx                  # Low / Medium / High badge
│   └── OverallScoreBanner.tsx         # Top risk score banner
└── lib/
    ├── claude.ts      # Gemini API wrapper + prompt
    ├── supabase.ts    # Supabase client
    └── types.ts       # TypeScript interfaces
```

---

## 💡 Approach & Key Decisions

**Why Next.js?**
A single codebase handles both frontend and backend via API routes. No separate Express server needed — this kept the project lean and fast to build within the 3-day deadline.

**Why Gemini instead of Claude?**
Started with the Anthropic API but switched to Google Gemini (free tier) mid-build to avoid billing friction during development. The `gemini-1.5-flash` model handles structured JSON output reliably and is fast enough for real-time contract analysis.

**AI Prompt Design**
The core of the app is a carefully engineered prompt sent to Gemini. It always returns a strict JSON schema with `overall_score`, `summary`, and a `clauses[]` array — making frontend rendering predictable and reliable without complex parsing logic.

**Supabase over a custom backend**
Supabase gave instant PostgreSQL with a JavaScript client, eliminating the need for a separate backend service. The `jsonb` column type was perfect for storing the variable-length clauses array returned by Gemini.

**User isolation**
Contracts are filtered by the logged-in user's email so each user only sees their own upload history — a critical data privacy requirement for any real SaaS product.

**Prioritization**
Built the full MVP pipeline first (auth → upload → analyze → display) before touching UI polish. Once the data was flowing correctly end-to-end, the bonus features (compare + counter-proposal) were straightforward to layer on top.

**What I'd add with more time**
- Stripe integration for a paid tier
- Email notification when analysis completes
- Export counter-proposal as a formatted PDF
- Clause library for saving negotiation templates
- Support for DOCX files in addition to PDF

---

