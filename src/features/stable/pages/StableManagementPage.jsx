import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button, Skeleton, EmptyState, Modal } from "@/common/ui";
import { useHorseProfile, useDeleteHorse } from "../hooks";
import { HorseImageCard } from "../components/HorseImageCard";
import { PedigreeChart } from "../components/PedigreeChart";
import { TrainingRaceLog } from "../components/TrainingRaceLog";
import { LifetimeEarnings } from "../components/LifetimeEarnings";
import { MedicalRecordsCard } from "../components/MedicalRecordsCard";
import { useToast } from "@/common/providers/ToastProvider";

export default function StableManagementPage() {
  const navigate = useNavigate();
  const { horseId = "" } = useParams();
  const { data, isPending, isError } = useHorseProfile(horseId);
  const [delOpen, setDelOpen] = useState(false);
  const del = useDeleteHorse();
  const toast = useToast();

  if (isPending) return <StableSkeleton />;
  if (isError)
    return (
      <EmptyState
        title="Couldn't load horse profile"
        description="Please try again."
      />
    );
  if (!data) {
    return (
      <EmptyState
        title="No horses in your stable"
        description="Register your first horse to see its detailed profile."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="mt-1 rounded-lg p-1 text-muted transition-colors hover:bg-subtle hover:text-ink"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-ink">{data.name}</h1>
            <p className="mt-1 text-sm text-muted">
              ID: #{data.horseCode} · {data.breed} {data.gender}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/owner/stable/${horseId}/edit`)}
          >
            Edit Info
          </Button>
          <Button variant="danger" onClick={() => setDelOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <HorseImageCard
            imageUrl={data.imageUrl}
            name={data.name}
            status={data.status}
            grade={data.grade}
          />
          <PedigreeChart pedigree={data.pedigree} />
          <TrainingRaceLog raceHistory={data.raceHistory} />
        </div>

        <div className="flex flex-col gap-6">
          <LifetimeEarnings
            lifetimeEarnings={data.lifetimeEarnings}
            starts={data.starts}
            wins={data.wins}
            top3={data.top3}
          />
          <MedicalRecordsCard horseId={horseId} medical={data.medical} />
        </div>
      </div>

      <Modal
        open={delOpen}
        onClose={() => setDelOpen(false)}
        title="Delete horse?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDelOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={del.isPending}
              onClick={() =>
                del.mutate(horseId, {
                  onSuccess: () => {
                    toast.success("Horse deleted");
                    navigate("/owner/stable");
                  },
                })
              }
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Are you sure you want to delete{" "}
          <span className="font-medium text-ink">{data.name}</span>? This action
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

function StableSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
