import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { MemoryRouter } from "react-router-dom";
import OwnerRegistrationPage from "./OwnerRegistrationPage";

const mockToast = { success: vi.fn(), error: vi.fn() };
let mockMutate;

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => vi.fn() };
});
vi.mock("../hooks", () => ({
  useRegisterOwner: () => ({ mutate: mockMutate, isPending: false }),
  useRequestEmailVerification: () => ({ mutate: vi.fn() }),
}));
vi.mock("@/common/hooks/useAuth", () => ({
  useAuth: () => ({ login: vi.fn() }),
}));
vi.mock("@/common/providers/ToastProvider", () => ({
  useToast: () => mockToast,
}));

function validationError() {
  return new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status: 400,
      statusText: "",
      headers: {},
      config: { headers: {} },
      data: {
        success: false,
        message: "Email đã được sử dụng",
        data: [{ field: "email", message: "BE says taken" }],
      },
    },
  );
}

async function fillAndSubmit() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <OwnerRegistrationPage />
    </MemoryRouter>,
  );
  await user.type(screen.getByLabelText(/Full Legal Name/i), "Jane Owner");
  await user.type(screen.getByLabelText(/Email Address/i), "jane@example.com");
  await user.type(screen.getByLabelText(/Contact Number/i), "0912345678");
  await user.type(screen.getByLabelText(/Primary Region/i), "Hanoi, Vietnam");
  await user.type(screen.getByLabelText(/Stable Name/i), "Star Stable");
  await user.type(screen.getByLabelText(/^Password$/i), "Example1!");
  await user.type(screen.getByLabelText(/Confirm Password/i), "Example1!");
  await user.type(
    screen.getByLabelText(/Professional Credentials/i),
    "Twenty years breeding.",
  );
  await user.click(screen.getByLabelText(/I agree to the Terms/i));
  await user.click(screen.getByRole("button", { name: /Register Account/i }));
}

describe("OwnerRegistrationPage — BE error surfacing", () => {
  beforeEach(() => {
    mockToast.success.mockClear();
    mockToast.error.mockClear();
  });

  it("toasts the BE message and sets the email field error (not the hardcoded string)", async () => {
    mockMutate = (_d, opts) => opts.onError(validationError());
    await fillAndSubmit();

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith("Email đã được sử dụng"),
    );
    expect(mockToast.error).not.toHaveBeenCalledWith("Đăng ký thất bại");
    expect(await screen.findByText("BE says taken")).toBeInTheDocument();
  });
});
