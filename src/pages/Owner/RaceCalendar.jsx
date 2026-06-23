import { useState, useEffect } from "react";
import { Calendar, MapPin, Trophy, Loader2, ArrowRight } from "lucide-react";
import { getTournaments } from "../../services/tournament";
import { getRaceList, getRaceEntries } from "../../services/race";

export default function RaceCalendar() {
  const [activeTab, setActiveTab] = useState("tournaments");
  const [tournaments, setTournaments] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail Drawer State
  const [selectedRace, setSelectedRace] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [raceEntries, setRaceEntries] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleOpenDetail = async (race) => {
    setSelectedRace(race);
    setIsDetailOpen(true);
    setLoadingDetails(true);
    try {
      const raceId = race.id || race.raceId;
      const data = await getRaceEntries(raceId);
      setRaceEntries(Array.isArray(data) ? data : (data?.content || []));
    } catch (err) {
      console.error("Failed to fetch race entries", err);
      setRaceEntries([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    const fetchScheduleData = async () => {
      setLoading(true);
      try {
        if (activeTab === "tournaments") {
          const data = await getTournaments({ status: "PUBLISHED" });
          setTournaments(data?.items || data?.content || data || []);
        } else {
          const data = await getRaceList({ sortBy: "scheduledStartAt", sortDir: "asc" });
          setRaces(data?.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, [activeTab]);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-[#0f172a] mb-1">Race Calendar</h1>
        <p className="text-slate-600 text-sm">
          View upcoming tournaments and scheduled races to plan your stable's strategy.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 mb-6">
        <button
          onClick={() => setActiveTab("tournaments")}
          className={`pb-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "tournaments"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Upcoming Tournaments
        </button>
        <button
          onClick={() => setActiveTab("races")}
          className={`pb-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "races"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Scheduled Races
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : activeTab === "tournaments" ? (
        /* Tournaments List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.length > 0 ? (
            tournaments.map((tournament, idx) => (
              <div
                key={tournament.id || idx}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase">
                    {tournament.status || "Upcoming"}
                  </div>
                  <Trophy className="text-slate-400" size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {tournament.name || "Unnamed Tournament"}
                </h3>
                <div className="flex flex-col gap-1.5 text-sm text-slate-600 mb-5">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />{" "}
                    {tournament.startDate
                      ? new Date(tournament.startDate).toLocaleDateString()
                      : "TBA"}{" "}
                    -{" "}
                    {tournament.endDate
                      ? new Date(tournament.endDate).toLocaleDateString()
                      : "TBA"}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />{" "}
                    {tournament.location || "Multiple Tracks"}
                  </div>
                </div>
                <button className="w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-colors flex justify-center items-center gap-1">
                  Register Horses <ArrowRight size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              No upcoming tournaments found.
            </div>
          )}
        </div>
      ) : (
        /* Races List */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 font-bold tracking-wider">Race Name</th>
                  <th className="px-6 py-4 font-bold tracking-wider">
                    Tournament
                  </th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {races.length > 0 ? (
                  races.map((race, idx) => (
                    <tr
                      key={race.id || idx}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {race.date || "TBA"}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {race.time || "TBA"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {race.name || `Race ${race.raceCode}`}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {race.trackCondition || "Unknown Track"} •{" "}
                          {race.distanceMeter
                            ? `${race.distanceMeter}m`
                            : "Unknown dist"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {race.tournamentName || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                            race.status === "LIVE"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {race.status || "SCHEDULED"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={() => handleOpenDetail(race)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No scheduled races found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer Overlay */}
      {isDetailOpen && selectedRace && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex justify-end"
          onClick={() => setIsDetailOpen(false)}
        >
          {/* Drawer Content */}
          <div 
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Race Details</h3>
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Race Hero Info */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${selectedRace.status === 'LIVE' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {selectedRace.status || 'SCHEDULED'}
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    {selectedRace.tournamentName || "Independent Race"}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  {selectedRace.name || `Race ${selectedRace.raceCode}`}
                </h2>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-slate-500 text-xs font-medium mb-1">DATE & TIME</span>
                    <strong className="text-slate-800">
                      {selectedRace.scheduledStartAt ? new Date(selectedRace.scheduledStartAt).toLocaleString() : (selectedRace.date + ' ' + (selectedRace.time || ''))}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-slate-500 text-xs font-medium mb-1">DISTANCE</span>
                    <strong className="text-slate-800">{selectedRace.distanceMeter ? `${selectedRace.distanceMeter}m` : 'Unknown'}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-slate-500 text-xs font-medium mb-1">TRACK</span>
                    <strong className="text-slate-800">{selectedRace.trackCondition || 'GOOD'}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-slate-500 text-xs font-medium mb-1">WEATHER</span>
                    <strong className="text-slate-800">{selectedRace.weatherCondition || 'Clear'}</strong>
                  </div>
                </div>
              </div>

              {/* Entries List */}
              <div>
                <h4 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                  <span>Registered Horses</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{raceEntries.length} entries</span>
                </h4>
                
                {loadingDetails ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                  </div>
                ) : raceEntries.length > 0 ? (
                  <div className="space-y-3">
                    {raceEntries.map((entry, idx) => (
                      <div key={entry.id || entry.entryId || idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 border border-slate-200">
                            {entry.laneNo || entry.entryNo || idx + 1}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900">{entry.horseName || 'Unknown Horse'}</div>
                            <div className="text-xs text-slate-500">Jockey: {entry.jockeyName || 'TBA'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                    <p className="text-slate-500 text-sm">No horses registered for this race yet.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer Action */}
            <div className="p-6 border-t border-slate-200">
              <button 
                className="w-full py-3 bg-[#0f4a36] text-white font-bold rounded-lg hover:bg-[#0b3b24] transition-colors"
                onClick={() => setIsDetailOpen(false)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
