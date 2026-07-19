import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Send, Shield } from "lucide-react";
import { Button, Input } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import horse from "@/assets/auth-horse.jpg";
import { useForgotPassword } from "../hooks";
import { emailField } from "../validation";
import { AuthSplitLayout } from "../components/AuthSplitLayout";

const schema = z.object({ email: emailField });

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const mutation = useForgotPassword();
  const toast = useToast();
  const navigate = useNavigate();

  const onSubmit = ({ email }) =>
    mutation.mutate(
      { email },
      {
        onSuccess: () => {
          toast.success("Đã gửi mã đặt lại tới email");
          navigate("/reset?email=" + encodeURIComponent(email));
        },
      },
    );

  return (
    <AuthSplitLayout
      imageSide="left"
      image={horse}
      panel={
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/10">
            <Shield size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold">Equine Elite</h2>
          <p className="mt-3 max-w-xs text-white/70">
            Elite Management for the Modern Stable. Precision data meets racing
            heritage.
          </p>
        </div>
      }
    >
      <div>
        <h1 className="text-2xl font-semibold text-ink">Forgot Password</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your registered email address to receive a secure reset code.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex flex-col gap-4"
      >
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={mutation.isPending}
        >
          <Send size={18} />
          Send Reset Code
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
