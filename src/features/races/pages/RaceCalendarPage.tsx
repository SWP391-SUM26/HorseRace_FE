import { RaceCalendarView } from '../components/RaceCalendarView';
import { useOwnerRaceIds } from '../hooks';

/** Owner Race Calendar — shows only the races the owner's horses are entered into. */
export default function RaceCalendarPage() {
  const { data: myRaceIds } = useOwnerRaceIds();

  return (
    <RaceCalendarView
      restrictToRaceIds={myRaceIds ?? null}
      subtitle="Track the races you've registered for."
      emptyLabel="No registered races yet"
      confirmHref={(raceId) => `/app/owner/races/${raceId}/confirm`}
    />
  );
}
