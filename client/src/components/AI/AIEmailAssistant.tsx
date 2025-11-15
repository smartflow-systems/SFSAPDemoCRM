import { useState } from 'react';
import { Mail, Sparkles, Send, Copy, RotateCw, Zap, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailAssistantProps {
  recipientName?: string;
  recipientCompany?: string;
  context?: string;
}

export default function AIEmailAssistant({ recipientName, recipientCompany, context }: EmailAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'friendly' | 'formal'>('professional');
  const [keyPoints, setKeyPoints] = useState('');
  const [draft, setDraft] = useState<{
    subject: string;
    body: string;
    suggestions: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateDraft = async () => {
    if (!purpose.trim()) {
      toast({
        title: 'Purpose Required',
        description: 'Please describe the purpose of this email',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipientName: recipientName || 'there',
          recipientCompany,
          purpose,
          tone,
          keyPoints: keyPoints.split('\n').filter(p => p.trim()),
          context,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate email');

      const data = await response.json();
      setDraft(data);

      toast({
        title: 'Email Generated! ✨',
        description: 'Your AI-powered email is ready',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!draft) return;

    const emailText = `Subject: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard.writeText(emailText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    toast({
      title: 'Copied!',
      description: 'Email copied to clipboard',
    });
  };

  const regenerate = () => {
    setDraft(null);
    generateDraft();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-sf-primary flex items-center gap-2 animate-sf-glow-pulse"
      >
        <Sparkles className="w-4 h-4" />
        AI Email Assistant
      </button>
    );
  }

  return (
    <div className="glass-card p-6 animate-sf-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
            <Mail className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-sf-text-primary">AI Email Assistant</h3>
            <p className="text-sm text-sf-text-muted">Powered by Claude AI</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-sf-text-muted hover:text-sf-gold transition-colors"
        >
          ✕
        </button>
      </div>

      {!draft ? (
        <div className="space-y-4">
          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-sf-text-secondary mb-2">
              Email Purpose *
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Follow up on demo meeting, Send proposal, Schedule call"
              className="input-sf w-full"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-sf-text-secondary mb-2">
              Tone
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['professional', 'casual', 'friendly', 'formal'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tone === t
                      ? 'bg-sf-gold text-sf-black'
                      : 'bg-sf-brown/30 text-sf-text-secondary hover:bg-sf-brown/50'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Key Points */}
          <div>
            <label className="block text-sm font-medium text-sf-text-secondary mb-2">
              Key Points (one per line)
            </label>
            <textarea
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="Mention pricing discussion&#10;Highlight ROI benefits&#10;Suggest next steps"
              rows={4}
              className="input-sf w-full"
            />
          </div>

          {/* Recipient Info */}
          {recipientName && (
            <div className="glass-panel p-3 rounded-lg">
              <p className="text-sm text-sf-text-muted">
                Drafting for: <span className="text-sf-gold font-medium">{recipientName}</span>
                {recipientCompany && <span className="text-sf-text-secondary"> at {recipientCompany}</span>}
              </p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateDraft}
            disabled={loading}
            className="btn-sf-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Email
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-sf-fade-in">
          {/* Subject */}
          <div className="glass-panel p-4 rounded-lg">
            <label className="block text-xs text-sf-text-muted mb-2">Subject Line</label>
            <p className="text-sf-text-primary font-medium">{draft.subject}</p>
          </div>

          {/* Body */}
          <div className="glass-panel p-4 rounded-lg">
            <label className="block text-xs text-sf-text-muted mb-2">Email Body</label>
            <div className="text-sf-text-secondary whitespace-pre-wrap leading-relaxed">
              {draft.body}
            </div>
          </div>

          {/* Suggestions */}
          {draft.suggestions.length > 0 && (
            <div className="glass-panel p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-sf-text-primary mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sf-gold" />
                AI Suggestions
              </h4>
              <ul className="space-y-2">
                {draft.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-sf-text-secondary flex items-start gap-2">
                    <span className="text-sf-gold mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={copyToClipboard}
              className="btn-sf-primary flex-1 flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Email
                </>
              )}
            </button>
            <button
              onClick={regenerate}
              className="btn-sf-secondary flex items-center justify-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Regenerate
            </button>
            <button
              onClick={() => {
                setDraft(null);
                setPurpose('');
                setKeyPoints('');
              }}
              className="btn-sf-ghost"
            >
              New Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
