import { describe, it, expect } from "vitest";
import { schema } from "./OwnerRegistrationPage";

const valid = {
  fullName: "Jane Owner",
  email: "jane@example.com",
  contactNumber: "0912345678",
  primaryRegion: "Hanoi, Vietnam",
  stableName: "Star Stable",
  password: "Example1!",
  confirmPassword: "Example1!",
  bio: "Twenty years of thoroughbred breeding.",
  agreedToTerms: true,
};

describe("Owner registration schema — every visible field required (FR-05)", () => {
  it("accepts a fully-populated owner payload", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it.each(["primaryRegion", "contactNumber", "stableName", "bio"])(
    "rejects when %s is empty and flags that field",
    (field) => {
      const result = schema.safeParse({ ...valid, [field]: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path[0] === field)).toBe(true);
      }
    },
  );

  it("rejects a non-VN contactNumber", () => {
    const result = schema.safeParse({ ...valid, contactNumber: "12345" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path[0] === "contactNumber"),
      ).toBe(true);
    }
  });
});
