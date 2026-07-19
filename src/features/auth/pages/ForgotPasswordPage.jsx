import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button, Input } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import horse from "@/assets/auth-horse.jpg";
import { useForgotPassword } from "../hooks";
import { emailField } from "../validation";
import { AuthSplitLayout } from "../components/AuthSplitLayout";

const schema = z.object({
  email: emailField,
});

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  const mutation = useForgotPassword();
  const toast = useToast();

  const onSubmit = (data) =>
    mutation.mutate(data, {
      onSuccess: () => {
        toast.success("If this email exists, we have sent reset instructions.");
      },
      onError: () => {
        toast.success("If this email exists, we have sent reset instructions.");
      },
    });

  return (
    <AuthSplitLayout imageSide="right" image={horse}>
      <div>
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand-700">
          <ArrowLeft size={16} /> Back to login
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-ink">Forgot Password</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your email and we will send password reset instructions if the account exists.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
          Send Instructions <Mail size={18} />
        </Button>
      </form>
    </AuthSplitLayout>
  );
}
