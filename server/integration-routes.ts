import express from 'express';
import crypto from 'crypto';
import { storage } from './storage';
import { twilioService } from './twilio-service';
import { workflowEngine } from './workflow-engine';
import { webhookService, WebhookService } from './webhook-service';
import { AuditService } from './audit-service';
import { usageMeteringService } from './usage-metering-service';
import { requireTenant, requirePlan } from './tenant-middleware';
import { z } from 'zod';
import type { Request, Response } from 'express';
import qrcode from 'qrcode';

const auditService = new AuditService(storage);

export function setupIntegrationRoutes(app: express.Application) {

  // ==========================================
  // CUSTOM FIELDS (Professional & Enterprise)
  // ==========================================

  /**
   * Get custom fields for an entity type
   * GET /api/custom-fields/:entityType
   */
  app.get('/api/custom-fields/:entityType',
    requireTenant,
    requirePlan('professional', 'enterprise'),
    async (req: Request, res: Response) => {
      try {
        const { entityType } = req.params;

        // Would fetch from database
        res.json({
          fields: [],
          // Placeholder for custom fields
        });

      } catch (error: any) {
        console.error('Get custom fields error:', error);
        res.status(500).json({
          error: { message: 'Failed to fetch custom fields' },
        });
      }
    }
  );

  /**
   * Create custom field
   * POST /api/custom-fields
   */
  app.post('/api/custom-fields',
    requireTenant,
    requirePlan('professional', 'enterprise'),
    async (req: Request, res: Response) => {
      try {
        const user = req.user as any;

        if (user.role !== 'Admin') {
          return res.status(403).json({
            error: { message: 'Only admins can create custom fields' },
          });
        }

        const schema = z.object({
          entityType: z.enum(['lead', 'opportunity', 'account', 'contact']),
          fieldName: z.string().min(1),
          fieldLabel: z.string().min(1),
          fieldType: z.enum(['text', 'number', 'date', 'dropdown', 'checkbox', 'textarea']),
          options: z.any().optional(),
          required: z.boolean().optional(),
        });

        const data = schema.parse(req.body);

        // Would create in database
        await auditService.logCreate(
          req.tenant!.id,
          user.id,
          'custom_field',
          'generated-id',
          data,
          req
        );

        res.status(201).json({
          message: 'Custom field created',
          field: { ...data, id: 'generated-id' },
        });

      } catch (error: any) {
        res.status(400).json({
          error: { message: error.message || 'Failed to create custom field' },
        });
      }
    }
  );

  // ==========================================
  // WORKFLOWS & AUTOMATION (Professional & Enterprise)
  // ==========================================

  /**
   * Get workflows
   * GET /api/workflows
   */
  app.get('/api/workflows',
    requireTenant,
    requirePlan('professional', 'enterprise'),
    async (req: Request, res: Response) => {
      try {
        res.json({
          workflows: [],
          // Would fetch from database
        });

      } catch (error: any) {
        res.status(500).json({
          error: { message: 'Failed to fetch workflows' },
        });
      }
    }
  );

  /**
   * Create workflow
   * POST /api/workflows
   */
  app.post('/api/workflows',
    requireTenant,
    requirePlan('professional', 'enterprise'),
    async (req: Request, res: Response) => {
      try {
        const user = req.user as any;

        const schema = z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          triggerType: z.string(),
          triggerConditions: z.any().optional(),
          actions: z.array(z.any()),
          isActive: z.boolean().optional(),
        });

        const data = schema.parse(req.body);

        // Would create in database
        await auditService.logCreate(
          req.tenant!.id,
          user.id,
          'workflow',
          'generated-id',
          data,
          req
        );

        res.status(201).json({
          message: 'Workflow created',
          workflow: { ...data, id: 'generated-id' },
        });

      } catch (error: any) {
        res.status(400).json({
          error: { message: error.message || 'Failed to create workflow' },
        });
      }
    }
  );

  // ==========================================
  // API KEYS
  // ==========================================

  /**
   * List API keys
   * GET /api/api-keys
   */
  app.get('/api/api-keys', requireTenant, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      // Only admins can view API keys
      if (user.role !== 'Admin') {
        return res.status(403).json({
          error: { message: 'Only admins can view API keys' },
        });
      }

      res.json({
        apiKeys: [],
        // Would fetch from database
      });

    } catch (error: any) {
      res.status(500).json({
        error: { message: 'Failed to fetch API keys' },
      });
    }
  });

  /**
   * Create API key
   * POST /api/api-keys
   */
  app.post('/api/api-keys', requireTenant, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (user.role !== 'Admin') {
        return res.status(403).json({
          error: { message: 'Only admins can create API keys' },
        });
      }

      const schema = z.object({
        name: z.string().min(1),
        scopes: z.array(z.string()),
        expiresInDays: z.number().optional(),
      });

      const data = schema.parse(req.body);

      // Generate API key
      const apiKey = `sk_${crypto.randomBytes(32).toString('hex')}`;

      // Calculate expiration
      const expiresAt = data.expiresInDays
        ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      // Would create in database
      await auditService.logCreate(
        req.tenant!.id,
        user.id,
        'api_key',
        'generated-id',
        { name: data.name, scopes: data.scopes },
        req
      );

      res.status(201).json({
        message: 'API key created',
        apiKey: {
          id: 'generated-id',
          name: data.name,
          key: apiKey,
          scopes: data.scopes,
          expiresAt,
        },
      });

    } catch (error: any) {
      res.status(400).json({
        error: { message: error.message || 'Failed to create API key' },
      });
    }
  });

  /**
   * Revoke API key
   * DELETE /api/api-keys/:id
   */
  app.delete('/api/api-keys/:id', requireTenant, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (user.role !== 'Admin') {
        return res.status(403).json({
          error: { message: 'Only admins can revoke API keys' },
        });
      }

      // Would delete from database
      await auditService.logDelete(
        req.tenant!.id,
        user.id,
        'api_key',
        req.params.id,
        {},
        req
      );

      res.json({ message: 'API key revoked' });

    } catch (error: any) {
      res.status(500).json({
        error: { message: 'Failed to revoke API key' },
      });
    }
  });

  // ==========================================
  // WEBHOOKS
  // ==========================================

  /**
   * List webhooks
   * GET /api/webhooks
   */
  app.get('/api/webhooks', requireTenant, async (req: Request, res: Response) => {
    try {
      res.json({
        webhooks: [],
        events: Object.values(WebhookService.EVENTS),
      });

    } catch (error: any) {
      res.status(500).json({
        error: { message: 'Failed to fetch webhooks' },
      });
    }
  });

  /**
   * Create webhook
   * POST /api/webhooks
   */
  app.post('/api/webhooks', requireTenant, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (!['Admin', 'Manager'].includes(user.role)) {
        return res.status(403).json({
          error: { message: 'Insufficient permissions' },
        });
      }

      const schema = z.object({
        url: z.string().url(),
        events: z.array(z.string()),
      });

      const data = schema.parse(req.body);

      // Generate webhook secret
      const secret = crypto.randomBytes(32).toString('hex');

      // Would create in database
      await auditService.logCreate(
        req.tenant!.id,
        user.id,
        'webhook',
        'generated-id',
        { url: data.url, events: data.events },
        req
      );

      res.status(201).json({
        message: 'Webhook created',
        webhook: {
          id: 'generated-id',
          url: data.url,
          events: data.events,
          secret,
          isActive: true,
        },
      });

    } catch (error: any) {
      res.status(400).json({
        error: { message: error.message || 'Failed to create webhook' },
      });
    }
  });

  // ==========================================
  // TWILIO SMS/CALLING
  // ==========================================

  /**
   * Send SMS
   * POST /api/communications/sms
   */
  app.post('/api/communications/sms', requireTenant, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const schema = z.object({
        to: z.string(),
        message: z.string(),
        leadId: z.string().optional(),
        contactId: z.string().optional(),
      });

      const data = schema.parse(req.body);

      // Check SMS limits
      const check = await usageMeteringService.checkLimits(req.tenant!.id, req.tenant!);
      if (!check.withinLimits && check.exceeded.includes('SMS messages')) {
        return res.status(429).json({
          error: {
            message: 'SMS limit exceeded for your plan. Please upgrade.',
            limitExceeded: true,
          },
        });
      }

      const result = await twilioService.sendSMS({
        to: data.to,
        body: data.message,
        tenantId: req.tenant!.id,
        userId: user.id,
        leadId: data.leadId,
        contactId: data.contactId,
      });

      await usageMeteringService.recordSMSSent(req.tenant!.id);

      await auditService.log({
        tenantId: req.tenant!.id,
        userId: user.id,
        action: 'sms_sent',
        changes: { to: data.to },
        req,
      });

      res.json({
        message: 'SMS sent',
        sid: result.sid,
        status: result.status,
      });

    } catch (error: any) {
      console.error('Send SMS error:', error);
      res.status(500).json({
        error: { message: error.message || 'Failed to send SMS' },
      });
    }
  });

  /**
   * Get communication logs
   * GET /api/communications/logs
   */
  app.get('/api/communications/logs', requireTenant, async (req: Request, res: Response) => {
    try {
      const { type, contactId, leadId } = req.query;

      res.json({
        logs: [],
        // Would fetch from database with filters
      });

    } catch (error: any) {
      res.status(500).json({
        error: { message: 'Failed to fetch communication logs' },
      });
    }
  });

  // ==========================================
  // EMAIL SYNC (Professional & Enterprise)
  // ==========================================

  /**
   * Connect email account (OAuth)
   * GET /api/email-sync/connect/:provider
   */
  app.get('/api/email-sync/connect/:provider',
    requireTenant,
    requirePlan('professional', 'enterprise'),
    async (req: Request, res: Response) => {
      try {
        const { provider } = req.params;

        if (!['gmail', 'outlook'].includes(provider)) {
          return res.status(400).json({
            error: { message: 'Invalid provider. Use gmail or outlook.' },
          });
        }

        // Would initiate OAuth flow
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=...`;

        res.json({
          message: 'Redirect to authorization URL',
          authUrl,
        });

      } catch (error: any) {
        res.status(500).json({
          error: { message: 'Failed to initiate email sync' },
        });
      }
    }
  );

  /**
   * Get email sync status
   * GET /api/email-sync/status
   */
  app.get('/api/email-sync/status',
    requireTenant,
    requirePlan('professional', 'enterprise'),
    async (req: Request, res: Response) => {
      try {
        const user = req.user as any;

        res.json({
          connected: false,
          provider: null,
          email: null,
          lastSyncAt: null,
          // Would fetch from database
        });

      } catch (error: any) {
        res.status(500).json({
          error: { message: 'Failed to fetch email sync status' },
        });
      }
    }
  );

  // ==========================================
  // ADVANCED REPORTING (Enterprise only)
  // ==========================================

  /**
   * Generate advanced report
   * POST /api/reports/generate
   */
  app.post('/api/reports/generate',
    requireTenant,
    requirePlan('enterprise'),
    async (req: Request, res: Response) => {
      try {
        const schema = z.object({
          reportType: z.enum(['revenue_forecast', 'sales_performance', 'pipeline_analysis', 'conversion_funnel']),
          startDate: z.string(),
          endDate: z.string(),
          groupBy: z.enum(['day', 'week', 'month']).optional(),
        });

        const data = schema.parse(req.body);

        // Generate report data
        const reportData = {
          type: data.reportType,
          period: { start: data.startDate, end: data.endDate },
          metrics: {},
          charts: [],
        };

        res.json({
          report: reportData,
        });

      } catch (error: any) {
        res.status(400).json({
          error: { message: error.message || 'Failed to generate report' },
        });
      }
    }
  );

  /**
   * Export report
   * POST /api/reports/export
   */
  app.post('/api/reports/export',
    requireTenant,
    requirePlan('enterprise'),
    async (req: Request, res: Response) => {
      try {
        const schema = z.object({
          reportId: z.string(),
          format: z.enum(['pdf', 'xlsx', 'csv']),
        });

        const data = schema.parse(req.body);

        // Generate export
        res.json({
          message: 'Report export initiated',
          downloadUrl: `/api/reports/download/${data.reportId}.${data.format}`,
        });

      } catch (error: any) {
        res.status(400).json({
          error: { message: error.message || 'Failed to export report' },
        });
      }
    }
  );

  console.log('✓ Integration routes configured');
}
