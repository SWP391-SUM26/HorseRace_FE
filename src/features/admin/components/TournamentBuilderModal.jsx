import { useEffect, useRef, useState } from "react";
import { Button, Checkbox, Input, Modal, Select, Textarea } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { useCreateTournament, useUpdateTournament, useUploadTournamentImage } from "../hooks";
import { errorMessage } from "../constants";
const CIRCUIT_TIER_OPTIONS = [
  { value: "", label: "Select circuit tier\u2026" },
  { value: "GROUP_1_ELITE", label: "Group 1 (Elite)" },
  { value: "GROUP_2", label: "Group 2" },
  { value: "GROUP_3", label: "Group 3" },
  { value: "LISTED", label: "Listed" },
  { value: "UNGRADED", label: "Ungraded" }
];
const EMPTY = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  registrationOpenAt: "",
  registrationCloseAt: "",
  location: "",
  status: "DRAFT"
};
function toIsoDateTime(v) {
  if (!v) return void 0;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T00:00:00Z`;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? void 0 : d.toISOString();
}
function TournamentBuilderModal({ tournament, onClose, onCreated }) {
  const toast = useToast();
  const create = useCreateTournament();
  const update = useUpdateTournament();
  const uploadImage = useUploadTournamentImage();
  const isEdit = !!tournament;
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
            toast.error(errorMessage(e));
          }
        }
      );
    } else {
      setPendingImage(file);
    }
  }
  const [form, setForm] = useState(
    tournament ? {
      name: tournament.name,
      description: tournament.description ?? "",
      startDate: tournament.startDate ? tournament.startDate.slice(0, 10) : "",
      endDate: tournament.endDate ? tournament.endDate.slice(0, 10) : "",
      registrationOpenAt: tournament.registrationOpenAt ?? "",
      registrationCloseAt: tournament.registrationCloseAt ?? "",
      location: tournament.location ?? "",
      status: tournament.status
    } : EMPTY
  );
  const [circuitTier, setCircuitTier] = useState(tournament?.circuitTier ?? "");
  const [eligibility, setEligibility] = useState({ thoroughbredsOnly: true, age3plus: true, requiresGroupWin: false });
  const [tracks, setTracks] = useState([]);
  const [newTrack, setNewTrack] = useState("");
  const busy = create.isPending || update.isPending || uploadImage.isPending;
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function addTrack() {
    const t = newTrack.trim();
    if (!t || tracks.includes(t)) return;
    setTracks((prev) => [...prev, t]);
    setNewTrack("");
  }
  function save() {
    if (!form.name.trim()) return toast.error("Name is required");
    const body = {
      name: form.name.trim(),
      description: form.description?.trim() || void 0,
      location: form.location?.trim() || void 0,
      status: form.status,
      startDate: toIsoDateTime(form.startDate),
      endDate: toIsoDateTime(form.endDate),
      registrationOpenAt: toIsoDateTime(form.registrationOpenAt),
      registrationCloseAt: toIsoDateTime(form.registrationCloseAt)
    };
    if (isEdit) {
      update.mutate(
        { id: tournament.tournamentId, body },
        { onSuccess: () => {
          toast.success("Tournament saved");
          onClose();
        }, onError: (e) => toast.error(errorMessage(e)) }
      );
    } else {
      create.mutate(body, {
        onSuccess: (t) => {
          if (pendingImage) {
            uploadImage.mutate(
              { id: t.tournamentId, file: pendingImage },
              { onError: (e) => toast.error(`Tournament created; image upload failed: ${errorMessage(e)}`) }
            );
          }
          toast.success("Tournament created");
          onCreated?.(t.tournamentId);
          onClose();
        },
        onError: (e) => toast.error(errorMessage(e))
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
          <Button loading={busy} onClick={save}>{isEdit ? "Save Changes" : "Save Draft"}</Button>
        </>}
  >
      <div className="flex flex-col gap-4">
        <Input label="Tournament Name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Royal Ascot Invitational" />

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Cover Image</p>
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

        <Select label="Circuit Tier" value={circuitTier} onChange={(e) => setCircuitTier(e.target.value)} options={CIRCUIT_TIER_OPTIONS} />

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Eligibility Criteria</p>
          <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
            <Checkbox
    name="elig-tb"
    label="Thoroughbreds Only"
    checked={eligibility.thoroughbredsOnly}
    onChange={(e) => setEligibility((el) => ({ ...el, thoroughbredsOnly: e.target.checked }))}
  />
            <Checkbox
    name="elig-age"
    label="Age 3+ Years"
    checked={eligibility.age3plus}
    onChange={(e) => setEligibility((el) => ({ ...el, age3plus: e.target.checked }))}
  />
            <Checkbox
    name="elig-group"
    label="Requires Previous Group Win"
    checked={eligibility.requiresGroupWin}
    onChange={(e) => setEligibility((el) => ({ ...el, requiresGroupWin: e.target.checked }))}
  />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Track Selection</p>
          <div className="rounded-xl border border-border p-3">
            {tracks.length > 0 && <div className="mb-2 flex flex-wrap gap-1.5">
                {tracks.map((track) => <span key={track} className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                    {track}
                    <button type="button" className="ml-0.5 text-brand-500 hover:text-brand-900" onClick={() => setTracks((t) => t.filter((x) => x !== track))}>×</button>
                  </span>)}
              </div>}
            <div className="flex gap-2">
              <input
    className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
    placeholder="e.g. Meydan Racecourse"
    value={newTrack}
    onChange={(e) => setNewTrack(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTrack();
      }
    }}
  />
              <Button size="sm" variant="secondary" onClick={addTrack}>+ Add</Button>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted">Circuit tier, eligibility and tracks save once the backend adds support.</p>
        </div>

        <Textarea label="Description" rows={2} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Start date" type="date" value={form.startDate ?? ""} onChange={(e) => set("startDate", e.target.value)} />
          <Input label="End date" type="date" value={form.endDate ?? ""} onChange={(e) => set("endDate", e.target.value)} />
        </div>
        <Input label="Location" value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Ascot, UK" />
      </div>
    </Modal>;
}
export {
  CIRCUIT_TIER_OPTIONS,
  TournamentBuilderModal
};
