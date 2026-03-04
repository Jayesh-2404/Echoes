import { messageService } from "@/src/services/message.service";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
    request: NextRequest,
    { params }: { params: { messageId: string } }
) {
    try {
        const { messageId } = params;
        const token = cookies().get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Securely call the service method which now requires token
        await messageService.markMessageAsRead(messageId, token);

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Message not Found')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error("Error marking message as read:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
