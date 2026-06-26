import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Badge, Button, Card, CardBody, CardHeader, DataTable, EmptyState, Modal, Skeleton } from "@/common/ui";
import { useAuth } from "@/common/hooks/useAuth";
import { getHorses } from "@/services/horse";
import { getTournaments } from "@/services/tournament";
import { getRegistrationList, submitRegistration, withdrawRegistration } from "@/services/registration";

function getUserId(user) {
  return user?.id || user?.userId || user?.user_id || "";
}

function formatDate(value) {
  if (!value) return "Not submitted";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function statusTone(status = "") {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  if (status === "WITHDRAWN") return "neutral";
  return "warning";
}

export default function OwnerRegistrations() {
  const { user } = useAuth();
  const ownerId = getUserId(user);
  const [registrations, setRegistrations] = useState([]);
  const [horses, setHorses] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ horseId: "", tournamentId: "" });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const registrationFilters = {
        ownerUserId: ownerId,
        page: 1,
        pageSize: 100,
      };

      if (status) {
        registrationFilters.status = status;
      }

      const [registrationData, horseData, tournamentData] = await Promise.all([
        getRegistrationList(registrationFilters),
        getHorses(),
        getTournaments({ status: "REGISTRATION_OPEN", page: 1, pageSize: 100 }).catch(() => []),
      ]);
      setRegistrations(registrationData?.items || []);
      setHorses(horseData || []);
      setTournaments(tournamentData?.items || tournamentData?.content || tournamentData?.data?.content || tournamentData || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to load registrations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [ownerId, status]);

  const visibleRegistrations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return registrations.filter((registration) => {
      if (!query) return true;
      return (
        registration.code?.toLowerCase().includes(query) ||
        registration.horse?.name?.toLowerCase().includes(query) ||
        registration.tournament?.name?.toLowerCase().includes(query)
      );
    });
  }, [registrations, search]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.horseId || !form.tournamentId) return;
    setSubmitting(true);
    setError("");
    try {
      await submitRegistration({
        horseId: form.horseId,
        tournamentId: form.tournamentId,
      });
      setSuccess("Registration submitted successfully.");
      setOpen(false);
      setForm({ horseId: "", tournamentId: "" });
      await loadData();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to submit registration.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWithdraw(registration) {
    setSubmitting(true);
    setError("");
    try {
      await withdrawRegistration(registration.id);
      setSuccess("Registration withdrawn.");
      await loadData();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to withdraw registration.");
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    { key: "code", header: "Registration ID", render: (registration) => registration.code || registration.id },
    { key: "horse", header: "Horse", render: (registration) => <strong>{registration.horse?.name || "Unknown Horse"}</strong> },
    { key: "tournament", header: "Tournament", render: (registration) => registration.tournament?.name || "N/A" },
    { key: "submittedAt", header: "Submitted Date", render: (registration) => formatDate(registration.submittedAt) },
    { key: "status", header: "Status", render: (registration) => <Badge tone={statusTone(registration.status)}>{registration.status}</Badge> },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (registration) =>
        ["SUBMITTED", "UNDER_REVIEW"].includes(registration.status) ? (
          <Button type="button" size="sm" variant="ghost" loading={submitting} onClick={() => handleWithdraw(registration)}>
            Withdraw
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner Registrations"
        subtitle="Register horses for tournaments and track referee approval status."
        actions={<Button onClick={() => setOpen(true)} leftIcon={<Plus size={16} />}>Submit Registration</Button>}
      />

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">{error}</div>}
      {success && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-success">{success}</div>}

      <Card>
        <CardHeader>
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <input
              className="h-11 rounded-lg border border-border bg-surface px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search registration, horse, or tournament..."
            />
            <select
              className="h-11 rounded-lg border border-border bg-surface px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Skeleton className="h-72 rounded-xl" />
          ) : visibleRegistrations.length === 0 ? (
            <EmptyState title="No registrations found" description="Submit a registration when a tournament is open." />
          ) : (
            <DataTable rows={visibleRegistrations} columns={columns} rowKey={(registration) => registration.id} flush />
          )}
        </CardBody>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Submit Registration"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" form="registration-form" loading={submitting}>Submit</Button>
          </>
        }
      >
        <form id="registration-form" className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-ink">
            Horse
            <select className="mt-2 h-11 w-full rounded-lg border border-border px-3 outline-none focus:ring-2 focus:ring-brand-500" value={form.horseId} onChange={(event) => setForm({ ...form, horseId: event.target.value })} required>
              <option value="">Choose horse</option>
              {horses.map((horse) => (
                <option key={horse.id} value={horse.id}>{horse.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-ink">
            Tournament
            <select className="mt-2 h-11 w-full rounded-lg border border-border px-3 outline-none focus:ring-2 focus:ring-brand-500" value={form.tournamentId} onChange={(event) => setForm({ ...form, tournamentId: event.target.value })} required>
              <option value="">Choose tournament</option>
              {tournaments.map((tournament) => (
                <option key={tournament.tournamentId || tournament.id} value={tournament.tournamentId || tournament.id}>
                  {tournament.name || tournament.tournamentName}
                </option>
              ))}
            </select>
          </label>
        </form>
      </Modal>
    </div>
  );
}
