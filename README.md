<!-- BADGES:START -->
[![SFS CI + Deploy](https://github.com/smartflow-systems/SFSAPDemoCRM/actions/workflows/ci.yml/badge.svg)](https://github.com/smartflow-systems/SFSAPDemoCRM/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
<!-- BADGES:END -->

# Smart Flow Systems CRM 🚀

**Enterprise-Grade Customer Relationship Management System**

A powerful, modern CRM built specifically for the home services industry. Features real-time notifications, advanced analytics, workflow automation, and enterprise-level capabilities.

---

## ✨ Key Features

- 🎯 **Complete CRM** - Leads, Opportunities, Contacts, Accounts, Activities
- 📊 **Real-Time Dashboard** - 6 interactive charts with live KPIs
- 🔔 **WebSocket Notifications** - Instant updates across all clients
- 🤖 **Workflow Automation** - Smart task creation and reminders
- 📁 **CSV Import/Export** - Bulk data operations made easy
- 📱 **Progressive Web App** - Install and use offline
- 🗄️ **PostgreSQL Support** - Production-ready persistent storage
- 🔐 **Enterprise Security** - Rate limiting, validation, error handling

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run in development (uses in-memory storage)
npm run dev

# Open http://localhost:5000
```

**Demo Login:** username: `gareth` / password: `demo123`

### With PostgreSQL

```bash
# Set database URL
export DATABASE_URL=postgresql://user:password@localhost:5432/sfs_crm

# Run migration
npm run db:migrate

# Start server
npm run dev
```

---

## 📚 Documentation

- **[API Documentation](./API-DOCUMENTATION.md)** - Complete API reference
- **[Design System](./SFS-DESIGN-SYSTEM.md)** - UI guidelines
- **[Agent Notes](./AGENTS.md)** - Development guidelines

---

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript, Vite, TanStack Query, Radix UI, Tailwind CSS
**Backend:** Node.js, Express, TypeScript, Drizzle ORM, WebSocket
**Database:** PostgreSQL (Neon), In-Memory fallback
**Security:** Rate limiting, Zod validation, Security headers

---

## 📊 Features Overview

### CRM Core
- Lead management with search, filters, pagination
- Visual opportunity pipeline with drag-and-drop
- Contact and account management
- Activity tracking (calls, emails, meetings, tasks, notes)
- Lead conversion workflow

### Analytics
- Real-time dashboard with KPIs
- Revenue trend charts
- Pipeline distribution
- Lead source analysis
- Recent activity feed

### Automation
- Auto-create follow-up tasks for new leads
- Stage-based task creation for opportunities
- Task reminders (checks every 5 minutes)
- Real-time WebSocket notifications

### Data Management
- Export leads/contacts/opportunities to CSV
- Import leads from CSV with validation
- Bulk delete operations
- Advanced search across all fields
- Server-side pagination

### PWA Capabilities
- Install as desktop/mobile app
- Offline support with service worker
- Responsive design for all devices
- Fast loading with caching

---

## 📁 Project Structure

```
├── client/              # React frontend
│   ├── src/pages/      # Dashboard, Leads, Pipeline, Tasks, Reports, Contacts, Accounts
│   ├── src/components/ # Reusable UI components
│   └── public/         # PWA manifest, service worker
├── server/             # Express backend
│   ├── routes.ts      # API endpoints
│   ├── automation.ts  # Workflow engine
│   ├── websocket.ts   # Real-time notifications
│   ├── db-storage.ts  # PostgreSQL implementation
│   └── csv-utils.ts   # Import/export utilities
└── shared/            # TypeScript types
```

---

## 🔧 Scripts

```bash
npm run dev        # Development server
npm run build      # Build for production
npm start          # Run production server
npm run check      # TypeScript type checking
npm run db:migrate # Create database tables
```

---

## 🌐 API Endpoints

```
GET    /api/leads              # List leads (with search, filters, pagination)
POST   /api/leads              # Create lead (auto-creates task)
PATCH  /api/leads/:id          # Update lead
DELETE /api/leads/:id          # Delete lead
POST   /api/leads/:id/convert  # Convert to opportunity

GET    /api/export/leads/csv       # Export to CSV
POST   /api/import/leads/csv       # Import from CSV
POST   /api/leads/bulk-delete      # Bulk delete

GET    /api/opportunities  # All CRUD operations + CSV export
GET    /api/contacts       # All CRUD operations + CSV export
GET    /api/accounts       # All CRUD operations
GET    /api/activities     # All CRUD operations
```

**WebSocket:** `ws://localhost:5000/ws`

See [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) for complete reference.

---

## 🔐 Security

- ✅ Rate limiting (100 req/15min API, 5 req/15min auth)
- ✅ Security headers (XSS, CSRF, Frame Options)
- ✅ Input validation with Zod schemas
- ✅ SQL injection protection (ORM)
- ✅ 10MB payload limit
- ✅ Error sanitization in production

---

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/smartflow-systems/SFSAPDemoCRM/issues)
- **Documentation:** Full docs in this repository
- **Email:** support@smartflowsystems.com

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

**Built with ❤️ by Smart Flow Systems**
