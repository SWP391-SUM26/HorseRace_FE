import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { PageHeader } from '@/common/components/PageHeader';
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
  Textarea,
} from '@/common/ui';
import { useAuth } from '@/common/hooks/useAuth';
import { useToast } from '@/common/providers/ToastProvider';
import { useJockeyDetail, useUpdateMyJockeyProfile } from '../hooks';
import { toUpdateJockeyProfileRequest } from '../api';
import { RIDING_STYLE_OPTIONS } from '../constants';

// Numeric fields are kept as STRINGS in the form (HTML number inputs yield
// strings); ranges are validated by parsing, and the submit handler converts.
const numberField = z
  .string()
  .optional()
  .refine((v) => !v || !Number.isNaN(Number(v)), 'Giá trị không hợp lệ');

const schema = z.object({
  bodyWeight: numberField.refine((v) => !v || Number(v) > 0, 'Phải lớn hơn 0'),
  heightCm: numberField.refine((v) => !v || Number(v) > 0, 'Phải lớn hơn 0'),
  ridingStyle: z.string().optional(),
  baseFee: numberField.refine((v) => !v || Number(v) >= 0, 'Không được âm'),
  prizePercent: numberField.refine(
    (v) => !v || (Number(v) >= 0 && Number(v) <= 100),
    'Từ 0 đến 100',
  ),
  licenseNo: z.string().max(100, 'Tối đa 100 ký tự').optional(),
  bio: z.string().max(1000, 'Tối đa 1000 ký tự').optional(),
});
type Form = z.infer<typeof schema>;

function str(n: number | null): string {
  return n == null ? '' : String(n);
}

export default function JockeyProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const jockeyUserId = user?.id ?? '';
  const { data: detail, isPending, isError } = useJockeyDetail(jockeyUserId);
  const update = useUpdateMyJockeyProfile();

  const styleOptions = useMemo(() => {
    const opts = [
      { value: '', label: '— Chọn phong cách —' },
      ...RIDING_STYLE_OPTIONS.map((s) => ({ value: s, label: s })),
    ];
    const cur = detail?.ridingStyle;
    if (cur && !RIDING_STYLE_OPTIONS.includes(cur as (typeof RIDING_STYLE_OPTIONS)[number])) {
      opts.push({ value: cur, label: cur });
    }
    return opts;
  }, [detail]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    // `values` (not defaultValues) so the form re-syncs once the GET resolves.
    values: {
      bodyWeight: str(detail?.bodyWeight ?? null),
      heightCm: str(detail?.heightCm ?? null),
      ridingStyle: detail?.ridingStyle ?? '',
      baseFee: str(detail?.baseFee ?? null),
      prizePercent: str(detail?.prizePercent ?? null),
      licenseNo: detail?.licenseNo ?? '',
      bio: detail?.bio ?? '',
    },
  });

  const onSubmit = (data: Form) => {
    const body = toUpdateJockeyProfileRequest({
      bodyWeight: data.bodyWeight ? Number(data.bodyWeight) : undefined,
      heightCm: data.heightCm ? Number(data.heightCm) : undefined,
      baseFee: data.baseFee ? Number(data.baseFee) : undefined,
      prizePercent: data.prizePercent ? Number(data.prizePercent) : undefined,
      ridingStyle: data.ridingStyle,
      bio: data.bio,
      licenseNo: data.licenseNo,
    });

    // PUT /jockeys/me is PARTIAL — it cannot null-out a field. If the user blanked
    // a field that previously had a value, that change is silently ignored by the
    // server (the value snaps back), so warn rather than claim a clean success.
    const cleared: string[] = [];
    const wasCleared = (formVal: string | undefined, detailVal: unknown, label: string) => {
      const blank = !formVal || !String(formVal).trim();
      const had = detailVal != null && String(detailVal).trim() !== '';
      if (blank && had) cleared.push(label);
    };
    wasCleared(data.bodyWeight, detail?.bodyWeight, 'Cân nặng');
    wasCleared(data.heightCm, detail?.heightCm, 'Chiều cao');
    wasCleared(data.ridingStyle, detail?.ridingStyle, 'Phong cách đua');
    wasCleared(data.baseFee, detail?.baseFee, 'Phí thuê cơ bản');
    wasCleared(data.prizePercent, detail?.prizePercent, '% chia thưởng');
    wasCleared(data.licenseNo, detail?.licenseNo, 'Số giấy phép');
    wasCleared(data.bio, detail?.bio, 'Giới thiệu');

    update.mutate(body, {
      onSuccess: () => {
        if (cleared.length) {
          toast.info(`Đã lưu. Không thể xoá trắng: ${cleared.join(', ')} — giữ giá trị cũ.`);
        } else {
          toast.success('Đã cập nhật hồ sơ');
        }
      },
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  return (
    <>
      <PageHeader
        title="Hồ sơ nài"
        subtitle="Chủ ngựa chọn nài dựa trên các thông tin này — hãy giữ chúng chính xác."
      />

      {isPending ? (
        <ProfileSkeleton />
      ) : isError || !detail ? (
        <EmptyState
          title="Không tải được hồ sơ"
          description="Vui lòng tải lại trang để thử lại."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT — editable professional info */}
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
                      {...register('bodyWeight')}
                      error={errors.bodyWeight?.message}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      label="Chiều cao (cm)"
                      {...register('heightCm')}
                      error={errors.heightCm?.message}
                    />
                    <Select
                      label="Phong cách đua"
                      options={styleOptions}
                      {...register('ridingStyle')}
                      error={errors.ridingStyle?.message}
                    />
                    <Input
                      label="Số giấy phép"
                      {...register('licenseNo')}
                      error={errors.licenseNo?.message}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      label="Phí thuê cơ bản ($)"
                      {...register('baseFee')}
                      error={errors.baseFee?.message}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      label="% chia thưởng"
                      {...register('prizePercent')}
                      error={errors.prizePercent?.message}
                    />
                  </div>
                  <Textarea label="Giới thiệu" rows={4} {...register('bio')} error={errors.bio?.message} />
                  <div className="flex justify-end">
                    <Button type="submit" loading={update.isPending}>
                      Lưu thay đổi
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>

          {/* RIGHT — read-only identity + career (not editable here) */}
          <aside>
            <Card>
              <CardBody className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <Avatar name={detail.fullName} src={detail.avatarUrl ?? undefined} size={56} />
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
                    value={detail.winRate != null ? `${detail.winRate}%` : '—'}
                  />
                  <ReadOnly label="Career Wins" value={detail.winCount ?? '—'} />
                  <ReadOnly
                    label="Kinh nghiệm"
                    value={detail.experienceYrs != null ? `${detail.experienceYrs} năm` : '—'}
                  />
                  <ReadOnly label="Đánh giá" value={detail.rating != null ? `${detail.rating} / 5` : '—'} />
                  <ReadOnly label="Cúp gần nhất" value={detail.lastTrophy ?? '—'} />
                </dl>
                <p className="text-xs text-muted">
                  Các chỉ số này do hệ thống tính, không sửa tại đây.
                </p>
              </CardBody>
            </Card>
          </aside>
        </div>
      )}
    </>
  );
}

function ReadOnly({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Skeleton className="h-96 w-full rounded-2xl lg:col-span-2" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}

/** Friendly toast text. license_no is UNIQUE → a real duplicate surfaces as 409;
 *  a bare 400 is a generic validation failure (could be any field), so don't
 *  misattribute it to the license number. */
function errorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 409) return 'Số giấy phép đã tồn tại. Vui lòng dùng số khác.';
    if (status === 400) return 'Cập nhật thất bại, vui lòng kiểm tra lại các trường.';
  }
  return 'Cập nhật thất bại. Vui lòng thử lại.';
}
