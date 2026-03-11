"use client";

import { useState } from "react";

interface LinkShareProps {
  link: string;
}

export function LinkShare({ link }: LinkShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-2.5 flex items-center gap-2 shadow-[var(--shadow-sm)]">
        <input
          readOnly
          value={link}
          className="bg-transparent px-3 outline-none flex-grow text-[var(--secondary-foreground)] text-sm"
        />
        <button
          onClick={handleCopy}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] px-5 py-2.5 rounded-xl font-semibold text-sm shadow-[var(--shadow-xs)]"
        >
          {copied ? (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </span>
          ) : (
            "Copy Link"
          )}
        </button>
      </div>
    </div>
  );
}
