/**
 * Empty State Component
 * Show when there's no data to display
 */

import { LucideIcon, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  children?: ReactNode;
}

/**
 * Full Page Empty State
 * Use when the entire page/section is empty
 */
export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
  children
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-[hsl(var(--sf-gold-dim))]/30 bg-[hsl(var(--sf-brown))]/10 p-12 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        <div className="rounded-full bg-[hsl(var(--sf-gold))]/10 p-4">
          <Icon className="h-10 w-10 text-[hsl(var(--sf-gold))]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action && (
          <Button
            onClick={action.onClick}
            className="mt-2 bg-gradient-to-r from-[hsl(var(--sf-gold))] to-[hsl(var(--sf-gold-bright))] text-[hsl(var(--sf-black))] hover:shadow-lg"
          >
            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}

/**
 * Small Empty State
 * Use inside cards or smaller sections
 */
export function EmptyStateSmall({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="rounded-full bg-[hsl(var(--sf-gold))]/10 p-3 mb-3">
        <Icon className="h-6 w-6 text-[hsl(var(--sf-gold))]" />
      </div>
      <h4 className="text-sm font-medium mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
      {action && (
        <Button size="sm" onClick={action.onClick} variant="outline">
          {action.icon && <action.icon className="mr-2 h-3 w-3" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
