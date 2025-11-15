import { LucideIcon, Inbox, Users, Briefcase, Search, FileText, Calendar, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  type?: 'default' | 'search' | 'success';
}

export default function EmptyState({ icon: Icon = Inbox, title, description, action, type = 'default' }: EmptyStateProps) {
  const getGradient = () => {
    switch (type) {
      case 'search':
        return 'from-blue-500/20 to-purple-500/20';
      case 'success':
        return 'from-green-500/20 to-emerald-500/20';
      default:
        return 'from-sf-gold/20 to-sf-gold-hover/20';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-sf-scale-in">
      <div className={`p-6 bg-gradient-to-br ${getGradient()} rounded-2xl mb-6 relative`}>
        <Icon className="w-16 h-16 text-sf-gold" />
        <Sparkles className="w-6 h-6 text-sf-gold absolute -top-2 -right-2 animate-pulse" />
      </div>
      <h3 className="text-xl font-bold text-sf-text-primary mb-2">{title}</h3>
      <p className="text-sm text-sf-text-muted text-center max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-sf-primary flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {action.label}
        </button>
      )}
    </div>
  );
}

// Specialized Empty States
export function NoLeadsState({ onAddLead }: { onAddLead: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No Leads Yet"
      description="Start building your pipeline by adding your first lead. AI will help you score and prioritize them."
      action={{ label: 'Add First Lead', onClick: onAddLead }}
    />
  );
}

export function NoDealsState({ onAddDeal }: { onAddDeal: () => void }) {
  return (
    <EmptyState
      icon={Briefcase}
      title="No Deals in Pipeline"
      description="Create your first deal and watch AI-powered insights guide you to close faster."
      action={{ label: 'Create First Deal', onClick: onAddDeal }}
    />
  );
}

export function NoSearchResultsState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      type="search"
      title="No Results Found"
      description={`We couldn't find anything matching "${query}". Try different keywords or check your spelling.`}
    />
  );
}

export function NoTasksState({ onAddTask }: { onAddTask: () => void }) {
  return (
    <EmptyState
      icon={Calendar}
      title="All Caught Up! 🎉"
      description="You have no pending tasks. Great work staying on top of everything!"
      type="success"
    />
  );
}

export function NoReportsState() {
  return (
    <EmptyState
      icon={FileText}
      title="No Reports Available"
      description="Reports will appear here once you have enough data. Keep adding leads and closing deals!"
    />
  );
}
