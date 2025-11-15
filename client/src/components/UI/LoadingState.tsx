import { Loader2, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function LoadingState({ message = 'Loading...', size = 'md', fullScreen = false }: LoadingStateProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className={`${sizes[size]} text-sf-gold animate-spin`} />
        <Sparkles className={`${sizes[size]} text-sf-gold absolute inset-0 animate-pulse opacity-50`} />
      </div>
      <p className="text-sf-text-secondary text-sm animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-sf-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}

// Skeleton Loader Component
export function SkeletonLoader({ count = 3, height = 'h-16' }: { count?: number; height?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${height} rounded-lg animate-sf-fade-in`} style={{ animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
  );
}

// Pulse Loader for inline use
export function PulseLoader() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-sf-gold rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-sf-gold rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-sf-gold rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
