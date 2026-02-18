"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface StreamEvent {
  type: "connected" | "new_message" | "message_read" | "message_answered";
  data: unknown;
}

interface UseRealtimeOptions {
  userId: string;
  onNewMessage?: (message: unknown) => void;
  onMessageRead?: (data: unknown) => void;
  onMessageAnswered?: (data: unknown) => void;
}

export function useRealtime({
  userId,
  onNewMessage,
  onMessageRead,
  onMessageAnswered,
}: UseRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource("/api/realtime");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();

      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      }
    };

    eventSource.addEventListener("connected", (event) => {
      try {
        const data = JSON.parse(event.data) as StreamEvent;
        console.log("Realtime connected:", data);
      } catch (e) {
        console.error("Failed to parse connected event:", e);
      }
    });

    eventSource.addEventListener("new_message", (event) => {
      try {
        const data = JSON.parse(event.data) as StreamEvent;
        onNewMessage?.(data.data);
      } catch (e) {
        console.error("Failed to parse new_message event:", e);
      }
    });

    eventSource.addEventListener("message_read", (event) => {
      try {
        const data = JSON.parse(event.data) as StreamEvent;
        onMessageRead?.(data.data);
      } catch (e) {
        console.error("Failed to parse message_read event:", e);
      }
    });

    eventSource.addEventListener("message_answered", (event) => {
      try {
        const data = JSON.parse(event.data) as StreamEvent;
        onMessageAnswered?.(data.data);
      } catch (e) {
        console.error("Failed to parse message_answered event:", e);
      }
    });
  }, [userId, onNewMessage, onMessageRead, onMessageAnswered]);

  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userId, connect]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsConnected(false);
  }, []);

  return { isConnected, disconnect, reconnect: connect };
}
