import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button, Card, Input, Textarea, Checkbox } from "@/common/ui";
import { useAuth } from "@/common/hooks/useAuth";
import { useToast } from "@/common/providers/ToastProvider";
import { useRegisterOwner, useRequestEmailVerification } from "../hooks";
import { emailField, passwordField, phoneFieldRequired } from "../validation";
import { AuthShell } from "../components/AuthShell";
import { applyApiErrorToForm } from "@/common/lib/apiError";

// Every visible owner field is required (user-confirmed FR-05).
export const schema = z
  .object({
    fullName: z.string().trim().min(1, "Vui lòng nhập họ tên"),
    email: emailField,
    contactNumber: phoneFieldRequired,
    primaryRegion: z.string().trim().min(1, "Vui lòng nhập khu vực"),
    stableName: z.string().trim().min(1, "Vui lòng nhập tên chuồng ngựa"),
    password: passwordField,
    confirmPassword: z.string(),
    bio: z.string().trim().min(1, "Vui lòng nhập thông tin chuyên môn"),
    agreedToTerms: z.literal(true, {
      error: () => "Bạn cần đồng ý điều khoản",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu không khớp",
  });

const BENEFITS = [
  "Direct access to Jockey Market",
  "Real-time Performance Analytics",
  "Global Race Entry Management",
];

export default function OwnerRegistrationPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const mutation = useRegisterOwner();
  const requestVerification = useRequestEmailVerification();
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const onSubmit = (data) =>
    mutation.mutate(
      {
        fullName: data.fullName,
        email: data.email,
        contactNumber: data.contactNumber,
        password: data.password,
        confirmPassword: data.confirmPassword,
        primaryRegion: data.primaryRegion,
        stableName: data.stableName,
        bio: data.bio,
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
          <div className="flex flex-col bg-brand-800 p-6 md:p-10 text-white">
            <h2 className="text-3xl font-semibold">
              Welcome to the Inner Circle
            </h2>
            <p className="mt-3 text-white/70">
              Register as an Owner to access the industry's most advanced
              bloodline analytics and race management platform.
            </p>
            <ul className="mt-8 flex flex-col gap-4">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                    <Check size={14} />
                  </span>
                  <span className="text-sm text-white/90">{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-auto pt-8 italic text-white/60">
              "Precision in data, prestige in management."
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 bg-surface p-8"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-semibold text-ink">
                Owner Registration
              </h1>
              <span className="text-xs font-medium uppercase tracking-wide text-muted">
                Step 01/01
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-ink">Stable Identity</h3>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg border border-border bg-subtle" />
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-fit"
                  >
                    Choose File
                  </Button>
                  <span className="text-xs text-muted">
                    Upload your racing silks, stable logo or professional crest.
                    High-res PNG or JPG preferred.
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Full Legal Name"
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
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Contact Number"
                {...register("contactNumber")}
                error={errors.contactNumber?.message}
              />
              <Input
                label="Primary Region"
                {...register("primaryRegion")}
                error={errors.primaryRegion?.message}
              />
            </div>

            <Input
              label="Stable Name"
              {...register("stableName")}
              error={errors.stableName?.message}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>

            <Textarea
              label="Professional Credentials"
              placeholder="Briefly describe your racing history, notable wins, and breeding philosophy."
              {...register("bio")}
              error={errors.bio?.message}
            />

            <div className="flex flex-col gap-1">
              <Checkbox
                label="I agree to the Terms of Service and confirm that I hold valid ownership credentials for my listed stable."
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
              Register Account
              <ArrowRight size={18} />
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-700 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
