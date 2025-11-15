import { useState } from 'react';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeadScoreCardProps {
  leadId: string;
  leadName: string;
  currentRating?: string;
  onScoreComplete?: (score: number) => void;
}

interface ScoringResult {
  score: number;
  conversionProbability: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
  recommendedActions: string[];
  nextSteps: string[];
}

export default function LeadScoreCard({ leadId, leadName, currentRating, onScoreComplete }: LeadScoreCardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const { toast } = useToast();

  const scoreLead = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/score-lead/${leadId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to score lead');
      }

      const data = await response.json();
      setResult(data);
      onScoreComplete?.(data.score);

      toast({
        title: 'Lead Scored Successfully',
        description: `${leadName} scored ${data.score}/100`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to score lead',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-sf-success';
    if (score >= 50) return 'text-sf-warning';
    return 'text-sf-error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Hot Lead 🔥';
    if (score >= 50) return 'Warm Lead ⚡';
    return 'Cold Lead ❄️';
  };

  return (
    <div className="glass-card p-6 animate-sf-scale-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sf-gold/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-sf-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-sf-text-primary">AI Lead Scoring</h3>
            <p className="text-sm text-sf-text-muted">Powered by Claude AI</p>
          </div>
        </div>
        {result && (
          <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
            {result.score}
            <span className="text-sm text-sf-text-muted">/100</span>
          </div>
        )}
      </div>

      {!result && !loading && (
        <button
          onClick={scoreLead}
          className="btn-sf-primary w-full flex items-center justify-center gap-2 animate-sf-glow-pulse"
        >
          <Zap className="w-4 h-4" />
          Score Lead with AI
        </button>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-sf-gold animate-spin mb-3" />
          <p className="text-sf-text-secondary">Analyzing lead data...</p>
          <p className="text-xs text-sf-text-muted mt-1">This may take a few seconds</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4 animate-sf-fade-in">
          {/* Score Overview */}
          <div className="glass-panel p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sf-text-secondary">Lead Quality</span>
              <span className="badge-sf-gold">{getScoreLabel(result.score)}</span>
            </div>
            <div className="w-full bg-sf-brown/30 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  result.score >= 80
                    ? 'bg-gradient-to-r from-green-500 to-green-400'
                    : result.score >= 50
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                    : 'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${result.score}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-sf-text-muted">Conversion Probability</span>
              <span className="text-sf-gold font-semibold">
                {(result.conversionProbability * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="glass-panel p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-sf-text-primary mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sf-gold" />
              AI Analysis
            </h4>
            <p className="text-sm text-sf-text-secondary leading-relaxed">{result.reasoning}</p>
          </div>

          {/* Strengths */}
          {result.strengths.length > 0 && (
            <div className="glass-panel p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-sf-success mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Strengths
              </h4>
              <ul className="space-y-2">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-sf-text-secondary flex items-start gap-2">
                    <span className="text-sf-success mt-0.5">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Concerns */}
          {result.concerns.length > 0 && (
            <div className="glass-panel p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-sf-warning mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Concerns
              </h4>
              <ul className="space-y-2">
                {result.concerns.map((concern, index) => (
                  <li key={index} className="text-sm text-sf-text-secondary flex items-start gap-2">
                    <span className="text-sf-warning mt-0.5">⚠</span>
                    <span>{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Actions */}
          {result.recommendedActions.length > 0 && (
            <div className="glass-panel p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-sf-gold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recommended Actions
              </h4>
              <ul className="space-y-2">
                {result.recommendedActions.map((action, index) => (
                  <li key={index} className="text-sm text-sf-text-secondary flex items-start gap-2">
                    <span className="text-sf-gold mt-0.5">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {result.nextSteps.length > 0 && (
            <div className="glass-panel p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-sf-text-primary mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-sf-gold" />
                Next Steps
              </h4>
              <ol className="space-y-2">
                {result.nextSteps.map((step, index) => (
                  <li key={index} className="text-sm text-sf-text-secondary flex items-start gap-2">
                    <span className="text-sf-gold mt-0.5 font-semibold">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Rescore Button */}
          <button
            onClick={scoreLead}
            className="btn-sf-secondary w-full flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Re-score Lead
          </button>
        </div>
      )}
    </div>
  );
}
