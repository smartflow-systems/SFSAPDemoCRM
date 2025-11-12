import express from 'express';
import { TenantService } from './tenant-service';
import { PasswordResetService } from './password-reset-service';
import { MFAService } from './mfa-service';
import { AuditService } from './audit-service';
import { storage } from './storage';
import { z } from 'zod';
import { requireTenant, requirePlan, requireActiveSubscription } from './tenant-middleware';
import type { Request, Response } from 'express';

// Initialize services
const tenantService = new TenantService(storage);
const passwordResetService = new PasswordResetService(storage);
const mfaService = new MFAService(storage);
const auditService = new AuditService(storage);

export function setupTenantRoutes(app: express.Application) {

  // ==========================================
  // PUBLIC ROUTES (No authentication required)
  // ==========================================

  /**
   * Register a new tenant organization
   * POST /api/tenants/register
   */
  app.post('/api/tenants/register', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        tenantName: z.string().min(2).max(255),
        subdomain: z.string().min(3).max(63).regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/),
        adminEmail: z.string().email(),
        adminPassword: z.string().min(8),
        adminFullName: z.string().min(2),
        plan: z.enum(['starter', 'professional', 'enterprise']).optional(),
      });

      const data = schema.parse(req.body);

      const result = await tenantService.registerTenant(data);

      res.status(201).json({
        message: 'Tenant registered successfully',
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          subdomain: result.tenant.subdomain,
          plan: result.tenant.plan,
          trialEndsAt: result.tenant.trialEndsAt,
        },
        adminUser: result.adminUser,
      });

    } catch (error: any) {
      console.error('Tenant registration error:', error);
      res.status(400).json({
        error: {
          message: error.message || 'Failed to register tenant',
        },
      });
    }
  });

  /**
   * Check if subdomain is available
   * GET /api/tenants/check-subdomain/:subdomain
   */
  app.get('/api/tenants/check-subdomain/:subdomain', async (req: Request, res: Response) => {
    try {
      const { subdomain } = req.params;
      const existing = await storage.getTenantBySubdomain(subdomain);

      res.json({
        available: !existing,
        subdomain,
      });

    } catch (error) {
      console.error('Subdomain check error:', error);
      res.status(500).json({
        error: { message: 'Failed to check subdomain availability' },
      });
    }
  });

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        email: z.string().email(),
      });

      const { email } = schema.parse(req.body);

      const user = await storage.getUserByEmail(email);

      if (user) {
        const token = await passwordResetService.createResetToken(user.id);
        const tenant = await storage.getTenant(user.tenantId);
        await passwordResetService.sendResetEmail(email, token, tenant?.subdomain);
      }

      // Always return success to prevent email enumeration
      res.json({
        message: 'If the email exists, a password reset link has been sent.',
      });

    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        error: { message: 'Failed to process password reset request' },
      });
    }
  });

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      });

      const { token, newPassword } = schema.parse(req.body);

      const success = await passwordResetService.resetPassword(token, newPassword);

      if (success) {
        res.json({ message: 'Password reset successfully' });
      } else {
        res.status(400).json({
          error: { message: 'Invalid or expired reset token' },
        });
      }

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        error: { message: 'Failed to reset password' },
      });
    }
  });

  // ==========================================
  // AUTHENTICATED ROUTES (Require tenant context)
  // ==========================================

  /**
   * Get current tenant information
   * GET /api/tenant
   */
  app.get('/api/tenant', requireTenant, async (req: Request, res: Response) => {
    try {
      const tenant = req.tenant!;

      const stats = await tenantService.getTenantStats(tenant.id);
      const limits = await tenantService.checkUsageLimits(tenant.id);

      res.json({
        tenant: {
          ...tenant,
          stripeCustomerId: undefined, // Don't expose sensitive data
          stripeSubscriptionId: undefined,
        },
        stats,
        limits,
      });

    } catch (error) {
      console.error('Get tenant error:', error);
      res.status(500).json({
        error: { message: 'Failed to fetch tenant information' },
      });
    }
  });

  /**
   * Update tenant settings
   * PATCH /api/tenant/settings
   */
  app.patch('/api/tenant/settings', requireTenant, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      if (user.role !== 'Admin') {
        return res.status(403).json({
          error: { message: 'Only admins can update tenant settings' },
        });
      }

      const schema = z.object({
        name: z.string().min(2).max(255).optional(),
        settings: z.any().optional(),
      });

      const updates = schema.parse(req.body);

      const updated = await storage.updateTenant(req.tenant!.id, updates);

      await auditService.log({
        tenantId: req.tenant!.id,
        userId: user.id,
        action: 'update_tenant_settings',
        changes: updates,
        req,
      });

      res.json({ tenant: updated });

    } catch (error) {
      console.error('Update tenant error:', error);
      res.status(500).json({
        error: { message: 'Failed to update tenant settings' },
      });
    }
  });

  // ==========================================
  // MFA ROUTES
  // ==========================================

  /**
   * Setup MFA for current user
   * POST /api/auth/mfa/setup
   */
  app.post('/api/auth/mfa/setup', requireTenant, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      const mfaData = await mfaService.setupMFA(user.id, user.email);

      await auditService.log({
        tenantId: req.tenant!.id,
        userId: user.id,
        action: 'mfa_setup_initiated',
        req,
      });

      res.json({
        secret: mfaData.secret,
        qrCodeUrl: mfaData.qrCodeUrl,
        backupCodes: mfaData.backupCodes,
      });

    } catch (error) {
      console.error('MFA setup error:', error);
      res.status(500).json({
        error: { message: 'Failed to setup MFA' },
      });
    }
  });

  /**
   * Verify and enable MFA
   * POST /api/auth/mfa/verify
   */
  app.post('/api/auth/mfa/verify', requireTenant, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const schema = z.object({
        token: z.string().length(6),
      });

      const { token } = schema.parse(req.body);

      const isValid = await mfaService.verifyTOTP(user.id, token);

      if (isValid) {
        await mfaService.enableMFA(user.id);

        await auditService.log({
          tenantId: req.tenant!.id,
          userId: user.id,
          action: 'mfa_enabled',
          req,
        });

        res.json({ message: 'MFA enabled successfully' });
      } else {
        res.status(400).json({
          error: { message: 'Invalid verification code' },
        });
      }

    } catch (error) {
      console.error('MFA verification error:', error);
      res.status(500).json({
        error: { message: 'Failed to verify MFA' },
      });
    }
  });

  /**
   * Disable MFA
   * POST /api/auth/mfa/disable
   */
  app.post('/api/auth/mfa/disable', requireTenant, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const schema = z.object({
        password: z.string(),
      });

      const { password } = schema.parse(req.body);

      // Verify password before disabling MFA
      const bcrypt = await import('bcrypt');
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          error: { message: 'Invalid password' },
        });
      }

      await mfaService.disableMFA(user.id);

      await auditService.log({
        tenantId: req.tenant!.id,
        userId: user.id,
        action: 'mfa_disabled',
        req,
      });

      res.json({ message: 'MFA disabled successfully' });

    } catch (error) {
      console.error('MFA disable error:', error);
      res.status(500).json({
        error: { message: 'Failed to disable MFA' },
      });
    }
  });

  // ==========================================
  // AUDIT LOG ROUTES
  // ==========================================

  /**
   * Get audit logs for tenant
   * GET /api/audit-logs
   */
  app.get('/api/audit-logs', requireTenant, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      // Only admins and managers can view audit logs
      if (!['Admin', 'Manager'].includes(user.role)) {
        return res.status(403).json({
          error: { message: 'Insufficient permissions to view audit logs' },
        });
      }

      const { action, entityType, limit = '100', offset = '0' } = req.query;

      const logs = await auditService.getAuditLogs(req.tenant!.id, {
        action: action as string,
        entityType: entityType as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      res.json({ logs });

    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({
        error: { message: 'Failed to fetch audit logs' },
      });
    }
  });

  // ==========================================
  // PLAN-GATED ROUTES (Enterprise only)
  // ==========================================

  /**
   * Advanced analytics (Enterprise plan only)
   * GET /api/analytics/advanced
   */
  app.get('/api/analytics/advanced',
    requireTenant,
    requireActiveSubscription,
    requirePlan('enterprise'),
    async (req: Request, res: Response) => {
      try {
        // Advanced analytics logic here
        res.json({
          message: 'Advanced analytics data',
          // ... analytics data
        });
      } catch (error) {
        console.error('Advanced analytics error:', error);
        res.status(500).json({
          error: { message: 'Failed to fetch advanced analytics' },
        });
      }
    }
  );

  console.log('✓ Tenant routes configured');
}
