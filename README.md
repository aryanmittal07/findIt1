# FindIt — Safe, Verified Lost and Found Platform

FindIt is a complete, production-grade lost-and-found web application built to feel like a carefully engineered, human-made civic product. It prioritizes a calm, confident, safety-oriented design with generous whitespace, strong typography hierarchy, and privacy-first safeguards.

---

## 🌟 Key Highlights & Architecture

- **Privacy-First Communication**: Personal phone numbers and email addresses are never exposed publicly. All communication is routed safely through protected in-app message threads with claimant ownership verification.
- **Dual Role-Based Access Control (RBAC)**: Ordinary community members manage their reports and messages, while administrators have a dedicated, protected control panel for review, moderation, dispute resolution, user restrictions, and immutable audit logs.
- **Smart Match Suggestion Engine**: Automatically correlates newly registered found items with missing item reports based on category, geographical proximity, and brand/model keywords.
- **Persistent Storage**: Backed by a relational SQLite database with Prisma ORM, migrations, relations, and seed scripts.
- **Unified Reporting Center**: Clean forms for reporting lost property, found items, or filing safety complaints and support tickets with unique reference codes (`FID-2026-XXXX` and `CMP-2026-XXXX`).

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom slate & warm off-white palette, subtle indigo & emerald accents
- **Database**: SQLite with Prisma Client
- **Authentication**: JWT-based HTTP-only secure cookie sessions with bcrypt password hashing
- **Form Validation**: Zod schemas on both client and server
- **Icons**: Lucide React (no generic emojis)
- **Image Handling**: Verified file uploads with MIME & size validation (5MB max) with live preview

---

## 🚀 Getting Started

The project is located in:
```bash
/Users/aryanmittal/.gemini/antigravity/scratch/findit
```

### 1. Environment Setup

Environment variables are configured in `.env` (template in `.env.example`):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="findit-super-secret-production-jwt-key-change-me-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 2. Running Locally

The application server is already built and running on port 3000!

To start or build manually:
```bash
# Export the portable Node.js binary path
export PATH="$HOME/.local/node/bin:$PATH"

# Run database seed
npm run db:seed

# Start the production Next.js server
npm run build && npm start
```

Visit: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Demo Accounts for Local Testing

The database comes pre-seeded with realistic community listings, categories, conversations, and verified test accounts:

### 1. Community Member (Sarah Jenkins)
- **Email**: `sarah@example.com`
- **Password**: `UserPass123!`
- **Role**: Normal User
- **Features**: Active report for lost Bellroy wallet, ongoing chat with Marcus Vance, smart match suggestions, notification alerts.

### 2. Community Finder (Marcus Vance)
- **Email**: `marcus@example.com`
- **Password**: `UserPass123!`
- **Role**: Normal User
- **Features**: Found black leather wallet outside Central Station Gate 3.

### 3. Administrator (Operations & Trust)
- **Email**: `admin@findit.org`
- **Password**: `AdminPass123!`
- **Role**: Administrator (`ADMIN`)
- **Features**: Access to `/admin` control panel, metrics dashboard, listing moderation queue, ticket resolution, user account suspension/activation, and audit trail.

*(Note: One-click demo login buttons are also provided directly on the `/login` screen for fast testing!)*

---

## 🧪 Testing

An automated end-to-end verification test suite is included:
```bash
node e2e_test.js
```
The suite verifies all 10 core capability areas (36 test assertions: public directory, search/filtering, PII privacy protection, registration, login/logout, report creation, messaging, complaints resolution, match engine, and admin RBAC).
