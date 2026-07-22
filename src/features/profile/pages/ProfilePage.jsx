import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/common/components/PageHeader";
import { Button, Card, CardBody, Input, Avatar } from "@/common/ui";
import { useAuth } from "@/common/hooks/useAuth";
import { useToast } from "@/common/providers/ToastProvider";
import { ROLE_LABELS } from "@/common/config/roles";
import { useUpdateProfile, useUploadAvatar } from "../hooks";

const schema = z.object({
  fullName: z.string().min(1, "Nhập họ tên"),
  phone: z
    .string()
    .regex(/^$|^\+?[0-9\-\s]{7,30}$/, "Số điện thoại không hợp lệ")
    .optional()
    .default(""),
});

export default function ProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const update = useUpdateProfile();
  const avatar = useUploadAvatar();
  const [file, setFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    values: { fullName: user?.fullName ?? "", phone: user?.phone ?? "" },
  });

  const onSubmit = (data) =>
    update.mutate(data, {
      onSuccess: () => toast.success("Đã cập nhật hồ sơ"),
      onError: () => toast.error("Cập nhật thất bại"),
    });

  const onUpload = () => {
    if (!file) {
      toast.error("Chọn ảnh trước");
      return;
    }
    avatar.mutate(file, {
      onSuccess: () => {
        toast.success("Đã cập nhật ảnh đại diện");
        setFile(null);
      },
      onError: () => toast.error("Tải ảnh thất bại"),
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Hồ sơ cá nhân"
        subtitle="Cập nhật thông tin tài khoản của bạn."
      />
      <Card>
        <CardBody className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar
              name={user?.fullName ?? "?"}
              src={user?.avatarUrl}
              size={64}
            />
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="text-sm text-muted"
              />
              <Button
                size="sm"
                variant="secondary"
                loading={avatar.isPending}
                onClick={onUpload}
              >
                Tải ảnh lên
              </Button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              label="Họ và tên"
              {...register("fullName")}
              error={errors.fullName?.message}
            />
            <Input
              label="Số điện thoại"
              {...register("phone")}
              error={errors.phone?.message}
            />
            <Input label="Email" value={user?.email ?? ""} disabled readOnly />
            <Input
              label="Vai trò"
              value={user ? ROLE_LABELS[user.role] : ""}
              disabled
              readOnly
            />
            <Button type="submit" size="lg" loading={update.isPending}>
              Lưu thay đổi
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
