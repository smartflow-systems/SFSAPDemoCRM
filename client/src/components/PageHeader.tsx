/**
 * Reusable Page Header Component
 * Consistent page headers across all apps
 */

import { ReactNode } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  badge?: { label: string; variant?: "default" | "secondary" | "outline" | "destructive" };
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumbs,
  badge
}: PageHeaderProps) {
  return (
    <div className="space-y-4 pb-8 border-b border-[hsl(var(--sf-gold-dim))]/20">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href} className="text-muted-foreground hover:text-[hsl(var(--sf-gold))]">
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-foreground">{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Title Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[hsl(var(--sf-gold))] to-[hsl(var(--sf-gold-bright))] bg-clip-text text-transparent">
              {title}
            </h1>
            {badge && (
              <Badge variant={badge.variant || "default"} className="bg-[hsl(var(--sf-gold))]/10 text-[hsl(var(--sf-gold))] border-[hsl(var(--sf-gold))]/30">
                {badge.label}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-muted-foreground text-base max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Action Button */}
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
