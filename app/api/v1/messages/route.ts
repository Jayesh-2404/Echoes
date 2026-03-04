import { NextRequest, NextResponse } from "next/server";
import { messageService } from "@/src/services/message.service";
import { requireAuth } from "@/src/lib/auth";
import { withErrorHandling } from "@/src/lib/api-error-handler";
import { z } from "zod";
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";
import { redis } from "@/src/lib/redis";

export const dynamic = "force-dynamic";

const getMessagesSchema = z.object({
  userId: z.string().nonempty(),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
  includeRead: z.boolean().optional().default(true),
});

let rateLimiter: RateLimiterRedis | RateLimiterMemory;

try {
  rateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: "rate-limiter:v1:messages",
    points: 30,
    duration: 60,
  });
} catch {
  rateLimiter = new RateLimiterMemory({
    keyPrefix: "rate-limiter:v1:messages",
    points: 30,
    duration: 60,
  });
}

const getHandler = async ({ request }: { request: NextRequest }) => {
  const ip = request.ip ?? "127.0.0.1";
  await rateLimiter.consume(ip);

  const user = await requireAuth();
  const url = request.nextUrl;
  const limit = Number(url.searchParams.get("limit")) || 50;
  const offset = Number(url.searchParams.get("offset")) || 0;
  const includeRead = url.searchParams.get("includeRead") !== "false";

  const userId = url.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: "userId is required" } },
      { status: 400 }
    );
  }

  if (userId !== user.id) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Cannot access other user's messages" } },
      { status: 403 }
    );
  }

  const messages = await messageService.getMessagesPaginated(userId, {
    limit,
    offset,
    includeRead,
  });

  return NextResponse.json({
    success: true,
    data: messages,
    meta: {
      limit,
      offset,
      count: messages.length,
    },
  });
};

export const GET = withErrorHandling(getHandler, { allowedMethods: ["GET"] });
