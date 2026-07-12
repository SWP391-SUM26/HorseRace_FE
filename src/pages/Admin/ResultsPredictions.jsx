import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/common/components/PageHeader";
import { Badge, Button, Card, CardBody, EmptyState, Skeleton, StatCard } from "@/common/ui";
import { getRaceList } from "@/services/race";
import { getPredictionList, getRaceResults } from "@/services/result";

function normalizeArray(payload) {
  if (Array.isArray(payload)) return payload;
  return payload?.items || payload?.content || payload?.data?.content || payload?.data || [];
}

function normalizeRaceResults(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.order)) return payload.order;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.order)) return payload.data.order;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  return [];
}

function isResultReadyRace(race) {
  const status = String(race.status || race.raceStatus || race.officialityStatus || "").toUpperCase();
  return ["FINISHED", "OFFICIAL", "COMPLETED"].includes(status);
}

export default function ResultsPredictions() {
  const [races, setRaces] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [results, setResults] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      setLoading(true);
      setError("");
      const errors = [];
      const [raceResult, predictionResult] = await Promise.allSettled([
        getRaceList({ page: 1, pageSize: 100, sortBy: "scheduledStartAt", sortOrder: "desc" }),
        getPredictionList(),
      ]);

      if (!mounted) return;

      if (raceResult.status === "fulfilled") {
        const raceData = raceResult.value;
        const nextRaces = raceData?.items || [];
        setRaces(nextRaces);
        const defaultRace = nextRaces.find(isResultReadyRace) || nextRaces[0];
        setSelectedRaceId(defaultRace?.raceId || defaultRace?.id || "");
      } else {
        errors.push(raceResult.reason?.response?.data?.message || raceResult.reason?.message || "Unable to load races.");
      }

      if (predictionResult.status === "fulfilled") {
        setPredictions(normalizeArray(predictionResult.value));
      } else {
        setPredictions([]);
        errors.push(predictionResult.reason?.response?.data?.message || predictionResult.reason?.message || "Unable to load predictions.");
      }

      setError(errors.join(" "));
      setLoading(false);
    }

    loadInitialData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedRaceId) {
      setResults([]);
      return;
    }

    let mounted = true;

    async function loadResults() {
      setDetailLoading(true);
      try {
        const data = await getRaceResults(selectedRaceId);
        if (mounted) setResults(normalizeRaceResults(data));
      } catch {
        if (mounted) setResults([]);
      } finally {
        if (mounted) setDetailLoading(false);
      }
    }

    loadResults();
    return () => {
      mounted = false;
    };
  }, [selectedRaceId]);

  const selectedRace = useMemo(
    () => races.find((race) => (race.raceId || race.id) === selectedRaceId),
    [races, selectedRaceId],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Results & Predictions"
        subtitle="Review official race results and prediction activity from live backend APIs."
      />

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-2xl" />)
        ) : (
          <>
            <StatCard label="Races Loaded" value={races.length} />
            <StatCard label="Result Rows" value={results.length} />
            <StatCard label="Predictions" value={predictions.length} hint="Current user history from backend." />
          </>
        )}
      </div>

      <Card>
        <CardBody>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">Official Results</h2>
              <p className="text-sm text-muted">Select a race to inspect its result rows.</p>
            </div>
            <select
              className="h-11 min-w-64 rounded-lg border border-border bg-surface px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              value={selectedRaceId}
              onChange={(event) => setSelectedRaceId(event.target.value)}
            >
              {races.map((race) => (
                <option key={race.raceId || race.id} value={race.raceId || race.id}>
                  {race.name || race.raceName || race.raceCode} {isResultReadyRace(race) ? `(${race.status || race.raceStatus})` : ""}
                </option>
              ))}
            </select>
          </div>

          {loading || detailLoading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : !selectedRace ? (
            <EmptyState title="No races returned" description="Race Management API did not return races." />
          ) : results.length === 0 ? (
            <EmptyState title="No results returned by API" description="Results are available after a race has been recorded or certified." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-medium">Position</th>
                    <th className="px-4 py-3 font-medium">Horse</th>
                    <th className="px-4 py-3 font-medium">Jockey</th>
                    <th className="px-4 py-3 font-medium">Finish Time</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.map((result, index) => (
                    <tr key={result.resultId || result.entryId || index}>
                      <td className="px-4 py-3 font-semibold text-ink">{result.position || result.finishPosition || index + 1}</td>
                      <td className="px-4 py-3">{result.horseName || "Unknown Horse"}</td>
                      <td className="px-4 py-3 text-muted">{result.jockeyName || "Not assigned"}</td>
                      <td className="px-4 py-3 text-muted">{result.finishTime || result.finishTimeText || "N/A"}</td>
                      <td className="px-4 py-3"><Badge tone="info">{result.officialityStatus || result.status || "PROVISIONAL"}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">Prediction Activity</h2>
              <p className="text-sm text-muted">Loaded from the backend prediction API. If admin list access is unavailable, it falls back to current-user history.</p>
            </div>
            <Button type="button" variant="secondary" onClick={() => window.location.reload()}>Refresh</Button>
          </div>

          {loading ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : predictions.length === 0 ? (
            <EmptyState
              title="No predictions returned"
              description="This endpoint only returns predictions made by the currently logged-in user."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-medium">Prediction</th>
                    <th className="px-4 py-3 font-medium">Race</th>
                    <th className="px-4 py-3 font-medium">Stake</th>
                    <th className="px-4 py-3 font-medium">Potential Payout</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {predictions.map((prediction, index) => (
                    <tr key={prediction.predictionId || index}>
                      <td className="px-4 py-3 font-semibold text-ink">{prediction.predictionType || "Prediction"}</td>
                      <td className="px-4 py-3 text-muted">{prediction.raceName || prediction.raceCode || "N/A"}</td>
                      <td className="px-4 py-3 text-muted">{prediction.stakeAmount ?? "N/A"}</td>
                      <td className="px-4 py-3 text-muted">{prediction.potentialPayout ?? "N/A"}</td>
                      <td className="px-4 py-3"><Badge tone="info">{prediction.status || "PENDING"}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
