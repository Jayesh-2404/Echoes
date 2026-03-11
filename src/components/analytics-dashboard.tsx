"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/src/components/skeletons";

interface AnalyticsData {
  overview: {
    totalMessages: number;
    unreadMessages: number;
    answeredMessages: number;
    responseRate: number;
    avgResponseTime: string;
  };
  dailyStats: Array<{ date: string; count: number }>;
  trends: {
    direction: "up" | "down" | "neutral";
    percentage: number;
  };
  recentMessages: Array<{
    id: string;
    message: string;
    isRead: boolean;
    hasAnswer: boolean;
    createdAt: string;
  }>;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    percentage: number;
  };
  icon?: string;
}

function StatsCard({ title, value, subtitle, trend, icon }: StatsCardProps) {
  const trendColors = {
    up: "text-[var(--success)]",
    down: "text-[var(--destructive)]",
    neutral: "text-[var(--muted-foreground)]",
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-[0.18em]">
          {title}
        </span>
        {icon && <span className="text-xs font-semibold text-[var(--secondary-foreground)]">{icon}</span>}
      </div>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-display font-semibold text-[var(--foreground)]">{value}</span>
        {trend && (
          <span className={`text-sm font-medium ${trendColors[trend.direction]}`}>
            {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : "="} {trend.percentage}%
          </span>
        )}
      </div>
      {subtitle && (
        <span className="text-sm text-[var(--muted-foreground)] mt-2 block">{subtitle}</span>
      )}
    </div>
  );
}

export function AnalyticsDashboard({ userId }: { userId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"24h" | "7d" | "30d" | "90d">("7d");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?period=${period}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period, userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-[var(--shadow-sm)]">
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-10 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        Failed to load analytics
      </div>
    );
  }

  const chartData = data.dailyStats.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-semibold tracking-tight">Analytics</h2>
        <div className="flex gap-2">
          {(["24h", "7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                period === p
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-xs)]"
                  : "bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)] hover:bg-[var(--muted)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Messages"
          value={data.overview.totalMessages}
          subtitle="All time"
          trend={data.trends}
          icon="MSG"
        />
        <StatsCard
          title="Unread"
          value={data.overview.unreadMessages}
          subtitle="Awaiting response"
          icon="NEW"
        />
        <StatsCard
          title="Answered"
          value={data.overview.answeredMessages}
          subtitle={`${data.overview.responseRate}% response rate`}
          icon="ANS"
        />
        <StatsCard
          title="Avg Response"
          value={data.overview.avgResponseTime}
          subtitle="Average time to reply"
          icon="AVG"
        />
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-[var(--shadow-sm)]">
        <h3 className="text-lg font-display font-semibold mb-6">Message Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(98, 115, 137, 0.32)" />
              <XAxis
                dataKey="date"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-[var(--shadow-sm)]">
        <h3 className="text-lg font-display font-semibold mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {data.recentMessages.length === 0 ? (
            <p className="text-center text-[var(--muted-foreground)] py-8">No recent messages</p>
          ) : (
            data.recentMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-center justify-between p-4 bg-[var(--background-alt)] rounded-xl border border-[var(--border)]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{msg.message}</p>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {!msg.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-red)]" />
                  )}
                  {msg.hasAnswer && (
                    <span className="text-[var(--success)] text-xs font-semibold uppercase">ok</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
