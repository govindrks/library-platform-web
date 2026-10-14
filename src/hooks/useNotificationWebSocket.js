import { useEffect, useRef } from "react";

import { createNotificationWebSocketClient } from "../services/notificationWebSocket";

// ============================================================
// NOTIFICATION WEBSOCKET HOOK
// ============================================================

export const useNotificationWebSocket = ({
  userId,
  enabled = true,
  onNotification,
  onConnected,
  onDisconnected,
  onError,
}) => {
  const clientRef = useRef(null);

  const notificationHandlerRef = useRef(onNotification);

  useEffect(() => {
    notificationHandlerRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!enabled || !userId) {
      return undefined;
    }

    const client = createNotificationWebSocketClient({
      userId,

      onNotification: (notification) => {
        notificationHandlerRef.current?.(notification);
      },

      onConnected,

      onDisconnected,

      onError,
    });

    clientRef.current = client;

    client.activate();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();

        clientRef.current = null;
      }
    };
  }, [userId, enabled, onConnected, onDisconnected, onError]);

  return {
    client: clientRef.current,
  };
};
