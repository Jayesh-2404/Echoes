import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/src/lib/auth";
import { messageRepository } from "@/src/repositories/message.repository";
import { ApiResponseError } from "@/src/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const url = request.nextUrl;
    const period = url.searchParams.get("period") || "7d";
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const [
      totalMessages,
      unreadMessages,
      answeredMessages,
      recentMessages,
      dailyStats,
    ] = await Promise.all([
      messageRepository.countByUserId(user.id),
      messageRepository.countUnreadByUserId(user.id),
      messageRepository.countAnsweredByUserId(user.id),
      messageRepository.findRecentByUserId(user.id, 10),
      messageRepository.getDailyStats(user.id, startDate, now),
    ]);

    const avgResponseTime = await calculateAvgResponseTime(recentMessages);
    
    const trends = calculateTrends(dailyStats);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalMessages,
          unreadMessages,
          answeredMessages,
          responseRate: totalMessages > 0 ? Math.round((answeredMessages / totalMessages) * 100) : 0,
          avgResponseTime,
        },
        dailyStats,
        trends,
        recentMessages: recentMessages.slice(0, 5).map((msg) => ({
          id: msg.id,
          message: msg.message.slice(0, 100),
          isRead: msg.isRead,
          hasAnswer: !!msg.answer,
          createdAt: msg.createdAt.toISOString(),
        })),
      },
    });
  } catch (error: unknown) {
    if (error instanceof ApiResponseError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    console.error("Analytics error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch analytics" } },
      { status: 500 }
    );
  }
}

async function calculateAvgResponseTime(messages: Array<{ createdAt: Date; answerAt: Date | null }>): Promise<string> {
  const answered = messages.filter((m) => m.answerAt);
  if (answered.length === 0) return "N/A";
  
  const totalMs = answered.reduce((acc, m) => {
    if (m.answerAt) {
      return acc + (m.answerAt.getTime() - m.createdAt.getTime());
    }
    return acc;
  }, 0);
  
  const avgMs = totalMs / answered.length;
  const hours = Math.floor(avgMs / (1000 * 60 * 60));
  
  if (hours < 1) return "< 1 hour";
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""}`;
}

function calculateTrends(dailyStats: Array<{ date: string; count: number }>) {
  if (dailyStats.length < 2) return { direction: "neutral" as const, percentage: 0 };
  
  const recent = dailyStats.slice(-Math.min(7, Math.floor(dailyStats.length / 2)));
  const older = dailyStats.slice(0, Math.min(7, Math.floor(dailyStats.length / 2)));
  
  const recentSum = recent.reduce((sum, d) => sum + d.count, 0);
  const olderSum = older.reduce((sum, d) => sum + d.count, 0);
  
  if (olderSum === 0) return { direction: "up" as const, percentage: recentSum > 0 ? 100 : 0 };
  
  const change = ((recentSum - olderSum) / olderSum) * 100;
  
  return {
    direction: change > 0 ? "up" as const : change < 0 ? "down" as const : "neutral" as const,
    percentage: Math.abs(Math.round(change)),
  };
}
