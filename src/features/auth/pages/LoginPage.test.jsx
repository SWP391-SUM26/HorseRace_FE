import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
let mockMutate;

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock("../hooks", () => ({
  useLogin: () => ({ mutate: mockMutate, isPending: false }),
}));
vi.mock("@/common/hooks/useAuth", () => ({
  useAuth: () => ({ login: mockLogin }),
}));
vi.mock("@/common/providers/ToastProvider", () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));

function session(role) {
  return {
    accessToken: "tok",
    refreshToken: "ref",
    user: {
      id: "u1",
      email: "x@y.z",
      role: role,
      fullName: "X",
      avatarUrl: null,
    },
  };
}

async function submitLogin() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  await user.type(screen.getByLabelText(/Email/i), "admin@horserace.local");
  await user.type(screen.getByLabelText(/^Password$/i), "secret1");
  await user.click(screen.getByRole("button", { name: /^Login/i }));
}

describe("LoginPage — redirect after login", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLogin.mockClear();
  });

  it("navigates ADMIN to the admin dashboard, not the public home", async () => {
    mockMutate = (_d, opts) => opts.onSuccess(session("ADMIN"));
    await submitLogin();
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/app/admin"),
    );
    expect(mockNavigate).not.toHaveBeenCalledWith("/");
  });

  it("navigates HORSE_OWNER to the owner dashboard", async () => {
    mockMutate = (_d, opts) => opts.onSuccess(session("HORSE_OWNER"));
    await submitLogin();
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/app/owner/tournaments"),
    );
  });
});
