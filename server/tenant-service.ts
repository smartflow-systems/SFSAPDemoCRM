import type { InsertTenant, InsertUser } from '../shared/schema';
import { hashPassword } from './auth';

export class TenantService {
  constructor(private storage: any) {}

  /**
   * Register a new tenant with initial admin user
   */
  async registerTenant(params: {
    tenantName: string;
    subdomain: string;
    adminEmail: string;
    adminPassword: string;
    adminFullName: string;
    plan?: string;
  }) {
    const { tenantName, subdomain, adminEmail, adminPassword, adminFullName, plan } = params;

    // Validate subdomain format (alphanumeric and hyphens only, 3-63 chars)
    if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(subdomain)) {
      throw new Error(
        'Invalid subdomain format. Use lowercase letters, numbers, and hyphens (3-63 characters).'
      );
    }

    // Reserved subdomains
    const reserved = [
      'www',
      'api',
      'app',
      'admin',
      'mail',
      'ftp',
      'localhost',
      'staging',
      'dev',
      'test',
      'demo',
    ];
    if (reserved.includes(subdomain)) {
      throw new Error('This subdomain is reserved.');
    }

    // Check if subdomain is already taken
    const existing = await this.storage.getTenantBySubdomain(subdomain);
    if (existing) {
      throw new Error('This subdomain is already taken.');
    }

    // Check if email is already registered
    const existingUser = await this.storage.getUserByEmail(adminEmail);
    if (existingUser) {
      throw new Error('This email is already registered.');
    }

    // Calculate trial end date (14 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Create tenant
    const tenantData: InsertTenant = {
      name: tenantName,
      subdomain,
      plan: plan || 'starter',
      status: 'active',
      subscriptionStatus: 'trial',
      trialEndsAt,
      maxUsers: plan === 'enterprise' ? 100 : plan === 'professional' ? 25 : 5,
    };

    const tenant = await this.storage.createTenant(tenantData);

    // Create admin user
    const hashedPassword = await hashPassword(adminPassword);

    const userData: InsertUser = {
      tenantId: tenant.id,
      username: adminEmail.split('@')[0], // Use email prefix as username
      email: adminEmail,
      password: hashedPassword,
      fullName: adminFullName,
      role: 'Admin',
      isActive: true,
      mfaEnabled: false,
    };

    const adminUser = await this.storage.createUser(userData);

    // Send welcome email (placeholder)
    await this.sendWelcomeEmail(tenant, adminUser);

    return {
      tenant,
      adminUser: {
        ...adminUser,
        password: undefined, // Don't return password
      },
    };
  }

  /**
   * Update tenant subscription
   */
  async updateSubscription(
    tenantId: string,
    params: {
      plan?: string;
      subscriptionStatus?: string;
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
    }
  ) {
    const updates: any = { ...params };

    // Update max users based on plan
    if (params.plan) {
      updates.maxUsers =
        params.plan === 'enterprise' ? 100 : params.plan === 'professional' ? 25 : 5;
    }

    return await this.storage.updateTenant(tenantId, updates);
  }

  /**
   * Suspend a tenant (for non-payment, violations, etc.)
   */
  async suspendTenant(tenantId: string, reason: string) {
    await this.storage.updateTenant(tenantId, { status: 'suspended' });

    // TODO: Send notification email
    console.log(`Tenant ${tenantId} suspended. Reason: ${reason}`);
  }

  /**
   * Reactivate a suspended tenant
   */
  async reactivateTenant(tenantId: string) {
    await this.storage.updateTenant(tenantId, { status: 'active' });

    // TODO: Send notification email
    console.log(`Tenant ${tenantId} reactivated.`);
  }

  /**
   * Cancel a tenant subscription
   */
  async cancelTenant(tenantId: string) {
    await this.storage.updateTenant(tenantId, {
      status: 'cancelled',
      subscriptionStatus: 'cancelled',
    });

    // TODO: Schedule data deletion (e.g., after 30 days)
    console.log(`Tenant ${tenantId} cancelled. Data will be deleted in 30 days.`);
  }

  /**
   * Get tenant statistics
   */
  async getTenantStats(tenantId: string) {
    const [userCount, leadCount, opportunityCount, accountCount] = await Promise.all([
      this.storage.getTenantUserCount(tenantId),
      this.storage.countLeadsByTenant(tenantId),
      this.storage.countOpportunitiesByTenant(tenantId),
      this.storage.countAccountsByTenant(tenantId),
    ]);

    return {
      users: userCount,
      leads: leadCount,
      opportunities: opportunityCount,
      accounts: accountCount,
    };
  }

  /**
   * Check if tenant is within usage limits
   */
  async checkUsageLimits(tenantId: string) {
    const tenant = await this.storage.getTenant(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const stats = await this.getTenantStats(tenantId);

    const limits = this.getPlanLimits(tenant.plan);

    return {
      users: {
        current: stats.users,
        limit: tenant.maxUsers || limits.users,
        withinLimit: stats.users < (tenant.maxUsers || limits.users),
      },
      leads: {
        current: stats.leads,
        limit: limits.leads,
        withinLimit: limits.leads === -1 || stats.leads < limits.leads,
      },
      opportunities: {
        current: stats.opportunities,
        limit: limits.opportunities,
        withinLimit: limits.opportunities === -1 || stats.opportunities < limits.opportunities,
      },
    };
  }

  /**
   * Get plan limits
   */
  private getPlanLimits(plan: string) {
    const limits = {
      starter: {
        users: 5,
        leads: 1000,
        opportunities: 500,
        storage: 1, // GB
      },
      professional: {
        users: 25,
        leads: 10000,
        opportunities: 5000,
        storage: 10, // GB
      },
      enterprise: {
        users: 100,
        leads: -1, // Unlimited
        opportunities: -1, // Unlimited
        storage: 100, // GB
      },
    };

    return limits[plan as keyof typeof limits] || limits.starter;
  }

  /**
   * Send welcome email (placeholder)
   */
  private async sendWelcomeEmail(tenant: any, user: any) {
    const loginUrl = `https://${tenant.subdomain}.yourcrm.com/login`;

    console.log(`
======================================
WELCOME EMAIL
======================================
To: ${user.email}
Subject: Welcome to ${tenant.name} CRM!

Hello ${user.fullName},

Welcome to Smart Flow Systems CRM! Your account has been successfully created.

Organization: ${tenant.name}
Your Login URL: ${loginUrl}
Plan: ${tenant.plan}
Trial Period: 14 days

Your trial includes:
${this.getTrialFeaturesList(tenant.plan)}

Get started:
1. Log in to your account
2. Add your team members
3. Import your leads and contacts
4. Set up your sales pipeline

Need help? Visit our documentation or contact support.

Thank you for choosing SFS CRM!

======================================
    `);

    // TODO: Integrate with actual email service
  }

  /**
   * Get trial features list based on plan
   */
  private getTrialFeaturesList(plan: string): string {
    const features = {
      starter: [
        '- Up to 5 users',
        '- 1,000 leads',
        '- 500 opportunities',
        '- Basic reporting',
        '- Email support',
      ],
      professional: [
        '- Up to 25 users',
        '- 10,000 leads',
        '- 5,000 opportunities',
        '- Advanced reporting',
        '- Automation workflows',
        '- Priority support',
      ],
      enterprise: [
        '- Up to 100 users',
        '- Unlimited leads',
        '- Unlimited opportunities',
        '- Custom reports & dashboards',
        '- Advanced automation',
        '- Dedicated account manager',
        '- 24/7 phone support',
      ],
    };

    return (features[plan as keyof typeof features] || features.starter).join('\n');
  }
}
