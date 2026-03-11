"use client";

interface HeaderProps {
  onLogout?: () => void;
  showLogout?: boolean;
}

export function Header({ onLogout, showLogout = true }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-[var(--border)] bg-[rgba(247,249,252,0.84)] backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[var(--foreground)] rounded-xl flex items-center justify-center shadow-[var(--shadow-sm)]">
            <span className="text-[var(--primary-foreground)] font-bold text-sm">E</span>
          </div>
          <div className="leading-none">
            <span className="block font-display font-semibold text-xl tracking-tight">Echoes</span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">anonymous inbox</span>
          </div>
        </div>
        {showLogout && onLogout && (
          <button
            onClick={onLogout}
            className="text-sm font-semibold text-[var(--secondary-foreground)] hover:text-[var(--foreground)] px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] shadow-[var(--shadow-xs)]"
          >
            Log out
          </button>
        )}
      </div>
    </header>
  );
}
