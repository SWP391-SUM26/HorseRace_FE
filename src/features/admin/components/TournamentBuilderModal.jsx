import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Checkbox, Input, Modal, Select, Textarea } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { getApiErrorMessage } from "@/common/lib/apiError";
import {
  useCreateTournament,
  useUpdateTournament,
  useUploadTournamentImage,
} from "../hooks";

/**
 * MUST stay in sync with the BE enum `tournaments/entity/CircuitTier` and the
 * CHECK constraint on `tournament.circuit_tier`. Jackson rejects any other value
 * during body binding — before @Valid runs — so the admin only ever sees a bare
 * "Invalid or malformed request" with no field named. Leave the tier blank for
 * an ungraded event; the column is nullable.
 */
// Array constant co-located with the form it drives; `allowConstantExport` only covers primitives.
// eslint-disable-next-line react-refresh/only-export-components
export const CIRCUIT_TIER_OPTIONS = [
  { value: "", label: "Select circuit tier…" },
  { value: "GROUP_1", label: "Group 1 (Elite)" },
  { value: "GROUP_2", label: "Group 2" },
  { value: "GROUP_3", label: "Group 3" },
  { value: "LISTED", label: "Listed" },
];

/** BE date fields are OffsetDateTime: a `<input type="date">` value (YYYY-MM-DD) or
 *  empty string won't parse. Convert to ISO-8601 with offset, or omit when empty. */
function toIsoDateTime(v) {
  if (!v) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T00:00:00Z`; // date-only → start of day UTC
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** Mode-aware schema: the late-added enrichment fields (circuitTier / totalPurse / entryCap /
 *  registration window) are required on CREATE but lenient on EDIT — so legacy tournaments whose
 *  rows predate these columns (null values) can still be re-saved. */
function makeSchema(isEdit) {
  const reqStr = (msg) => z.string().trim().min(1, msg);
  const posNum = (msg) =>
    reqStr(msg).refine((v) => Number(v) > 0, "Phải lớn hơn 0");
  const posInt = (msg) =>
    reqStr(msg).refine(
      (v) => Number.isInteger(Number(v)) && Number(v) > 0,
      "Phải là số nguyên > 0",
    );
  // On edit, allow blank; if a value is present it must still be valid.
  const lenientNum = z
    .string()
    .refine((v) => v === "" || Number(v) > 0, "Phải lớn hơn 0");
  const lenientInt = z
    .string()
    .refine(
      (v) => v === "" || (Number.isInteger(Number(v)) && Number(v) > 0),
      "Phải là số nguyên > 0",
    );

  // On edit, every field is lenient (blank allowed) so legacy rows with null values still save;
  // `name` stays required in both modes (BE @NotBlank — always present).
  const opt = (required) => (isEdit ? z.string() : required);

  return z
    .object({
      name: reqStr("Nhập tên giải đấu"),
      description: opt(reqStr("Nhập mô tả")),
      location: opt(reqStr("Nhập địa điểm")),
      startDate: opt(reqStr("Chọn ngày bắt đầu")),
      endDate: opt(reqStr("Chọn ngày kết thúc")),
      // Blank is allowed (ungraded); anything non-blank must be a real BE enum
      // constant, or the request dies at Jackson with a message that names no field.
      circuitTier: (isEdit ? z.string() : reqStr("Chọn hạng giải")).refine(
        (v) => v === "" || CIRCUIT_TIER_OPTIONS.some((o) => o.value === v),
        "Hạng giải không hợp lệ",
      ),
      totalPurse: isEdit ? lenientNum : posNum("Nhập tổng giải thưởng"),
      entryCap: isEdit ? lenientInt : posInt("Nhập giới hạn số ngựa"),
      registrationOpenAt: isEdit
        ? z.string()
        : reqStr("Chọn thời điểm mở đăng ký"),
      registrationCloseAt: isEdit
        ? z.string()
        : reqStr("Chọn thời điểm đóng đăng ký"),
      minAgeYears: z
        .string()
        .default("")
        .refine(
          (v) => v === "" || (Number.isInteger(Number(v)) && Number(v) >= 0),
          "Tuổi tối thiểu không hợp lệ",
        ),
      thoroughbredsOnly: z.boolean(),
      requiresGroupWin: z.boolean(),
    })
    .refine(
      (v) =>
        !v.startDate ||
        !v.endDate ||
        new Date(v.endDate) >= new Date(v.startDate),
      {
        path: ["endDate"],
        message: "Kết thúc phải sau bắt đầu",
      },
    )
    .refine(
      (v) =>
        !v.registrationOpenAt ||
        !v.registrationCloseAt ||
        new Date(v.registrationCloseAt) >= new Date(v.registrationOpenAt),
      { path: ["registrationCloseAt"], message: "Đóng đăng ký phải sau khi mở" },
    )
    .refine(
      (v) =>
        !v.registrationOpenAt ||
        !v.startDate ||
        new Date(v.registrationOpenAt) <= new Date(v.startDate),
      {
        path: ["registrationOpenAt"],
        message: "Đăng ký phải mở trước khi giải bắt đầu",
      },
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
      requiresGroupWin: false,
    };
  }
  return {
    name: t.name,
    description: t.description ?? "",
    location: t.location ?? "",
    startDate: t.startDate ? t.startDate.slice(0, 10) : "",
    endDate: t.endDate ? t.endDate.slice(0, 10) : "",
    registrationOpenAt: t.registrationOpenAt
      ? t.registrationOpenAt.slice(0, 10)
      : "",
    registrationCloseAt: t.registrationCloseAt
      ? t.registrationCloseAt.slice(0, 10)
      : "",
    circuitTier: t.circuitTier ?? "",
    totalPurse: t.totalPurse != null ? String(t.totalPurse) : "",
    entryCap: t.entryCap != null ? String(t.entryCap) : "",
    minAgeYears:
      t.eligibility?.minAgeYears != null
        ? String(t.eligibility.minAgeYears)
        : "",
    thoroughbredsOnly: t.eligibility?.thoroughbredsOnly ?? true,
    requiresGroupWin: t.eligibility?.requiresPreviousGroupWin ?? false,
  };
}

export function TournamentBuilderModal({ tournament, onClose, onCreated }) {
  const toast = useToast();
  const create = useCreateTournament();
  const update = useUpdateTournament();
  const uploadImage = useUploadTournamentImage();
  const isEdit = !!tournament;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(makeSchema(isEdit)),
    defaultValues: toDefaults(tournament),
  });

  // Cover image: on edit we upload immediately; when creating we hold the file until the
  // tournament exists (the BE endpoint is POST /tournaments/{id}/image), then upload on save.
  const [pendingImage, setPendingImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    tournament?.imageUrl ?? null,
  );
  // Track the local blob URL so we can revoke it (avoid leaking) when replaced or on unmount.
  const blobUrlRef = useRef(null);
  useEffect(
    () => () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    },
    [],
  );

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
          },
        },
      );
    } else {
      setPendingImage(file); // uploaded right after the tournament is created
    }
  }

  const busy = create.isPending || update.isPending || uploadImage.isPending;

  function onValid(v) {
    // Build a clean payload: trim text, convert dates to OffsetDateTime, omit empty fields.
    // `status` is intentionally NOT sent — the BE ignores it on both create and update.
    const body = {
      name: v.name.trim(),
      description: v.description.trim() || undefined,
      location: v.location.trim() || undefined,
      startDate: toIsoDateTime(v.startDate),
      endDate: toIsoDateTime(v.endDate),
      registrationOpenAt: toIsoDateTime(v.registrationOpenAt),
      registrationCloseAt: toIsoDateTime(v.registrationCloseAt),
      // Blank -> omitted (column is nullable). The zod refine above already
      // narrowed the non-blank case to a real enum constant.
      circuitTier: v.circuitTier || undefined,
      totalPurse: v.totalPurse !== "" ? Number(v.totalPurse) : undefined,
      entryCap: v.entryCap !== "" ? Number(v.entryCap) : undefined,
      eligibility: {
        thoroughbredsOnly: v.thoroughbredsOnly,
        requiresPreviousGroupWin: v.requiresGroupWin,
        minAgeYears: v.minAgeYears !== "" ? Number(v.minAgeYears) : null,
      },
    };
    if (isEdit) {
      update.mutate(
        { id: tournament.tournamentId, body },
        {
          onSuccess: () => {
            toast.success("Tournament saved");
            onClose();
          },
        },
      );
    } else {
      create.mutate(body, {
        onSuccess: (t) => {
          // Fire the Cloudinary upload in the background (it invalidates the tournament queries
          // on success) but do NOT await it — the modal resolves the moment the tournament exists.
          if (pendingImage) {
            uploadImage.mutate(
              { id: t.tournamentId, file: pendingImage },
              {
                onError: (e) =>
                  toast.error(
                    `Tournament created; image upload failed: ${getApiErrorMessage(e)}`,
                  ),
              },
            );
          }
          toast.success("Tournament created");
          onCreated?.(t.tournamentId);
          onClose();
        },
      });
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={isEdit ? "Edit Tournament" : "Tournament Builder"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          {/* Modal footer is a DOM sibling of the body (not inside a <form>), so bind submit via onClick. */}
          <Button loading={busy} onClick={handleSubmit(onValid)}>
            {isEdit ? "Save Changes" : "Save Draft"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Tournament Name"
          {...register("name")}
          error={errors.name?.message}
          placeholder="e.g. Royal Ascot Invitational"
        />

        <div>
          <p className="mb-2 text-sm font-medium text-ink">
            Cover Image (optional)
          </p>
          <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-brand-50">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Tournament cover"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                  No image
                </div>
              )}
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
                {isEdit
                  ? "Uploads immediately (PNG/JPG/WebP/GIF, ≤5MB)."
                  : "Uploads after the tournament is created."}
              </p>
            </div>
          </div>
        </div>

        <Select
          label="Circuit Tier"
          {...register("circuitTier")}
          error={errors.circuitTier?.message}
          options={CIRCUIT_TIER_OPTIONS}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Total Purse"
            type="number"
            min="0"
            step="0.01"
            {...register("totalPurse")}
            error={errors.totalPurse?.message}
            placeholder="e.g. 500000"
          />
          <Input
            label="Entry Cap"
            type="number"
            min="1"
            step="1"
            {...register("entryCap")}
            error={errors.entryCap?.message}
            placeholder="e.g. 20"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">
            Eligibility Criteria
          </p>
          <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
            <Checkbox
              label="Thoroughbreds Only"
              {...register("thoroughbredsOnly")}
            />
            <Checkbox
              label="Requires Previous Group Win"
              {...register("requiresGroupWin")}
            />
            <Input
              label="Minimum Age (years, optional)"
              type="number"
              min="0"
              step="1"
              {...register("minAgeYears")}
              error={errors.minAgeYears?.message}
              placeholder="e.g. 3"
            />
          </div>
        </div>

        <Textarea
          label="Description"
          rows={2}
          {...register("description")}
          error={errors.description?.message}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Start date"
            type="date"
            {...register("startDate")}
            error={errors.startDate?.message}
          />
          <Input
            label="End date"
            type="date"
            {...register("endDate")}
            error={errors.endDate?.message}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Registration opens"
            type="date"
            {...register("registrationOpenAt")}
            error={errors.registrationOpenAt?.message}
          />
          <Input
            label="Registration closes"
            type="date"
            {...register("registrationCloseAt")}
            error={errors.registrationCloseAt?.message}
          />
        </div>
        <Input
          label="Location"
          {...register("location")}
          error={errors.location?.message}
          placeholder="e.g. Ascot, UK"
        />
      </div>
    </Modal>
  );
}
