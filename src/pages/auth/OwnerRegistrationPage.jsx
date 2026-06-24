import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import toast from "react-hot-toast";

import {
  Button,
  Card,
  Input,
  Select,
  Textarea,
  Checkbox,
} from "@/common/ui";
import { loginWithCredentials } from "../../services/auth";
import { useRegisterOwner, useRequestEmailVerification } from "./hooks";
import { emailField, passwordField, phoneFieldOptional } from "./validation";
import { AuthShell } from "./components/AuthShell";

const schema = z
  .object({
    fullName: z.string().min(1, "Vui lòng nhập họ tên"),
    email: emailField,
    contactNumber: phoneFieldOptional,
    primaryRegion: z.string().optional(),
    stableName: z.string().optional(),
    password: passwordField,
    confirmPassword: z.string(),
    bio: z.string().optional(),
    agreedToTerms: z.literal(true, {
      errorMap: () => ({ message: "Bạn cần đồng ý điều khoản" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu không khớp",
  });

const REGION_OPTIONS = [
  { value: "", label: "Select region" },
  { value: "KY-US", label: "Kentucky, USA" },
  { value: "CA-US", label: "California, USA" },
  { value: "UK", label: "United Kingdom" },
  { value: "IE", label: "Ireland" },
  { value: "AU", label: "Australia" },
  { value: "VN", label: "Vietnam" },
];

const BENEFITS = [
  "Direct access to Jockey Market",
  "Real-time Performance Analytics",
  "Global Race Entry Management",
];

export default function OwnerRegistrationPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useRegisterOwner();
  const requestVerification = useRequestEmailVerification();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    mutation.mutate(
      {
        fullName: data.fullName,
        email: data.email,
        contactNumber: data.contactNumber || undefined,
        password: data.password,
        confirmPassword: data.confirmPassword,
        primaryRegion: data.primaryRegion || undefined,
        stableName: data.stableName || undefined,
        bio: data.bio || undefined,
        agreedToTerms: data.agreedToTerms,
      },
      {
        onSuccess: async () => {
          requestVerification.mutate({ email: data.email });
          toast.success("Đã gửi mã xác thực tới email của bạn");
          
          await loginWithCredentials(data.email, data.password);
          navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
        },
        onError: (err) => {
          toast.error(
            err.response?.data?.message || err.message || "Đăng ký thất bại"
          );
        },
      }
    );
  };

  return (
    <AuthShell>
      <div className="w-full max-w-5xl">
        <Card className="grid overflow-hidden md:grid-cols-2">
          <div className="flex flex-col bg-brand-800 p-10 text-white">
            <h2 className="text-3xl font-semibold">Welcome to the Inner Circle</h2>
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
            <div className="flex items-center justify-between">
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
              <Select
                label="Primary Region"
                options={REGION_OPTIONS}
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
