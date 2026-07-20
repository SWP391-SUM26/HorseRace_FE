import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button, Input, Select, Checkbox } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import jockeyImg from "@/assets/jockey.png";
import { useRegisterJockey } from "../hooks";
import { emailField, passwordField } from "../validation";
import { AuthSplitLayout } from "../components/AuthSplitLayout";
import { UploadBox } from "../components/UploadBox";
import { applyApiErrorToForm } from "@/common/lib/apiError";

const optionalNumber = z
  .union([z.string(), z.number()])
  .transform((v) =>
    v === "" || v === undefined || v === null ? undefined : Number(v),
  )
  .refine((v) => v === undefined || !Number.isNaN(v), "Giá trị không hợp lệ")
  .optional();

const schema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
    firstName: z.string().min(1, "Vui lòng nhập tên"),
    lastName: z.string().min(1, "Vui lòng nhập họ"),
    age: optionalNumber,
    weight: optionalNumber,
    nationality: z.string().trim().min(1, "Vui lòng nhập quốc tịch"),
    yearsActive: optionalNumber,
    ridingStyle: z.string().optional(),
    agreedToTerms: z.literal(true, {
      errorMap: () => ({ message: "Bạn cần đồng ý điều khoản" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu không khớp",
  });

const RIDING_STYLE_OPTIONS = [
  { value: "", label: "Select riding style" },
  { value: "Flat", label: "Flat" },
  { value: "Jump", label: "Jump" },
  { value: "Harness", label: "Harness" },
  { value: "Endurance", label: "Endurance" },
];

function Section({ icon, title, children }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
          {icon}
        </span>
        <h2 className="font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function JockeyRegistrationPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const mutation = useRegisterJockey();
  const toast = useToast();
  const navigate = useNavigate();
  const [license, setLicense] = useState(null);
  const [fitness, setFitness] = useState(null);

  const onSubmit = (data) => {
    if (!license || !fitness) {
      toast.error("Vui lòng tải lên giấy phép nài và giấy chứng nhận thể lực");
      return;
    }
    mutation.mutate(
      {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        weight: data.weight,
        nationality: data.nationality,
        yearsActive: data.yearsActive,
        ridingStyle: data.ridingStyle || undefined,
        agreedToTerms: data.agreedToTerms,
        license,
        fitnessCertificate: fitness,
      },
      {
        // Jockey is NOT logged in — the account is PENDING admin approval.
        onSuccess: () => {
          toast.success(
            "Đăng ký thành công — tài khoản đang chờ quản trị viên (admin) duyệt.",
          );
          navigate("/login?pending=1");
        },
        onError: (err) =>
          applyApiErrorToForm(err, {
            toast,
            setError,
            fallback: "Đăng ký thất bại",
          }),
      },
    );
  };

  return (
    <AuthSplitLayout
      imageSide="left"
      image={jockeyImg}
      formMaxWidth="xl"
      panel={
        <div className="mt-auto">
          <h2 className="text-2xl font-semibold">🏅 Equine Elite</h2>
          <p className="mt-3 max-w-sm text-white/70">
            Join the premier platform for elite racing management. Register your
            credentials to access high-performance analytics and top-tier stable
            relations.
          </p>
        </div>
      }
    >
      <div>
        <h1 className="text-2xl font-semibold text-ink">Jockey Registration</h1>
        <p className="mt-2 text-sm text-muted">
          Complete your profile to gain access to the Jockey Portal.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex flex-col gap-5"
      >
        <Section icon="@" title="Account Credentials">
          <div className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              {...register("email")}
              error={errors.email?.message}
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
          </div>
        </Section>

        <Section icon="1" title="Personal Identity">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="First Name"
                {...register("firstName")}
                error={errors.firstName?.message}
              />
              <Input
                label="Last Name"
                {...register("lastName")}
                error={errors.lastName?.message}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Age"
                type="number"
                {...register("age")}
                error={errors.age?.message}
              />
              <Input
                label="Weight (kg)"
                type="number"
                {...register("weight")}
                error={errors.weight?.message}
              />
            </div>
            <Input
              label="Nationality"
              {...register("nationality")}
              error={errors.nationality?.message}
            />
          </div>
        </Section>

        <Section icon="2" title="Experience">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Years Active"
              type="number"
              {...register("yearsActive")}
              error={errors.yearsActive?.message}
            />

            <Select
              label="Primary Riding Style"
              options={RIDING_STYLE_OPTIONS}
              {...register("ridingStyle")}
              error={errors.ridingStyle?.message}
            />
          </div>
        </Section>

        <Section icon="3" title="Credentials">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UploadBox label="Jockey License Copy" onFile={setLicense} />
            <UploadBox
              label="Current Fitness Certificate"
              onFile={setFitness}
            />
          </div>
        </Section>

        <div className="flex flex-col gap-1">
          <Checkbox
            label="I agree to the Terms of Service and confirm my credentials are accurate."
            {...register("agreedToTerms")}
          />

          {errors.agreedToTerms && (
            <span className="text-xs text-danger">
              {errors.agreedToTerms.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/login" className="text-sm text-muted hover:text-ink">
            ← Back to Login
          </Link>
          <Button type="submit" loading={mutation.isPending}>
            Submit Registration
            <ArrowRight size={18} />
          </Button>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
