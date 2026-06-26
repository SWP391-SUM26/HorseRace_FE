import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, Plus, Rabbit, Trash2 } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Badge, Button, Card, CardBody, CardHeader, DataTable, EmptyState, Modal, Skeleton } from "@/common/ui";
import { createHorse, deleteHorse, getHorseDetail, getHorses, updateHorse, uploadHorseImage } from "@/services/horse";
import { getTournaments } from "@/services/tournament";
import { submitRegistration } from "@/services/registration";

const EMPTY_FORM = {
  name: "",
  breed: "Thoroughbred",
  age: "3yo",
  status: "FIT TO RACE",
  imageFile: null,
  imagePreview: "",
};

function getStatusTone(status = "") {
  const normalized = status.toUpperCase();
  if (normalized.includes("FIT") || normalized.includes("ACTIVE") || normalized.includes("HEALTHY")) return "success";
  if (normalized.includes("INJURED")) return "danger";
  return "warning";
}

export default function StableManagement() {
  const [horses, setHorses] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [detailHorse, setDetailHorse] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [modalMode, setModalMode] = useState("");
  const [registrationTournamentId, setRegistrationTournamentId] = useState("");

  async function loadStable() {
    setLoading(true);
    setError("");
    try {
      const [horseData, tournamentData] = await Promise.all([
        getHorses(),
        getTournaments({ status: "REGISTRATION_OPEN", page: 1, pageSize: 100 }).catch(() => []),
      ]);
      setHorses(horseData || []);
      setTournaments(tournamentData?.items || tournamentData?.content || tournamentData?.data?.content || tournamentData || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to load stable data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStable();
  }, []);

  const filteredHorses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return horses.filter((horseItem) => {
      const matchesQuery =
        !query ||
        horseItem.name?.toLowerCase().includes(query) ||
        horseItem.breed?.toLowerCase().includes(query);
      const matchesStatus = status === "ALL" || horseItem.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [horses, search, status]);

  function openCreate() {
    setSelectedHorse(null);
    setForm(EMPTY_FORM);
    setModalMode("form");
  }

  function openEdit(horseItem) {
    setSelectedHorse(horseItem);
    setForm({
      name: horseItem.name || "",
      breed: horseItem.breed || "Thoroughbred",
      age: horseItem.age || "3yo",
      status: horseItem.status || "FIT TO RACE",
      imageFile: null,
      imagePreview: horseItem.image || "",
    });
    setModalMode("form");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;
    setForm((current) => ({
      ...current,
      imageFile: file,
      imagePreview: file ? URL.createObjectURL(file) : selectedHorse?.image || "",
    }));
  }

  async function openDetail(horseItem) {
    setSelectedHorse(horseItem);
    setDetailHorse(horseItem);
    setModalMode("detail");
    try {
      const data = await getHorseDetail(horseItem.id);
      setDetailHorse(data || horseItem);
    } catch {
      setDetailHorse(horseItem);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      let savedHorse;
      if (selectedHorse) {
        savedHorse = await updateHorse(selectedHorse.id, form);
      } else {
        savedHorse = await createHorse(form);
      }

      if (form.imageFile && savedHorse?.id) {
        savedHorse = await uploadHorseImage(savedHorse.id, form.imageFile);
      }

      if (selectedHorse) {
        setHorses((current) => current.map((horseItem) => (horseItem.id === savedHorse.id ? savedHorse : horseItem)));
        setSuccess(`${savedHorse.name} updated successfully.`);
      } else {
        setHorses((current) => [savedHorse, ...current]);
        setSuccess(`${savedHorse.name} registered successfully.`);
      }
      setModalMode("");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to save horse.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(horseItem) {
    if (!window.confirm(`Remove ${horseItem.name} from your stable?`)) return;
    setSubmitting(true);
    setError("");
    try {
      await deleteHorse(horseItem.id);
      setHorses((current) => current.filter((item) => item.id !== horseItem.id));
      setSuccess(`${horseItem.name} removed from stable.`);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to delete horse.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegisterTournament(event) {
    event.preventDefault();
    if (!selectedHorse || !registrationTournamentId) return;
    setSubmitting(true);
    setError("");
    try {
      await submitRegistration({
        horseId: selectedHorse.id,
        tournamentId: registrationTournamentId,
      });
      setRegistrationTournamentId("");
      setSuccess(`${selectedHorse.name} registration submitted.`);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to submit registration.");
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    {
      key: "horse",
      header: "Horse",
      className: "min-w-[260px]",
      render: (horseItem) => (
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50 text-brand-700">
            {horseItem.image ? <img src={horseItem.image} alt="" className="h-full w-full object-cover" /> : <Rabbit size={18} />}
          </div>
          <div>
            <p className="font-semibold text-ink">{horseItem.name}</p>
            <p className="text-xs text-muted">{horseItem.breed || horseItem.details || "Horse profile"}</p>
          </div>
        </div>
      ),
    },
    { key: "status", header: "Status", className: "min-w-[160px]", render: (horseItem) => <Badge tone={getStatusTone(horseItem.status)}>{horseItem.status || "ACTIVE"}</Badge> },
    { key: "nextRace", header: "Next Race", className: "min-w-[220px]", render: (horseItem) => horseItem.nextRace || "No upcoming races" },
    {
      key: "actions",
      header: "Actions",
      className: "min-w-[260px] text-right",
      render: (horseItem) => (
        <div className="flex flex-nowrap justify-end gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={() => openDetail(horseItem)} leftIcon={<Eye size={14} />}>View</Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => openEdit(horseItem)} leftIcon={<Edit3 size={14} />}>Edit</Button>
          <Button type="button" size="sm" variant="danger" onClick={() => handleDelete(horseItem)} leftIcon={<Trash2 size={14} />}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stable Management"
        subtitle="Manage your horses, registrations, and race readiness."
        actions={<Button onClick={openCreate} leftIcon={<Plus size={16} />}>Register Horse</Button>}
      />

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">{error}</div>}
      {success && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-success">{success}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardBody><p className="text-xs font-semibold uppercase text-muted">Total Horses</p><strong className="mt-3 block text-3xl text-ink">{horses.length}</strong></CardBody></Card>
        <Card><CardBody><p className="text-xs font-semibold uppercase text-muted">Fit to Race</p><strong className="mt-3 block text-3xl text-success">{horses.filter((horseItem) => getStatusTone(horseItem.status) === "success").length}</strong></CardBody></Card>
        <Card><CardBody><p className="text-xs font-semibold uppercase text-muted">Open Tournaments</p><strong className="mt-3 block text-3xl text-ink">{tournaments.length}</strong></CardBody></Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-surface">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <input
              className="h-11 rounded-lg border border-border bg-surface px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search horse..."
            />
            <select
              className="h-11 rounded-lg border border-border bg-surface px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="FIT TO RACE">Fit to Race</option>
              <option value="RESTING">Resting</option>
            </select>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? <Skeleton className="h-72 rounded-xl" /> : <DataTable rows={filteredHorses} columns={columns} rowKey={(horseItem) => horseItem.id} emptyLabel="No horses found" flush />}
        </CardBody>
      </Card>

      <Modal
        open={modalMode === "form"}
        onClose={() => setModalMode("")}
        title={selectedHorse ? "Edit Horse" : "Register Horse"}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalMode("")}>Cancel</Button>
            <Button type="submit" form="horse-form" loading={submitting}>{selectedHorse ? "Save Changes" : "Register Horse"}</Button>
          </>
        }
      >
        <form id="horse-form" className="space-y-4" onSubmit={handleSave}>
          <label className="block text-sm font-semibold text-ink">
            Horse Image
            <div className="mt-2 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-brand-50 text-brand-700">
                {form.imagePreview ? (
                  <img src={form.imagePreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Rabbit size={22} />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-brand-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-800"
                onChange={handleImageChange}
              />
            </div>
          </label>
          <label className="block text-sm font-semibold text-ink">
            Horse Name
            <input className="mt-2 h-11 w-full rounded-lg border border-border px-3 outline-none focus:ring-2 focus:ring-brand-500" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink">
              Breed
              <input className="mt-2 h-11 w-full rounded-lg border border-border px-3 outline-none focus:ring-2 focus:ring-brand-500" value={form.breed} onChange={(event) => setForm({ ...form, breed: event.target.value })} />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Status
              <select className="mt-2 h-11 w-full rounded-lg border border-border px-3 outline-none focus:ring-2 focus:ring-brand-500" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="FIT TO RACE">Fit to Race</option>
                <option value="RESTING">Resting</option>
              </select>
            </label>
          </div>
        </form>
      </Modal>

      <Modal open={modalMode === "detail"} onClose={() => setModalMode("")} title="Horse Detail">
        {detailHorse ? (
          <div className="space-y-5">
            <div className="rounded-2xl bg-brand-50 p-5">
              <p className="text-2xl font-semibold text-ink">{detailHorse.name}</p>
              <p className="mt-1 text-sm text-muted">{detailHorse.breed || detailHorse.details || "Horse profile"}</p>
              <div className="mt-3"><Badge tone={getStatusTone(detailHorse.status)}>{detailHorse.status || "ACTIVE"}</Badge></div>
            </div>
            <form className="space-y-3" onSubmit={handleRegisterTournament}>
              <label className="block text-sm font-semibold text-ink">
                Register for Tournament
                <select className="mt-2 h-11 w-full rounded-lg border border-border px-3 outline-none focus:ring-2 focus:ring-brand-500" value={registrationTournamentId} onChange={(event) => setRegistrationTournamentId(event.target.value)}>
                  <option value="">Choose open tournament</option>
                  {tournaments.map((tournament) => (
                    <option key={tournament.tournamentId || tournament.id} value={tournament.tournamentId || tournament.id}>
                      {tournament.name || tournament.tournamentName}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="submit" loading={submitting} disabled={!registrationTournamentId}>Submit Registration</Button>
            </form>
          </div>
        ) : (
          <EmptyState title="Horse detail is not available" />
        )}
      </Modal>
    </div>
  );
}
