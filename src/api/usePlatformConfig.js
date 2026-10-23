import { useCallback, useEffect, useState } from "react";

import platformApi from "../api/platformApi";

const DEFAULT_CONFIG = {
  platformName: "LibraryHub",
  maintenanceMode: false,
  allowUserRegistration: true,
  allowLibraryRegistration: true,
  supportEmail: "",
  supportPhone: "",
  defaultCurrency: "INR",
  timezone: "Asia/Kolkata",
};

const EVENT_NAME = "platform-config-updated";

let cachedConfig = {
  ...DEFAULT_CONFIG,
};

let hasLoaded = false;

let inFlightRequest = null;

// ============================================================
// NORMALIZE CONFIG
// ============================================================

const normalizeConfig = (response) => ({
  platformName:
    String(response?.platformName || DEFAULT_CONFIG.platformName).trim() ||
    DEFAULT_CONFIG.platformName,

  maintenanceMode: Boolean(response?.maintenanceMode),

  allowUserRegistration: response?.allowUserRegistration !== false,

  allowLibraryRegistration: response?.allowLibraryRegistration !== false,

  supportEmail: response?.supportEmail || "",

  supportPhone: response?.supportPhone || "",

  defaultCurrency: response?.defaultCurrency || DEFAULT_CONFIG.defaultCurrency,

  timezone: response?.timezone || DEFAULT_CONFIG.timezone,
});

// ============================================================
// NOTIFY CONFIG CHANGE
// ============================================================

const notifyConfigChanged = (config) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: config,
    }),
  );
};

// ============================================================
// PUBLISH CONFIG
// ============================================================

export const publishPlatformConfig = (nextConfig) => {
  cachedConfig = normalizeConfig({
    ...cachedConfig,
    ...nextConfig,
  });

  hasLoaded = true;

  notifyConfigChanged(cachedConfig);

  return cachedConfig;
};

// ============================================================
// REFRESH CONFIG FROM BACKEND
// ============================================================

export const refreshPlatformConfig = async () => {
  if (!inFlightRequest) {
    inFlightRequest = platformApi
      .getStatus()

      .then((response) => {
        cachedConfig = normalizeConfig(response);

        hasLoaded = true;

        notifyConfigChanged(cachedConfig);

        return cachedConfig;
      })

      .finally(() => {
        inFlightRequest = null;
      });
  }

  return inFlightRequest;
};

// ============================================================
// HOOK
// ============================================================

function usePlatformConfig() {
  const [config, setConfig] = useState(cachedConfig);

  const [loading, setLoading] = useState(!hasLoaded);

  const [error, setError] = useState("");

  // =========================================================
  // REFRESH
  // =========================================================

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const next = await refreshPlatformConfig();

      setConfig(next);

      return next;
    } catch (requestError) {
      console.error("Unable to load platform configuration:", requestError);

      setError(
        requestError?.response?.data?.message ||
          "Unable to load platform configuration.",
      );

      return cachedConfig;
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // LISTEN FOR PLATFORM CONFIG CHANGES
  // =========================================================

  useEffect(() => {
    const handleUpdate = (event) => {
      const next = normalizeConfig(event?.detail || cachedConfig);

      cachedConfig = next;

      setConfig(next);

      setLoading(false);
    };

    if (typeof window !== "undefined") {
      window.addEventListener(EVENT_NAME, handleUpdate);
    }

    if (hasLoaded) {
      setConfig(cachedConfig);

      setLoading(false);
    } else {
      refresh();
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(EVENT_NAME, handleUpdate);
      }
    };
  }, [refresh]);

  // =========================================================
  // UPDATE BROWSER TITLE
  // =========================================================

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (config.platformName) {
      document.title = config.platformName;
    }
  }, [config.platformName]);

  // =========================================================
  // BRAND INITIAL
  // =========================================================

  const brandInitial = (config.platformName || DEFAULT_CONFIG.platformName)
    .charAt(0)
    .toUpperCase();

  // =========================================================
  // RETURN
  // =========================================================

  return {
    ...config,

    brandInitial,

    loading,

    error,

    refresh,
  };
}

export default usePlatformConfig;
