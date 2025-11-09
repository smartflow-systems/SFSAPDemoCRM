# Smart Flow Systems CRM - API Documentation

Complete API reference for the SFS CRM system.

## Table of Contents

- [Authentication](#authentication)
- [Leads](#leads)
- [Opportunities](#opportunities)
- [Contacts](#contacts)
- [Accounts](#accounts)
- [Activities](#activities)
- [CSV Import/Export](#csv-importexport)
- [Bulk Operations](#bulk-operations)

## Base URL

```
http://localhost:5000/api
```

## Authentication

Currently using demo authentication. Real authentication with Passport.js coming soon.

---

## Leads

### Get All Leads

```http
GET /api/leads
```

**Query Parameters:**
- `search` (string): Search across name, company, email, phone
- `status` (string): Filter by status (New, Contacted, Qualified, Converted, Lost)
- `source` (string): Filter by source
- `ownerId` (string): Filter by owner
- `sortBy` (string): Field to sort by (default: createdAt)
- `sortOrder` (string): asc or desc (default: desc)
- `page` (number): Page number for pagination
- `limit` (number): Items per page (default: 50)

**Response:**
```json
// Without pagination
[{
  "id": "uuid",
  "name": "John Doe",
  "company": "Acme Corp",
  "email": "john@acme.com",
  "phone": "(555) 123-4567",
  "status": "New",
  "source": "Website",
  "rating": "Hot",
  "value": 50000,
  "ownerId": "user-id",
  "createdAt": "2025-01-01T00:00:00Z"
}]

// With pagination
{
  "data": [...leads],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```

### Get Single Lead

```http
GET /api/leads/:id
```

### Create Lead

```http
POST /api/leads
```

**Body:**
```json
{
  "name": "John Doe",
  "company": "Acme Corp",
  "email": "john@acme.com",
  "phone": "(555) 123-4567",
  "source": "Website",
  "status": "New",
  "rating": "Hot",
  "value": 50000,
  "ownerId": "user-id",
  "description": "Interested in HVAC services"
}
```

**Automation:** Auto-creates follow-up task for 2 days from now.

### Update Lead

```http
PATCH /api/leads/:id
```

### Delete Lead

```http
DELETE /api/leads/:id
```

### Convert Lead to Opportunity

```http
POST /api/leads/:id/convert
```

**Response:**
```json
{
  "message": "Lead converted successfully",
  "opportunity": {...},
  "lead": {...}
}
```

**Automation:** Creates opportunity in Discovery stage and sends notification.

---

## Opportunities

### Get All Opportunities

```http
GET /api/opportunities
```

**Query Parameters:**
- `search` (string): Search name and description
- `stage` (string): Filter by stage (Discovery, Proposal, Negotiation, Won, Lost)
- `ownerId` (string): Filter by owner
- `minValue` (number): Minimum opportunity value
- `maxValue` (number): Maximum opportunity value
- `sortBy` (string): Field to sort by
- `sortOrder` (string): asc or desc
- `page` (number): Page number
- `limit` (number): Items per page

### Create Opportunity

```http
POST /api/opportunities
```

**Body:**
```json
{
  "name": "HVAC Installation - Acme Corp",
  "accountId": "account-uuid",
  "contactId": "contact-uuid",
  "ownerId": "user-id",
  "stage": "Discovery",
  "value": 50000,
  "probability": 20,
  "expectedCloseDate": "2025-06-01",
  "source": "Website",
  "description": "Full HVAC system replacement"
}
```

### Update Opportunity

```http
PATCH /api/opportunities/:id
```

**Automation:** When stage changes, creates stage-specific task and sends notification when Won.

---

## Contacts

### Get All Contacts

```http
GET /api/contacts
```

### Create Contact

```http
POST /api/contacts
```

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@acme.com",
  "phone": "(555) 123-4567",
  "mobile": "(555) 987-6543",
  "title": "CTO",
  "department": "Technology",
  "accountId": "account-uuid"
}
```

### Update Contact / Delete Contact

```http
PATCH /api/contacts/:id
DELETE /api/contacts/:id
```

---

## Accounts

### Get All Accounts

```http
GET /api/accounts
```

### Create Account

```http
POST /api/accounts
```

**Body:**
```json
{
  "name": "Acme Corporation",
  "accountType": "Customer",
  "industry": "Technology",
  "website": "https://acme.com",
  "phone": "(555) 123-4567",
  "billingStreet": "123 Main St",
  "billingCity": "San Francisco",
  "billingState": "CA",
  "billingPostalCode": "94105",
  "billingCountry": "USA",
  "numberOfEmployees": 500,
  "annualRevenue": 10000000,
  "description": "Leading technology company"
}
```

---

## Activities

### Get All Activities

```http
GET /api/activities
```

### Get Activities by Lead

```http
GET /api/activities/lead/:leadId
```

### Create Activity

```http
POST /api/activities
```

**Body:**
```json
{
  "type": "call",
  "subject": "Follow-up call",
  "description": "Discuss HVAC requirements",
  "dueDate": "2025-01-15T10:00:00Z",
  "priority": "high",
  "completed": false,
  "ownerId": "user-id",
  "leadId": "lead-uuid"
}
```

**Types:** call, email, meeting, task, note

---

## CSV Import/Export

### Export Leads to CSV

```http
GET /api/export/leads/csv
```

Downloads CSV file with all leads.

### Import Leads from CSV

```http
POST /api/import/leads/csv
```

**Body:**
```json
{
  "csvData": "name,company,email,phone,source\nJohn Doe,Acme,john@acme.com,(555)123-4567,Website"
}
```

**Response:**
```json
{
  "message": "Imported 10 leads",
  "created": 10,
  "errors": 0,
  "errorDetails": []
}
```

### Export Contacts to CSV

```http
GET /api/export/contacts/csv
```

### Export Opportunities to CSV

```http
GET /api/export/opportunities/csv
```

---

## Bulk Operations

### Bulk Delete Leads

```http
POST /api/leads/bulk-delete
```

**Body:**
```json
{
  "ids": ["lead-uuid-1", "lead-uuid-2", "lead-uuid-3"]
}
```

**Response:**
```json
{
  "message": "Deleted 3 leads",
  "deleted": 3,
  "errors": 0,
  "errorDetails": []
}
```

---

## Automation Features

The CRM includes intelligent automation:

### Lead Automation
- **New Lead Created** → Auto-creates follow-up task (2 days)
- **Lead Updated** → Sends real-time notification
- **Lead Converted** → Creates opportunity + sends notification

### Opportunity Automation
- **Discovery Stage** → Creates discovery call task (3 days)
- **Proposal Stage** → Creates proposal task (5 days)
- **Negotiation Stage** → Creates negotiation task (2 days)
- **Won** → Sends celebration notification

### Task Automation
- **Due Soon** → Reminder sent 24 hours before (runs every 5 minutes)
- **Overdue** → Critical priority notification

---

## Real-Time Notifications

WebSocket endpoint: `ws://localhost:5000/ws`

**Connect and Authenticate:**
```json
{
  "type": "auth",
  "userId": "your-user-id"
}
```

**Notification Types:**
- `lead_created`
- `lead_updated`
- `opportunity_won`
- `task_due`
- `system_alert`

---

## Rate Limiting

- **API Requests:** 100 requests per 15 minutes per IP
- **Authentication:** 5 attempts per 15 minutes per IP

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": {
    "message": "Error description",
    "status": 400,
    "timestamp": "2025-01-01T00:00:00Z",
    "path": "/api/leads"
  }
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Database Setup

### Using PostgreSQL (Recommended)

1. Set DATABASE_URL environment variable:
   ```bash
   export DATABASE_URL=postgresql://user:password@localhost:5432/sfs_crm
   ```

2. Run migrations:
   ```bash
   npm run db:migrate
   ```

3. Start server:
   ```bash
   npm run dev
   ```

### Using In-Memory Storage

If DATABASE_URL is not set, the system uses in-memory storage (data lost on restart).

---

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run database migration
npm run db:migrate

# Type check
npm run check
```

---

For more information, visit: https://github.com/smartflow-systems/SFSAPDemoCRM
