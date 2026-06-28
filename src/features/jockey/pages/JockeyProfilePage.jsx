import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { PageHeader } from "@/common/components/PageHeader";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Select,
  Skeleton,
  Textarea
} from "@/common/ui";
import { useAuth } from "@/common/hooks/useAuth";
import { useToast } from "@/common/providers/ToastProvider";
import { useJockeyDetail, useUpdateMyJockeyProfile } from "../hooks";
import { toUpdateJockeyProfileRequest } from "../api";
import { RIDING_STYLE_OPTIONS } from "../constants";
const numberField = z.string().optional().refine((v) => !v || !Number.isNaN(Number(v)), "Gi\xE1 tr\u1ECB kh\xF4ng h\u1EE3p l\u1EC7");
const schema = z.object({
  bodyWeight: numberField.refine((v) => !v || Number(v) > 0, "Ph\u1EA3i l\u1EDBn h\u01A1n 0"),
  heightCm: numberField.refine((v) => !v || Number(v) > 0, "Ph\u1EA3i l\u1EDBn h\u01A1n 0"),
  ridingStyle: z.string().optional(),
  baseFee: numberField.refine((v) => !v || Number(v) >= 0, "Kh\xF4ng \u0111\u01B0\u1EE3c \xE2m"),
  prizePercent: numberField.refine(
    (v) => !v || Number(v) >= 0 && Number(v) <= 100,
    "T\u1EEB 0 \u0111\u1EBFn 100"
  ),
  licenseNo: z.string().max(100, "T\u1ED1i \u0111a 100 k\xFD t\u1EF1").optional(),
  bio: z.string().max(1e3, "T\u1ED1i \u0111a 1000 k\xFD t\u1EF1").optional()
});
function str(n) {
  return n == null ? "" : String(n);
}
function JockeyProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const jockeyUserId = user?.id ?? "";
  const { data: detail, isPending, isError } = useJockeyDetail(jockeyUserId);
  const update = useUpdateMyJockeyProfile();
  const styleOptions = useMemo(() => {
    const opts = [
      { value: "", label: "\u2014 Ch\u1ECDn phong c\xE1ch \u2014" },
      ...RIDING_STYLE_OPTIONS.map((s) => ({ value: s, label: s }))
    ];
    const cur = detail?.ridingStyle;
    if (cur && !RIDING_STYLE_OPTIONS.includes(cur)) {
      opts.push({ value: cur, label: cur });
    }
    return opts;
  }, [detail]);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    // `values` (not defaultValues) so the form re-syncs once the GET resolves.
    values: {
      bodyWeight: str(detail?.bodyWeight ?? null),
      heightCm: str(detail?.heightCm ?? null),
      ridingStyle: detail?.ridingStyle ?? "",
      baseFee: str(detail?.baseFee ?? null),
      prizePercent: str(detail?.prizePercent ?? null),
      licenseNo: detail?.licenseNo ?? "",
      bio: detail?.bio ?? ""
    }
  });
  const onSubmit = (data) => {
    const body = toUpdateJockeyProfileRequest({
      bodyWeight: data.bodyWeight ? Number(data.bodyWeight) : void 0,
      heightCm: data.heightCm ? Number(data.heightCm) : void 0,
      baseFee: data.baseFee ? Number(data.baseFee) : void 0,
      prizePercent: data.prizePercent ? Number(data.prizePercent) : void 0,
      ridingStyle: data.ridingStyle,
      bio: data.bio,
      licenseNo: data.licenseNo
    });
    const cleared = [];
    const wasCleared = (formVal, detailVal, label) => {
      const blank = !formVal || !String(formVal).trim();
      const had = detailVal != null && String(detailVal).trim() !== "";
      if (blank && had) cleared.push(label);
    };
    wasCleared(data.bodyWeight, detail?.bodyWeight, "C\xE2n n\u1EB7ng");
    wasCleared(data.heightCm, detail?.heightCm, "Chi\u1EC1u cao");
    wasCleared(data.ridingStyle, detail?.ridingStyle, "Phong c\xE1ch \u0111ua");
    wasCleared(data.baseFee, detail?.baseFee, "Ph\xED thu\xEA c\u01A1 b\u1EA3n");
    wasCleared(data.prizePercent, detail?.prizePercent, "% chia th\u01B0\u1EDFng");
    wasCleared(data.licenseNo, detail?.licenseNo, "S\u1ED1 gi\u1EA5y ph\xE9p");
    wasCleared(data.bio, detail?.bio, "Gi\u1EDBi thi\u1EC7u");
    update.mutate(body, {
      onSuccess: () => {
        if (cleared.length) {
          toast.info(`\u0110\xE3 l\u01B0u. Kh\xF4ng th\u1EC3 xo\xE1 tr\u1EAFng: ${cleared.join(", ")} \u2014 gi\u1EEF gi\xE1 tr\u1ECB c\u0169.`);
        } else {
          toast.success("\u0110\xE3 c\u1EADp nh\u1EADt h\u1ED3 s\u01A1");
        }
      },
      onError: (err) => toast.error(errorMessage(err))
    });
  };
  return <>
      <PageHeader
    title="Hồ sơ nài"
    subtitle="Chủ ngựa chọn nài dựa trên các thông tin này — hãy giữ chúng chính xác."
  />

      {isPending ? <ProfileSkeleton /> : isError || !detail ? <EmptyState
    title="Không tải được hồ sơ"
    description="Vui lòng tải lại trang để thử lại."
  /> : <div className="grid gap-6 lg:grid-cols-3">
          {
    /* LEFT — editable professional info */
  }
          <div className="lg:col-span-2">
            <Card>
              <CardBody>
                <h2 className="mb-4 font-semibold text-ink">Thông tin nghề nghiệp</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
    type="number"
    step="0.01"
    label="Cân nặng (kg)"
    {...register("bodyWeight")}
    error={errors.bodyWeight?.message}
  />
                    <Input
    type="number"
    step="0.01"
    label="Chiều cao (cm)"
    {...register("heightCm")}
    error={errors.heightCm?.message}
  />
                    <Select
    label="Phong cách đua"
    options={styleOptions}
    {...register("ridingStyle")}
    error={errors.ridingStyle?.message}
  />
                    <Input
    label="Số giấy phép"
    {...register("licenseNo")}
    error={errors.licenseNo?.message}
  />
                    <Input
    type="number"
    step="0.01"
    label="Phí thuê cơ bản ($)"
    {...register("baseFee")}
    error={errors.baseFee?.message}
  />
                    <Input
    type="number"
    step="0.01"
    label="% chia thưởng"
    {...register("prizePercent")}
    error={errors.prizePercent?.message}
  />
                  </div>
                  <Textarea label="Giới thiệu" rows={4} {...register("bio")} error={errors.bio?.message} />
                  <div className="flex justify-end">
                    <Button type="submit" loading={update.isPending}>
                      Lưu thay đổi
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>

          {
    /* RIGHT — read-only identity + career (not editable here) */
  }
          <aside>
            <Card>
              <CardBody className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <Avatar name={detail.fullName} src={detail.avatarUrl ?? void 0} size={56} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{detail.fullName}</p>
                    <Badge tone="success">{detail.status}</Badge>
                  </div>
                </div>

                <dl className="flex flex-col gap-3 text-sm">
                  <ReadOnly label="Email" value={detail.email} />
                  <ReadOnly label="Điện thoại" value={detail.phone} />
                  <ReadOnly
    label="Win Rate"
    value={detail.winRate != null ? `${detail.winRate}%` : "\u2014"}
  />
                  <ReadOnly label="Career Wins" value={detail.winCount ?? "\u2014"} />
                  <ReadOnly
    label="Kinh nghiệm"
    value={detail.experienceYrs != null ? `${detail.experienceYrs} n\u0103m` : "\u2014"}
  />
                  <ReadOnly label="Đánh giá" value={detail.rating != null ? `${detail.rating} / 5` : "\u2014"} />
                  <ReadOnly label="Cúp gần nhất" value={detail.lastTrophy ?? "\u2014"} />
                </dl>
                <p className="text-xs text-muted">
                  Các chỉ số này do hệ thống tính, không sửa tại đây.
                </p>
              </CardBody>
            </Card>
          </aside>
        </div>}
    </>;
}
function ReadOnly({ label, value }) {
  return <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>;
}
function ProfileSkeleton() {
  return <div className="grid gap-6 lg:grid-cols-3">
      <Skeleton className="h-96 w-full rounded-2xl lg:col-span-2" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>;
}
function errorMessage(err) {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 409) return "S\u1ED1 gi\u1EA5y ph\xE9p \u0111\xE3 t\u1ED3n t\u1EA1i. Vui l\xF2ng d\xF9ng s\u1ED1 kh\xE1c.";
    if (status === 400) return "C\u1EADp nh\u1EADt th\u1EA5t b\u1EA1i, vui l\xF2ng ki\u1EC3m tra l\u1EA1i c\xE1c tr\u01B0\u1EDDng.";
  }
  return "C\u1EADp nh\u1EADt th\u1EA5t b\u1EA1i. Vui l\xF2ng th\u1EED l\u1EA1i.";
}
export {
  JockeyProfilePage as default
};
