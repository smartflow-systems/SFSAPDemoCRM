import { Request, Response, NextFunction } from 'express';
import type { Tenant } from '../shared/schema';

// Extend Express Request to include tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      tenantId?: string;
    }
  }
}

/**
 * Tenant Context Middleware
 * Extracts tenant from subdomain or X-Tenant-ID header and attaches to request
 */
export function tenantMiddleware(storage: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let tenantId: string | null = null;
      let subdomain: string | null = null;

      // Option 1: Extract from subdomain (e.g., acme.yourcrm.com)
      const host = req.get('host') || '';
      const parts = host.split('.');

      // If we have subdomain.domain.com pattern
      if (parts.length >= 3) {
        subdomain = parts[0];

        // Exclude common non-tenant subdomains
        if (!['www', 'api', 'app', 'admin', 'localhost'].includes(subdomain)) {
          const tenant = await storage.getTenantBySubdomain(subdomain);
          if (tenant) {
            tenantId = tenant.id;
            req.tenant = tenant;
          }
        }
      }

      // Option 2: Extract from header (for API calls, mobile apps, etc.)
      if (!tenantId) {
        const headerTenantId = req.get('X-Tenant-ID');
        if (headerTenantId) {
          const tenant = await storage.getTenant(headerTenantId);
          if (tenant) {
            tenantId = tenant.id;
            req.tenant = tenant;
          }
        }
      }

      // Option 3: Get from authenticated user's tenant
      if (!tenantId && req.isAuthenticated && req.isAuthenticated()) {
        const user = req.user as any;
        if (user && user.tenantId) {
          tenantId = user.tenantId;
          const tenant = await storage.getTenant(tenantId);
          if (tenant) {
            req.tenant = tenant;
          }
        }
      }

      // Attach tenantId for convenience
      if (tenantId) {
        req.tenantId = tenantId;
      }

      next();
    } catch (error) {
      console.error('Tenant middleware error:', error);
      next(error);
    }
  };
}

/**
 * Require Tenant Middleware
 * Ensures a tenant context exists, returns 400 if missing
 */
export function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.tenantId || !req.tenant) {
    return res.status(400).json({
      error: {
        message: 'Tenant context required. Please specify subdomain or X-Tenant-ID header.',
      },
    });
  }

  // Check tenant status
  if (req.tenant.status !== 'active') {
    return res.status(403).json({
      error: {
        message: `Tenant account is ${req.tenant.status}. Please contact support.`,
      },
    });
  }

  next();
}

/**
 * Tenant Feature Gate Middleware
 * Restricts features based on tenant plan
 */
export function requirePlan(...allowedPlans: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenant) {
      return res.status(400).json({
        error: { message: 'Tenant context required' },
      });
    }

    if (!allowedPlans.includes(req.tenant.plan)) {
      return res.status(403).json({
        error: {
          message: `This feature requires ${allowedPlans.join(' or ')} plan. Current plan: ${req.tenant.plan}`,
          upgradeRequired: true,
        },
      });
    }

    next();
  };
}

/**
 * Check tenant subscription status
 */
export function requireActiveSubscription(req: Request, res: Response, next: NextFunction) {
  if (!req.tenant) {
    return res.status(400).json({
      error: { message: 'Tenant context required' },
    });
  }

  const validStatuses = ['trial', 'active'];
  if (!validStatuses.includes(req.tenant.subscriptionStatus || '')) {
    return res.status(402).json({
      error: {
        message: 'Subscription payment required. Please update your billing information.',
        subscriptionStatus: req.tenant.subscriptionStatus,
        paymentRequired: true,
      },
    });
  }

  // Check if trial has expired
  if (req.tenant.subscriptionStatus === 'trial' && req.tenant.trialEndsAt) {
    const now = new Date();
    if (now > req.tenant.trialEndsAt) {
      return res.status(402).json({
        error: {
          message: 'Your trial has expired. Please subscribe to continue.',
          trialExpired: true,
          paymentRequired: true,
        },
      });
    }
  }

  next();
}

/**
 * Check tenant user limits
 */
export async function checkUserLimit(storage: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenant) {
      return res.status(400).json({
        error: { message: 'Tenant context required' },
      });
    }

    const userCount = await storage.getTenantUserCount(req.tenant.id);

    if (userCount >= (req.tenant.maxUsers || 5)) {
      return res.status(403).json({
        error: {
          message: `User limit reached (${req.tenant.maxUsers} users). Please upgrade your plan.`,
          limitReached: true,
          upgradeRequired: true,
        },
      });
    }

    next();
  };
}
