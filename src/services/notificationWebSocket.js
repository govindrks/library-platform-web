import { Client } from "@stomp/stompjs";

// ============================================================
// BUILD WEBSOCKET URL
// ============================================================

const getWebSocketUrl = () => {
  const explicitUrl = import.meta.env.VITE_WS_URL;

  if (explicitUrl && explicitUrl.trim()) {
    return explicitUrl.trim();
  }

  let apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  apiBaseUrl = apiBaseUrl
    .trim()
    .replace(/\/$/, "")
    .replace(/\/api$/, "");

  if (apiBaseUrl.startsWith("https://")) {
    return apiBaseUrl.replace("https://", "wss://") + "/ws";
  }

  if (apiBaseUrl.startsWith("http://")) {
    return apiBaseUrl.replace("http://", "ws://") + "/ws";
  }

  return `${apiBaseUrl}/ws`;
};

// ============================================================
// CREATE CLIENT
// ============================================================

export const createNotificationWebSocketClient = ({
  userId,
  token,
  onNotification,
  onConnected,
  onDisconnected,
  onError,
}) => {
  // ========================================================
  // VALIDATION
  // ========================================================

  if (!userId) {
    throw new Error("User ID is required for notification WebSocket.");
  }

  if (!token) {
    throw new Error("JWT token is required for notification WebSocket.");
  }

  // ========================================================
  // ACTIVE SUBSCRIPTION
  // ========================================================

  let notificationSubscription = null;

  // ========================================================
  // CLIENT
  // ========================================================

  const client = new Client({
    brokerURL: getWebSocketUrl(),

    // ====================================================
    // JWT AUTHENTICATION
    // ====================================================

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    // ====================================================
    // RECONNECT
    // ====================================================

    reconnectDelay: 5000,

    // ====================================================
    // CONNECTION TIMEOUT
    // ====================================================

    connectionTimeout: 10000,

    // ====================================================
    // HEARTBEAT
    // ====================================================

    heartbeatIncoming: 10000,

    heartbeatOutgoing: 10000,

    // ====================================================
    // DEBUG
    // ====================================================

    debug: (message) => {
      if (import.meta.env.DEV) {
        console.debug("[Notification STOMP]", message);
      }
    },

    // ====================================================
    // CONNECT
    // ====================================================

    onConnect: () => {
      if (import.meta.env.DEV) {
        console.info("Authenticated notification WebSocket connected.");
      }

      // ------------------------------------------------
      // PREVENT DUPLICATE SUBSCRIPTIONS
      // ------------------------------------------------

      if (notificationSubscription) {
        try {
          notificationSubscription.unsubscribe();
        } catch (unsubscribeError) {
          console.warn(
            "Unable to unsubscribe previous notification subscription:",
            unsubscribeError,
          );
        }

        notificationSubscription = null;
      }

      // ------------------------------------------------
      // SUBSCRIBE TO USER NOTIFICATIONS
      // ------------------------------------------------

      notificationSubscription = client.subscribe(
        `/topic/notifications/${userId}`,
        (frame) => {
          try {
            if (!frame?.body) {
              return;
            }

            const notification = JSON.parse(frame.body);

            onNotification?.(notification);
          } catch (error) {
            console.error("Unable to parse WebSocket notification:", error);
          }
        },
      );

      onConnected?.();
    },

    // ====================================================
    // DISCONNECT
    // ====================================================

    onWebSocketClose: (event) => {
      notificationSubscription = null;

      if (import.meta.env.DEV) {
        console.info("Notification WebSocket disconnected.", {
          code: event?.code,

          reason: event?.reason,
        });
      }

      onDisconnected?.(event);
    },

    // ====================================================
    // STOMP ERROR
    // ====================================================

    onStompError: (frame) => {
      console.error("Notification STOMP error:", frame);

      onError?.(frame);
    },

    // ====================================================
    // SOCKET ERROR
    // ====================================================

    onWebSocketError: (error) => {
      console.error("Notification WebSocket error:", error);

      onError?.(error);
    },

    // ====================================================
    // DISCONNECT RECEIPT
    // ====================================================

    onDisconnect: () => {
      notificationSubscription = null;

      if (import.meta.env.DEV) {
        console.info("Notification STOMP client disconnected cleanly.");
      }
    },
  });

  // ========================================================
  // RETURN CLIENT
  // ========================================================

  return client;
};
