import { useState, useEffect } from 'react';
import { X, Keyboard, Zap, Search, Command } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: 'Navigation' | 'Actions' | 'Search' | 'General';
}

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts: Shortcut[] = [
    // Search & Navigation
    { keys: ['⌘', 'K'], description: 'Global Search - Find anything instantly', category: 'Search' },
    { keys: ['⌘', 'J'], description: 'Quick Actions - Do anything fast', category: 'Actions' },
    { keys: ['⌘', '/'], description: 'Keyboard Shortcuts - Show this help', category: 'General' },

    // Navigation
    { keys: ['⌘', 'H'], description: 'Go to Dashboard', category: 'Navigation' },
    { keys: ['⌘', 'L'], description: 'Go to Leads', category: 'Navigation' },
    { keys: ['⌘', 'P'], description: 'Go to Pipeline', category: 'Navigation' },
    { keys: ['⌘', 'T'], description: 'Go to Tasks', category: 'Navigation' },
    { keys: ['⌘', 'R'], description: 'Go to Reports', category: 'Navigation' },

    // Quick Actions
    { keys: ['⌘', 'N'], description: 'New Lead', category: 'Actions' },
    { keys: ['⌘', 'D'], description: 'New Deal', category: 'Actions' },
    { keys: ['⌘', 'E'], description: 'New Email', category: 'Actions' },

    // General
    { keys: ['Esc'], description: 'Close modal or cancel', category: 'General' },
    { keys: ['↑', '↓'], description: 'Navigate lists and results', category: 'General' },
    { keys: ['↵'], description: 'Select or confirm', category: 'General' },
  ];

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+/ to open shortcuts help
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(true);
      }

      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] animate-sf-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Shortcuts Panel */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl z-[70] px-4 animate-sf-scale-in">
        <div className="glass-card p-0 overflow-hidden max-h-[80vh]">
          {/* Header */}
          <div className="p-6 border-b border-gold-800/20 bg-gradient-to-br from-sf-gold/10 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-sf-gold/20 to-sf-gold-hover/10 rounded-xl">
                  <Keyboard className="w-6 h-6 text-sf-gold" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-sf-text-primary">Keyboard Shortcuts</h2>
                  <p className="text-sm text-sf-text-muted">Master these shortcuts to become a power user</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-sf-text-muted hover:text-sf-gold transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Shortcuts Grid */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-lg font-semibold text-sf-gold flex items-center gap-2">
                    {category === 'Search' && <Search className="w-4 h-4" />}
                    {category === 'Actions' && <Zap className="w-4 h-4" />}
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {shortcuts
                      .filter(s => s.category === category)
                      .map((shortcut, index) => (
                        <div
                          key={index}
                          className="glass-panel p-3 rounded-lg flex items-center justify-between hover:bg-sf-brown/30 transition-all"
                        >
                          <span className="text-sm text-sf-text-secondary">{shortcut.description}</span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, i) => (
                              <kbd
                                key={i}
                                className="px-2 py-1 bg-sf-black/50 border border-sf-gold/30 rounded text-sf-gold font-mono text-sm"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Tip */}
          <div className="p-4 border-t border-gold-800/20 bg-sf-black/30">
            <div className="flex items-center justify-center gap-2 text-sm text-sf-text-muted">
              <Keyboard className="w-4 h-4 text-sf-gold" />
              <span>Pro tip: Use these shortcuts to navigate 10x faster!</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
