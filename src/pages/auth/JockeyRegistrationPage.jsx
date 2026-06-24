import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Upload } from "lucide-react";
import toast from "react-hot-toast";

import { Button, Input, Select } from "@/common/ui";
import { loginWithCredentials } from "../../services/auth";
import jockeyImg from "../../assets/Jockey preparing for race.png";
import { useRegisterJockey, useRequestEmailVerification } from "./hooks";
import { emailField, passwordField } from "./validation";
import { AuthSplitLayout } from "./components/AuthSplitLayout";

const optionalNumber = z
  .union([z.string(), z.number()])
  .transform((v) =>
    v === "" || v === undefined || v === null ? undefined : Number(v)
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
    nationality: z.string().optional(),
    yearsActive: optionalNumber,
    ridingStyle: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu không khớp",
  });

const NATIONALITY_OPTIONS = [
  { value: "", label: "Select your nationality" },
  { value: "VN", label: "Vietnam" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "IE", label: "Ireland" },
  { value: "FR", label: "France" },
  { value: "AU", label: "Australia" },
  { value: "JP", label: "Japan" },
];

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

function UploadBox({ label }) {
  const ref = useRef(null);
  const [fileName, setFileName] = useState(null);
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      className="flex w-full flex-col items-center rounded-lg border-2 border-dashed border-border p-6 text-center hover:bg-subtle"
    >
      <Upload size={20} className="text-muted" />
      <span className="mt-2 text-sm font-medium text-ink">{label}</span>
      <span className="mt-1 text-xs text-muted">
        {fileName ?? "Upload a file or drag and drop"}
      </span>
      <span className="mt-1 text-xs text-muted">PDF, PNG, JPG up to 10MB</span>
      <input
        ref={ref}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
    </button>
  );
}

export default function JockeyRegistrationPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useRegisterJockey();
  const requestVerification = useRequestEmailVerification();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    mutation.mutate(
      {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        weight: data.weight,
        nationality: data.nationality || undefined,
        yearsActive: data.yearsActive,
        ridingStyle: data.ridingStyle || undefined,
        jockeyLicenseUrl: undefined,
        fitnessCertificateUrl: undefined,
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

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
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
                label="Weight Class (lbs)"
                type="number"
                {...register("weight")}
                error={errors.weight?.message}
              />
            </div>
            <Select
              label="Nationality"
              options={NATIONALITY_OPTIONS}
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
            <UploadBox label="Jockey License Copy" />
            <UploadBox label="Current Fitness Certificate" />
          </div>
        </Section>

        <div className="flex items-center justify-between">
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
