import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import notificationApi from "../api/notificationApi";

import { createNotificationWebSocketClient } from "../services/notificationWebSocket";

import { useAuth } from "./AuthContext";

// ============================================================
// CONTEXT
// ============================================================

const NotificationContext = createContext(null);

// ============================================================
// PROVIDER
// ============================================================

export function NotificationProvider({ children }) {
  // ==========================================================
  // AUTH STATE
  // ==========================================================

  const { user, token, isAuthenticated, initializing } = useAuth();

  const userId = user?.id ?? null;

  // ==========================================================
  // STATE
  // ==========================================================

  const [unreadCount, setUnreadCount] = useState(0);

  const [latestNotification, setLatestNotification] = useState(null);

  const [notificationVersion, setNotificationVersion] = useState(0);

  const [connected, setConnected] = useState(false);

  // ==========================================================
  // REFS
  // ==========================================================

  const clientRef = useRef(null);

  const unreadRequestIdRef = useRef(0);

  const lastUnreadRefreshAtRef = useRef(0);

  // ==========================================================
  // AUTH READY
  // ==========================================================

  const authReady =
    !initializing && isAuthenticated && Boolean(token) && Boolean(userId);

  // ==========================================================
  // REFRESH UNREAD COUNT
  // ==========================================================

  const refreshUnreadCount = useCallback(
    async ({ force = false } = {}) => {
      if (!authReady) {
        setUnreadCount(0);

        return;
      }

      /*
       * Small development/runtime deduplication window.
       *
       * React.StrictMode may mount/effect twice during development.
       * Focus + reconnect can also happen very close together.
       */
      const now = Date.now();

      if (!force && now - lastUnreadRefreshAtRef.current < 500) {
        return;
      }

      lastUnreadRefreshAtRef.current = now;

      const requestId = ++unreadRequestIdRef.current;

      try {
        const response = await notificationApi.getUnreadCount();

        /*
         * Ignore a stale response.
         *
         * Example:
         * user logs out while this request is still running.
         */
        if (requestId !== unreadRequestIdRef.current) {
          return;
        }

        const count = Number(response?.unreadCount ?? 0);

        setUnreadCount(Number.isFinite(count) ? count : 0);
      } catch (error) {
        /*
         * Axios handles 401 globally.
         *
         * Avoid excessive console noise for a request that became
         * irrelevant because authentication changed.
         */
        if (requestId !== unreadRequestIdRef.current) {
          return;
        }

        console.error("Unable to load unread notification count:", error);
      }
    },
    [authReady],
  );

  // ==========================================================
  // DECREASE UNREAD COUNT
  // ==========================================================

  const decreaseUnreadCount = useCallback(() => {
    setUnreadCount((previous) => Math.max(previous - 1, 0));
  }, []);

  // ==========================================================
  // CLEAR UNREAD COUNT
  // ==========================================================

  const clearUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // ==========================================================
  // INITIAL UNREAD COUNT
  // ==========================================================

  useEffect(() => {
    if (!authReady) {
      setUnreadCount(0);

      return;
    }

    refreshUnreadCount();
  }, [authReady, refreshUnreadCount]);

  // ==========================================================
  // WEBSOCKET CONNECTION
  // ==========================================================

  useEffect(() => {
    // ------------------------------------------------------
    // AUTH NOT READY
    // ------------------------------------------------------

    if (!authReady) {
      setConnected(false);

      if (clientRef.current) {
        const activeClient = clientRef.current;

        clientRef.current = null;

        activeClient.deactivate().catch?.((error) => {
          console.warn("Notification WebSocket deactivate failed:", error);
        });
      }

      return undefined;
    }

    // ------------------------------------------------------
    // CREATE JWT-AUTHENTICATED STOMP CLIENT
    // ------------------------------------------------------

    const client = createNotificationWebSocketClient({
      userId,

      token,

      // ==================================================
      // NEW NOTIFICATION
      // ==================================================

      onNotification: (notification) => {
        if (!notification) {
          return;
        }

        if (notification.read !== true) {
          setUnreadCount((previous) => previous + 1);
        }

        setLatestNotification(notification);

        setNotificationVersion((previous) => previous + 1);
      },

      // ==================================================
      // CONNECTED
      // ==================================================

      onConnected: () => {
        /*
         * Ignore callbacks from an old client that was already
         * replaced during a user/token change.
         */
        if (clientRef.current !== client) {
          return;
        }

        setConnected(true);

        /*
         * Reconcile with DB after every successful connection.
         */
        refreshUnreadCount({
          force: true,
        });
      },

      // ==================================================
      // DISCONNECTED
      // ==================================================

      onDisconnected: () => {
        if (clientRef.current === client) {
          setConnected(false);
        }
      },

      // ==================================================
      // ERROR
      // ==================================================

      onError: (error) => {
        if (clientRef.current !== client) {
          return;
        }

        console.error("Notification WebSocket error:", error);

        setConnected(false);
      },
    });

    // ------------------------------------------------------
    // STORE ACTIVE CLIENT
    // ------------------------------------------------------

    clientRef.current = client;

    // ------------------------------------------------------
    // CONNECT
    // ------------------------------------------------------

    client.activate();

    // ------------------------------------------------------
    // CLEANUP
    // ------------------------------------------------------

    return () => {
      if (clientRef.current === client) {
        clientRef.current = null;
      }

      setConnected(false);

      client.deactivate().catch?.((error) => {
        console.warn("Notification WebSocket cleanup failed:", error);
      });
    };
  }, [authReady, userId, token, refreshUnreadCount]);

  // ==========================================================
  // REFRESH WHEN WINDOW REGAINS FOCUS
  // ==========================================================

  useEffect(() => {
    if (!authReady) {
      return undefined;
    }

    const handleFocus = () => {
      refreshUnreadCount();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [authReady, refreshUnreadCount]);

  // ==========================================================
  // RESET STATE AFTER LOGOUT / USER CHANGE
  // ==========================================================

  useEffect(() => {
    /*
     * Invalidate any in-flight unread-count request whenever
     * authentication becomes unavailable.
     */
    if (authReady) {
      return;
    }

    unreadRequestIdRef.current += 1;

    lastUnreadRefreshAtRef.current = 0;

    setUnreadCount(0);

    setLatestNotification(null);

    setNotificationVersion(0);

    setConnected(false);
  }, [authReady]);

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = useMemo(
    () => ({
      unreadCount,

      latestNotification,

      notificationVersion,

      connected,

      refreshUnreadCount,

      decreaseUnreadCount,

      clearUnreadCount,

      setUnreadCount,
    }),
    [
      unreadCount,
      latestNotification,
      notificationVersion,
      connected,
      refreshUnreadCount,
      decreaseUnreadCount,
      clearUnreadCount,
    ],
  );

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider.",
    );
  }

  return context;
}

export default NotificationContext;
