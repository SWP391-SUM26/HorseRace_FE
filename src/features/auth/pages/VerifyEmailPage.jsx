import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button, Input } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import horse from "@/assets/auth-horse.jpg";
import { useRequestEmailVerification, useVerifyEmail } from "../hooks";
import { emailField } from "../validation";
import { AuthSplitLayout } from "../components/AuthSplitLayout";

const schema = z.object({
  email: emailField,
  code: z.string().min(1, "Please enter the verification code"),
});

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const verifyMutation = useVerifyEmail();
  const requestMutation = useRequestEmailVerification();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: params.get("email") ?? "",
      code: params.get("code") ?? "",
    },
  });

  const email = watch("email");

  useEffect(() => {
    const code = params.get("code");
    const queryEmail = params.get("email");
    if (queryEmail && code) {
      verifyMutation.mutate({ email: queryEmail, code }, {
        onSuccess: () => {
          toast.success("Email verified successfully.");
          navigate("/login");
        },
      });
    }
  }, []);

  const onSubmit = (data) =>
    verifyMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Email verified successfully.");
        navigate("/login");
      },
      onError: (error) => toast.error(error.message || "Could not verify email."),
    });

  const resend = () => {
    if (!email) {
      toast.error("Please enter your email first.");
      return;
    }
    requestMutation.mutate({ email }, {
      onSuccess: () => toast.success("Verification code sent."),
      onError: (error) => toast.error(error.message || "Could not resend code."),
    });
  };

  return (
    <AuthSplitLayout imageSide="right" image={horse}>
      <div>
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand-700">
          <ArrowLeft size={16} /> Back to login
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-ink">Verify Your Email</h1>
        <p className="mt-2 text-sm text-muted">Enter the verification code sent to your email.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <Input label="Email Address" type="email" {...register("email")} error={errors.email?.message} />
        <Input label="Verification Code" {...register("code")} error={errors.code?.message} />
        <Button type="submit" size="lg" className="w-full" loading={verifyMutation.isPending}>
          Verify Email <ShieldCheck size={18} />
        </Button>
        <Button type="button" variant="secondary" onClick={resend} loading={requestMutation.isPending}>
          Resend Code
        </Button>
      </form>
    </AuthSplitLayout>
  );
}
