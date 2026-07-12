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
  name: z.string().min(1, "Nh\u1EADp t\xEAn ng\u1EF1a"),
  gender: z.enum(["MALE", "FEMALE", "GELDING"]),
  breed: z.string().optional().default(""),
  color: z.string().optional().default(""),
  dateOfBirth: z.string().optional().default(""),
  weight: z.string().optional().default(""),
  originCountry: z.string().optional().default(""),
  microchipNo: z.string().optional().default(""),
  healthStatus: z.string().optional().default(""),
  registrationStatus: z.string().optional().default(""),
  status: z.string().optional().default("")
});
const GENDER_OPTS = [
  { value: "MALE", label: "\u0110\u1EF1c (Male)" },
  { value: "FEMALE", label: "C\xE1i (Female)" },
  { value: "GELDING", label: "Thi\u1EBFn (Gelding)" }
];
const HEALTH_OPTS = [
  { value: "", label: "\u2014" },
  { value: "HEALTHY", label: "Kho\u1EBB m\u1EA1nh (Healthy)" },
  { value: "INJURED", label: "Ch\u1EA5n th\u01B0\u01A1ng (Injured)" },
  { value: "QUARANTINE", label: "C\xE1ch ly (Quarantine)" },
  { value: "UNFIT", label: "Kh\xF4ng \u0111\u1EE7 \u0111i\u1EC1u ki\u1EC7n (Unfit)" }
];
const STATUS_OPTS = [
  { value: "", label: "\u2014" },
  { value: "ACTIVE", label: "Ho\u1EA1t \u0111\u1ED9ng (Active)" },
  { value: "RETIRED", label: "Gi\u1EA3i ngh\u1EC7 (Retired)" },
  { value: "INACTIVE", label: "Ng\u1EEBng (Inactive)" }
];
function HorseFormPage({ mode }) {
  const { horseId = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [image, setImage] = useState(null);
  const editing = mode === "edit";
  const raw = useHorse(editing ? horseId : "");
  const createM = useCreateHorse();
  const updateM = useUpdateHorse(horseId);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    values: editing && raw.data ? {
      name: raw.data.name,
      gender: raw.data.gender ?? "MALE",
      breed: raw.data.breed ?? "",
      color: raw.data.color ?? "",
      dateOfBirth: raw.data.dateOfBirth ?? "",
      weight: raw.data.weight != null ? String(raw.data.weight) : "",
      originCountry: raw.data.originCountry ?? "",
      microchipNo: raw.data.microchipNo ?? "",
      // from microchip, NEVER horseCode
      healthStatus: raw.data.healthStatus ?? "",
      registrationStatus: raw.data.registrationStatus ?? "",
      status: raw.data.status ?? ""
    } : void 0
  });
  const onSubmit = (data) => {
    if (editing) {
      updateM.mutate(data, {
        onSuccess: () => {
          toast.success("\u0110\xE3 c\u1EADp nh\u1EADt ng\u1EF1a");
          navigate(`/app/owner/stable/${horseId}`);
        },
        onError: () => toast.error("C\u1EADp nh\u1EADt th\u1EA5t b\u1EA1i")
      });
    } else {
      createM.mutate({ values: data, image }, {
        onSuccess: () => {
          toast.success("\u0110\xE3 \u0111\u0103ng k\xFD ng\u1EF1a");
          navigate("/app/owner/stable");
        },
        onError: () => toast.error("\u0110\u0103ng k\xFD th\u1EA5t b\u1EA1i")
      });
    }
  };
  const pending = createM.isPending || updateM.isPending;
  return <div className="mx-auto max-w-2xl">
      <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ChevronLeft size={16} /> Quay lại
      </button>
      <h1 className="mb-6 text-2xl font-semibold text-ink">{editing ? "S\u1EEDa th\xF4ng tin ng\u1EF1a" : "\u0110\u0103ng k\xFD ng\u1EF1a m\u1EDBi"}</h1>
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Tên ngựa" {...register("name")} error={errors.name?.message} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Giới tính" options={GENDER_OPTS} {...register("gender")} error={errors.gender?.message} />
              <Input label="Giống (breed)" {...register("breed")} />
              <Input label="Màu lông" {...register("color")} />
              <Input label="Ngày sinh" type="date" {...register("dateOfBirth")} />
              <Input label="Cân nặng (kg)" type="number" step="0.1" {...register("weight")} />
              <Input label="Quốc gia" {...register("originCountry")} />
              <Input label="Mã chip" {...register("microchipNo")} />
              <Select label="Tình trạng sức khoẻ" options={HEALTH_OPTS} {...register("healthStatus")} />
              <Select label="Trạng thái" options={STATUS_OPTS} {...register("status")} />
              <Input label="Tình trạng đăng ký" {...register("registrationStatus")} />
            </div>
            {!editing && <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-ink">Ảnh ngựa (tuỳ chọn)</label>
                <input
    type="file"
    accept="image/*"
    onChange={(e) => setImage(e.target.files?.[0] ?? null)}
    className="text-sm text-muted"
  />
              </div>}
            <Button type="submit" size="lg" loading={pending}>{editing ? "L\u01B0u thay \u0111\u1ED5i" : "\u0110\u0103ng k\xFD ng\u1EF1a"}</Button>
          </form>
        </CardBody>
      </Card>
    </div>;
}
export {
  HorseFormPage as default
};
