import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { userRepository } from "@/src/repositories/user.repository";
import { addClient, removeClient } from "@/src/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = cookies().get("auth_token")?.value;

    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = await userRepository.findByToken(token);
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const stream = new ReadableStream({
      start(controller) {
        addClient(user.id, controller);

        const encoder = new TextEncoder();
        const initialData = encoder.encode(
          `event: connected\ndata: ${JSON.stringify({ type: "connected", data: { userId: user.id } })}\n\n`
        );
        controller.enqueue(initialData);

        const heartbeat = setInterval(() => {
          try {
            const ping = encoder.encode(": ping\n\n");
            controller.enqueue(ping);
          } catch {
            clearInterval(heartbeat);
            removeClient(user.id, controller);
          }
        }, 30000);

        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          removeClient(user.id, controller);
        });
      },
      cancel() {
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Realtime connection error:", error);
    return new Response("Realtime unavailable", { status: 503 });
  }
}
