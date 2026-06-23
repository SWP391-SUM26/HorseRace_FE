import { useEffect, useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/StatCard";
import { getFinishedRaceList, getRaceResultDetail, recordRaceResult } from "../../services/referee";
import styles from "./RaceResultRecording.module.css";

export default function RaceResultRecording() {
  const [races, setRaces] = useState([]);
  const [raceId, setRaceId] = useState("");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function selectRace(id) {
    setRaceId(id);
    if (!id) return setDetail(null);
    setLoading(true);
    try { setDetail(await getRaceResultDetail(id)); }
    catch (e) { setError(e?.response?.data?.message || e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    getFinishedRaceList().then((items) => {
      setRaces(items);
      if (items[0]) selectRace(items[0].raceId);
      else setLoading(false);
    }).catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  async function unsupported() {
    try { await recordRaceResult(raceId, {}); } catch (e) { setError(e.message); }
  }

  return <>
    <PageHeader title="Race Result Recording" subtitle="Review finished race entries before recording official placements." />
    {error && <div className={styles.error}>{error}</div>}
    <Card className={styles.selector}><label>Finished Race<select value={raceId} onChange={(e) => selectRace(e.target.value)}><option value="">Select race</option>{races.map((race) => <option key={race.raceId} value={race.raceId}>{race.name} ({race.raceCode})</option>)}</select></label></Card>
    {loading ? <div className={styles.state}>Loading race entries...</div> : !detail ? <div className={styles.state}>No finished race is available.</div> :
      <Card className={styles.card}>
        <div className={styles.header}><div><h2>{detail.race.name}</h2><p>{detail.race.raceType} / {detail.race.distanceMeter}m</p></div><Badge>{detail.race.status}</Badge></div>
        <div className={styles.notice}>Backend has race-result entities but Swagger exposes no result GET/POST endpoint. Recording is disabled to avoid sending a fabricated request.</div>
        <table><thead><tr><th>Entry</th><th>Horse</th><th>Lane</th><th>Status</th><th>Position</th><th>Finish Time</th></tr></thead><tbody>{detail.entries.map((entry) => <tr key={entry.entryId}><td>{entry.entryCode}</td><td>{entry.horseName}</td><td>{entry.laneNo ?? "-"}</td><td>{entry.status}</td><td><input disabled placeholder="Unsupported" /></td><td><input disabled placeholder="Unsupported" /></td></tr>)}</tbody></table>
        <div className={styles.actions}><Button disabled onClick={unsupported}>Record Race Result</Button></div>
      </Card>}
  </>;
}
