import { describe, it, expect } from "vitest";
import { mapAuthResponse } from "./api";

describe("mapAuthResponse", () => {
  it("maps the flat BE AuthResponse into an AuthSession", () => {
    const raw = {
      accessToken: "jwt.token",
      refreshToken: "refresh.token",
      tokenType: "Bearer",
      expiresInSeconds: 3600,
      userId: "7",
      email: "owner@x.com",
      role: "HORSE_OWNER",
    };
    const out = mapAuthResponse(raw);
    expect(out.accessToken).toBe("jwt.token");
    expect(out.refreshToken).toBe("refresh.token");
    expect(out.user.id).toBe("7");
    expect(out.user.role).toBe("HORSE_OWNER");
    expect(out.user.email).toBe("owner@x.com");
    // fullName is derived from the email local-part until /users/me is wired
    expect(out.user.fullName).toBe("owner");
  });
});
