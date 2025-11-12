import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tenants table - each customer organization
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subdomain: text("subdomain").notNull().unique(), // acme, tesla, etc.
  plan: text("plan").notNull().default("starter"), // starter, professional, enterprise
  status: text("status").notNull().default("active"), // active, suspended, cancelled
  maxUsers: integer("max_users").default(5),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("trial"), // trial, active, past_due, cancelled
  trialEndsAt: timestamp("trial_ends_at"),
  settings: json("settings"), // Custom tenant settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  username: text("username").notNull(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("Sales Rep"), // Admin, Manager, Sales Rep, Viewer
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  mfaEnabled: boolean("mfa_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  website: text("website"),
  industry: text("industry"),
  phone: text("phone"),
  address: text("address"),
  ownerId: varchar("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  title: text("title"),
  accountId: varchar("account_id").references(() => accounts.id),
  ownerId: varchar("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
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
  priority: text("priority").default("medium"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit logs for tracking all user actions
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(), // create, update, delete, login, logout, etc.
  entityType: text("entity_type"), // lead, opportunity, account, etc.
  entityId: varchar("entity_id"),
  changes: json("changes"), // Before/after values
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// MFA secrets for two-factor authentication
export const mfaSecrets = pgTable("mfa_secrets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOpportunitySchema = createInsertSchema(opportunities).omit({ id: true, createdAt: true, updatedAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({ id: true, createdAt: true });
export const insertMfaSecretSchema = createInsertSchema(mfaSecrets).omit({ id: true, createdAt: true });

// Types
export type Tenant = typeof tenants.$inferSelect;
export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Opportunity = typeof opportunities.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type MfaSecret = typeof mfaSecrets.$inferSelect;

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type InsertMfaSecret = z.infer<typeof insertMfaSecretSchema>;
