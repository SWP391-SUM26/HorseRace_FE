import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button, Input } from "@/common/ui";
import { cn } from "@/common/lib/cn";
import { useToast } from "@/common/providers/ToastProvider";
import horse from "@/assets/auth-horse.jpg";
import { useResetPassword, useResendCode } from "../hooks";
import { passwordField, passwordStrength } from "../validation";
import { AuthSplitLayout } from "../components/AuthSplitLayout";
import { CodeInput } from "../components/CodeInput";

const schema = z
  .object({
    newPassword: passwordField,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu không khớp",
  });

const STRENGTH_LABEL = ["Rất yếu", "Yếu", "Trung bình", "Khá", "Mạnh"];
const STRENGTH_COLOR = [
  "bg-danger",
  "bg-danger",
  "bg-warning",
  "bg-brand-500",
  "bg-success",
];

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const [code, setCode] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const newPassword = watch("newPassword") ?? "";
  const strength = passwordStrength(newPassword);

  const mutation = useResetPassword();
  const resend = useResendCode();
  const toast = useToast();
  const navigate = useNavigate();

  const onResend = () =>
    resend.mutate(
      { email },
      {
        onSuccess: () => toast.success("Đã gửi lại mã"),
      },
    );

  const onSubmit = (data) => {
    if (code.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 chữ số");
      return;
    }
    mutation.mutate(
      {
        email,
        code,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: () => {
          toast.success("Đặt lại mật khẩu thành công");
          navigate("/login");
        },
      },
    );
  };

  return (
    <AuthSplitLayout
      imageSide="left"
      image={horse}
      panel={
        <div className="mt-auto">
          <h2 className="text-xl font-semibold">Secure Your Access</h2>
          <p className="mt-3 max-w-sm text-white/70">
            Protecting sensitive performance data and stable financials requires
            robust security protocols. Reset your credentials to regain secure
            access to the command center.
          </p>
        </div>
      }
    >
      <div>
        <h1 className="text-2xl font-semibold text-ink">Reset Password</h1>
        <p className="mt-2 text-sm text-muted">
          We've sent a 6-digit verification code to your registered email
          address. Please enter it below along with your new password.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <label className="text-xs uppercase tracking-wide text-muted">
              Verification Code
            </label>
            <button
              type="button"
              onClick={onResend}
              disabled={resend.isPending}
              className="text-sm text-brand-700 hover:underline disabled:opacity-50"
            >
              Resend Code
            </button>
          </div>
          <CodeInput value={code} onChange={setCode} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-muted">
            New Password
          </label>
          <Input
            type="password"
            autoComplete="new-password"
            {...register("newPassword")}
            error={errors.newPassword?.message}
          />
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className={cn("h-full transition-all", STRENGTH_COLOR[strength])}
              style={{ width: `${(strength / 4) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted">
            {newPassword ? STRENGTH_LABEL[strength] + " — " : ""}
            8+ ký tự, gồm chữ hoa, chữ thường, số &amp; ký tự đặc biệt
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-muted">
            Confirm Password
          </label>
          <Input
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={mutation.isPending}
        >
          <ShieldCheck size={18} />
          Reset Password
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link to="/login" className="text-muted hover:text-ink">
          ← Back to Login
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
