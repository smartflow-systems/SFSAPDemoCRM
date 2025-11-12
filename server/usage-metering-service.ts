import { storage } from './storage';
import type { Tenant } from '../shared/schema';

interface UsageMetrics {
  apiCalls: number;
  storageBytes: number;
  automationRuns: number;
  emailsSent: number;
  smsSent: number;
}

interface UsageLimits {
  apiCalls: number;
  storageBytes: number;
  automationRuns: number;
  emailsSent: number;
  smsSent: number;
}

/**
 * Usage Metering Service
 * Tracks usage metrics per tenant for billing and limit enforcement
 */
export class UsageMeteringService {
  private usageCache: Map<string, UsageMetrics> = new Map();
  private resetInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Reset usage metrics monthly
    this.startMonthlyReset();
  }

  /**
   * Get usage limits based on tenant plan
   */
  getUsageLimits(plan: string): UsageLimits {
    const limits = {
      starter: {
        apiCalls: 10000, // 10k API calls per month
        storageBytes: 1 * 1024 * 1024 * 1024, // 1 GB
        automationRuns: 1000,
        emailsSent: 1000,
        smsSent: 100,
      },
      professional: {
        apiCalls: 100000, // 100k API calls per month
        storageBytes: 10 * 1024 * 1024 * 1024, // 10 GB
        automationRuns: 10000,
        emailsSent: 10000,
        smsSent: 1000,
      },
      enterprise: {
        apiCalls: -1, // Unlimited
        storageBytes: 100 * 1024 * 1024 * 1024, // 100 GB
        automationRuns: -1, // Unlimited
        emailsSent: -1, // Unlimited
        smsSent: 5000,
      },
    };

    return limits[plan as keyof typeof limits] || limits.starter;
  }

  /**
   * Get current usage for a tenant
   */
  async getUsage(tenantId: string): Promise<UsageMetrics> {
    // Check cache first
    if (this.usageCache.has(tenantId)) {
      return this.usageCache.get(tenantId)!;
    }

    // Load from database (in production, store in Redis or similar)
    // For now, initialize with zeros
    const usage: UsageMetrics = {
      apiCalls: 0,
      storageBytes: 0,
      automationRuns: 0,
      emailsSent: 0,
      smsSent: 0,
    };

    this.usageCache.set(tenantId, usage);
    return usage;
  }

  /**
   * Record an API call
   */
  async recordAPICall(tenantId: string): Promise<void> {
    const usage = await this.getUsage(tenantId);
    usage.apiCalls++;
    this.usageCache.set(tenantId, usage);
  }

  /**
   * Record storage usage
   */
  async recordStorage(tenantId: string, bytes: number): Promise<void> {
    const usage = await this.getUsage(tenantId);
    usage.storageBytes = bytes; // Set total, not increment
    this.usageCache.set(tenantId, usage);
  }

  /**
   * Record automation run
   */
  async recordAutomationRun(tenantId: string): Promise<void> {
    const usage = await this.getUsage(tenantId);
    usage.automationRuns++;
    this.usageCache.set(tenantId, usage);
  }

  /**
   * Record email sent
   */
  async recordEmailSent(tenantId: string): Promise<void> {
    const usage = await this.getUsage(tenantId);
    usage.emailsSent++;
    this.usageCache.set(tenantId, usage);
  }

  /**
   * Record SMS sent
   */
  async recordSMSSent(tenantId: string): Promise<void> {
    const usage = await this.getUsage(tenantId);
    usage.smsSent++;
    this.usageCache.set(tenantId, usage);
  }

  /**
   * Check if tenant is within usage limits
   */
  async checkLimits(tenantId: string, tenant: Tenant): Promise<{
    withinLimits: boolean;
    usage: UsageMetrics;
    limits: UsageLimits;
    exceeded: string[];
  }> {
    const usage = await this.getUsage(tenantId);
    const limits = this.getUsageLimits(tenant.plan);

    const exceeded: string[] = [];

    // Check each metric
    if (limits.apiCalls !== -1 && usage.apiCalls >= limits.apiCalls) {
      exceeded.push('API calls');
    }

    if (limits.storageBytes !== -1 && usage.storageBytes >= limits.storageBytes) {
      exceeded.push('Storage');
    }

    if (limits.automationRuns !== -1 && usage.automationRuns >= limits.automationRuns) {
      exceeded.push('Automation runs');
    }

    if (limits.emailsSent !== -1 && usage.emailsSent >= limits.emailsSent) {
      exceeded.push('Emails');
    }

    if (limits.smsSent !== -1 && usage.smsSent >= limits.smsSent) {
      exceeded.push('SMS messages');
    }

    return {
      withinLimits: exceeded.length === 0,
      usage,
      limits,
      exceeded,
    };
  }

  /**
   * Get usage percentage for a specific metric
   */
  async getUsagePercentage(tenantId: string, tenant: Tenant, metric: keyof UsageMetrics): Promise<number> {
    const usage = await this.getUsage(tenantId);
    const limits = this.getUsageLimits(tenant.plan);

    const limit = limits[metric];
    if (limit === -1) {
      return 0; // Unlimited
    }

    const current = usage[metric];
    return (current / limit) * 100;
  }

  /**
   * Reset monthly usage (called on 1st of each month)
   */
  async resetMonthlyUsage(): Promise<void> {
    console.log('🔄 Resetting monthly usage metrics...');

    // In production, save current metrics to database for billing
    // Then reset the cache

    this.usageCache.clear();

    console.log('✓ Monthly usage metrics reset');
  }

  /**
   * Start automatic monthly reset
   */
  private startMonthlyReset(): void {
    // Check every hour if it's the 1st of the month
    this.resetInterval = setInterval(() => {
      const now = new Date();
      if (now.getDate() === 1 && now.getHours() === 0) {
        this.resetMonthlyUsage();
      }
    }, 60 * 60 * 1000); // Every hour

    console.log('✓ Monthly usage reset scheduler started');
  }

  /**
   * Stop automatic reset
   */
  stopMonthlyReset(): void {
    if (this.resetInterval) {
      clearInterval(this.resetInterval);
      this.resetInterval = null;
    }
  }

  /**
   * Calculate storage size for a tenant
   */
  async calculateStorageSize(tenantId: string): Promise<number> {
    // Count all data for this tenant
    // In production, this would query actual file storage
    // For now, estimate based on database records

    const [leads, opportunities, accounts, contacts] = await Promise.all([
      storage.countLeadsByTenant(tenantId),
      storage.countOpportunitiesByTenant(tenantId),
      storage.countAccountsByTenant(tenantId),
      storage.getContacts(), // Would need tenant filter
    ]);

    // Rough estimate: 1KB per record
    const estimatedBytes =
      (leads + opportunities + accounts + contacts.length) * 1024;

    return estimatedBytes;
  }

  /**
   * Get usage summary for billing
   */
  async getUsageSummary(tenantId: string, tenant: Tenant) {
    const usage = await this.getUsage(tenantId);
    const limits = this.getUsageLimits(tenant.plan);
    const check = await this.checkLimits(tenantId, tenant);

    return {
      period: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      },
      usage,
      limits,
      exceeded: check.exceeded,
      percentages: {
        apiCalls: limits.apiCalls === -1 ? 0 : (usage.apiCalls / limits.apiCalls) * 100,
        storage: limits.storageBytes === -1 ? 0 : (usage.storageBytes / limits.storageBytes) * 100,
        automations: limits.automationRuns === -1 ? 0 : (usage.automationRuns / limits.automationRuns) * 100,
        emails: limits.emailsSent === -1 ? 0 : (usage.emailsSent / limits.emailsSent) * 100,
        sms: limits.smsSent === -1 ? 0 : (usage.smsSent / limits.smsSent) * 100,
      },
    };
  }
}

// Singleton instance
export const usageMeteringService = new UsageMeteringService();
