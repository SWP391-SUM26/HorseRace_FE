import { apiClient } from "@/common/lib/apiClient";

/**
 * Map the flat BE AuthResponse into our AuthSession.
 * The BE does not return a display name on auth, so fullName is derived from the
 * email local-part until a /users/me profile fetch is wired up.
 */
export function mapAuthResponse(raw) {
  const user = {
    id: raw.userId,
    email: raw.email,
    role: raw.role,
    fullName: raw.email.split("@")[0],
    avatarUrl: null,
  };
  return { accessToken: raw.accessToken, refreshToken: raw.refreshToken, user };
}

/** POST an auth/register request and unwrap the ApiResponse into a session. */
async function postAuth(path, body) {
  const { data } = await apiClient.post(path, body);
  return mapAuthResponse(data.data);
}

export const authApi = {
  login: (body) => postAuth("/auth/login", body),
  registerSpectator: (body) => postAuth("/auth/register/spectator", body),
  registerOwner: (body) => postAuth("/auth/register/owner", body),

  /**
   * Jockey register is multipart (fields + licence/fitness files) and returns NO
   * tokens — the account is PENDING referee approval.
   */
  async registerJockey(input) {
    const { license, fitnessCertificate, ...fields } = input;
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
    });
    if (license) fd.append("license", license);
    if (fitnessCertificate) fd.append("fitnessCertificate", fitnessCertificate);
    // Content-Type: null → let the browser set multipart/form-data with the
    // correct boundary.
    const { data } = await apiClient.post("/auth/register/jockey", fd, {
      headers: { "Content-Type": null },
    });
    return data.data;
  },

  async forgotPassword(body) {
    await apiClient.post("/auth/forgot-password", body);
  },
  async resendCode(body) {
    await apiClient.post("/auth/resend-code", body);
  },
  async verifyCode(body) {
    await apiClient.post("/auth/verify-code", body);
  },
  async resetPassword(body) {
    await apiClient.post("/auth/reset-password", body);
  },

  /** Send a 6-digit OTP to a registered email (post-registration verification). */
  async requestEmailVerification(body) {
    await apiClient.post("/auth/verify-email/request", body);
  },
  /** Validate the OTP and mark the email verified. */
  async verifyEmail(body) {
    await apiClient.post("/auth/verify-email", body);
  },
};
