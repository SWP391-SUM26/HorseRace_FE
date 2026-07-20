import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button, Card, CardBody, Input, Select } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { useCreateHorse, useUpdateHorse, useHorse } from "../hooks";
function makeSchema(isEdit) {
  const reqStr = (msg) => z.string().trim().min(1, msg);
  const lenient = z.string().optional().default("");
  const validWeight = (s) => Number(s) > 0 && Number(s) <= 9999.99;
  const notFuture = (s) => new Date(s) <= /* @__PURE__ */ new Date();
  return z.object({
    name: reqStr("Nh\u1EADp t\xEAn ng\u1EF1a"),
    gender: z.enum(["MALE", "FEMALE", "GELDING"], { message: "Ch\u1ECDn gi\u1EDBi t\xEDnh" }),
    breed: isEdit ? lenient : reqStr("Nh\u1EADp gi\u1ED1ng"),
    color: isEdit ? lenient : reqStr("Nh\u1EADp m\xE0u l\xF4ng"),
    dateOfBirth: (isEdit ? lenient : reqStr("Ch\u1ECDn ng\xE0y sinh")).refine(
      (s) => !s || notFuture(s),
      "Ng\xE0y sinh kh\xF4ng th\u1EC3 \u1EDF t\u01B0\u01A1ng lai"
    ),
    weight: (isEdit ? lenient : reqStr("Nh\u1EADp c\xE2n n\u1EB7ng")).refine(
      (s) => isEdit && s === "" || validWeight(s),
      "C\xE2n n\u1EB7ng ph\u1EA3i trong kho\u1EA3ng 0\u20139999.99"
    ),
    originCountry: isEdit ? lenient : reqStr("Nh\u1EADp qu\u1ED1c gia"),
    microchipNo: isEdit ? lenient : reqStr("Nh\u1EADp m\xE3 chip"),
    healthStatus: isEdit ? lenient : reqStr("Ch\u1ECDn t\xECnh tr\u1EA1ng s\u1EE9c kho\u1EBB"),
    registrationStatus: isEdit ? lenient : reqStr("Nh\u1EADp t\xECnh tr\u1EA1ng \u0111\u0103ng k\xFD"),
    status: isEdit ? lenient : reqStr("Ch\u1ECDn tr\u1EA1ng th\xE1i")
  });
}
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
    resolver: zodResolver(makeSchema(editing)),
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
        }
      });
    } else {
      createM.mutate({ values: data, image }, {
        onSuccess: () => {
          toast.success("\u0110\xE3 \u0111\u0103ng k\xFD ng\u1EF1a");
          navigate("/app/owner/stable");
        }
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
              <Input label="Giống (breed)" {...register("breed")} error={errors.breed?.message} />
              <Input label="Màu lông" {...register("color")} error={errors.color?.message} />
              <Input label="Ngày sinh" type="date" {...register("dateOfBirth")} error={errors.dateOfBirth?.message} />
              <Input label="Cân nặng (kg)" type="number" step="0.1" {...register("weight")} error={errors.weight?.message} />
              <Input label="Quốc gia" {...register("originCountry")} error={errors.originCountry?.message} />
              <Input label="Mã chip" {...register("microchipNo")} error={errors.microchipNo?.message} />
              <Select label="Tình trạng sức khoẻ" options={HEALTH_OPTS} {...register("healthStatus")} error={errors.healthStatus?.message} />
              <Select label="Trạng thái" options={STATUS_OPTS} {...register("status")} error={errors.status?.message} />
              <Input label="Tình trạng đăng ký" {...register("registrationStatus")} error={errors.registrationStatus?.message} />
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
