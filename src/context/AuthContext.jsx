import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import storage from "../utility/browserStorage";

import userProfileApi from "../api/userProfileApi";

// ============================================================
// AUTH CONTEXT
// ============================================================

const AuthContext = createContext(null);

// ============================================================
// JWT PAYLOAD DECODER
// ============================================================

const decodeJwtPayload = (token) => {
  try {
    if (!token) {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");

    while (payload.length % 4) {
      payload += "=";
    }

    const decoded = window.atob(payload);

    const json = decodeURIComponent(
      decoded
        .split("")
        .map(
          (character) =>
            `%${("00" + character.charCodeAt(0).toString(16)).slice(-2)}`,
        )
        .join(""),
    );

    return JSON.parse(json);
  } catch (error) {
    console.warn("Unable to decode authentication token:", error);

    return null;
  }
};

// ============================================================
// TOKEN EXPIRATION
// ============================================================

const isTokenExpired = (token) => {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
};

// ============================================================
// TOKEN EXPIRATION TIME
// ============================================================

const getTokenExpirationTime = (token) => {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return null;
  }

  return payload.exp * 1000;
};

// ============================================================
// USER FROM TOKEN
// ============================================================

const getUserFromToken = (token) => {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return null;
  }

  return {
    id: payload.userId ?? payload.id ?? null,

    email: payload.sub ?? payload.email ?? null,

    role: payload.role ?? null,
  };
};

// ============================================================
// MERGE USER DATA
// ============================================================

const mergeUserData = (currentUser, profile, token) => {
  const tokenUser = getUserFromToken(token) || {};

  return {
    ...tokenUser,
    ...(currentUser || {}),
    ...(profile || {}),

    id: profile?.id ?? currentUser?.id ?? tokenUser?.id ?? null,

    fullName: profile?.fullName ?? currentUser?.fullName ?? null,

    phone: profile?.phone ?? currentUser?.phone ?? null,

    email: profile?.email ?? currentUser?.email ?? tokenUser?.email ?? null,

    gender: profile?.gender ?? currentUser?.gender ?? null,

    role: profile?.role ?? currentUser?.role ?? tokenUser?.role ?? null,

    profileImageUrl:
      profile?.profileImageUrl ?? currentUser?.profileImageUrl ?? null,
  };
};

// ============================================================
// AUTH PROVIDER
// ============================================================

export function AuthProvider({ children }) {
  // ==========================================================
  // INITIAL STATE
  // ==========================================================

  const [token, setToken] = useState(() => storage.getToken());

  const [user, setUser] = useState(() => storage.getUser());

  const [initializing, setInitializing] = useState(true);

  // ==========================================================
  // CLEAR AUTH
  // ==========================================================

  const clearAuthentication = useCallback(() => {
    storage.clear();

    setToken(null);

    setUser(null);
  }, []);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = useCallback(
    (authToken, userData = null, rememberMe = false) => {
      if (!authToken) {
        throw new Error("Authentication token is required.");
      }

      if (isTokenExpired(authToken)) {
        throw new Error("Authentication token has already expired.");
      }

      const tokenUser = getUserFromToken(authToken);

      const authenticatedUser = mergeUserData(tokenUser, userData, authToken);

      // ----------------------------------------------------
      // PERSIST AUTH
      // ----------------------------------------------------

      storage.setAuth(authToken, authenticatedUser, rememberMe);

      // ----------------------------------------------------
      // REACT STATE
      // ----------------------------------------------------

      setToken(authToken);

      setUser(authenticatedUser);
    },
    [],
  );

  // ==========================================================
  // UPDATE USER
  // ==========================================================

  const updateUser = useCallback((updates) => {
    setUser((currentUser) => {
      const updatedUser = {
        ...(currentUser || {}),
        ...(updates || {}),
      };

      storage.setUser(updatedUser);

      return updatedUser;
    });
  }, []);

  // ==========================================================
  // REPLACE USER
  // ==========================================================

  const replaceUser = useCallback((userData) => {
    if (!userData) {
      setUser(null);

      storage.removeUser();

      return;
    }

    storage.setUser(userData);

    setUser(userData);
  }, []);

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = useCallback(() => {
    clearAuthentication();
  }, [clearAuthentication]);

  // ==========================================================
  // REFRESH AUTHENTICATED PROFILE
  // ==========================================================

  const refreshProfile = useCallback(async () => {
    const activeToken = storage.getToken() || token;

    if (!activeToken || isTokenExpired(activeToken)) {
      return null;
    }

    try {
      const profile = await userProfileApi.getProfile();

      if (!profile) {
        return null;
      }

      let updatedUser = null;

      setUser((currentUser) => {
        updatedUser = mergeUserData(currentUser, profile, activeToken);

        storage.setUser(updatedUser);

        return updatedUser;
      });

      return updatedUser || profile;
    } catch (error) {
      const status = error?.response?.status;

      // --------------------------------------------------
      // TOKEN INVALID / SESSION NO LONGER AUTHORIZED
      // --------------------------------------------------

      if (status === 401) {
        clearAuthentication();
      }

      throw error;
    }
  }, [token, clearAuthentication]);

  // ==========================================================
  // RESTORE AUTHENTICATION
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const restoreAuthentication = async () => {
      try {
        const storedToken = storage.getToken();

        const storedUser = storage.getUser();

        // -----------------------------------------------
        // NO TOKEN
        // -----------------------------------------------

        if (!storedToken) {
          if (mounted) {
            setToken(null);

            setUser(null);
          }

          return;
        }

        // -----------------------------------------------
        // EXPIRED TOKEN
        // -----------------------------------------------

        if (isTokenExpired(storedToken)) {
          storage.clear();

          if (mounted) {
            setToken(null);

            setUser(null);
          }

          return;
        }

        // -----------------------------------------------
        // RESTORE TOKEN
        // -----------------------------------------------

        if (mounted) {
          setToken(storedToken);
        }

        // -----------------------------------------------
        // RESTORE CACHED / JWT USER FIRST
        // -----------------------------------------------

        const tokenUser = getUserFromToken(storedToken);

        const restoredUser = mergeUserData(tokenUser, storedUser, storedToken);

        if (mounted) {
          setUser(restoredUser);
        }

        // -----------------------------------------------
        // REFRESH PROFILE FROM BACKEND
        // -----------------------------------------------

        try {
          const profile = await userProfileApi.getProfile();

          if (!mounted) {
            return;
          }

          if (profile) {
            const hydratedUser = mergeUserData(
              restoredUser,
              profile,
              storedToken,
            );

            storage.setUser(hydratedUser);

            setUser(hydratedUser);
          }
        } catch (profileError) {
          const status = profileError?.response?.status;

          // ---------------------------------------------
          // INVALID SESSION
          // ---------------------------------------------

          if (status === 401) {
            storage.clear();

            if (mounted) {
              setToken(null);

              setUser(null);
            }

            return;
          }

          /*
           * A temporary profile API/network failure should
           * not destroy a still-valid local JWT session.
           *
           * The cached/JWT-derived user remains available.
           */
          console.warn(
            "Unable to refresh authenticated profile:",
            profileError,
          );
        }
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    };

    restoreAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================
  // AUTOMATIC TOKEN EXPIRATION
  // ==========================================================

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const expirationTime = getTokenExpirationTime(token);

    if (!expirationTime) {
      return undefined;
    }

    const remainingTime = expirationTime - Date.now();

    if (remainingTime <= 0) {
      clearAuthentication();

      return undefined;
    }

    /*
     * setTimeout has a practical maximum delay of roughly
     * 2^31 - 1 milliseconds.
     *
     * For unusually long-lived JWTs, schedule the maximum
     * timeout and allow the effect/state lifecycle to handle
     * subsequent validation.
     */
    const timeoutDelay = Math.min(remainingTime, 2147483647);

    const timer = window.setTimeout(() => {
      if (isTokenExpired(token)) {
        clearAuthentication();
      }
    }, timeoutDelay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [token, clearAuthentication]);

  // ==========================================================
  // AUTHENTICATION STATUS
  // ==========================================================

  const isAuthenticated = Boolean(token && !isTokenExpired(token));

  // ==========================================================
  // ROLE
  // ==========================================================

  const role = user?.role ?? getUserFromToken(token)?.role ?? null;

  // ==========================================================
  // ROLE HELPERS
  // ==========================================================

  const isAdmin = role === "ADMIN";

  const isLibraryOwner = role === "LIBRARY_OWNER";

  const isStudent = role === "USER";

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = useMemo(
    () => ({
      token,

      user,

      role,

      initializing,

      isAuthenticated,

      isAdmin,

      isLibraryOwner,

      isStudent,

      login,

      logout,

      updateUser,

      replaceUser,

      refreshProfile,
    }),
    [
      token,
      user,
      role,
      initializing,
      isAuthenticated,
      isAdmin,
      isLibraryOwner,
      isStudent,
      login,
      logout,
      updateUser,
      replaceUser,
      refreshProfile,
    ],
  );

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================
// AUTH HOOK
// ============================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

export default AuthContext;
