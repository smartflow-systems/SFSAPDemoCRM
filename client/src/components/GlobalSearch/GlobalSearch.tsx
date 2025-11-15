import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Search, X, Users, Building2, Briefcase, ListTodo, FileText, TrendingUp, Command } from 'lucide-react';
import { useLeads, useOpportunities } from '@/contexts/CRMContext';

interface SearchResult {
  id: string;
  type: 'lead' | 'contact' | 'account' | 'opportunity' | 'task' | 'page';
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  icon: React.ReactNode;
  score: number;
}

const pages = [
  { id: 'dashboard', title: 'Dashboard', url: '/dashboard', icon: <TrendingUp className="w-4 h-4" />, keywords: ['home', 'overview', 'analytics'] },
  { id: 'pipeline', title: 'Pipeline', url: '/pipeline', icon: <Briefcase className="w-4 h-4" />, keywords: ['deals', 'opportunities', 'sales'] },
  { id: 'leads', title: 'Leads', url: '/leads', icon: <Users className="w-4 h-4" />, keywords: ['prospects', 'new'] },
  { id: 'contacts', title: 'Contacts', url: '/contacts', icon: <Users className="w-4 h-4" />, keywords: ['people', 'customers'] },
  { id: 'accounts', title: 'Accounts', url: '/accounts', icon: <Building2 className="w-4 h-4" />, keywords: ['companies', 'organizations'] },
  { id: 'tasks', title: 'Tasks', url: '/tasks', icon: <ListTodo className="w-4 h-4" />, keywords: ['todo', 'activities'] },
  { id: 'reports', title: 'Reports', url: '/reports', icon: <FileText className="w-4 h-4" />, keywords: ['analytics', 'metrics', 'charts'] },
  { id: 'settings', title: 'Settings', url: '/settings', icon: <FileText className="w-4 h-4" />, keywords: ['preferences', 'config'] },
];

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: leads = [] } = useLeads();
  const { data: opportunities = [] } = useOpportunities();

  // Fuzzy search scoring
  const calculateScore = (text: string, query: string): number => {
    if (!query) return 0;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // Exact match scores highest
    if (lowerText === lowerQuery) return 100;

    // Starts with query
    if (lowerText.startsWith(lowerQuery)) return 90;

    // Contains query
    if (lowerText.includes(lowerQuery)) return 70;

    // Fuzzy match - check if all characters in query appear in order
    let queryIndex = 0;
    for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
      if (lowerText[i] === lowerQuery[queryIndex]) {
        queryIndex++;
      }
    }

    if (queryIndex === lowerQuery.length) {
      return 50;
    }

    return 0;
  };

  // Search function
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const allResults: SearchResult[] = [];

    // Search pages
    pages.forEach(page => {
      const titleScore = calculateScore(page.title, searchQuery);
      const keywordScore = Math.max(...page.keywords.map(k => calculateScore(k, searchQuery)));
      const score = Math.max(titleScore, keywordScore);

      if (score > 0) {
        allResults.push({
          id: page.id,
          type: 'page',
          title: page.title,
          url: page.url,
          icon: page.icon,
          score
        });
      }
    });

    // Search leads
    leads.forEach(lead => {
      const nameScore = calculateScore(`${lead.firstName} ${lead.lastName}`, searchQuery);
      const companyScore = calculateScore(lead.company || '', searchQuery);
      const emailScore = calculateScore(lead.email || '', searchQuery);
      const score = Math.max(nameScore, companyScore, emailScore);

      if (score > 0) {
        allResults.push({
          id: lead.id!,
          type: 'lead',
          title: `${lead.firstName} ${lead.lastName}`,
          subtitle: lead.company,
          description: lead.email,
          url: `/leads/${lead.id}`,
          icon: <Users className="w-4 h-4" />,
          score
        });
      }
    });

    // Search opportunities
    opportunities.forEach(opp => {
      const titleScore = calculateScore(opp.title, searchQuery);
      const stageScore = calculateScore(opp.stage, searchQuery);
      const score = Math.max(titleScore, stageScore);

      if (score > 0) {
        allResults.push({
          id: opp.id!,
          type: 'opportunity',
          title: opp.title,
          subtitle: opp.stage,
          description: opp.value ? `$${opp.value.toLocaleString()}` : undefined,
          url: `/pipeline`,
          icon: <Briefcase className="w-4 h-4" />,
          score
        });
      }
    });

    // Sort by score and limit results
    const sortedResults = allResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setResults(sortedResults);
    setSelectedIndex(0);
  }, [leads, opportunities]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }

      // Arrow navigation
      if (isOpen && results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        }
        if (e.key === 'Enter' && selectedIndex !== -1) {
          e.preventDefault();
          handleResultClick(results[selectedIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Perform search when query changes
  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  const handleResultClick = (result: SearchResult) => {
    setLocation(result.url);
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-sf-fade-in"
        onClick={() => {
          setIsOpen(false);
          setQuery('');
          setResults([]);
        }}
      />

      {/* Search Modal */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4 animate-sf-scale-in">
        <div className="glass-card p-0 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gold-800/20">
            <Search className="w-5 h-5 text-sf-gold" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads, opportunities, pages..."
              className="flex-1 bg-transparent border-none outline-none text-sf-text-primary text-lg placeholder:text-sf-text-muted"
            />
            <div className="flex items-center gap-2 text-xs text-sf-text-muted">
              <kbd className="px-2 py-1 bg-sf-brown/50 rounded border border-sf-gold/20">
                <Command className="w-3 h-3" />
              </kbd>
              <kbd className="px-2 py-1 bg-sf-brown/50 rounded border border-sf-gold/20">K</kbd>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setQuery('');
                setResults([]);
              }}
              className="text-sf-text-muted hover:text-sf-gold transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length === 0 && query.trim() !== '' && (
              <div className="p-8 text-center text-sf-text-muted">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-1">Try searching for leads, opportunities, or pages</p>
              </div>
            )}

            {results.length === 0 && query.trim() === '' && (
              <div className="p-8 text-center text-sf-text-muted">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Start typing to search...</p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <span className="text-xs bg-sf-brown/30 px-2 py-1 rounded">Leads</span>
                  <span className="text-xs bg-sf-brown/30 px-2 py-1 rounded">Opportunities</span>
                  <span className="text-xs bg-sf-brown/30 px-2 py-1 rounded">Pages</span>
                </div>
              </div>
            )}

            {results.map((result, index) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className={`w-full text-left p-4 flex items-start gap-3 transition-all ${
                  index === selectedIndex
                    ? 'bg-sf-gold/10 border-l-2 border-sf-gold'
                    : 'border-l-2 border-transparent hover:bg-sf-brown/20'
                }`}
              >
                <div className="mt-1 text-sf-gold">{result.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sf-text-primary truncate">{result.title}</p>
                    <span className="badge-sf-gold text-xs">{result.type}</span>
                  </div>
                  {result.subtitle && (
                    <p className="text-sm text-sf-text-secondary truncate">{result.subtitle}</p>
                  )}
                  {result.description && (
                    <p className="text-xs text-sf-text-muted truncate mt-0.5">{result.description}</p>
                  )}
                </div>
                <div className="text-xs text-sf-text-muted mt-1">
                  {index === selectedIndex && <kbd className="px-1.5 py-0.5 bg-sf-brown/50 rounded text-xs">↵</kbd>}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="p-3 border-t border-gold-800/20 flex items-center justify-between text-xs text-sf-text-muted">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-sf-brown/50 rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-sf-brown/50 rounded">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-sf-brown/50 rounded">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-sf-brown/50 rounded">Esc</kbd>
                  Close
                </span>
              </div>
              <span>{results.length} results</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
