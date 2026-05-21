# SFSAPDemoCRM (CRM System)

> A demo-first CRM built for home services businesses — pre-loaded with realistic data and ready to show prospects in minutes.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-FFD700?style=for-the-badge&logo=replit&logoColor=black)](https://sfsapdemocrm.replit.app)
[![SmartFlow Systems](https://img.shields.io/badge/SmartFlow-Systems-0a0a0a?style=for-the-badge)](https://github.com/smartflow-systems)

---

## What It Does

SFSAPDemoCRM is a lightweight, production-ready customer relationship management application designed for home services companies such as plumbers, landscapers, and cleaners. It ships with pre-seeded realistic data so it looks live from the moment it starts. Core features include a drag-and-drop Kanban pipeline, lead and opportunity tracking with stage progression, task management, account and contact records, and a reporting dashboard — all wrapped in a dark gold UI. The demo mode removes authentication barriers so prospects can explore every feature immediately.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Frontend | React + Vite, Wouter (routing), Tailwind CSS, Radix UI |
| Database / Storage | PostgreSQL via Drizzle ORM (configured; Neon recommended) |
| Key packages | @dnd-kit (drag-and-drop Kanban), TanStack Query, React Hook Form + Zod, bcryptjs |

---

## How to Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/smartflow-systems/SFSAPDemoCRM.git
cd SFSAPDemoCRM

# 2. Install dependencies
npm install

# 3. Copy the environment variables file and fill in your values
cp .env.example .env

# 4. Push the database schema
npm run migrate

# 5. Seed demo data and start the server
npm run dev
```

The app will be available at `http://localhost:5000`.

---

## Environment Variables

| Variable | Required | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `NODE_ENV` | No | Runtime environment | `production` |
| `FRONTEND_URL` | No | Allowed CORS origin for the frontend (production) | `https://sfsapdemocrm.replit.app` |
| `PORT` | No | Port the server listens on | `5000` |

---

## API Endpoints

| Method | Route | Auth required | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check |
| `GET` | `/api/users` | No | List CRM users |
| `GET` | `/api/accounts` | No | List all accounts (companies) |
| `GET` | `/api/accounts/:id` | No | Get a single account |
| `POST` | `/api/accounts` | No | Create a new account |
| `PATCH` | `/api/accounts/:id` | No | Update an account |
| `DELETE` | `/api/accounts/:id` | No | Delete an account |
| `GET` | `/api/contacts` | No | List all contacts |
| `GET` | `/api/contacts/:id` | No | Get a single contact |
| `POST` | `/api/contacts` | No | Create a new contact |
| `PATCH` | `/api/contacts/:id` | No | Update a contact |
| `DELETE` | `/api/contacts/:id` | No | Delete a contact |
| `GET` | `/api/leads` | No | List all leads |
| `GET` | `/api/leads/:id` | No | Get a single lead |
| `POST` | `/api/leads` | No | Create a new lead |
| `PATCH` | `/api/leads/:id` | No | Update a lead (e.g. change stage) |
| `DELETE` | `/api/leads/:id` | No | Delete a lead |
| `POST` | `/api/leads/:id/convert` | No | Convert a lead to an opportunity |
| `GET` | `/api/opportunities` | No | List all opportunities |
| `GET` | `/api/opportunities/:id` | No | Get a single opportunity |
| `POST` | `/api/opportunities` | No | Create a new opportunity |
| `PATCH` | `/api/opportunities/:id` | No | Update an opportunity |
| `DELETE` | `/api/opportunities/:id` | No | Delete an opportunity |
| `GET` | `/api/activities` | No | List all activities |
| `GET` | `/api/activities/lead/:leadId` | No | List activities for a lead |
| `POST` | `/api/activities` | No | Log a new activity |
| `PATCH` | `/api/activities/:id` | No | Update an activity |
| `DELETE` | `/api/activities/:id` | No | Delete an activity |
| `POST` | `/api/init-demo` | No | Re-seed the database with fresh demo data |

---

## How It Connects to SmartFlow Systems

- **Main hub** — [`smartflow-systems/SmartFlowSite`](https://github.com/smartflow-systems/SmartFlowSite) links to this repo's live demo from the CRM System product card on the homepage.
- **Design system** — follows the SFS design system (gold `#FFD700` on dark `#0a0a0a`). See [`sfs-claude-skills`](https://github.com/smartflow-systems/sfs-claude-skills) for the full token reference.
- **Stripe** — Not used in this repo.
- **Other integrations** — None. The app is intentionally self-contained to make demos frictionless.

---

## Live Demo

**[sfsapdemocrm.replit.app](https://sfsapdemocrm.replit.app)** — Login-free CRM demo with pre-loaded accounts, contacts, leads, and a live Kanban pipeline.

---

## Design System

This repo follows the SmartFlow Systems design system.

- Brand colours: Gold `#FFD700` on dark background `#0a0a0a`
- Background: `#0D0D0D`
- Gold gradient CTAs: `linear-gradient(135deg, #FFD700, #E6C200)` with black text
- Typography: Inter (headings), system-ui (body)
- Full token reference and component rules: [`sfs-claude-skills/sfs-design-system/SKILL.md`](https://github.com/smartflow-systems/sfs-claude-skills/blob/main/sfs-design-system/SKILL.md)

---

## Contact

| | |
|---|---|
| Sales enquiries | [sales@smartflowsystems.com](mailto:sales@smartflowsystems.com) |
| Book a demo | [calendly.com/boweazy123](https://calendly.com/boweazy123) |

---

## Part of the SmartFlow Systems Suite

SmartFlow Systems builds automation tools for modern businesses — booking, CRM, e-commerce, AI bots, analytics, and more.

| | |
|---|---|
| Website | [smartflowsystems.replit.app](https://smartflowsystems.replit.app) |
| All repos | [github.com/smartflow-systems](https://github.com/smartflow-systems) |

---

*Built by SmartFlow Systems.*
