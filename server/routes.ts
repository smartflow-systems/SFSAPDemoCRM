import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { NotificationService, createNotification } from "./websocket";
import { initializeAutomation, getAutomationService } from "./automation";
import {
  leadsToCSV,
  contactsToCSV,
  opportunitiesToCSV,
  csvToArray,
  validateLeadCSV,
  generateCSVFilename
} from "./csv-utils";
import {
  insertUserSchema, insertAccountSchema, insertContactSchema,
  insertLeadSchema, insertOpportunitySchema, insertActivitySchema
} from "@shared/schema";
import { tenantMiddleware } from "./tenant-middleware";
import { setupTenantRoutes } from "./tenant-routes";
import { setupBillingRoutes } from "./billing-routes";
import { setupIntegrationRoutes } from "./integration-routes";

// Global service instances
let notificationService: NotificationService | null = null;

// Global service instances
let notificationService: NotificationService | null = null;

export async function registerRoutes(app: Express): Promise<Server> {

  // Apply tenant middleware to all routes
  app.use(tenantMiddleware(storage));
  console.log('✓ Tenant middleware initialized');

  // Setup tenant-specific routes (registration, MFA, audit logs, etc.)
  setupTenantRoutes(app);

  // Setup billing and subscription routes
  setupBillingRoutes(app);

  // Setup integration routes (custom fields, workflows, webhooks, Twilio, etc.)
  setupIntegrationRoutes(app);

  // User routes
  app.get("/api/users", async (req, res) => {
    // Only for admin purposes - not exposing in UI
    res.json([]);
  });

  // Account routes
  app.get("/api/accounts", async (req, res) => {
    const accounts = await storage.getAccounts();
    res.json(accounts);
  });

  app.get("/api/accounts/:id", async (req, res) => {
    const account = await storage.getAccount(req.params.id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json(account);
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const accountData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(accountData);
      res.status(201).json(account);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/accounts/:id", async (req, res) => {
    try {
      const accountData = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(req.params.id, accountData);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(account);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    const success = await storage.deleteAccount(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.status(204).send();
  });

  // Contact routes
  app.get("/api/contacts", async (req, res) => {
    const contacts = await storage.getContacts();
    res.json(contacts);
  });

  app.get("/api/contacts/:id", async (req, res) => {
    const contact = await storage.getContact(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json(contact);
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.status(201).json(contact);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    try {
      const contactData = insertContactSchema.partial().parse(req.body);
      const contact = await storage.updateContact(req.params.id, contactData);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    const success = await storage.deleteContact(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(204).send();
  });

  // Lead routes
  app.get("/api/leads", async (req, res) => {
    let leads = await storage.getLeads();

    // Search functionality
    const search = req.query.search as string;
    if (search) {
      const searchLower = search.toLowerCase();
      leads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchLower) ||
        lead.company?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    const status = req.query.status as string;
    if (status) {
      leads = leads.filter(lead => lead.status === status);
    }

    // Filter by source
    const source = req.query.source as string;
    if (source) {
      leads = leads.filter(lead => lead.source === source);
    }

    // Filter by owner
    const ownerId = req.query.ownerId as string;
    if (ownerId) {
      leads = leads.filter(lead => lead.ownerId === ownerId);
    }

    // Sorting
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';
    leads.sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination (optional - if page is not provided, return all)
    const page = req.query.page ? parseInt(req.query.page as string) : null;
    const limit = parseInt(req.query.limit as string) || 50;

    if (page) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLeads = leads.slice(startIndex, endIndex);

      res.json({
        data: paginatedLeads,
        pagination: {
          total: leads.length,
          page,
          limit,
          pages: Math.ceil(leads.length / limit)
        }
      });
    } else {
      // Return all leads (backward compatible)
      res.json(leads);
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    const lead = await storage.getLead(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.json(lead);
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);

      // Send notification about new lead
      if (notificationService && lead.ownerId) {
        const notification = createNotification.leadCreated(
          lead.name,
          lead.ownerId
        );
        notificationService.notifyUser(lead.ownerId, notification);
      }

      // Auto-create follow-up task
      const automation = getAutomationService();
      if (automation && lead.ownerId) {
        await automation.createLeadFollowUpTask(lead.id, lead.name, lead.ownerId);
      }

      res.status(201).json(lead);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const leadData = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(req.params.id, leadData);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      // Send notification about lead update
      if (notificationService && lead.ownerId) {
        const notification = createNotification.leadUpdated(
          lead.name,
          lead.ownerId
        );
        notificationService.notifyUser(lead.ownerId, notification);
      }

      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    const success = await storage.deleteLead(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(204).send();
  });

  // Lead conversion to opportunity
  app.post("/api/leads/:id/convert", async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      if (lead.status === 'Converted') {
        return res.status(400).json({ message: "Lead is already converted" });
      }

      // Create opportunity from lead data
      const opportunityData = insertOpportunitySchema.parse({
        name: lead.name,
        accountId: lead.accountId,
        contactId: lead.contactId,
        ownerId: lead.ownerId,
        stage: 'Discovery',
        value: lead.value || 0,
        probability: 20,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        source: lead.source,
        description: `Converted from lead: ${lead.name}`
      });

      const opportunity = await storage.createOpportunity(opportunityData);

      // Update lead status to Converted
      await storage.updateLead(req.params.id, { status: 'Converted' });

      // Send notification
      if (notificationService && lead.ownerId) {
        const notification = {
          type: 'system_alert' as const,
          title: 'Lead Converted',
          message: `Lead "${lead.name}" has been converted to an opportunity`,
          userId: lead.ownerId,
          timestamp: new Date(),
          priority: 'medium' as const
        };
        notificationService.notifyUser(lead.ownerId, notification);
      }

      res.status(201).json({
        message: "Lead converted successfully",
        opportunity,
        lead: await storage.getLead(req.params.id)
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Opportunity routes
  app.get("/api/opportunities", async (req, res) => {
    let opportunities = await storage.getOpportunities();

    // Search functionality
    const search = req.query.search as string;
    if (search) {
      const searchLower = search.toLowerCase();
      opportunities = opportunities.filter(opp =>
        opp.name.toLowerCase().includes(searchLower) ||
        opp.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by stage
    const stage = req.query.stage as string;
    if (stage) {
      opportunities = opportunities.filter(opp => opp.stage === stage);
    }

    // Filter by owner
    const ownerId = req.query.ownerId as string;
    if (ownerId) {
      opportunities = opportunities.filter(opp => opp.ownerId === ownerId);
    }

    // Filter by value range
    const minValue = req.query.minValue ? parseFloat(req.query.minValue as string) : null;
    const maxValue = req.query.maxValue ? parseFloat(req.query.maxValue as string) : null;
    if (minValue !== null) {
      opportunities = opportunities.filter(opp => opp.value >= minValue);
    }
    if (maxValue !== null) {
      opportunities = opportunities.filter(opp => opp.value <= maxValue);
    }

    // Sorting
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';
    opportunities.sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination (optional)
    const page = req.query.page ? parseInt(req.query.page as string) : null;
    const limit = parseInt(req.query.limit as string) || 50;

    if (page) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOpportunities = opportunities.slice(startIndex, endIndex);

      res.json({
        data: paginatedOpportunities,
        pagination: {
          total: opportunities.length,
          page,
          limit,
          pages: Math.ceil(opportunities.length / limit)
        }
      });
    } else {
      res.json(opportunities);
    }
  });

  app.get("/api/opportunities/:id", async (req, res) => {
    const opportunity = await storage.getOpportunity(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    res.json(opportunity);
  });

  app.post("/api/opportunities", async (req, res) => {
    try {
      const opportunityData = insertOpportunitySchema.parse(req.body);
      const opportunity = await storage.createOpportunity(opportunityData);
      res.status(201).json(opportunity);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/opportunities/:id", async (req, res) => {
    try {
      const opportunityData = insertOpportunitySchema.partial().parse(req.body);
      const opportunity = await storage.updateOpportunity(req.params.id, opportunityData);
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }

      // Send notification when opportunity is won
      if (notificationService && opportunity.ownerId && opportunity.stage === 'Won') {
        const notification = createNotification.opportunityWon(
          opportunity.name,
          opportunity.value,
          opportunity.ownerId
        );
        notificationService.notifyUser(opportunity.ownerId, notification);
      }

      // Auto-create stage-based tasks
      if (opportunityData.stage && opportunity.ownerId) {
        const automation = getAutomationService();
        if (automation) {
          await automation.handleOpportunityStageChange(
            opportunity.id,
            opportunity.name,
            opportunity.stage,
            opportunity.ownerId
          );
        }
      }

      res.json(opportunity);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/opportunities/:id", async (req, res) => {
    const success = await storage.deleteOpportunity(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    res.status(204).send();
  });

  // Activity routes
  app.get("/api/activities", async (req, res) => {
    const activities = await storage.getActivities();
    res.json(activities);
  });

  app.get("/api/activities/lead/:leadId", async (req, res) => {
    const activities = await storage.getActivitiesByLead(req.params.leadId);
    res.json(activities);
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/activities/:id", async (req, res) => {
    try {
      const activityData = insertActivitySchema.partial().parse(req.body);
      const activity = await storage.updateActivity(req.params.id, activityData);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.json(activity);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    const success = await storage.deleteActivity(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.status(204).send();
  });

  // Demo data initialization
  app.post("/api/init-demo", async (req, res) => {
    try {
      // Create demo user
      const demoUser = await storage.createUser({
        username: "gareth",
        password: "demo123",
        email: "gareth.bowers@smartflowsystems.com",
        fullName: "Gareth Bowers",
        role: "Admin"
      });

      res.json({ message: "Demo data initialized", userId: demoUser.id });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ================== CSV Export/Import Endpoints ==================

  // Export leads to CSV
  app.get("/api/export/leads/csv", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      const csv = leadsToCSV(leads);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${generateCSVFilename('leads')}"`);
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Import leads from CSV
  app.post("/api/import/leads/csv", async (req, res) => {
    try {
      const { csvData } = req.body;
      if (!csvData) {
        return res.status(400).json({ message: "CSV data is required" });
      }

      const rows = csvToArray(csvData);
      const validation = validateLeadCSV(rows);

      if (!validation.valid) {
        return res.status(400).json({
          message: "CSV validation failed",
          errors: validation.errors
        });
      }

      const created = [];
      const errors = [];

      for (const row of rows) {
        try {
          const leadData = insertLeadSchema.parse({
            name: row.name,
            company: row.company || undefined,
            email: row.email || undefined,
            phone: row.phone || undefined,
            source: row.source || undefined,
            status: row.status || 'New',
            rating: row.rating || undefined,
            value: row.value ? parseFloat(row.value) : undefined,
            description: row.description || undefined,
            ownerId: row.ownerId || 'demo-user-gareth'
          });

          const lead = await storage.createLead(leadData);
          created.push(lead);
        } catch (error: any) {
          errors.push({ row, error: error.message });
        }
      }

      res.json({
        message: `Imported ${created.length} leads`,
        created: created.length,
        errors: errors.length,
        errorDetails: errors
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Export contacts to CSV
  app.get("/api/export/contacts/csv", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      const csv = contactsToCSV(contacts);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${generateCSVFilename('contacts')}"`);
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Export opportunities to CSV
  app.get("/api/export/opportunities/csv", async (req, res) => {
    try {
      const opportunities = await storage.getOpportunities();
      const csv = opportunitiesToCSV(opportunities);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${generateCSVFilename('opportunities')}"`);
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Bulk delete leads
  app.post("/api/leads/bulk-delete", async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ message: "ids must be an array" });
      }

      const deleted = [];
      const errors = [];

      for (const id of ids) {
        try {
          const success = await storage.deleteLead(id);
          if (success) {
            deleted.push(id);
          } else {
            errors.push({ id, error: "Lead not found" });
          }
        } catch (error: any) {
          errors.push({ id, error: error.message });
        }
      }

      res.json({
        message: `Deleted ${deleted.length} leads`,
        deleted: deleted.length,
        errors: errors.length,
        errorDetails: errors
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  // Initialize WebSocket server for real-time notifications
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws'
  });

  notificationService = new NotificationService(wss);
  console.log('✓ WebSocket notification service initialized');

  // Initialize automation service
  initializeAutomation(notificationService);
  console.log('✓ Automation service initialized');

  return httpServer;
}
