import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("Sales Rep"), // Admin, Manager, Sales Rep
  createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  website: text("website"),
  industry: text("industry"),
  phone: text("phone"),
  address: text("address"),
  ownerId: varchar("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  title: text("title"),
  accountId: varchar("account_id").references(() => accounts.id),
  ownerId: varchar("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  title: text("title"),
  source: text("source").notNull(), // Website, Referral, Cold Call, etc.
  status: text("status").notNull().default("New"), // New, Qualified, Converted, Lost
  ownerId: varchar("owner_id").references(() => users.id),
  notes: text("notes"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  accountId: varchar("account_id").references(() => accounts.id),
  contactId: varchar("contact_id").references(() => contacts.id),
  leadId: varchar("lead_id").references(() => leads.id),
  amount: integer("amount").notNull(),
  stage: text("stage").notNull().default("New"), // New, Qualified, Proposal, Won, Lost
  probability: integer("probability").default(0),
  closeDate: timestamp("close_date"),
  ownerId: varchar("owner_id").references(() => users.id),
  description: text("description"),
  nextAction: text("next_action"),
  nextActionDate: timestamp("next_action_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // Note, Call, Email, Meeting, Task
  subject: text("subject").notNull(),
  description: text("description"),
  leadId: varchar("lead_id").references(() => leads.id),
  contactId: varchar("contact_id").references(() => contacts.id),
  opportunityId: varchar("opportunity_id").references(() => opportunities.id),
  accountId: varchar("account_id").references(() => accounts.id),
  ownerId: varchar("owner_id").references(() => users.id),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertOpportunitySchema = createInsertSchema(opportunities).omit({ id: true, createdAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Opportunity = typeof opportunities.$inferSelect;
export type Activity = typeof activities.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
