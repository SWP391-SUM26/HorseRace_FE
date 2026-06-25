import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Crown, Trophy, Users } from "lucide-react";
import toast from "react-hot-toast";

import { Button, Input, Checkbox } from "@/common/ui";
import { useAuth } from "@/common/hooks/useAuth";
import { loginWithCredentials } from "../../services/auth";
import horse from "../../assets/login.jpg";
import { emailField } from "./validation";
import { AuthSplitLayout } from "./components/AuthSplitLayout";

const schema = z.object({
  email: emailField,
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

const roleRedirects = {
  Admin: "/admin/users",
  Owner: "/owner-dashboard",
  Jockey: "/jockey-dashboard",
  Referee: "/referee/dashboard",
  Spectator: "/spectator-dashboard",
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const session = await loginWithCredentials(data.email, data.password, true);
      login(session.user, session.accessToken);
      toast.success("Đăng nhập thành công");
      navigate(roleRedirects[session.user.role] || "/");
    } catch (error) {
      toast.error(error.message || "Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      imageSide="right"
      image={horse}
      panel={
        <div className="flex h-full items-end">
          <span className="text-2xl font-semibold text-white/80">
            Equine Elite
          </span>
        </div>
      }
    >
      <div>
        <h1 className="text-xl font-semibold text-brand-800">Equine Elite</h1>
        <p className="mt-1 text-sm text-muted">
          Sign in to access Elite Management dashboard
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex flex-col gap-4"
      >
        <Input
          label="Email Address / Username"
          type="email"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />

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
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-[34px] text-muted hover:text-ink"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Checkbox label="Remember Me" />
          <Link to="/forgot-password" className="text-sm text-brand-700 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Login
          <ArrowRight size={18} />
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        Or sign up as
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Link to="/owner-register">
          <Button
            variant="secondary"
            className="w-full"
            leftIcon={<Crown size={16} />}
          >
            Owner
          </Button>
        </Link>
        <Link to="/jockey-register">
          <Button
            variant="secondary"
            className="w-full"
            leftIcon={<Trophy size={16} />}
          >
            Jockey
          </Button>
        </Link>
        <Link to="/spectator-register">
          <Button
            variant="secondary"
            className="w-full"
            leftIcon={<Users size={16} />}
          >
            Spectator
          </Button>
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
