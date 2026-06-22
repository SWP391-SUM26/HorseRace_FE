import { useState, useEffect } from 'react';
import { Calendar, MapPin, Flag, Trophy, Loader2 } from 'lucide-react';
import { getTournaments } from '../../services/tournament';
import { getRaceList } from '../../services/race';
import { Link } from 'react-router-dom';

export default function Schedule() {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [tournaments, setTournaments] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheduleData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'tournaments') {
          // Fetch tournaments
          const data = await getTournaments({ status: 'UPCOMING' }); // Assuming there's a way to filter, or just get all
          // Fallback if the API structure is different: data.items or data
          setTournaments(data?.items || data || []);
        } else {
          // Fetch races
          const data = await getRaceList({ sortBy: 'scheduledStartAt', sortDir: 'asc' });
          setRaces(data?.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch schedule data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Race Schedule</h1>
        <p className="text-slate-600 mb-6">View upcoming tournaments and scheduled races across all tracks.</p>
        
        <div className="flex space-x-8">
          <button 
            onClick={() => setActiveTab('tournaments')}
            className={`px-1 py-4 border-b-2 font-bold text-sm transition-colors ${activeTab === 'tournaments' ? 'border-[#0b3b24] text-[#0b3b24]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Upcoming Tournaments
          </button>
          <button 
            onClick={() => setActiveTab('races')}
            className={`px-1 py-4 border-b-2 font-bold text-sm transition-colors ${activeTab === 'races' ? 'border-[#0b3b24] text-[#0b3b24]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Scheduled Races
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-[#0b3b24]" size={32} />
        </div>
      ) : activeTab === 'tournaments' ? (
        /* Tournaments List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.length > 0 ? tournaments.map((tournament, idx) => (
            <div key={tournament.id || idx} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded uppercase">
                  {tournament.status || 'Upcoming'}
                </div>
                <Trophy className="text-slate-400" size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{tournament.name || 'Unnamed Tournament'}</h3>
              <div className="flex flex-col gap-2 text-sm text-slate-600 mb-6">
                <div className="flex items-center gap-2"><Calendar size={16} className="text-slate-400" /> {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBA'} - {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : 'TBA'}</div>
                <div className="flex items-center gap-2"><MapPin size={16} className="text-slate-400" /> {tournament.location || 'Multiple Tracks'}</div>
              </div>
              <button className="w-full py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                View Details
              </button>
            </div>
          )) : (
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
                  <th className="px-6 py-4 font-bold tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Race Name</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Tournament</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {races.length > 0 ? races.map((race, idx) => (
                  <tr key={race.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{race.date || 'TBA'}</div>
                      <div className="text-slate-500 text-xs">{race.time || 'TBA'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{race.name || `Race ${race.raceCode}`}</div>
                      <div className="text-slate-500 text-xs">{race.trackCondition || 'Unknown Track'} • {race.distanceMeter ? `${race.distanceMeter}m` : 'Unknown dist'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {race.tournamentName || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${race.status === 'LIVE' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {race.status || 'SCHEDULED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to="/spectator/predictions" className="text-sm font-bold text-[#0b3b24] hover:text-[#0f4d2f] hover:underline">
                        Predict
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      No scheduled races found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
