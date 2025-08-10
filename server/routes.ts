import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertAccountSchema, insertContactSchema, 
  insertLeadSchema, insertOpportunitySchema, insertActivitySchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
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

  // Lead routes
  app.get("/api/leads", async (req, res) => {
    const leads = await storage.getLeads();
    res.json(leads);
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
      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Opportunity routes
  app.get("/api/opportunities", async (req, res) => {
    const opportunities = await storage.getOpportunities();
    res.json(opportunities);
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
      res.json(opportunity);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
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

  const httpServer = createServer(app);
  return httpServer;
}
