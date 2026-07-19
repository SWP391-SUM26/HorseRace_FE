import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Crown, Eye, EyeOff, Trophy, Users } from "lucide-react";
import { Button, Checkbox, Input } from "@/common/ui";
import { useAuth } from "@/common/hooks/useAuth";
import { useToast } from "@/common/providers/ToastProvider";
import horse from "@/assets/auth-horse.jpg";
import { useLogin } from "../hooks";
import { emailField } from "../validation";
import { AuthSplitLayout } from "../components/AuthSplitLayout";

const schema = z.object({
  email: emailField,
  password: z.string().min(1, "Vui long nhap mat khau"),
  rememberMe: z.boolean().optional(),
});

const ROLE_REDIRECTS = {
  Admin: "/admin/dashboard",
  ADMIN: "/admin/dashboard",
  Owner: "/owner/overview",
  OWNER: "/owner/overview",
  HORSE_OWNER: "/owner/overview",
  Jockey: "/jockey-dashboard",
  JOCKEY: "/jockey-dashboard",
  Referee: "/referee/dashboard",
  RACE_REFEREE: "/referee/dashboard",
  Spectator: "/spectator-dashboard",
  SPECTATOR: "/spectator-dashboard",
};

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: false },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [params] = useSearchParams();
  const mutation = useLogin();
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const onSubmit = (data) =>
    mutation.mutate(data, {
      onSuccess: (session) => {
        login(session.user, session.accessToken);
        toast.success("Dang nhap thanh cong");
        navigate(ROLE_REDIRECTS[session.user.role] ?? "/");
      },
      onError: (error) => toast.error(error.message || "Dang nhap that bai"),
    });

  return (
    <AuthSplitLayout imageSide="right" image={horse}>
      <div>
        <h1 className="text-xl font-semibold text-brand-800">Equine Elite</h1>
        <p className="mt-1 text-sm text-muted">Sign in to access Elite Management dashboard</p>
        {params.get("pending") && (
          <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            Your account is awaiting referee approval.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <Input label="Email Address / Username" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="pr-10"
            {...register("password")}
            error={errors.password?.message}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-[34px] text-muted hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <Checkbox label="Remember Me" {...register("rememberMe")} />
          <Link to="/forgot" className="text-sm text-brand-700 hover:underline">Forgot Password?</Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
          Login <ArrowRight size={18} />
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        Or sign up as
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link to="/register/owner"><Button variant="secondary" className="w-full" leftIcon={<Crown size={16} />}>Owner</Button></Link>
        <Link to="/register/jockey"><Button variant="secondary" className="w-full" leftIcon={<Trophy size={16} />}>Jockey</Button></Link>
        <Link to="/register/spectator"><Button variant="secondary" className="w-full" leftIcon={<Users size={16} />}>Spectator</Button></Link>
      </div>
    </AuthSplitLayout>
  );
}
