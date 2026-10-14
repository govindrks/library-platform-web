const TOKEN_KEY = "libraryhub_token";
const USER_KEY = "libraryhub_user";
const REMEMBER_KEY = "libraryhub_remember_me";

// ============================================================
// INTERNAL HELPERS
// ============================================================

const clearAuthKeys = (targetStorage) => {
  targetStorage.removeItem(TOKEN_KEY);

  targetStorage.removeItem(USER_KEY);
};

const hasToken = (targetStorage) => Boolean(targetStorage.getItem(TOKEN_KEY));

const getPreferredStorage = () => {
  const rememberMe = localStorage.getItem(REMEMBER_KEY) === "true";

  return rememberMe ? localStorage : sessionStorage;
};

const getActiveAuthStorage = () => {
  if (hasToken(sessionStorage)) {
    return sessionStorage;
  }

  if (hasToken(localStorage)) {
    return localStorage;
  }

  return getPreferredStorage();
};

// ============================================================
// BROWSER STORAGE
// ============================================================

export const storage = {
  // ==========================================================
  // SAVE COMPLETE AUTH SESSION
  // ==========================================================

  setAuth(token, user, rememberMe = false) {
    if (!token) {
      this.clear();

      return;
    }

    /*
     * Always remove previous auth state first.
     *
     * This prevents situations such as:
     *
     * localStorage   -> old authenticated user
     * sessionStorage -> new authenticated user
     */
    clearAuthKeys(localStorage);

    clearAuthKeys(sessionStorage);

    localStorage.removeItem(REMEMBER_KEY);

    const targetStorage = rememberMe ? localStorage : sessionStorage;

    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, "true");
    }

    targetStorage.setItem(TOKEN_KEY, token);

    if (user) {
      targetStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  // ==========================================================
  // TOKEN
  // ==========================================================

  setToken(token, rememberMe = null) {
    if (!token) {
      this.removeToken();

      return;
    }

    let targetStorage;

    if (rememberMe === true) {
      targetStorage = localStorage;
    } else if (rememberMe === false) {
      targetStorage = sessionStorage;
    } else {
      targetStorage = getActiveAuthStorage();
    }

    /*
     * Remove duplicate token values first.
     */
    localStorage.removeItem(TOKEN_KEY);

    sessionStorage.removeItem(TOKEN_KEY);

    /*
     * Keep remember-me preference aligned with
     * the actual token location.
     */
    if (targetStorage === localStorage) {
      localStorage.setItem(REMEMBER_KEY, "true");
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    targetStorage.setItem(TOKEN_KEY, token);
  },

  getToken() {
    /*
     * Session token gets priority.
     *
     * Normally only one location should contain a token,
     * but this protects against stale data from an older
     * application version.
     */
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);

    sessionStorage.removeItem(TOKEN_KEY);
  },

  // ==========================================================
  // USER
  // ==========================================================

  setUser(user, rememberMe = null) {
    if (!user) {
      this.removeUser();

      return;
    }

    let targetStorage;

    if (rememberMe === true) {
      targetStorage = localStorage;
    } else if (rememberMe === false) {
      targetStorage = sessionStorage;
    } else {
      /*
       * Update whichever storage currently owns the
       * authentication session.
       */
      targetStorage = getActiveAuthStorage();
    }

    /*
     * Avoid stale user objects existing in both stores.
     */
    localStorage.removeItem(USER_KEY);

    sessionStorage.removeItem(USER_KEY);

    targetStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser() {
    /*
     * Read the user from the same storage that owns the
     * active token whenever possible.
     */
    let rawUser = null;

    if (hasToken(sessionStorage)) {
      rawUser = sessionStorage.getItem(USER_KEY);
    } else if (hasToken(localStorage)) {
      rawUser = localStorage.getItem(USER_KEY);
    } else {
      /*
       * Fallback for older/stale sessions.
       */
      rawUser =
        sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    }

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser);
    } catch (error) {
      console.warn("Invalid stored LibraryHub user:", error);

      this.removeUser();

      return null;
    }
  },

  removeUser() {
    localStorage.removeItem(USER_KEY);

    sessionStorage.removeItem(USER_KEY);
  },

  // ==========================================================
  // REMEMBER ME
  // ==========================================================

  isRemembered() {
    return localStorage.getItem(REMEMBER_KEY) === "true";
  },

  setRememberMe(rememberMe) {
    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, "true");

      return;
    }

    localStorage.removeItem(REMEMBER_KEY);
  },

  // ==========================================================
  // AUTH STORAGE TYPE
  // ==========================================================

  getAuthStorage() {
    return getActiveAuthStorage();
  },

  // ==========================================================
  // CLEAR AUTHENTICATION
  // ==========================================================

  clear() {
    clearAuthKeys(localStorage);

    clearAuthKeys(sessionStorage);

    localStorage.removeItem(REMEMBER_KEY);
  },
};

export default storage;
