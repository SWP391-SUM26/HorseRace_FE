import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button, Card, Checkbox, Input, Textarea } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { applyApiErrorToForm } from "@/common/lib/apiError";
import { useRegisterOwner } from "../hooks";
import { emailField, passwordField, phoneFieldRequired } from "../validation";
import { AuthShell } from "../components/AuthShell";

const schema = z
  .object({
    fullName: z.string().trim().min(1, "Vui long nhap ho ten"),
    email: emailField,
    contactNumber: phoneFieldRequired,
    primaryRegion: z.string().trim().min(1, "Vui long nhap khu vuc"),
    stableName: z.string().trim().min(1, "Vui long nhap ten stable"),
    password: passwordField,
    confirmPassword: z.string(),
    bio: z.string().trim().min(1, "Vui long nhap bio"),
    agreedToTerms: z.boolean().refine(Boolean, "Ban can dong y dieu khoan"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mat khau khong khop",
  });

export default function OwnerRegistrationPage() {
  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { agreedToTerms: false },
  });
  const mutation = useRegisterOwner();
  const toast = useToast();
  const navigate = useNavigate();

  const onSubmit = (data) =>
    mutation.mutate(data, {
      onSuccess: () => {
        toast.success("Dang ky owner thanh cong. Vui long dang nhap.");
        navigate("/login");
      },
      onError: (error) => applyApiErrorToForm(error, { toast, setError, fallback: "Dang ky owner that bai" }),
    });

  return (
    <AuthShell>
      <div className="w-full max-w-5xl">
        <Card className="grid overflow-hidden md:grid-cols-2">
          <div className="flex flex-col bg-brand-800 p-8 text-white">
            <h2 className="text-3xl font-semibold">Owner Registration</h2>
            <p className="mt-3 text-white/70">Register as an Owner to access stable management and jockey marketplace.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 bg-surface p-8">
            <Input label="Full Legal Name" {...register("fullName")} error={errors.fullName?.message} />
            <Input label="Email Address" type="email" {...register("email")} error={errors.email?.message} />
            <Input label="Contact Number" {...register("contactNumber")} error={errors.contactNumber?.message} />
            <Input label="Primary Region" {...register("primaryRegion")} error={errors.primaryRegion?.message} />
            <Input label="Stable Name" {...register("stableName")} error={errors.stableName?.message} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
              <Input label="Confirm Password" type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
            </div>
            <Textarea label="Professional Credentials" {...register("bio")} error={errors.bio?.message} />
            <Checkbox label="I agree to the Terms of Service and confirm ownership credentials." {...register("agreedToTerms")} />
            {errors.agreedToTerms && <span className="text-xs text-danger">{errors.agreedToTerms.message}</span>}
            <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>Register Account <ArrowRight size={18} /></Button>
          </form>
        </Card>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account? <Link to="/login" className="font-medium text-brand-700 hover:underline">Sign In</Link>
        </p>
      </div>
    </AuthShell>
  );
}
