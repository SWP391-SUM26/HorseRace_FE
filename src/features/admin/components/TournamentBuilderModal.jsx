import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Checkbox, Input, Modal, Select, Textarea } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { getApiErrorMessage } from "@/common/lib/apiError";
import { useCreateTournament, useUpdateTournament, useUploadTournamentImage } from "../hooks";
const CIRCUIT_TIER_OPTIONS = [
  { value: "", label: "Select circuit tier\u2026" },
  { value: "GROUP_1", label: "Group 1 (Elite)" },
  { value: "GROUP_2", label: "Group 2" },
  { value: "GROUP_3", label: "Group 3" },
  { value: "LISTED", label: "Listed" }
];
function toIsoDateTime(v) {
  if (!v) return void 0;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T00:00:00Z`;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? void 0 : d.toISOString();
}
function makeSchema(isEdit) {
  const reqStr = (msg) => z.string().trim().min(1, msg);
  const posNum = (msg) => reqStr(msg).refine((v) => Number(v) > 0, "Ph\u1EA3i l\u1EDBn h\u01A1n 0");
  const posInt = (msg) => reqStr(msg).refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, "Ph\u1EA3i l\xE0 s\u1ED1 nguy\xEAn > 0");
  const lenientNum = z.string().refine((v) => v === "" || Number(v) > 0, "Ph\u1EA3i l\u1EDBn h\u01A1n 0");
  const lenientInt = z.string().refine((v) => v === "" || Number.isInteger(Number(v)) && Number(v) > 0, "Ph\u1EA3i l\xE0 s\u1ED1 nguy\xEAn > 0");
  const opt = (required) => isEdit ? z.string() : required;
  return z.object({
    name: reqStr("Nh\u1EADp t\xEAn gi\u1EA3i \u0111\u1EA5u"),
    description: opt(reqStr("Nh\u1EADp m\xF4 t\u1EA3")),
    location: opt(reqStr("Nh\u1EADp \u0111\u1ECBa \u0111i\u1EC3m")),
    startDate: opt(reqStr("Ch\u1ECDn ng\xE0y b\u1EAFt \u0111\u1EA7u")),
    endDate: opt(reqStr("Ch\u1ECDn ng\xE0y k\u1EBFt th\xFAc")),
    circuitTier: z.string(),
    totalPurse: isEdit ? lenientNum : posNum("Nh\u1EADp t\u1ED5ng gi\u1EA3i th\u01B0\u1EDFng"),
    entryCap: isEdit ? lenientInt : posInt("Nh\u1EADp gi\u1EDBi h\u1EA1n s\u1ED1 ng\u1EF1a"),
    registrationOpenAt: isEdit ? z.string() : reqStr("Ch\u1ECDn th\u1EDDi \u0111i\u1EC3m m\u1EDF \u0111\u0103ng k\xFD"),
    registrationCloseAt: isEdit ? z.string() : reqStr("Ch\u1ECDn th\u1EDDi \u0111i\u1EC3m \u0111\xF3ng \u0111\u0103ng k\xFD"),
    minAgeYears: z.string().default("").refine((v) => v === "" || Number.isInteger(Number(v)) && Number(v) >= 0, "Tu\u1ED5i t\u1ED1i thi\u1EC3u kh\xF4ng h\u1EE3p l\u1EC7"),
    thoroughbredsOnly: z.boolean(),
    requiresGroupWin: z.boolean()
  }).refine((v) => !v.startDate || !v.endDate || new Date(v.endDate) >= new Date(v.startDate), {
    path: ["endDate"],
    message: "K\u1EBFt th\xFAc ph\u1EA3i sau b\u1EAFt \u0111\u1EA7u"
  }).refine(
    (v) => !v.registrationOpenAt || !v.registrationCloseAt || new Date(v.registrationCloseAt) >= new Date(v.registrationOpenAt),
    { path: ["registrationCloseAt"], message: "\u0110\xF3ng \u0111\u0103ng k\xFD ph\u1EA3i sau khi m\u1EDF" }
  ).refine(
    (v) => !v.registrationOpenAt || !v.startDate || new Date(v.registrationOpenAt) >= new Date(v.startDate),
    { path: ["registrationOpenAt"], message: "Mở đăng ký phải nằm trong hoặc sau ngày bắt đầu giải" }
  ).refine(
    (v) => !v.registrationCloseAt || !v.endDate || new Date(v.registrationCloseAt) <= new Date(v.endDate),
    { path: ["registrationCloseAt"], message: "Đóng đăng ký phải nằm trong hoặc trước ngày kết thúc giải" }
  );
}
function toDefaults(t) {
  if (!t) {
    return {
      name: "",
      description: "",
      location: "",
      startDate: "",
      endDate: "",
      circuitTier: "",
      totalPurse: "",
      entryCap: "",
      registrationOpenAt: "",
      registrationCloseAt: "",
      minAgeYears: "",
      thoroughbredsOnly: true,
      requiresGroupWin: false
    };
  }
  return {
    name: t.name,
    description: t.description ?? "",
    location: t.location ?? "",
    startDate: t.startDate ? t.startDate.slice(0, 10) : "",
    endDate: t.endDate ? t.endDate.slice(0, 10) : "",
    registrationOpenAt: t.registrationOpenAt ? t.registrationOpenAt.slice(0, 10) : "",
    registrationCloseAt: t.registrationCloseAt ? t.registrationCloseAt.slice(0, 10) : "",
    circuitTier: t.circuitTier ?? "",
    totalPurse: t.totalPurse != null ? String(t.totalPurse) : "",
    entryCap: t.entryCap != null ? String(t.entryCap) : "",
    minAgeYears: t.eligibility?.minAgeYears != null ? String(t.eligibility.minAgeYears) : "",
    thoroughbredsOnly: t.eligibility?.thoroughbredsOnly ?? true,
    requiresGroupWin: t.eligibility?.requiresPreviousGroupWin ?? false
  };
}
function TournamentBuilderModal({ tournament, onClose, onCreated }) {
  const toast = useToast();
  const create = useCreateTournament();
  const update = useUpdateTournament();
  const uploadImage = useUploadTournamentImage();
  const isEdit = !!tournament;
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(makeSchema(isEdit)),
    defaultValues: toDefaults(tournament)
  });
  const [pendingImage, setPendingImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(tournament?.imageUrl ?? null);
  const blobUrlRef = useRef(null);
  useEffect(() => () => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
  }, []);
  function showLocalPreview(file) {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;
    setImagePreview(url);
  }
  function pickImage(file) {
    if (!file) return;
    showLocalPreview(file);
    if (isEdit) {
      uploadImage.mutate(
        { id: tournament.tournamentId, file },
        {
          onSuccess: (t) => {
            setImagePreview(t.imageUrl ?? null);
            toast.success("Image uploaded");
          },
          // Revert to the actual persisted image so the preview doesn't lie about what was saved.
          onError: (e) => {
            setImagePreview(tournament?.imageUrl ?? null);
            toast.error(getApiErrorMessage(e));
          }
        }
      );
    } else {
      setPendingImage(file);
    }
  }
  const busy = create.isPending || update.isPending || uploadImage.isPending;
  function onValid(v) {
    const body = {
      name: v.name.trim(),
      description: v.description.trim() || void 0,
      location: v.location.trim() || void 0,
      startDate: toIsoDateTime(v.startDate),
      endDate: toIsoDateTime(v.endDate),
      registrationOpenAt: toIsoDateTime(v.registrationOpenAt),
      registrationCloseAt: toIsoDateTime(v.registrationCloseAt),
      circuitTier: v.circuitTier || void 0,
      totalPurse: v.totalPurse !== "" ? Number(v.totalPurse) : void 0,
      entryCap: v.entryCap !== "" ? Number(v.entryCap) : void 0,
      eligibility: {
        thoroughbredsOnly: v.thoroughbredsOnly,
        requiresPreviousGroupWin: v.requiresGroupWin,
        minAgeYears: v.minAgeYears !== "" ? Number(v.minAgeYears) : null
      }
    };
    if (isEdit) {
      update.mutate(
        { id: tournament.tournamentId, body },
        { onSuccess: () => {
          toast.success("Tournament saved");
          onClose();
        } }
      );
    } else {
      create.mutate(body, {
        onSuccess: (t) => {
          if (pendingImage) {
            uploadImage.mutate(
              { id: t.tournamentId, file: pendingImage },
              { onError: (e) => toast.error(`Tournament created; image upload failed: ${getApiErrorMessage(e)}`) }
            );
          }
          toast.success("Tournament created");
          onCreated?.(t.tournamentId);
          onClose();
        }
      });
    }
  }
  return <Modal
    open
    onClose={onClose}
    size="lg"
    title={isEdit ? "Edit Tournament" : "Tournament Builder"}
    footer={<>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          {
      /* Modal footer is a DOM sibling of the body (not inside a <form>), so bind submit via onClick. */
    }
          <Button loading={busy} onClick={handleSubmit(onValid)}>{isEdit ? "Save Changes" : "Save Draft"}</Button>
        </>}
  >
      <div className="flex flex-col gap-4">
        <Input label="Tournament Name" {...register("name")} error={errors.name?.message} placeholder="e.g. Royal Ascot Invitational" />

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Cover Image (optional)</p>
          <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-brand-50">
              {imagePreview ? <img src={imagePreview} alt="Tournament cover" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs text-muted">No image</div>}
            </div>
            <div className="min-w-0 flex-1">
              <input
    type="file"
    accept="image/png,image/jpeg,image/webp,image/gif"
    disabled={busy}
    onChange={(e) => pickImage(e.target.files?.[0])}
    className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
  />
              <p className="mt-1 text-xs text-muted">
                {isEdit ? "Uploads immediately (PNG/JPG/WebP/GIF, \u22645MB)." : "Uploads after the tournament is created."}
              </p>
            </div>
          </div>
        </div>

        <Select label="Circuit Tier" {...register("circuitTier")} error={errors.circuitTier?.message} options={CIRCUIT_TIER_OPTIONS} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Total Purse" type="number" min="0" step="0.01" {...register("totalPurse")} error={errors.totalPurse?.message} placeholder="e.g. 500000" />
          <Input label="Entry Cap" type="number" min="1" step="1" {...register("entryCap")} error={errors.entryCap?.message} placeholder="e.g. 20" />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Eligibility Criteria</p>
          <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
            <Checkbox label="Thoroughbreds Only" {...register("thoroughbredsOnly")} />
            <Checkbox label="Requires Previous Group Win" {...register("requiresGroupWin")} />
            <Input label="Minimum Age (years, optional)" type="number" min="0" step="1" {...register("minAgeYears")} error={errors.minAgeYears?.message} placeholder="e.g. 3" />
          </div>
        </div>

        <Textarea label="Description" rows={2} {...register("description")} error={errors.description?.message} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Start date" type="date" {...register("startDate")} error={errors.startDate?.message} />
          <Input label="End date" type="date" {...register("endDate")} error={errors.endDate?.message} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Registration opens" type="date" {...register("registrationOpenAt")} error={errors.registrationOpenAt?.message} />
          <Input label="Registration closes" type="date" {...register("registrationCloseAt")} error={errors.registrationCloseAt?.message} />
        </div>
        <Input label="Location" {...register("location")} error={errors.location?.message} placeholder="e.g. Ascot, UK" />
      </div>
    </Modal>;
}
export {
  CIRCUIT_TIER_OPTIONS,
  TournamentBuilderModal
};
