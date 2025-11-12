import Stripe from 'stripe';
import type { Tenant } from '../shared/schema';

// Stripe price IDs for each plan (these would be created in Stripe Dashboard)
const STRIPE_PRICE_IDS = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
  starter_yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly',
  professional_monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || 'price_professional_monthly',
  professional_yearly: process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY || 'price_professional_yearly',
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
  enterprise_yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly',
};

export class StripeService {
  private stripe: Stripe;

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      console.warn('⚠️  STRIPE_SECRET_KEY not set. Stripe integration disabled.');
      // Initialize with dummy key for development
      this.stripe = new Stripe('sk_test_dummy', { apiVersion: '2024-11-20.acacia' });
    } else {
      this.stripe = new Stripe(apiKey, { apiVersion: '2024-11-20.acacia' });
      console.log('✓ Stripe initialized');
    }
  }

  /**
   * Create a Stripe customer for a tenant
   */
  async createCustomer(params: {
    email: string;
    name: string;
    tenantId: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    const customer = await this.stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: {
        tenantId: params.tenantId,
        ...params.metadata,
      },
    });

    return customer;
  }

  /**
   * Create a subscription for a customer
   */
  async createSubscription(params: {
    customerId: string;
    plan: 'starter' | 'professional' | 'enterprise';
    billingCycle: 'monthly' | 'yearly';
    trialDays?: number;
  }): Promise<Stripe.Subscription> {
    const priceKey = `${params.plan}_${params.billingCycle}` as keyof typeof STRIPE_PRICE_IDS;
    const priceId = STRIPE_PRICE_IDS[priceKey];

    const subscription = await this.stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: priceId }],
      trial_period_days: params.trialDays,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  }

  /**
   * Update subscription plan
   */
  async updateSubscription(params: {
    subscriptionId: string;
    newPlan: 'starter' | 'professional' | 'enterprise';
    billingCycle: 'monthly' | 'yearly';
  }): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.retrieve(params.subscriptionId);

    const priceKey = `${params.newPlan}_${params.billingCycle}` as keyof typeof STRIPE_PRICE_IDS;
    const newPriceId = STRIPE_PRICE_IDS[priceKey];

    const updated = await this.stripe.subscriptions.update(params.subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations',
    });

    return updated;
  }

  /**
   * Cancel subscription (at period end)
   */
  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<Stripe.Subscription> {
    if (immediately) {
      return await this.stripe.subscriptions.cancel(subscriptionId);
    } else {
      return await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  }

  /**
   * Reactivate a cancelled subscription
   */
  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  /**
   * Create billing portal session for customer self-service
   */
  async createBillingPortalSession(params: {
    customerId: string;
    returnUrl: string;
  }): Promise<Stripe.BillingPortal.Session> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });

    return session;
  }

  /**
   * Create checkout session for new subscription
   */
  async createCheckoutSession(params: {
    customerId?: string;
    customerEmail?: string;
    plan: 'starter' | 'professional' | 'enterprise';
    billingCycle: 'monthly' | 'yearly';
    successUrl: string;
    cancelUrl: string;
    tenantId: string;
    trialDays?: number;
  }): Promise<Stripe.Checkout.Session> {
    const priceKey = `${params.plan}_${params.billingCycle}` as keyof typeof STRIPE_PRICE_IDS;
    const priceId = STRIPE_PRICE_IDS[priceKey];

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        tenantId: params.tenantId,
      },
    };

    if (params.customerId) {
      sessionParams.customer = params.customerId;
    } else if (params.customerEmail) {
      sessionParams.customer_email = params.customerEmail;
    }

    if (params.trialDays) {
      sessionParams.subscription_data = {
        trial_period_days: params.trialDays,
      };
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams);

    return session;
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.retrieve(subscriptionId);
  }

  /**
   * Get customer details
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    return await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
  }

  /**
   * List customer invoices
   */
  async listInvoices(customerId: string, limit: number = 10): Promise<Stripe.Invoice[]> {
    const invoices = await this.stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return invoices.data;
  }

  /**
   * Get upcoming invoice preview
   */
  async getUpcomingInvoice(customerId: string): Promise<Stripe.Invoice | null> {
    try {
      return await this.stripe.invoices.retrieveUpcoming({
        customer: customerId,
      });
    } catch (error: any) {
      if (error.code === 'invoice_upcoming_none') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Add usage record for metered billing
   */
  async recordUsage(params: {
    subscriptionItemId: string;
    quantity: number;
    timestamp?: number;
    action?: 'increment' | 'set';
  }): Promise<Stripe.UsageRecord> {
    return await this.stripe.subscriptionItems.createUsageRecord(
      params.subscriptionItemId,
      {
        quantity: params.quantity,
        timestamp: params.timestamp || Math.floor(Date.now() / 1000),
        action: params.action || 'increment',
      }
    );
  }

  /**
   * Create a payment intent for one-time charges
   */
  async createPaymentIntent(params: {
    amount: number; // in cents
    currency: string;
    customerId: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      customer: params.customerId,
      description: params.description,
      metadata: params.metadata,
      automatic_payment_methods: { enabled: true },
    });
  }

  /**
   * Construct webhook event from request
   */
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  /**
   * Get pricing information
   */
  getPricingInfo() {
    return {
      starter: {
        monthly: { priceId: STRIPE_PRICE_IDS.starter_monthly, amount: 29, currency: 'usd' },
        yearly: { priceId: STRIPE_PRICE_IDS.starter_yearly, amount: 290, currency: 'usd' },
      },
      professional: {
        monthly: { priceId: STRIPE_PRICE_IDS.professional_monthly, amount: 99, currency: 'usd' },
        yearly: { priceId: STRIPE_PRICE_IDS.professional_yearly, amount: 990, currency: 'usd' },
      },
      enterprise: {
        monthly: { priceId: STRIPE_PRICE_IDS.enterprise_monthly, amount: 299, currency: 'usd' },
        yearly: { priceId: STRIPE_PRICE_IDS.enterprise_yearly, amount: 2990, currency: 'usd' },
      },
    };
  }
}
