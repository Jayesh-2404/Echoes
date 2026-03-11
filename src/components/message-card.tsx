"use client";

import { useState, FormEvent } from "react";

interface Message {
  id: string;
  message: string;
  createdAt: string;
  answer?: string;
  isRead: boolean;
}

interface MessageCardProps {
  msg: Message;
  onMarkAsRead: (id: string) => Promise<void>;
  onAnswerSubmit: (id: string, answer: string) => Promise<void>;
}

export function MessageCard({ msg, onMarkAsRead, onAnswerSubmit }: MessageCardProps) {
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(!!msg.answer);

  const toggleExpand = async () => {
    if (!expanded && !msg.isRead) {
      await onMarkAsRead(msg.id);
    }
    setExpanded((prev) => !prev);
  };

  const submitReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAnswerSubmit(msg.id, reply);
      setReply("");
      setExpanded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`group border border-[var(--border)] rounded-2xl p-6 ${
        msg.isRead
          ? "bg-[var(--card)]"
          : "bg-[var(--card)] border-l-4 border-l-[var(--primary)]"
      } mb-4 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]`}
    >
      <div className="flex justify-between items-start cursor-pointer" onClick={toggleExpand}>
        <div className="flex-1">
          <p
            className={`text-lg mb-2 ${
              msg.isRead
                ? "text-[var(--foreground)]"
                : "text-[var(--foreground)] font-semibold"
            }`}
          >
            {msg.message}
          </p>
          <small className="text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
            {new Date(msg.createdAt).toLocaleString()}
          </small>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {!msg.isRead && (
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
          )}
          <span className="h-7 w-7 rounded-full border border-[var(--border)] bg-[var(--background-alt)] flex items-center justify-center text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
            {expanded ? "-" : "+"}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="mt-6 pt-6 border-t border-[var(--border)]">
          {msg.answer ? (
            <div className="bg-[var(--background-alt)] rounded-xl p-4 border border-[var(--border)]">
              <span className="text-xs font-semibold text-[var(--primary)] uppercase tracking-widest block mb-2">
                Your Reply
              </span>
              <p className="text-[var(--foreground)]">{msg.answer}</p>
            </div>
          ) : (
            <form onSubmit={submitReply}>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl p-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-all mb-4"
                placeholder="Write your reply..."
                rows={3}
                autoFocus
              />
              <button
                type="submit"
                disabled={isSubmitting || !reply.trim()}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] px-6 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send Reply"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
