import { useState, useEffect } from 'react';
import { Play, BarChart2, Loader2 } from 'lucide-react';
import { getTournaments } from '../../services/tournament';
import { getRaceList } from '../../services/race';
import { Link } from 'react-router-dom';

export default function LiveRaces() {
  const [liveRaces, setLiveRaces] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [racesRes, tournamentsRes] = await Promise.all([
          getRaceList({ status: 'LIVE', size: 2 }),
          getTournaments({ status: 'UPCOMING', size: 4 })
        ]);
        
        setLiveRaces(racesRes?.items || []);
        setTournaments(tournamentsRes?.items || tournamentsRes || []);
      } catch (error) {
        console.error("Failed to fetch live races data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-[#1b2b3a] to-[#2d465c] text-white flex min-h-[320px]">
        {/* Placeholder for the horse racing image on the right */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-60 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1598516088276-2674e2d31ce2?q=80&w=2070&auto=format&fit=crop")' }}></div>
        <div className="absolute right-0 top-0 bottom-0 w-2/3 bg-gradient-to-r from-[#1b2b3a] via-[#1b2b3a]/80 to-transparent"></div>

        <div className="relative z-10 p-8 md:p-12 max-w-2xl flex flex-col justify-center">
          <div className="inline-flex items-center gap-1.5 bg-[#0b3b24] text-white text-xs font-bold px-2 py-1 rounded w-fit mb-4 uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            Race of the Day
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">The Emerald Stakes</h1>
          <p className="text-slate-300 mb-8 max-w-lg">
            Churchill Downs • Grade 1 • 1 1/4 Miles. The finest thoroughbreds clash in this season-defining high-stakes event.
          </p>

          <div className="flex gap-4 mb-8">
            <div className="bg-[#2a3c4f] border border-[#3b5166] rounded-lg p-3 text-center min-w-[70px]">
              <div className="text-2xl font-bold">02</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Hours</div>
            </div>
            <div className="bg-[#2a3c4f] border border-[#3b5166] rounded-lg p-3 text-center min-w-[70px]">
              <div className="text-2xl font-bold">45</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Mins</div>
            </div>
            <div className="bg-[#2a3c4f] border border-[#3b5166] rounded-lg p-3 text-center min-w-[70px]">
              <div className="text-2xl font-bold">12</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Secs</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="bg-[#0b3b24] hover:bg-[#0f4d2f] transition-colors text-white font-medium py-3 px-6 rounded-lg">
              Place Prediction
            </button>
            <button className="bg-transparent hover:bg-white/10 border border-white/30 transition-colors text-white font-medium py-3 px-6 rounded-lg">
              View Field
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Live Now & Tournaments) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Live Now */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Live Now
              </h2>
              <button className="text-sm text-[#0b3b24] font-medium hover:underline">View All Live</button>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-2 flex justify-center py-8">
                  <Loader2 className="animate-spin text-[#0b3b24]" size={24} />
                </div>
              ) : liveRaces.length > 0 ? (
                liveRaces.map((race, idx) => (
                  <div key={race.id || idx} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-wider">
                          Race {race.raceCode} • In Progress
                        </span>
                        <h3 className="font-bold text-lg text-slate-900">{race.name || `Race ${race.raceCode}`}</h3>
                        <p className="text-sm text-slate-500">{race.trackCondition || 'Turf'} • {race.distanceMeter ? `${race.distanceMeter}m` : 'Unknown dist'}</p>
                      </div>
                      <Link to={`/spectator/predictions`} className="text-[#0b3b24] hover:text-[#0f4d2f]">
                        <Play size={20} />
                      </Link>
                    </div>
                    <div className="bg-slate-50 rounded border border-slate-100 p-3 flex justify-between items-center mt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#0b3b24] text-white flex items-center justify-center rounded font-bold text-xs">1</div>
                        <span className="font-medium text-sm">Participant</span>
                      </div>
                      <span className="font-bold text-sm text-[#0b3b24]">Leading</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                  No live races at the moment. Check the schedule for upcoming events.
                </div>
              )}
            </div>
          </section>

          {/* Tournament at a Glance */}
          <section>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-slate-400">📅</span>
                  Tournament at a Glance
                </h2>
                <button className="text-sm border border-slate-200 px-3 py-1.5 rounded text-slate-600 hover:bg-slate-50 transition-colors">
                  Full Calendar
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-medium">Date & Time</th>
                      <th className="px-6 py-3 font-medium">Event / Track</th>
                      <th className="px-6 py-3 font-medium">Grade</th>
                      <th className="px-6 py-3 font-medium text-right">Purse</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center">
                          <Loader2 className="animate-spin text-[#0b3b24] mx-auto" size={24} />
                        </td>
                      </tr>
                    ) : tournaments.length > 0 ? (
                      tournaments.slice(0, 4).map((tournament, idx) => (
                        <tr key={tournament.id || idx} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">{tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBA'}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{tournament.name || 'Unnamed Tournament'}</div>
                            <div className="text-slate-500 text-xs">{tournament.location || 'Multiple Tracks'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">
                              {tournament.status || 'TBA'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-medium">{tournament.purse ? `$${tournament.purse.toLocaleString()}` : 'TBA'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                          No tournaments scheduled at the moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column (Top Predictors) */}
        <div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-24">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
                <span className="text-emerald-600">🏆</span>
                Top Predictors
              </h2>
              <p className="text-xs text-slate-500">Global Leaderboard • This Week</p>
            </div>
            
            <div className="p-5">
              <div className="flex flex-col gap-4">
                
                {/* User 1 */}
                <div className="flex items-center gap-4 p-3 rounded-lg border border-emerald-100 bg-emerald-50/30">
                  <div className="font-bold text-lg w-4 text-center">1</div>
                  <div className="w-10 h-10 rounded-full bg-[#1b2b3a] text-white flex items-center justify-center font-bold text-sm">
                    AW
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">Alex Winston</div>
                    <div className="text-xs text-slate-500">68% Win Rate</div>
                  </div>
                  <div className="font-bold text-emerald-700 text-sm">
                    +245 pts
                  </div>
                </div>

                {/* User 2 */}
                <div className="flex items-center gap-4 p-2">
                  <div className="font-bold text-slate-400 text-lg w-4 text-center">2</div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                    SK
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-700">Sarah K.</div>
                    <div className="text-xs text-slate-500">62% Win Rate</div>
                  </div>
                  <div className="font-bold text-slate-700 text-sm">
                    +190 pts
                  </div>
                </div>

                {/* User 3 */}
                <div className="flex items-center gap-4 p-2">
                  <div className="font-bold text-slate-400 text-lg w-4 text-center">3</div>
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
                    MJ
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-700">Marcus J.</div>
                    <div className="text-xs text-slate-500">59% Win Rate</div>
                  </div>
                  <div className="font-bold text-slate-700 text-sm">
                    +175 pts
                  </div>
                </div>

                {/* User 4 */}
                <div className="flex items-center gap-4 p-2">
                  <div className="font-bold text-slate-400 text-lg w-4 text-center">4</div>
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                    TR
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-700">Tom Racing</div>
                    <div className="text-xs text-slate-500">55% Win Rate</div>
                  </div>
                  <div className="font-bold text-slate-700 text-sm">
                    +140 pts
                  </div>
                </div>

              </div>

              <button className="w-full mt-6 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                View Full Leaderboard
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
