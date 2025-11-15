import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Zap, X, Plus, Search, Mail, Phone, Calendar, FileText,
  Users, Briefcase, ListTodo, TrendingUp, Settings, LogOut, Command
} from 'lucide-react';
import { useCRM } from '@/contexts/CRMContext';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
  shortcut?: string;
}

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setLocation] = useLocation();
  const { logout } = useCRM();

  // Define all quick actions
  const allActions: QuickAction[] = [
    {
      id: 'add-lead',
      label: 'Add New Lead',
      description: 'Create a new lead in the system',
      icon: <Plus className="w-5 h-5" />,
      action: () => {
        setIsOpen(false);
        setLocation('/leads');
        // TODO: Trigger add lead modal
      },
      keywords: ['add', 'new', 'create', 'lead', 'prospect'],
      shortcut: 'L',
    },
    {
      id: 'add-deal',
      label: 'Add New Deal',
      description: 'Create a new opportunity',
      icon: <Briefcase className="w-5 h-5" />,
      action: () => {
        setIsOpen(false);
        setLocation('/pipeline');
      },
      keywords: ['add', 'new', 'create', 'deal', 'opportunity'],
      shortcut: 'D',
    },
    {
      id: 'add-task',
      label: 'Add New Task',
      description: 'Create a new task or reminder',
      icon: <ListTodo className="w-5 h-5" />,
      action: () => {
        setIsOpen(false);
        setLocation('/tasks');
      },
      keywords: ['add', 'new', 'create', 'task', 'todo', 'reminder'],
      shortcut: 'T',
    },
    {
      id: 'search',
      label: 'Global Search',
      description: 'Search across all records',
      icon: <Search className="w-5 h-5" />,
      action: () => {
        setIsOpen(false);
        // Trigger global search (Cmd+K)
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
      },
      keywords: ['search', 'find', 'lookup'],
      shortcut: 'K',
    },
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      description: 'View your dashboard',
      icon: <TrendingUp className="w-5 h-5" />,
      action: () => {
        setIsOpen(false);
        setLocation('/dashboard');
      },
      keywords: ['dashboard', 'home', 'overview'],
      shortcut: 'H',
    },
    {
      id: 'leads',
      label: 'View Leads',
      description: 'Browse all leads',
      icon: <Users className="w-5 h-5" />,
      action: () => {
        setIsOpen(false);
        setLocation('/leads');
      },
      keywords: ['leads', 'prospects', 'contacts'],
    },
    {
      id: 'pipeline',
      label: 'View Pipeline',
      description: 'See your sales pipeline',
      icon: <Briefcase className="w-5 h-5" />,
      action: () => {
        setIsOpen(false);
        setLocation('/pipeline');
      },
      keywords: ['pipeline', 'deals', 'opportunities'],
      shortcut: 'P',
    },
    {
      id: 'tasks',
      label: 'View Tasks',
      description: 'See all your tasks',
      icon: <ListTodo className="w-5 h-5" />,
      action: () => {
        setIsOpen(false);
        setLocation('/tasks');
      },
      keywords: ['tasks', 'todo', 'activities'],
    },
    {
      id: 'reports',
      label: 'View Reports',
      description: 'Analytics and insights',
      icon: <FileText className="w-5 h-5" />,
      action: () => {
        setIsOpen(false);
        setLocation('/reports');
      },
      keywords: ['reports', 'analytics', 'insights', 'metrics'],
      shortcut: 'R',
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Manage your preferences',
      icon: <Settings className="w-5 h-5" />,
      action: () => {
        setIsOpen(false);
        setLocation('/settings');
      },
      keywords: ['settings', 'preferences', 'config'],
    },
    {
      id: 'logout',
      label: 'Sign Out',
      description: 'Log out of your account',
      icon: <LogOut className="w-5 h-5" />,
      action: () => {
        setIsOpen(false);
        logout();
      },
      keywords: ['logout', 'signout', 'exit'],
    },
  ];

  // Filter actions based on query
  const filteredActions = query.trim()
    ? allActions.filter(action =>
        action.label.toLowerCase().includes(query.toLowerCase()) ||
        action.description.toLowerCase().includes(query.toLowerCase()) ||
        action.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()))
      )
    : allActions;

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+J or Ctrl+J to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsOpen(true);
      }

      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }

      // Arrow navigation
      if (isOpen && filteredActions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredActions.length);
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
        }
        if (e.key === 'Enter' && selectedIndex !== -1) {
          e.preventDefault();
          filteredActions[selectedIndex]?.action();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] animate-sf-fade-in"
        onClick={() => {
          setIsOpen(false);
          setQuery('');
        }}
      />

      {/* Quick Actions Modal */}
      <div className="fixed top-32 left-1/2 -translate-x-1/2 w-full max-w-xl z-[60] px-4 animate-sf-scale-in">
        <div className="glass-card p-0 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gold-800/20">
            <Zap className="w-5 h-5 text-sf-gold animate-sf-glow-pulse" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What would you like to do?"
              className="flex-1 bg-transparent border-none outline-none text-sf-text-primary text-lg placeholder:text-sf-text-muted"
              autoFocus
            />
            <div className="flex items-center gap-2 text-xs text-sf-text-muted">
              <kbd className="px-2 py-1 bg-sf-brown/50 rounded border border-sf-gold/20">
                <Command className="w-3 h-3" />
              </kbd>
              <kbd className="px-2 py-1 bg-sf-brown/50 rounded border border-sf-gold/20">J</kbd>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setQuery('');
              }}
              className="text-sf-text-muted hover:text-sf-gold transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Actions List */}
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredActions.length === 0 ? (
              <div className="p-8 text-center text-sf-text-muted">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No actions found for "{query}"</p>
              </div>
            ) : (
              filteredActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`w-full text-left p-4 flex items-center gap-4 transition-all ${
                    index === selectedIndex
                      ? 'bg-sf-gold/10 border-l-2 border-sf-gold'
                      : 'border-l-2 border-transparent hover:bg-sf-brown/20'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    index === selectedIndex ? 'bg-sf-gold/20 text-sf-gold' : 'bg-sf-brown/30 text-sf-text-muted'
                  }`}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sf-text-primary">{action.label}</p>
                    <p className="text-sm text-sf-text-muted">{action.description}</p>
                  </div>
                  {action.shortcut && (
                    <kbd className="px-2 py-1 bg-sf-brown/50 rounded border border-sf-gold/20 text-xs text-sf-text-muted">
                      ⌘{action.shortcut}
                    </kbd>
                  )}
                  {index === selectedIndex && (
                    <kbd className="px-2 py-1 bg-sf-brown/50 rounded text-xs text-sf-gold">↵</kbd>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gold-800/20 flex items-center justify-between text-xs text-sf-text-muted bg-sf-black/30">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-sf-brown/50 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-sf-brown/50 rounded">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-sf-brown/50 rounded">↵</kbd>
                Execute
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-sf-brown/50 rounded">Esc</kbd>
                Close
              </span>
            </div>
            <span>{filteredActions.length} actions</span>
          </div>
        </div>
      </div>
    </>
  );
}
