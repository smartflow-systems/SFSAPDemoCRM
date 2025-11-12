import crypto from 'crypto';
import type { Webhook, InsertWebhookDelivery } from '../shared/schema';

export class WebhookService {
  /**
   * Deliver webhook to endpoint
   */
  async deliverWebhook(params: {
    webhook: Webhook;
    event: string;
    payload: any;
    tenantId: string;
  }): Promise<InsertWebhookDelivery> {
    const { webhook, event, payload, tenantId } = params;

    const delivery: InsertWebhookDelivery = {
      tenantId,
      webhookId: webhook.id,
      event,
      payload,
      attempts: 1,
      success: false,
    };

    try {
      // Generate signature for verification
      const signature = this.generateSignature(payload, webhook.secret);

      // Send webhook
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
          'User-Agent': 'SFS-CRM-Webhook/1.0',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      delivery.responseStatus = response.status;
      delivery.responseBody = await response.text().catch(() => '');
      delivery.success = response.ok;

      if (!response.ok) {
        console.error(`Webhook delivery failed: ${response.status} ${response.statusText}`);
      }

    } catch (error: any) {
      console.error('Webhook delivery error:', error);
      delivery.responseStatus = 0;
      delivery.responseBody = error.message;
      delivery.success = false;
    }

    // Log delivery (would be saved to database)
    // await storage.createWebhookDelivery(delivery);

    return delivery;
  }

  /**
   * Retry failed webhook delivery
   */
  async retryDelivery(delivery: InsertWebhookDelivery, webhook: Webhook): Promise<InsertWebhookDelivery> {
    delivery.attempts++;

    try {
      const signature = this.generateSignature(delivery.payload, webhook.secret);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': delivery.event,
          'X-Webhook-Retry': delivery.attempts.toString(),
        },
        body: JSON.stringify(delivery.payload),
        signal: AbortSignal.timeout(30000),
      });

      delivery.responseStatus = response.status;
      delivery.responseBody = await response.text().catch(() => '');
      delivery.success = response.ok;

    } catch (error: any) {
      delivery.responseStatus = 0;
      delivery.responseBody = error.message;
      delivery.success = false;
    }

    return delivery;
  }

  /**
   * Trigger webhooks for an event
   */
  async triggerEvent(params: {
    tenantId: string;
    event: string;
    data: any;
  }): Promise<void> {
    const { tenantId, event, data } = params;

    // Get all webhooks for this tenant that subscribe to this event
    // const webhooks = await storage.getWebhooksByEvent(tenantId, event);

    // For now, simulate
    console.log(`Triggering webhook event: ${event} for tenant ${tenantId}`);

    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      tenant_id: tenantId,
    };

    // Deliver to each webhook
    // for (const webhook of webhooks) {
    //   if (webhook.isActive && webhook.events.includes(event)) {
    //     await this.deliverWebhook({
    //       webhook,
    //       event,
    //       payload,
    //       tenantId,
    //     });
    //   }
    // }
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  generateSignature(payload: any, secret: string): string {
    const payloadString = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payloadString);
    return hmac.digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: any, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Standard webhook events
   */
  static readonly EVENTS = {
    // Lead events
    LEAD_CREATED: 'lead.created',
    LEAD_UPDATED: 'lead.updated',
    LEAD_DELETED: 'lead.deleted',
    LEAD_CONVERTED: 'lead.converted',

    // Opportunity events
    OPPORTUNITY_CREATED: 'opportunity.created',
    OPPORTUNITY_UPDATED: 'opportunity.updated',
    OPPORTUNITY_WON: 'opportunity.won',
    OPPORTUNITY_LOST: 'opportunity.lost',

    // Account events
    ACCOUNT_CREATED: 'account.created',
    ACCOUNT_UPDATED: 'account.updated',

    // Contact events
    CONTACT_CREATED: 'contact.created',
    CONTACT_UPDATED: 'contact.updated',

    // Activity events
    TASK_CREATED: 'task.created',
    TASK_COMPLETED: 'task.completed',
  };
}

export const webhookService = new WebhookService();
