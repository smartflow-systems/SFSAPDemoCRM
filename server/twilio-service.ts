import twilio from 'twilio';
import type { InsertCommunicationLog } from '../shared/schema';

export class TwilioService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (!accountSid || !authToken) {
      console.warn('⚠️  Twilio credentials not set. SMS/calling disabled.');
    } else {
      this.client = twilio(accountSid, authToken);
      console.log('✓ Twilio initialized');
    }
  }

  /**
   * Send SMS message
   */
  async sendSMS(params: {
    to: string;
    body: string;
    tenantId: string;
    userId?: string;
    leadId?: string;
    contactId?: string;
  }): Promise<{ sid: string; status: string; cost?: string }> {
    if (!this.client) {
      throw new Error('Twilio not configured');
    }

    const message = await this.client.messages.create({
      from: this.fromNumber,
      to: params.to,
      body: params.body,
    });

    return {
      sid: message.sid,
      status: message.status,
      cost: message.price,
    };
  }

  /**
   * Make phone call
   */
  async makeCall(params: {
    to: string;
    url: string; // TwiML URL
    tenantId: string;
    userId?: string;
    contactId?: string;
  }): Promise<{ sid: string; status: string }> {
    if (!this.client) {
      throw new Error('Twilio not configured');
    }

    const call = await this.client.calls.create({
      from: this.fromNumber,
      to: params.to,
      url: params.url,
    });

    return {
      sid: call.sid,
      status: call.status,
    };
  }

  /**
   * Get SMS details
   */
  async getSMS(sid: string) {
    if (!this.client) {
      throw new Error('Twilio not configured');
    }

    return await this.client.messages(sid).fetch();
  }

  /**
   * Get call details
   */
  async getCall(sid: string) {
    if (!this.client) {
      throw new Error('Twilio not configured');
    }

    return await this.client.calls(sid).fetch();
  }

  /**
   * List recent messages
   */
  async listMessages(limit: number = 20) {
    if (!this.client) {
      throw new Error('Twilio not configured');
    }

    return await this.client.messages.list({ limit });
  }

  /**
   * List recent calls
   */
  async listCalls(limit: number = 20) {
    if (!this.client) {
      throw new Error('Twilio not configured');
    }

    return await this.client.calls.list({ limit });
  }

  /**
   * Handle incoming SMS webhook
   */
  handleIncomingSMS(webhookData: any): InsertCommunicationLog {
    return {
      tenantId: '', // Will be set by route handler
      type: 'sms',
      direction: 'inbound',
      from: webhookData.From,
      to: webhookData.To,
      body: webhookData.Body,
      status: 'delivered',
      externalId: webhookData.MessageSid,
    };
  }

  /**
   * Handle incoming call webhook
   */
  handleIncomingCall(webhookData: any): InsertCommunicationLog {
    return {
      tenantId: '', // Will be set by route handler
      type: 'call',
      direction: 'inbound',
      from: webhookData.From,
      to: webhookData.To,
      status: webhookData.CallStatus,
      duration: parseInt(webhookData.CallDuration || '0'),
      externalId: webhookData.CallSid,
    };
  }

  /**
   * Validate Twilio webhook signature
   */
  validateWebhook(url: string, params: any, signature: string): boolean {
    if (!this.client) {
      return false;
    }

    const authToken = process.env.TWILIO_AUTH_TOKEN || '';
    return twilio.validateRequest(authToken, signature, url, params);
  }
}

export const twilioService = new TwilioService();
