import { broadcastToUser } from "@/src/lib/realtime";

export function broadcastNewMessage(userId: string, message: {
  id: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}) {
  broadcastToUser(userId, {
    type: "new_message",
    data: {
      id: message.id,
      message: message.message,
      createdAt: message.createdAt.toISOString(),
      isRead: message.isRead,
    },
  });
}

export function broadcastMessageRead(userId: string, messageId: string) {
  broadcastToUser(userId, {
    type: "message_read",
    data: { messageId },
  });
}

export function broadcastMessageAnswered(userId: string, message: {
  id: string;
  answer: string;
  answerAt: Date;
}) {
  broadcastToUser(userId, {
    type: "message_answered",
    data: {
      id: message.id,
      answer: message.answer,
      answerAt: message.answerAt.toISOString(),
    },
  });
}
