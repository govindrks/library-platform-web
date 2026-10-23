import api from "./axios";

// ============================================================
// WHATSAPP OTP API
// ============================================================

const whatsappOtpApi = {
  // ==========================================================
  // NORMALIZE PHONE
  // ==========================================================
  //
  // Accepted frontend values:
  //
  // 9876543210
  // +91 9876543210
  // 919876543210
  //
  // Backend receives:
  //
  // 919876543210
  //
  // ==========================================================

  normalizePhoneNumber: (phone) => {
    if (!phone || !String(phone).trim()) {
      throw new Error("Mobile number is required.");
    }

    const digits = String(phone).replace(/\D/g, "");

    // ========================================================
    // INDIAN 10-DIGIT NUMBER
    // ========================================================

    if (/^[6-9]\d{9}$/.test(digits)) {
      return `91${digits}`;
    }

    // ========================================================
    // ALREADY CANONICAL INDIAN NUMBER
    // ========================================================

    if (/^91[6-9]\d{9}$/.test(digits)) {
      return digits;
    }

    throw new Error("Enter a valid Indian mobile number.");
  },

  // ==========================================================
  // VALIDATE OTP
  // ==========================================================

  validateOtp: (otp) => {
    const normalizedOtp = String(otp || "").trim();

    if (!/^\d{6}$/.test(normalizedOtp)) {
      throw new Error("OTP must contain exactly 6 digits.");
    }

    return normalizedOtp;
  },

  // ==========================================================
  // LOGIN OTP
  // ==========================================================

  // ==========================================================
  // REQUEST LOGIN OTP
  // ==========================================================
  //
  // POST
  // /api/auth/whatsapp/request-otp
  //
  // Request:
  //
  // {
  //   phoneNumber: "919876543210"
  // }
  //
  // Response:
  //
  // {
  //   challengeId: "...",
  //   expiresInSeconds: 300,
  //   resendAvailableInSeconds: 60
  // }
  //
  // ==========================================================

  requestOtp: async (phone) => {
    const phoneNumber = whatsappOtpApi.normalizePhoneNumber(phone);

    const response = await api.post("/api/auth/whatsapp/request-otp", {
      phoneNumber,
    });

    return response.data;
  },

  // ==========================================================
  // VERIFY LOGIN OTP
  // ==========================================================
  //
  // POST
  // /api/auth/whatsapp/verify-otp
  //
  // Request:
  //
  // {
  //   challengeId: "...",
  //   otp: "123456"
  // }
  //
  // Response:
  //
  // {
  //   token: "...",
  //   userId: 1,
  //   fullName: "...",
  //   email: "...",
  //   phone: "919876543210",
  //   role: "USER"
  // }
  //
  // ==========================================================

  verifyOtp: async ({ challengeId, otp }) => {
    if (!challengeId || !String(challengeId).trim()) {
      throw new Error("OTP challenge ID is required.");
    }

    const normalizedOtp = whatsappOtpApi.validateOtp(otp);

    const response = await api.post("/api/auth/whatsapp/verify-otp", {
      challengeId: String(challengeId).trim(),

      otp: normalizedOtp,
    });

    return response.data;
  },

  // ==========================================================
  // REGISTRATION OTP
  // ==========================================================

  // ==========================================================
  // REQUEST REGISTRATION OTP
  // ==========================================================
  //
  // Used before:
  //
  // POST /api/auth/register
  //
  // and:
  //
  // POST /api/library-registration
  //
  // Endpoint:
  //
  // POST
  // /api/auth/whatsapp/registration/request-otp
  //
  // Request:
  //
  // {
  //   phoneNumber: "919876543210"
  // }
  //
  // Response:
  //
  // {
  //   challengeId: "...",
  //   expiresInSeconds: 300,
  //   resendAvailableInSeconds: 60
  // }
  //
  // ==========================================================

  requestRegistrationOtp: async (phone) => {
    const phoneNumber = whatsappOtpApi.normalizePhoneNumber(phone);

    const response = await api.post(
      "/api/auth/whatsapp/registration/request-otp",
      {
        phoneNumber,
      },
    );

    return response.data;
  },

  // ==========================================================
  // VERIFY REGISTRATION OTP
  // ==========================================================
  //
  // POST
  // /api/auth/whatsapp/registration/verify-otp
  //
  // Request:
  //
  // {
  //   challengeId: "...",
  //   otp: "123456"
  // }
  //
  // Response:
  //
  // {
  //   verificationToken: "...",
  //   phoneNumber: "919876543210",
  //   expiresInSeconds: 600
  // }
  //
  // IMPORTANT:
  //
  // verificationToken is NOT an authentication token.
  //
  // It must be sent during final account/library registration.
  //
  // ==========================================================

  verifyRegistrationOtp: async ({ challengeId, otp }) => {
    if (!challengeId || !String(challengeId).trim()) {
      throw new Error("OTP challenge ID is required.");
    }

    const normalizedOtp = whatsappOtpApi.validateOtp(otp);

    const response = await api.post(
      "/api/auth/whatsapp/registration/verify-otp",
      {
        challengeId: String(challengeId).trim(),

        otp: normalizedOtp,
      },
    );

    return response.data;
  },
};

export default whatsappOtpApi;
