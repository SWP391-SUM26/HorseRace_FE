import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button, Checkbox, Input, Select } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import jockeyImg from "@/assets/jockey.png";
import { applyApiErrorToForm } from "@/common/lib/apiError";
import { useRegisterJockey } from "../hooks";
import { emailField, passwordField } from "../validation";
import { AuthSplitLayout } from "../components/AuthSplitLayout";
import { UploadBox } from "../components/UploadBox";

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? undefined : Number(value)),
  z.number().optional(),
);

const schema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
    firstName: z.string().min(1, "Vui long nhap ten"),
    lastName: z.string().min(1, "Vui long nhap ho"),
    age: optionalNumber,
    weight: optionalNumber,
    nationality: z.string().trim().min(1, "Vui long nhap quoc tich"),
    yearsActive: optionalNumber,
    ridingStyle: z.string().optional(),
    agreedToTerms: z.boolean().refine(Boolean, "Ban can dong y dieu khoan"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mat khau khong khop",
  });

function Section({ icon, title, children }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">{icon}</span>
        <h2 className="font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function JockeyRegistrationPage() {
  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { ridingStyle: "Flat", agreedToTerms: false },
  });
  const [license, setLicense] = useState(null);
  const [fitnessCertificate, setFitnessCertificate] = useState(null);
  const mutation = useRegisterJockey();
  const toast = useToast();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    if (!license || !fitnessCertificate) {
      toast.error("Vui long tai len license va fitness certificate");
      return;
    }
    mutation.mutate(
      { ...data, license, fitnessCertificate },
      {
        onSuccess: () => {
          toast.success("Your account is pending referee approval.");
          navigate("/login?pending=1");
        },
        onError: (error) => applyApiErrorToForm(error, { toast, setError, fallback: "Dang ky jockey that bai" }),
      },
    );
  };

  return (
    <AuthSplitLayout imageSide="left" image={jockeyImg} formMaxWidth="xl">
      <h1 className="text-2xl font-semibold text-ink">Jockey Registration</h1>
      <p className="mt-2 text-sm text-muted">Complete your profile to gain access to the Jockey Portal.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <Section icon="@" title="Account Credentials">
          <div className="flex flex-col gap-4">
            <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
              <Input label="Confirm Password" type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
            </div>
          </div>
        </Section>
        <Section icon="1" title="Personal Identity">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First Name" {...register("firstName")} error={errors.firstName?.message} />
            <Input label="Last Name" {...register("lastName")} error={errors.lastName?.message} />
            <Input label="Age" type="number" {...register("age")} error={errors.age?.message} />
            <Input label="Weight (kg)" type="number" {...register("weight")} error={errors.weight?.message} />
            <Input label="Nationality" {...register("nationality")} error={errors.nationality?.message} />
          </div>
        </Section>
        <Section icon="2" title="Experience">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Years Active" type="number" {...register("yearsActive")} error={errors.yearsActive?.message} />
            <Select label="Primary Riding Style" {...register("ridingStyle")} options={[
              { value: "Flat", label: "Flat" },
              { value: "Jump", label: "Jump" },
              { value: "Harness", label: "Harness" },
              { value: "Endurance", label: "Endurance" },
            ]} />
          </div>
        </Section>
        <Section icon="3" title="Credentials">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UploadBox label="Jockey License Copy" onFile={setLicense} />
            <UploadBox label="Current Fitness Certificate" onFile={setFitnessCertificate} />
          </div>
        </Section>
        <Checkbox label="I agree to the Terms of Service and confirm my credentials are accurate." {...register("agreedToTerms")} />
        {errors.agreedToTerms && <span className="text-xs text-danger">{errors.agreedToTerms.message}</span>}
        <div className="flex items-center justify-between">
          <Link to="/login" className="text-sm text-muted hover:text-ink">Back to Login</Link>
          <Button type="submit" loading={mutation.isPending}>Submit Registration <ArrowRight size={18} /></Button>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
