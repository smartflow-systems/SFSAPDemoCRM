import express from 'express';
import { StripeService } from './stripe-service';
import { usageMeteringService } from './usage-metering-service';
import { AuditService } from './audit-service';
import { storage } from './storage';
import { z } from 'zod';
import { requireTenant } from './tenant-middleware';
import type { Request, Response } from 'express';

const stripeService = new StripeService();
const auditService = new AuditService(storage);

export function setupBillingRoutes(app: express.Application) {

  /**
   * Get current subscription and billing info
   * GET /api/billing/subscription
   */
  app.get('/api/billing/subscription', requireTenant, async (req: Request, res: Response) => {
    try {
      const tenant = req.tenant!;

      if (!tenant.stripeCustomerId) {
        return res.json({
          subscription: null,
          customer: null,
        });
      }

      const [customer, invoices] = await Promise.all([
        stripeService.getCustomer(tenant.stripeCustomerId),
        stripeService.listInvoices(tenant.stripeCustomerId, 5),
      ]);

      let subscription = null;
      if (tenant.stripeSubscriptionId) {
        subscription = await stripeService.getSubscription(tenant.stripeSubscriptionId);
      }

      res.json({
        subscription,
        customer,
        invoices,
      });

    } catch (error: any) {
      console.error('Get subscription error:', error);
      res.status(500).json({
        error: { message: 'Failed to fetch subscription' },
      });
    }
  });

  /**
   * Create checkout session for new subscription or upgrade
   * POST /api/billing/create-checkout
   */
  app.post('/api/billing/create-checkout', requireTenant, async (req: Request, res: Response) => {
    try {
      const tenant = req.tenant!;
      const user = req.user as any;

      const schema = z.object({
        plan: z.enum(['starter', 'professional', 'enterprise']),
        billingCycle: z.enum(['monthly', 'yearly']),
      });

      const { plan, billingCycle } = schema.parse(req.body);

      // Create or get Stripe customer
      let customerId = tenant.stripeCustomerId;

      if (!customerId) {
        const customer = await stripeService.createCustomer({
          email: user.email,
          name: tenant.name,
          tenantId: tenant.id,
        });

        customerId = customer.id;

        await storage.updateTenant(tenant.id, {
          stripeCustomerId: customerId,
        });
      }

      // Create checkout session
      const baseUrl = process.env.APP_URL || 'http://localhost:5000';
      const subdomain = tenant.subdomain;

      const session = await stripeService.createCheckoutSession({
        customerId,
        plan,
        billingCycle,
        successUrl: `${baseUrl}/settings?tab=billing&success=true`,
        cancelUrl: `${baseUrl}/settings?tab=billing&cancelled=true`,
        tenantId: tenant.id,
        trialDays: tenant.subscriptionStatus === 'trial' ? 0 : undefined,
      });

      await auditService.log({
        tenantId: tenant.id,
        userId: user.id,
        action: 'checkout_session_created',
        changes: { plan, billingCycle },
        req,
      });

      res.json({
        sessionId: session.id,
        url: session.url,
      });

    } catch (error: any) {
      console.error('Create checkout error:', error);
      res.status(500).json({
        error: { message: 'Failed to create checkout session' },
      });
    }
  });

  /**
   * Create billing portal session for customer self-service
   * POST /api/billing/create-portal-session
   */
  app.post('/api/billing/create-portal-session', requireTenant, async (req: Request, res: Response) => {
    try {
      const tenant = req.tenant!;

      if (!tenant.stripeCustomerId) {
        return res.status(400).json({
          error: { message: 'No Stripe customer found' },
        });
      }

      const baseUrl = process.env.APP_URL || 'http://localhost:5000';

      const session = await stripeService.createBillingPortalSession({
        customerId: tenant.stripeCustomerId,
        returnUrl: `${baseUrl}/settings?tab=billing`,
      });

      res.json({
        url: session.url,
      });

    } catch (error: any) {
      console.error('Create portal session error:', error);
      res.status(500).json({
        error: { message: 'Failed to create portal session' },
      });
    }
  });

  /**
   * Get usage metrics
   * GET /api/billing/usage
   */
  app.get('/api/billing/usage', requireTenant, async (req: Request, res: Response) => {
    try {
      const tenant = req.tenant!;

      const summary = await usageMeteringService.getUsageSummary(tenant.id, tenant);

      res.json(summary);

    } catch (error: any) {
      console.error('Get usage error:', error);
      res.status(500).json({
        error: { message: 'Failed to fetch usage metrics' },
      });
    }
  });

  /**
   * Get pricing information
   * GET /api/billing/pricing
   */
  app.get('/api/billing/pricing', async (req: Request, res: Response) => {
    try {
      const pricing = stripeService.getPricingInfo();

      res.json({
        plans: {
          starter: {
            name: 'Starter',
            features: [
              '5 users',
              '1,000 leads',
              '500 opportunities',
              '10,000 API calls/month',
              '1 GB storage',
              'Email support',
            ],
            pricing: pricing.starter,
          },
          professional: {
            name: 'Professional',
            features: [
              '25 users',
              '10,000 leads',
              '5,000 opportunities',
              '100,000 API calls/month',
              '10 GB storage',
              'Priority support',
              'Advanced automation',
              'Custom fields',
            ],
            pricing: pricing.professional,
          },
          enterprise: {
            name: 'Enterprise',
            features: [
              '100 users',
              'Unlimited leads',
              'Unlimited opportunities',
              'Unlimited API calls',
              '100 GB storage',
              '24/7 phone support',
              'Dedicated account manager',
              'Custom integrations',
              'SLA guarantee',
            ],
            pricing: pricing.enterprise,
          },
        },
      });

    } catch (error: any) {
      console.error('Get pricing error:', error);
      res.status(500).json({
        error: { message: 'Failed to fetch pricing' },
      });
    }
  });

  /**
   * Cancel subscription
   * POST /api/billing/cancel
   */
  app.post('/api/billing/cancel', requireTenant, async (req: Request, res: Response) => {
    try {
      const tenant = req.tenant!;
      const user = req.user as any;

      // Only admins can cancel subscriptions
      if (user.role !== 'Admin') {
        return res.status(403).json({
          error: { message: 'Only admins can cancel subscriptions' },
        });
      }

      if (!tenant.stripeSubscriptionId) {
        return res.status(400).json({
          error: { message: 'No active subscription found' },
        });
      }

      const schema = z.object({
        immediately: z.boolean().optional(),
      });

      const { immediately = false } = schema.parse(req.body);

      const subscription = await stripeService.cancelSubscription(
        tenant.stripeSubscriptionId,
        immediately
      );

      await auditService.log({
        tenantId: tenant.id,
        userId: user.id,
        action: 'subscription_cancelled',
        changes: { immediately },
        req,
      });

      res.json({
        message: immediately
          ? 'Subscription cancelled immediately'
          : 'Subscription will cancel at period end',
        subscription,
      });

    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({
        error: { message: 'Failed to cancel subscription' },
      });
    }
  });

  /**
   * Stripe webhook handler
   * POST /api/webhooks/stripe
   */
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    try {
      const event = stripeService.constructWebhookEvent(
        req.body,
        sig,
        webhookSecret
      );

      console.log(`Stripe webhook received: ${event.type}`);

      // Handle the event
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as any;
          const tenantId = subscription.metadata?.tenantId;

          if (tenantId) {
            const status = subscription.status === 'active' ? 'active' :
                          subscription.status === 'past_due' ? 'past_due' :
                          subscription.status === 'canceled' ? 'cancelled' : 'trial';

            await storage.updateTenant(tenantId, {
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: status,
            });

            console.log(`Updated tenant ${tenantId} subscription status: ${status}`);
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as any;
          const tenantId = subscription.metadata?.tenantId;

          if (tenantId) {
            await storage.updateTenant(tenantId, {
              subscriptionStatus: 'cancelled',
            });

            console.log(`Cancelled subscription for tenant ${tenantId}`);
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as any;
          console.log(`Payment succeeded for invoice ${invoice.id}`);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as any;
          console.log(`Payment failed for invoice ${invoice.id}`);

          // Update tenant status to past_due
          const customerId = invoice.customer;
          // Would need to query tenant by customerId
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });

    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  console.log('✓ Billing routes configured');
}
