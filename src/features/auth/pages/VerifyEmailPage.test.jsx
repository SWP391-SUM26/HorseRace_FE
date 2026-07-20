import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import VerifyEmailPage from "./VerifyEmailPage";

const mockNavigate = vi.fn();
let mockVerify;
let mockUser;

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock("../hooks", () => ({
  useVerifyEmail: () => ({ mutate: mockVerify, isPending: false }),
  useRequestEmailVerification: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@/common/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser }),
}));
vi.mock("@/common/providers/ToastProvider", () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));

function user(role) {
  return {
    id: "u1",
    email: "x@y.z",
    role: role,
    fullName: "X",
    avatarUrl: null,
  };
}

async function verifyWithCode() {
  const u = userEvent.setup();
  render(
    <MemoryRouter initialEntries={["/verify-email?email=jockey%40y.z"]}>
      <VerifyEmailPage />
    </MemoryRouter>,
  );
  await u.click(screen.getByLabelText("Mã ký tự 1"));
  await u.paste("123456");
  await u.click(screen.getByRole("button", { name: /Xác thực Email/i }));
}

describe("VerifyEmailPage — redirect after verify", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockVerify = (_d, opts) => opts.onSuccess();
  });

  it("sends an authenticated user to their role dashboard, not the public home", async () => {
    mockUser = user("JOCKEY");
    await verifyWithCode();
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/app/jockey"),
    );
    expect(mockNavigate).not.toHaveBeenCalledWith("/");
  });

  it("falls back to /login when there is no session (opened from an email link)", async () => {
    mockUser = null;
    await verifyWithCode();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
  });
});
