/**
 * AI Service - Claude AI Integration
 * Provides AI-powered features: lead scoring, email generation, sentiment analysis
 */

import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client (use env var or fallback)
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '',
});

const isConfigured = Boolean(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY);

interface LeadData {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  source: string;
  status: string;
  rating?: string | null;
  budget?: number | null;
  notes?: string | null;
  tags?: string[] | null;
}

interface LeadScoringResult {
  score: number; // 0-100
  reasoning: string;
  conversionProbability: number; // 0-1
  recommendedActions: string[];
  strengths: string[];
  concerns: string[];
  nextSteps: string[];
}

interface EmailDraftResult {
  subject: string;
  body: string;
  tone: string;
  suggestions: string[];
}

interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  score: number; // -1 to 1
  emotions: string[];
  keyPhrases: string[];
  actionRequired: boolean;
}

export class AIService {
  /**
   * Score a lead using AI analysis
   */
  async scoreLead(leadData: LeadData): Promise<LeadScoringResult> {
    if (!isConfigured) {
      throw new Error('AI service not configured. Set ANTHROPIC_API_KEY or CLAUDE_API_KEY environment variable.');
    }

    const prompt = `Analyze this sales lead and provide a comprehensive scoring assessment.

Lead Information:
- Name: ${leadData.firstName} ${leadData.lastName}
- Email: ${leadData.email || 'Not provided'}
- Phone: ${leadData.phone || 'Not provided'}
- Company: ${leadData.company || 'Not provided'}
- Source: ${leadData.source}
- Current Status: ${leadData.status}
- Rating: ${leadData.rating || 'Not rated'}
- Budget: ${leadData.budget ? `$${leadData.budget}` : 'Unknown'}
- Notes: ${leadData.notes || 'None'}
- Tags: ${leadData.tags?.join(', ') || 'None'}

Please analyze this lead and provide:
1. A score from 0-100 (0 = very low quality, 100 = extremely high quality)
2. Conversion probability (0.0 to 1.0)
3. Key strengths that make this a good lead
4. Potential concerns or red flags
5. Recommended next actions for the sales team
6. Suggested next steps in the sales process

Respond in the following JSON format:
{
  "score": <number>,
  "conversionProbability": <number>,
  "reasoning": "<detailed explanation>",
  "strengths": ["<strength1>", "<strength2>"],
  "concerns": ["<concern1>", "<concern2>"],
  "recommendedActions": ["<action1>", "<action2>"],
  "nextSteps": ["<step1>", "<step2>"]
}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = content.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const result: LeadScoringResult = JSON.parse(jsonText);
    return result;
  }

  /**
   * Generate an AI-powered email draft
   */
  async draftEmail(params: {
    recipientName: string;
    recipientCompany?: string;
    purpose: string;
    tone: 'professional' | 'casual' | 'friendly' | 'formal';
    keyPoints?: string[];
    context?: string;
  }): Promise<EmailDraftResult> {
    if (!isConfigured) {
      throw new Error('AI service not configured.');
    }

    const prompt = `Draft a ${params.tone} email for the following scenario:

Recipient: ${params.recipientName}${params.recipientCompany ? ` at ${params.recipientCompany}` : ''}
Purpose: ${params.purpose}
Tone: ${params.tone}
Key Points to Include: ${params.keyPoints?.join(', ') || 'None specified'}
Additional Context: ${params.context || 'None'}

Please provide:
1. An engaging subject line
2. A well-crafted email body
3. The tone category used
4. 2-3 suggestions for improving the email

Respond in JSON format:
{
  "subject": "<subject line>",
  "body": "<email body>",
  "tone": "<tone>",
  "suggestions": ["<suggestion1>", "<suggestion2>"]
}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let jsonText = content.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const result: EmailDraftResult = JSON.parse(jsonText);
    return result;
  }

  /**
   * Analyze sentiment of text (email, note, message)
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    if (!isConfigured) {
      throw new Error('AI service not configured.');
    }

    const prompt = `Analyze the sentiment and emotion in the following text:

"${text}"

Please provide:
1. Overall sentiment: positive, neutral, negative, or urgent
2. Sentiment score from -1 (very negative) to 1 (very positive)
3. Detected emotions (e.g., happy, frustrated, excited, concerned)
4. Key phrases that indicate sentiment
5. Whether immediate action is required

Respond in JSON format:
{
  "sentiment": "<positive|neutral|negative|urgent>",
  "score": <number>,
  "emotions": ["<emotion1>", "<emotion2>"],
  "keyPhrases": ["<phrase1>", "<phrase2>"],
  "actionRequired": <boolean>
}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let jsonText = content.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const result: SentimentResult = JSON.parse(jsonText);
    return result;
  }

  /**
   * Get AI-powered sales coaching insights
   */
  async getSalesCoaching(params: {
    dealHistory: Array<{
      won: boolean;
      value: number;
      closedIn: number; // days
      touchpoints: number;
      source: string;
    }>;
    currentDeal?: {
      stage: string;
      value: number;
      daysInStage: number;
      touchpoints: number;
    };
  }): Promise<{
    insights: string[];
    recommendations: string[];
    winProbability?: number;
    estimatedCloseDate?: string;
  }> {
    if (!isConfigured) {
      throw new Error('AI service not configured.');
    }

    const prompt = `Analyze this sales performance data and provide coaching insights:

Historical Deal Data:
${params.dealHistory.map((deal, i) => `
Deal ${i + 1}:
- Result: ${deal.won ? 'Won' : 'Lost'}
- Value: $${deal.value}
- Days to Close: ${deal.closedIn}
- Touchpoints: ${deal.touchpoints}
- Source: ${deal.source}
`).join('\n')}

${params.currentDeal ? `Current Deal in Progress:
- Stage: ${params.currentDeal.stage}
- Value: $${params.currentDeal.value}
- Days in Current Stage: ${params.currentDeal.daysInStage}
- Touchpoints So Far: ${params.currentDeal.touchpoints}
` : ''}

Please provide:
1. Key insights from the historical data
2. Actionable recommendations for improvement
${params.currentDeal ? `3. Win probability for the current deal (0.0 to 1.0)
4. Estimated close date for current deal` : ''}

Respond in JSON format:
{
  "insights": ["<insight1>", "<insight2>"],
  "recommendations": ["<recommendation1>", "<recommendation2>"],
  ${params.currentDeal ? `"winProbability": <number>,
  "estimatedCloseDate": "<ISO date>"` : ''}
}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let jsonText = content.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const result = JSON.parse(jsonText);
    return result;
  }

  /**
   * Check if AI service is configured
   */
  isAvailable(): boolean {
    return isConfigured;
  }
}

export const aiService = new AIService();
