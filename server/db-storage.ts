/**
 * PostgreSQL Database Storage Implementation
 * Uses Drizzle ORM for type-safe database operations
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '@shared/schema';
import { eq, and, desc, ilike, or } from 'drizzle-orm';
import type { IStorage } from './storage';
import type {
  User, InsertUser,
  Account, InsertAccount,
  Contact, InsertContact,
  Lead, InsertLead,
  Opportunity, InsertOpportunity,
  Activity, InsertActivity,
  Tenant, InsertTenant,
  AuditLog, InsertAuditLog,
  PasswordResetToken, InsertPasswordResetToken,
  MfaSecret, InsertMfaSecret
} from '@shared/schema';

// Configure WebSocket for serverless environments
neonConfig.webSocketConstructor = ws;

export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle<typeof schema>>;
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.db = drizzle(this.pool, { schema });
  }

  async close() {
    await this.pool.end();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.query.users.findFirst({
      where: eq(schema.users.username, username)
    });
    return result;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(schema.users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Accounts
  async getAccounts(): Promise<Account[]> {
    return await this.db.query.accounts.findMany({
      orderBy: [desc(schema.accounts.createdAt)]
    });
  }

  async getAccount(id: string): Promise<Account | undefined> {
    return await this.db.query.accounts.findFirst({
      where: eq(schema.accounts.id, id)
    });
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await this.db.insert(schema.accounts)
      .values(insertAccount)
      .returning();
    return account;
  }

  async updateAccount(id: string, accountUpdate: Partial<InsertAccount>): Promise<Account | undefined> {
    const [updated] = await this.db.update(schema.accounts)
      .set(accountUpdate)
      .where(eq(schema.accounts.id, id))
      .returning();
    return updated;
  }

  async deleteAccount(id: string): Promise<boolean> {
    const result = await this.db.delete(schema.accounts)
      .where(eq(schema.accounts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return await this.db.query.contacts.findMany({
      orderBy: [desc(schema.contacts.createdAt)]
    });
  }

  async getContactsByAccount(accountId: string): Promise<Contact[]> {
    return await this.db.query.contacts.findMany({
      where: eq(schema.contacts.accountId, accountId)
    });
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return await this.db.query.contacts.findFirst({
      where: eq(schema.contacts.id, id)
    });
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await this.db.insert(schema.contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async updateContact(id: string, contactUpdate: Partial<InsertContact>): Promise<Contact | undefined> {
    const [updated] = await this.db.update(schema.contacts)
      .set(contactUpdate)
      .where(eq(schema.contacts.id, id))
      .returning();
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    const result = await this.db.delete(schema.contacts)
      .where(eq(schema.contacts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    return await this.db.query.leads.findMany({
      orderBy: [desc(schema.leads.createdAt)]
    });
  }

  async getLead(id: string): Promise<Lead | undefined> {
    return await this.db.query.leads.findFirst({
      where: eq(schema.leads.id, id)
    });
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await this.db.insert(schema.leads)
      .values(insertLead)
      .returning();
    return lead;
  }

  async updateLead(id: string, leadUpdate: Partial<InsertLead>): Promise<Lead | undefined> {
    const [updated] = await this.db.update(schema.leads)
      .set(leadUpdate)
      .where(eq(schema.leads.id, id))
      .returning();
    return updated;
  }

  async deleteLead(id: string): Promise<boolean> {
    const result = await this.db.delete(schema.leads)
      .where(eq(schema.leads.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Opportunities
  async getOpportunities(): Promise<Opportunity[]> {
    return await this.db.query.opportunities.findMany({
      orderBy: [desc(schema.opportunities.createdAt)]
    });
  }

  async getOpportunity(id: string): Promise<Opportunity | undefined> {
    return await this.db.query.opportunities.findFirst({
      where: eq(schema.opportunities.id, id)
    });
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const [opportunity] = await this.db.insert(schema.opportunities)
      .values(insertOpportunity)
      .returning();
    return opportunity;
  }

  async updateOpportunity(id: string, opportunityUpdate: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const [updated] = await this.db.update(schema.opportunities)
      .set(opportunityUpdate)
      .where(eq(schema.opportunities.id, id))
      .returning();
    return updated;
  }

  async deleteOpportunity(id: string): Promise<boolean> {
    const result = await this.db.delete(schema.opportunities)
      .where(eq(schema.opportunities.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Activities
  async getActivities(): Promise<Activity[]> {
    return await this.db.query.activities.findMany({
      orderBy: [desc(schema.activities.createdAt)]
    });
  }

  async getActivitiesByLead(leadId: string): Promise<Activity[]> {
    return await this.db.query.activities.findMany({
      where: eq(schema.activities.leadId, leadId),
      orderBy: [desc(schema.activities.createdAt)]
    });
  }

  async getActivitiesByContact(contactId: string): Promise<Activity[]> {
    return await this.db.query.activities.findMany({
      where: eq(schema.activities.contactId, contactId),
      orderBy: [desc(schema.activities.createdAt)]
    });
  }

  async getActivitiesByOpportunity(opportunityId: string): Promise<Activity[]> {
    return await this.db.query.activities.findMany({
      where: eq(schema.activities.opportunityId, opportunityId),
      orderBy: [desc(schema.activities.createdAt)]
    });
  }

  async getActivity(id: string): Promise<Activity | undefined> {
    return await this.db.query.activities.findFirst({
      where: eq(schema.activities.id, id)
    });
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await this.db.insert(schema.activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async updateActivity(id: string, activityUpdate: Partial<InsertActivity>): Promise<Activity | undefined> {
    const [updated] = await this.db.update(schema.activities)
      .set(activityUpdate)
      .where(eq(schema.activities.id, id))
      .returning();
    return updated;
  }

  async deleteActivity(id: string): Promise<boolean> {
    const result = await this.db.delete(schema.activities)
      .where(eq(schema.activities.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Tenants
  async getTenant(id: string): Promise<Tenant | undefined> {
    return await this.db.query.tenants.findFirst({
      where: eq(schema.tenants.id, id)
    });
  }

  async getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined> {
    return await this.db.query.tenants.findFirst({
      where: eq(schema.tenants.subdomain, subdomain)
    });
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const [tenant] = await this.db.insert(schema.tenants)
      .values(insertTenant)
      .returning();
    return tenant;
  }

  async updateTenant(id: string, tenantUpdate: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const [updated] = await this.db.update(schema.tenants)
      .set({ ...tenantUpdate, updatedAt: new Date() })
      .where(eq(schema.tenants.id, id))
      .returning();
    return updated;
  }

  async getTenantUserCount(tenantId: string): Promise<number> {
    const result = await this.db
      .select({ count: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.tenantId, tenantId));
    return result.length;
  }

  async countLeadsByTenant(tenantId: string): Promise<number> {
    const result = await this.db
      .select({ count: schema.leads.id })
      .from(schema.leads)
      .where(eq(schema.leads.tenantId, tenantId));
    return result.length;
  }

  async countOpportunitiesByTenant(tenantId: string): Promise<number> {
    const result = await this.db
      .select({ count: schema.opportunities.id })
      .from(schema.opportunities)
      .where(eq(schema.opportunities.tenantId, tenantId));
    return result.length;
  }

  async countAccountsByTenant(tenantId: string): Promise<number> {
    const result = await this.db
      .select({ count: schema.accounts.id })
      .from(schema.accounts)
      .where(eq(schema.accounts.tenantId, tenantId));
    return result.length;
  }

  // User extensions
  async getUserByEmail(email: string): Promise<User | undefined> {
    return await this.db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await this.db.update(schema.users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));
  }

  async updateUserMfaStatus(userId: string, enabled: boolean): Promise<void> {
    await this.db.update(schema.users)
      .set({ mfaEnabled: enabled, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await this.db.update(schema.users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.users.id, userId));
  }

  // Audit Logs
  async createAuditLog(insertAuditLog: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await this.db.insert(schema.auditLogs)
      .values(insertAuditLog)
      .returning();
    return auditLog;
  }

  async getAuditLogs(tenantId: string, options: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<AuditLog[]> {
    const conditions = [eq(schema.auditLogs.tenantId, tenantId)];

    if (options.userId) {
      conditions.push(eq(schema.auditLogs.userId, options.userId));
    }
    if (options.action) {
      conditions.push(eq(schema.auditLogs.action, options.action));
    }
    if (options.entityType) {
      conditions.push(eq(schema.auditLogs.entityType, options.entityType));
    }
    if (options.entityId) {
      conditions.push(eq(schema.auditLogs.entityId, options.entityId));
    }

    let query = this.db.query.auditLogs.findMany({
      where: and(...conditions),
      orderBy: [desc(schema.auditLogs.createdAt)],
      limit: options.limit || 100,
      offset: options.offset || 0
    });

    return await query;
  }

  // Password Reset Tokens
  async createPasswordResetToken(insertToken: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [token] = await this.db.insert(schema.passwordResetTokens)
      .values(insertToken)
      .returning();
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    return await this.db.query.passwordResetTokens.findFirst({
      where: eq(schema.passwordResetTokens.token, token)
    });
  }

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    await this.db.update(schema.passwordResetTokens)
      .set({ used: true })
      .where(eq(schema.passwordResetTokens.token, token));
  }

  async deleteExpiredPasswordResetTokens(): Promise<number> {
    const now = new Date();
    const result = await this.db.delete(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.expiresAt, now));
    return result.rowCount || 0;
  }

  // MFA Secrets
  async createMfaSecret(insertSecret: InsertMfaSecret): Promise<MfaSecret> {
    const [secret] = await this.db.insert(schema.mfaSecrets)
      .values(insertSecret)
      .returning();
    return secret;
  }

  async getMfaSecret(userId: string): Promise<MfaSecret | undefined> {
    return await this.db.query.mfaSecrets.findFirst({
      where: eq(schema.mfaSecrets.userId, userId)
    });
  }

  async updateMfaBackupCodes(userId: string, codes: string[]): Promise<void> {
    await this.db.update(schema.mfaSecrets)
      .set({ backupCodes: codes })
      .where(eq(schema.mfaSecrets.userId, userId));
  }

  async deleteMfaSecret(userId: string): Promise<void> {
    await this.db.delete(schema.mfaSecrets)
      .where(eq(schema.mfaSecrets.userId, userId));
  }
}
