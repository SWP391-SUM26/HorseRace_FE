import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MailCheck } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/common/ui";
import horse from "../../assets/Jockey preparing for race.png";
import { useVerifyEmail, useRequestEmailVerification } from "./hooks";
import { AuthSplitLayout } from "./components/AuthSplitLayout";
import { CodeInput } from "./components/CodeInput";

const RESEND_COOLDOWN = 30;

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const verify = useVerifyEmail();
  const requestCode = useRequestEmailVerification();
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const onResend = () =>
    requestCode.mutate(
      { email },
      {
        onSuccess: () => {
          setCooldown(RESEND_COOLDOWN);
          toast.success("Đã gửi lại mã xác thực");
        },
        onError: () => toast.error("Không gửi lại được, thử lại sau"),
      }
    );

  const onSubmit = () => {
    if (code.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 chữ số");
      return;
    }
    verify.mutate(
      { email, code },
      {
        onSuccess: () => {
          toast.success("Xác thực email thành công");
          navigate("/");
        },
        onError: () => toast.error("Mã không đúng hoặc đã hết hạn"),
      }
    );
  };

  if (!email) {
    return (
      <AuthSplitLayout imageSide="left" image={horse}>
        <div>
          <h1 className="text-2xl font-semibold text-ink">Thiếu thông tin email</h1>
          <p className="mt-2 text-sm text-muted">
            Không tìm thấy email cần xác thực. Vui lòng đăng ký lại.
          </p>
          <Link
            to="/owner-register"
            className="mt-6 inline-block font-medium text-brand-700 hover:underline"
          >
            ← Về trang đăng ký
          </Link>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      imageSide="left"
      image={horse}
      panel={
        <div className="mt-auto">
          <h2 className="text-xl font-semibold">Xác thực để hoàn tất</h2>
          <p className="mt-3 max-w-sm text-white/70">
            Một mã xác thực 6 chữ số đã được gửi tới email của bạn. Xác thực
            email giúp bảo vệ tài khoản và mở khóa toàn bộ tính năng của Equine
            Elite.
          </p>
        </div>
      }
    >
      <div>
        <h1 className="text-2xl font-semibold text-ink">Xác thực Email</h1>
        <p className="mt-2 text-sm text-muted">
          Chúng tôi đã gửi mã 6 chữ số tới{" "}
          <span className="font-medium text-ink">{email}</span>. Nhập mã bên
          dưới để hoàn tất đăng ký.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wide text-muted">
              Mã xác thực
            </label>
            <button
              type="button"
              onClick={onResend}
              disabled={requestCode.isPending || cooldown > 0}
              className="text-sm text-brand-700 hover:underline disabled:opacity-50"
            >
              {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại mã"}
            </button>
          </div>
          <CodeInput value={code} onChange={setCode} />
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full"
          loading={verify.isPending}
          onClick={onSubmit}
        >
          <MailCheck size={18} />
          Xác thực Email
        </Button>
      </div>

      <div className="mt-6 text-center text-sm">
        <Link to="/login" className="text-muted hover:text-ink">
          ← Về trang đăng nhập
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
