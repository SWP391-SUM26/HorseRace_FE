import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button, Input } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import horse from "@/assets/auth-horse.jpg";
import { useResetPassword } from "../hooks";
import { emailField, passwordField } from "../validation";
import { AuthSplitLayout } from "../components/AuthSplitLayout";

const schema = z.object({
  email: emailField,
  code: z.string().min(1, "Please enter the reset code"),
  newPassword: passwordField,
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const mutation = useResetPassword();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: params.get("email") ?? "",
      code: params.get("code") ?? "",
    },
  });

  const onSubmit = (data) =>
    mutation.mutate(data, {
      onSuccess: () => {
        toast.success("Password reset successfully.");
        navigate("/login");
      },
      onError: (error) => toast.error(error.message || "Could not reset password."),
    });

  return (
    <AuthSplitLayout imageSide="right" image={horse}>
      <div>
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand-700">
          <ArrowLeft size={16} /> Back to login
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-ink">Reset Password</h1>
        <p className="mt-2 text-sm text-muted">Enter your reset code and choose a new password.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <Input label="Email Address" type="email" {...register("email")} error={errors.email?.message} />
        <Input label="Reset Code" {...register("code")} error={errors.code?.message} />
        <Input label="New Password" type="password" {...register("newPassword")} error={errors.newPassword?.message} />
        <Input label="Confirm Password" type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
          Reset Password <ArrowRight size={18} />
        </Button>
      </form>
    </AuthSplitLayout>
  );
}
