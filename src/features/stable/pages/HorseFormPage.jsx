import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button, Card, CardBody, Input, Select } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { useCreateHorse, useUpdateHorse, useHorse } from "../hooks";

const schema = z.object({
  name: z.string().min(1, "Nhập tên ngựa"),
  gender: z.enum(["MALE", "FEMALE", "GELDING"]),
  breed: z.string().optional().default(""),
  color: z.string().optional().default(""),
  dateOfBirth: z.string().optional().default(""),
  weight: z.string().optional().default(""),
  originCountry: z.string().optional().default(""),
  microchipNo: z.string().optional().default(""),
  healthStatus: z.string().optional().default(""),
  registrationStatus: z.string().optional().default(""),
  status: z.string().optional().default(""),
});

const GENDER_OPTS = [
  { value: "MALE", label: "Đực (Male)" },
  { value: "FEMALE", label: "Cái (Female)" },
  { value: "GELDING", label: "Thiến (Gelding)" },
];

const HEALTH_OPTS = [
  { value: "", label: "—" },
  { value: "HEALTHY", label: "Khoẻ mạnh (Healthy)" },
  { value: "INJURED", label: "Chấn thương (Injured)" },
  { value: "QUARANTINE", label: "Cách ly (Quarantine)" },
  { value: "UNFIT", label: "Không đủ điều kiện (Unfit)" },
];

const STATUS_OPTS = [
  { value: "", label: "—" },
  { value: "ACTIVE", label: "Hoạt động (Active)" },
  { value: "RETIRED", label: "Giải nghệ (Retired)" },
  { value: "INACTIVE", label: "Ngừng (Inactive)" },
];

export default function HorseFormPage({ mode }) {
  const { horseId = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [image, setImage] = useState(null);

  const editing = mode === "edit";
  const raw = useHorse(editing ? horseId : "");
  const createM = useCreateHorse();
  const updateM = useUpdateHorse(horseId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    values:
      editing && raw.data
        ? {
            name: raw.data.name,
            gender: raw.data.gender ?? "MALE",
            breed: raw.data.breed ?? "",
            color: raw.data.color ?? "",
            dateOfBirth: raw.data.dateOfBirth ?? "",
            weight: raw.data.weight != null ? String(raw.data.weight) : "",
            originCountry: raw.data.originCountry ?? "",
            microchipNo: raw.data.microchipNo ?? "", // from microchip, NEVER horseCode
            healthStatus: raw.data.healthStatus ?? "",
            registrationStatus: raw.data.registrationStatus ?? "",
            status: raw.data.status ?? "",
          }
        : undefined,
  });

  const onSubmit = (data) => {
    if (editing) {
      updateM.mutate(data, {
        onSuccess: () => {
          toast.success("Đã cập nhật ngựa");
          navigate(`/owner/stable/${horseId}`);
        },
        onError: () => toast.error("Cập nhật thất bại"),
      });
    } else {
      createM.mutate(
        { values: data, image },
        {
          onSuccess: () => {
            toast.success("Đã đăng ký ngựa");
            navigate("/owner/stable");
          },
          onError: () => toast.error("Đăng ký thất bại"),
        },
      );
    }
  };

  const pending = createM.isPending || updateM.isPending;

  return (
    <div className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <ChevronLeft size={16} /> Quay lại
      </button>
      <h1 className="mb-6 text-2xl font-semibold text-ink">
        {editing ? "Sửa thông tin ngựa" : "Đăng ký ngựa mới"}
      </h1>
      <Card>
        <CardBody>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              label="Tên ngựa"
              {...register("name")}
              error={errors.name?.message}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Giới tính"
                options={GENDER_OPTS}
                {...register("gender")}
                error={errors.gender?.message}
              />
              <Input label="Giống (breed)" {...register("breed")} />
              <Input label="Màu lông" {...register("color")} />
              <Input
                label="Ngày sinh"
                type="date"
                {...register("dateOfBirth")}
              />
              <Input
                label="Cân nặng (kg)"
                type="number"
                step="0.1"
                {...register("weight")}
              />
              <Input label="Quốc gia" {...register("originCountry")} />
              <Input label="Mã chip" {...register("microchipNo")} />
              <Select
                label="Tình trạng sức khoẻ"
                options={HEALTH_OPTS}
                {...register("healthStatus")}
              />
              <Select
                label="Trạng thái"
                options={STATUS_OPTS}
                {...register("status")}
              />
              <Input
                label="Tình trạng đăng ký"
                {...register("registrationStatus")}
              />
            </div>
            {!editing && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-ink">
                  Ảnh ngựa (tuỳ chọn)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                  className="text-sm text-muted"
                />
              </div>
            )}
            <Button type="submit" size="lg" loading={pending}>
              {editing ? "Lưu thay đổi" : "Đăng ký ngựa"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
