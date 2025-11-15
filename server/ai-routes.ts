/**
 * AI Routes - API endpoints for AI-powered features
 */

import type { Express } from 'express';
import { aiService } from './ai-service';
import { storage } from './storage';

export function setupAIRoutes(app: Express) {
  // Check if AI is available
  app.get('/api/ai/status', (req, res) => {
    res.json({
      available: aiService.isAvailable(),
      features: {
        leadScoring: true,
        emailDrafting: true,
        sentimentAnalysis: true,
        salesCoaching: true,
      },
    });
  });

  // Score a lead
  app.post('/api/ai/score-lead/:leadId', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { leadId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID required' });
      }

      // Get lead data
      const lead = await storage.getLead(leadId, tenantId);
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      // Score the lead
      const scoring = await aiService.scoreLead({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        source: lead.source,
        status: lead.status,
        rating: lead.rating,
        budget: lead.budget,
        notes: lead.notes,
        tags: lead.tags,
      });

      // Optionally store the score
      await storage.updateLead(leadId, {
        ...lead,
        rating: scoring.score >= 80 ? 'Hot' : scoring.score >= 50 ? 'Warm' : 'Cold',
      });

      res.json({
        leadId,
        ...scoring,
        scoredAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('AI lead scoring error:', error);
      res.status(500).json({
        error: 'Failed to score lead',
        message: error.message,
      });
    }
  });

  // Draft an email
  app.post('/api/ai/draft-email', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { recipientName, recipientCompany, purpose, tone, keyPoints, context } = req.body;

      if (!recipientName || !purpose) {
        return res.status(400).json({ error: 'Recipient name and purpose are required' });
      }

      const draft = await aiService.draftEmail({
        recipientName,
        recipientCompany,
        purpose,
        tone: tone || 'professional',
        keyPoints,
        context,
      });

      res.json(draft);
    } catch (error: any) {
      console.error('AI email draft error:', error);
      res.status(500).json({
        error: 'Failed to draft email',
        message: error.message,
      });
    }
  });

  // Analyze sentiment
  app.post('/api/ai/analyze-sentiment', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const sentiment = await aiService.analyzeSentiment(text);

      res.json(sentiment);
    } catch (error: any) {
      console.error('AI sentiment analysis error:', error);
      res.status(500).json({
        error: 'Failed to analyze sentiment',
        message: error.message,
      });
    }
  });

  // Get sales coaching
  app.post('/api/ai/sales-coaching', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { dealHistory, currentDeal } = req.body;

      if (!dealHistory || !Array.isArray(dealHistory)) {
        return res.status(400).json({ error: 'Deal history is required' });
      }

      const coaching = await aiService.getSalesCoaching({
        dealHistory,
        currentDeal,
      });

      res.json(coaching);
    } catch (error: any) {
      console.error('AI sales coaching error:', error);
      res.status(500).json({
        error: 'Failed to get sales coaching',
        message: error.message,
      });
    }
  });

  // Batch score all leads for a tenant
  app.post('/api/ai/score-all-leads', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID required' });
      }

      // Get all leads
      const leads = await storage.getLeadsByOwner(req.user!.id, tenantId);

      // Score each lead (limit to 10 for cost reasons)
      const scoredLeads = [];
      const limit = Math.min(leads.length, 10);

      for (let i = 0; i < limit; i++) {
        const lead = leads[i];
        try {
          const scoring = await aiService.scoreLead({
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            source: lead.source,
            status: lead.status,
            rating: lead.rating,
            budget: lead.budget,
            notes: lead.notes,
            tags: lead.tags,
          });

          scoredLeads.push({
            leadId: lead.id,
            name: `${lead.firstName} ${lead.lastName}`,
            score: scoring.score,
            conversionProbability: scoring.conversionProbability,
            recommendedActions: scoring.recommendedActions,
          });

          // Update rating
          await storage.updateLead(lead.id!, {
            ...lead,
            rating: scoring.score >= 80 ? 'Hot' : scoring.score >= 50 ? 'Warm' : 'Cold',
          });
        } catch (error) {
          console.error(`Failed to score lead ${lead.id}:`, error);
        }
      }

      res.json({
        scoredCount: scoredLeads.length,
        totalLeads: leads.length,
        leads: scoredLeads,
      });
    } catch (error: any) {
      console.error('AI batch scoring error:', error);
      res.status(500).json({
        error: 'Failed to score leads',
        message: error.message,
      });
    }
  });

  console.log('✓ AI routes configured');
}
