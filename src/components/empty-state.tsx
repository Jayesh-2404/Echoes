"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = "Inbox", title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-20 px-6 bg-[var(--card)] rounded-3xl border border-dashed border-[var(--border)] shadow-[var(--shadow-sm)]">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">{icon}</div>
      <p className="text-[var(--foreground)] font-semibold mb-2">{title}</p>
      {description && <p className="text-[var(--muted-foreground)] text-sm">{description}</p>}
    </div>
  );
}
