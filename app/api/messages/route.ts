import { messageService } from "@/src/services/message.service";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

const getMessagesSchema = z.object({
  // accept any non-empty string if user IDs are not CUIDs
  userId: z.string().nonempty(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const token = cookies().get("auth_token")?.value;

    if (!userId || !token) {
      // return 401 (Unauthorized) instead of throwing generic Error
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = getMessagesSchema.parse({ userId });

    // guard for service shape to avoid runtime TypeError
    if (
      !messageService ||
      typeof messageService.getMessageForUser !== "function"
    ) {
      console.error(
        "[API /messages] messageService.getMessageForUser is missing"
      );
      return NextResponse.json(
        { error: "Service unavailable" },
        { status: 503 }
      );
    }

    const messages = await messageService.getMessageForUser(
      query.userId,
      token
    );

    return NextResponse.json(messages);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid user ID format", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
