import { z } from 'zod';

export const sendMessageSchema = z.object({
  recipientId: z.string().cuid({ message: "Invalid Recipient ID format" }),
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message cannot exceed 500 characters'),
});

export const getMessagesSchema = z.object({
  recipientId: z.string().cuid({ message: "Invalid Recipient ID format" }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
