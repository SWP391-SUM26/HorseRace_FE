import { RaceCalendarView } from "../components/RaceCalendarView";
import { useOwnerRaceIds } from "../hooks";
function RaceCalendarPage() {
  const { data: myRaceIds } = useOwnerRaceIds();
  return <RaceCalendarView
    restrictToRaceIds={myRaceIds ?? null}
    subtitle="Track the races you've registered for."
    emptyLabel="No registered races yet"
    confirmHref={(raceId) => `/app/owner/races/${raceId}/confirm`}
  />;
}
export {
  RaceCalendarPage as default
};
