import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Input, Checkbox } from "@/common/ui";
import { useAuth } from "@/common/hooks/useAuth";
import { useToast } from "@/common/providers/ToastProvider";
import heroHorses from "@/assets/hero-horses.png";
import { useRegisterSpectator, useRequestEmailVerification } from "../hooks";
import { emailField, passwordField, phoneFieldOptional } from "../validation";
import { AuthShell } from "../components/AuthShell";
import { applyApiErrorToForm } from "@/common/lib/apiError";

const schema = z
  .object({
    fullName: z.string().min(1, "Vui lòng nhập họ tên"),
    email: emailField,
    phone: phoneFieldOptional,
    password: passwordField,
    confirmPassword: z.string(),
    agreedToTerms: z.literal(true, {
      errorMap: () => ({ message: "Bạn cần đồng ý điều khoản" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu không khớp",
  });

export default function SpectatorRegistrationPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const mutation = useRegisterSpectator();
  const requestVerification = useRequestEmailVerification();
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const onSubmit = (data) =>
    mutation.mutate(
      {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
        confirmPassword: data.confirmPassword,
        agreedToTerms: data.agreedToTerms,
      },
      {
        onSuccess: (s) => {
          login(s.user, s.accessToken);
          requestVerification.mutate({ email: data.email });
          toast.success("Đã gửi mã xác thực tới email của bạn");
          navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
        },
        onError: (err) =>
          applyApiErrorToForm(err, {
            toast,
            setError,
            fallback: "Đăng ký thất bại",
          }),
      },
    );

  return (
    <AuthShell>
      <div className="w-full max-w-5xl">
        <Card className="grid overflow-hidden md:grid-cols-2">
          <div
            className="relative hidden flex-col justify-end bg-cover bg-center p-10 text-white md:flex"
            style={{ backgroundImage: `url(${heroHorses})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 to-brand-900/50" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold">
                Join the Elite. Predict the Winners.
              </h2>
              <p className="mt-3 text-white/70">
                Experience the thrill of the race with unparalleled data,
                insights, and exclusive spectator access.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 bg-surface p-6 sm:p-8"
          >
            <div>
              <h1 className="text-2xl font-semibold text-ink">
                Create Spectator Account
              </h1>
              <p className="mt-1 text-sm text-muted">
                Enter your details to access the Elite Turf paddock.
              </p>
            </div>

            <Input
              label="Full Name"
              {...register("fullName")}
              error={errors.fullName?.message}
            />
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              {...register("email")}
              error={errors.email?.message}
            />

            <Input
              label="Phone Number"
              {...register("phone")}
              error={errors.phone?.message}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
              error={errors.password?.message}
            />

            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />

            <div className="flex flex-col gap-1">
              <Checkbox
                label="I agree to the Terms of Service and Privacy Policy."
                {...register("agreedToTerms")}
              />

              {errors.agreedToTerms && (
                <span className="text-xs text-danger">
                  {errors.agreedToTerms.message}
                </span>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={mutation.isPending}
            >
              Create Spectator Account
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-brand-700 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
