import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Checkbox, Input } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { applyApiErrorToForm } from "@/common/lib/apiError";
import { useRegisterSpectator } from "../hooks";
import { emailField, passwordField, phoneFieldOptional } from "../validation";
import { AuthShell } from "../components/AuthShell";

const schema = z
  .object({
    fullName: z.string().min(1, "Vui long nhap ho ten"),
    email: emailField,
    phone: phoneFieldOptional,
    password: passwordField,
    confirmPassword: z.string(),
    agreedToTerms: z.boolean().refine(Boolean, "Ban can dong y dieu khoan"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mat khau khong khop",
  });

export default function SpectatorRegistrationPage() {
  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { agreedToTerms: false },
  });
  const mutation = useRegisterSpectator();
  const toast = useToast();
  const navigate = useNavigate();

  const onSubmit = (data) =>
    mutation.mutate(data, {
      onSuccess: () => {
        toast.success("Dang ky spectator thanh cong. Vui long dang nhap.");
        navigate("/login");
      },
      onError: (error) => applyApiErrorToForm(error, { toast, setError, fallback: "Dang ky spectator that bai" }),
    });

  return (
    <AuthShell>
      <div className="w-full max-w-3xl">
        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-ink">Create Spectator Account</h1>
            <Input label="Full Name" {...register("fullName")} error={errors.fullName?.message} />
            <Input label="Email Address" type="email" {...register("email")} error={errors.email?.message} />
            <Input label="Phone Number" {...register("phone")} error={errors.phone?.message} />
            <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
            <Input label="Confirm Password" type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
            <Checkbox label="I agree to the Terms of Service and Privacy Policy." {...register("agreedToTerms")} />
            {errors.agreedToTerms && <span className="text-xs text-danger">{errors.agreedToTerms.message}</span>}
            <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>Create Spectator Account</Button>
          </form>
        </Card>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account? <Link to="/login" className="font-medium text-brand-700 hover:underline">Sign In</Link>
        </p>
      </div>
    </AuthShell>
  );
}
