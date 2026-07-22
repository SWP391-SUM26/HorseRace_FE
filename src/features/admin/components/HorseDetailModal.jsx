import { Badge, Modal, Skeleton } from "@/common/ui";
import { formatDate } from "@/common/lib/format";
import { useHorseMedical } from "../hooks";
import { humanize } from "../api";
import { HORSE_HEALTH_TONE, HORSE_STATUS_TONE } from "../constants";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value ?? "—"}</p>
    </div>
  );
}

/** Compute "N yrs" from an ISO date of birth. */
function ageFromDob(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const yrs = Math.floor(
    (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000),
  );
  return yrs >= 0 ? `${yrs} yr${yrs === 1 ? "" : "s"}` : null;
}

export function HorseDetailModal({ horse, onClose }) {
  const medicalQuery = useHorseMedical(horse.horseId);
  const med = medicalQuery.data;

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={horse.name ?? horse.horseCode ?? "Horse detail"}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          {horse.status && (
            <Badge tone={HORSE_STATUS_TONE[horse.status] ?? "neutral"}>
              {humanize(horse.status)}
            </Badge>
          )}
          {horse.healthStatus && (
            <Badge tone={HORSE_HEALTH_TONE[horse.healthStatus] ?? "neutral"}>
              {humanize(horse.healthStatus)}
            </Badge>
          )}
          <span className="text-xs text-muted">{horse.horseCode ?? "—"}</span>
          {horse.registrationStatus && (
            <span className="ml-auto text-xs text-muted">
              Reg: {humanize(horse.registrationStatus)}
            </span>
          )}
        </div>

        {/* Profile */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Owner" value={horse.ownerName} />
          <Field label="Microchip" value={horse.microchipNo} />
          <Field label="Gender" value={horse.gender && humanize(horse.gender)} />
          <Field label="Breed" value={horse.breed} />
          <Field label="Color" value={horse.color} />
          <Field label="Age" value={ageFromDob(horse.dateOfBirth)} />
          <Field
            label="Date of birth"
            value={horse.dateOfBirth ? formatDate(horse.dateOfBirth) : null}
          />
          <Field
            label="Weight"
            value={horse.weight != null ? `${horse.weight} kg` : null}
          />
          <Field label="Origin" value={horse.originCountry} />
        </div>

        {/* Medical / vet */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Medical &amp; Vet
          </p>
          {medicalQuery.isPending ? (
            <Skeleton className="h-16 w-full rounded" />
          ) : medicalQuery.isError ? (
            <p className="text-sm text-danger">
              Couldn't load medical status. Please try again.
            </p>
          ) : !med ? (
            <p className="text-sm text-muted">No medical status on record.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field
                label="Health"
                value={
                  med.healthStatus && (
                    <Badge
                      tone={HORSE_HEALTH_TONE[med.healthStatus] ?? "neutral"}
                    >
                      {humanize(med.healthStatus)}
                    </Badge>
                  )
                }
              />
              <Field
                label="Last check"
                value={
                  med.lastHealthCheckAt ? formatDate(med.lastHealthCheckAt) : null
                }
              />
              <Field
                label="Vaccinations"
                value={med.vaccinationsUpToDate ? "Up to date" : "Not current"}
              />
              {med.recoveryPercent != null && (
                <Field label="Recovery" value={`${med.recoveryPercent}%`} />
              )}
              {med.medicalNote && (
                <div className="col-span-2 sm:col-span-3">
                  <Field label="Note" value={med.medicalNote} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
