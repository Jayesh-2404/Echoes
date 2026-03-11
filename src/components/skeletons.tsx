"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--muted)]/45 rounded-lg ${className}`}
    />
  );
}

export function MessageCardSkeleton() {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-4 shadow-[var(--shadow-sm)]">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}

export function MessageListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <MessageCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="text-center lg:text-left mb-8">
      <Skeleton className="w-20 h-20 rounded-full mx-auto lg:mx-0 mb-4" />
      <Skeleton className="h-8 w-48 mx-auto lg:mx-0 mb-2" />
      <Skeleton className="h-4 w-32 mx-auto lg:mx-0" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
    </div>
  );
}

export function LinkCardSkeleton() {
  return (
    <div className="relative group mx-auto max-w-lg">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-2.5 flex items-center shadow-[var(--shadow-sm)]">
        <Skeleton className="h-6 flex-grow ml-4" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
}
