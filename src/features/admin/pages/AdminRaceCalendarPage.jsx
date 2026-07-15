import { useState } from "react";
import { RaceCalendarView } from "@/features/races/components/RaceCalendarView";
import { useTournaments } from "../hooks";
import { RaceFormModal } from "../components/RaceFormModal";
import { RaceDetailModal } from "../components/RaceDetailModal";
function AdminRaceCalendarPage() {
  const tournamentsQuery = useTournaments({});
  const tournaments = tournamentsQuery.data?.rows ?? [];
  const [adding, setAdding] = useState(false);
  const [manageRaceId, setManageRaceId] = useState(null);
  return <>
      <RaceCalendarView
    canManage
    onAddEvent={() => setAdding(true)}
    onSelectRace={(id) => setManageRaceId(id)}
  />

      {adding && <RaceFormModal mode="create" tournaments={tournaments} onClose={() => setAdding(false)} />}
      {manageRaceId && <RaceDetailModal raceId={manageRaceId} tournaments={tournaments} onClose={() => setManageRaceId(null)} />}
    </>;
}
export {
  AdminRaceCalendarPage as default
};
