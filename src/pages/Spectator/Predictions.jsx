import { useState, useEffect } from 'react';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { getRaceList, getRaceEntries } from '../../services/race';
import { createPrediction, getMyPredictions } from '../../services/prediction';
import { getHorseDetail } from '../../services/horse';

export default function Predictions() {
  const [races, setRaces] = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);
  const [entries, setEntries] = useState([]);
  const [horses, setHorses] = useState({});
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [placingBet, setPlacingBet] = useState(false);

  // Form state
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [betType, setBetType] = useState('WIN');
  const [stake, setStake] = useState(100);

  // Message state
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch upcoming races on mount
  useEffect(() => {
    const fetchRaces = async () => {
      try {
        setLoadingRaces(true);
        // We assume status=SCHEDULED is what we want to predict on
        const res = await getRaceList({ status: 'SCHEDULED', size: 10 });
        const fetchedRaces = res?.items || [];
        setRaces(fetchedRaces);
        if (fetchedRaces.length > 0) {
          setSelectedRace(fetchedRaces[0]);
        }
      } catch (err) {
        setError('Failed to load upcoming races.');
      } finally {
        setLoadingRaces(false);
      }
    };
    fetchRaces();
  }, []);

  // Fetch entries when a race is selected
  useEffect(() => {
    if (!selectedRace) return;
    const fetchEntries = async () => {
      try {
        setLoadingEntries(true);
        setError('');
        const data = await getRaceEntries(selectedRace.id);
        const entriesList = Array.isArray(data) ? data : (data?.content || []);
        setEntries(entriesList);

        // Fetch horse details for each entry
        const horseMap = {};
        for (const entry of entriesList) {
          try {
            // Depending on what entry contains, maybe it has horseId or we use registrationId
            const horseId = entry.horseId || entry.registration?.horse?.id || entry.registrationId; // fallback logic
            if (horseId) {
              const horseDetail = await getHorseDetail(horseId);
              horseMap[entry.id || entry.entryId] = horseDetail;
            }
          } catch (e) {
            console.error("Failed to load horse detail for entry", entry);
          }
        }
        setHorses(horseMap);
        setSelectedEntry(null); // Reset selection
        setMessage('');
      } catch (err) {
        if (err.message.includes('prize_earned')) {
           setError('Database Error: Column "prize_earned" is missing in "race_entry". Please run ALTER TABLE in pgAdmin.');
        } else {
           setError('Failed to load race entries.');
        }
      } finally {
        setLoadingEntries(false);
      }
    };
    fetchEntries();
  }, [selectedRace]);

  const handleSelectRace = (race) => {
    setSelectedRace(race);
    setSelectedEntry(null);
  };

  const handleConfirmPrediction = async () => {
    if (!selectedRace || !selectedEntry) return;
    try {
      setPlacingBet(true);
      setError('');
      setMessage('');
      await createPrediction({
        raceId: selectedRace.id,
        predictedEntryId: selectedEntry.id || selectedEntry.entryId,
        predictionType: betType,
        stakeAmount: stake,
        idempotencyKey: `bet-${Date.now()}` // optional if required by API
      });
      setMessage('Prediction placed successfully!');
    } catch (err) {
      setError(err.message || 'Failed to place prediction. Please try again.');
    } finally {
      setPlacingBet(false);
    }
  };

  if (loadingRaces) {
    return <div className="p-8 text-center text-slate-500">Loading upcoming races...</div>;
  }

  const selectedHorseDetails = selectedEntry ? horses[selectedEntry.id || selectedEntry.entryId] : null;
  const horseName = selectedHorseDetails?.name || selectedEntry?.horseName || 'Unknown Horse';
  
  // Calculate mock return
  const mockOdds = 3.5;
  const estimatedReturn = Math.floor(stake * mockOdds);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Race Predictions</h1>
        <p className="text-slate-600 mb-6">Analyze data, consult experts, and place your predictions for upcoming elite races.</p>
        
        <div className="flex space-x-8">
          <button className="px-1 py-4 border-b-2 border-[#0b3b24] text-[#0b3b24] font-bold text-sm">
            Upcoming Races
          </button>
          <button className="px-1 py-4 border-b-2 border-transparent text-slate-500 font-medium text-sm hover:text-slate-800">
            My Active Predictions
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium">
          {error}
        </div>
      )}
      
      {message && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium">
          {message}
        </div>
      )}

      {races.length === 0 && !error ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
          No upcoming races found. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Race Details & Field) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Race Selection (Horizontal Scroll or Simple Select) */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {races.map((race) => (
                <button 
                  key={race.id}
                  onClick={() => handleSelectRace(race)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${
                    selectedRace?.id === race.id 
                      ? 'bg-[#0b3b24] text-white' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {race.name || race.raceCode}
                </button>
              ))}
            </div>

            {/* Race Header Card */}
            {selectedRace && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="inline-block bg-[#0b3b24]/10 text-[#0b3b24] text-xs font-bold px-2 py-1 rounded mb-3 uppercase tracking-wider">
                    {selectedRace.raceType || 'FLAT'}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedRace.name || selectedRace.raceCode}</h2>
                  <div className="flex items-center text-sm text-slate-500 gap-3">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {selectedRace.tournamentName || 'Elite Track'}</span>
                    <span>•</span>
                    <span>{selectedRace.distanceMeter ? `${selectedRace.distanceMeter}m` : 'N/A'}</span>
                    <span>•</span>
                    <span>{selectedRace.trackCondition || 'GOOD'}</span>
                  </div>
                </div>
                
                <div className="text-left md:text-right">
                  <div className="text-lg font-bold text-slate-900">
                    Post: {selectedRace.time || selectedRace.scheduledStartAt?.slice(11, 16) || 'TBA'}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-amber-600 mt-1 justify-start md:justify-end">
                    <Clock size={14} />
                    Scheduled: {selectedRace.date || selectedRace.scheduledStartAt?.slice(0, 10)}
                  </div>
                </div>
              </div>
            )}

            {/* Field & Predictions */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Field & Predictions</h3>
              
              {loadingEntries ? (
                <div className="p-8 text-center text-slate-500">Loading horses...</div>
              ) : entries.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-500">
                  No horses have been assigned to this race yet.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {entries.map((entry, index) => {
                    const isSelected = selectedEntry?.id === entry.id || selectedEntry?.entryId === entry.entryId;
                    const horseInfo = horses[entry.id || entry.entryId];
                    const eName = horseInfo?.name || entry.horseName || `Horse #${entry.entryNo || index + 1}`;
                    const eOdds = entry.odds || "3/1"; // Using mock odds if API doesn't provide
                    const eJockey = entry.jockeyName || "Unknown";
                    const eTrainer = horseInfo?.trainerName || "Unknown";

                    return (
                      <div 
                        key={entry.id || entry.entryId || index} 
                        className={`bg-white rounded-xl p-4 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden cursor-pointer transition-all ${
                          isSelected ? 'border-2 border-[#0b3b24]' : 'border border-slate-200 hover:border-[#0b3b24]/50'
                        }`}
                        onClick={() => setSelectedEntry(entry)}
                      >
                        {isSelected && <div className="absolute right-0 top-0 bottom-0 w-2 bg-[#0b3b24]"></div>}
                        
                        <div className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-xl shrink-0 ${
                          isSelected ? 'bg-emerald-100 text-[#0b3b24]' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {entry.laneNo || entry.entryNo || index + 1}
                        </div>
                        
                        <div className="flex-1 w-full text-center sm:text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h4 className="text-lg font-bold text-slate-900">{eName}</h4>
                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded mx-auto sm:mx-0">Odds: {eOdds}</span>
                          </div>
                          <div className="text-xs text-slate-500 flex flex-wrap justify-center sm:justify-start gap-2">
                            <span>J: {eJockey}</span>
                            <span>|</span>
                            <span>T: {eTrainer}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto pr-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => { setSelectedEntry(entry); setBetType('WIN'); }}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded text-sm font-bold transition-colors ${
                              isSelected && betType === 'WIN' ? 'bg-[#0b3b24] text-white shadow-sm' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >Win</button>
                          <button 
                            onClick={() => { setSelectedEntry(entry); setBetType('PLACE'); }}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded text-sm font-bold transition-colors ${
                              isSelected && betType === 'PLACE' ? 'bg-[#0b3b24] text-white shadow-sm' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >Place</button>
                          <button 
                            onClick={() => { setSelectedEntry(entry); setBetType('SHOW'); }}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded text-sm font-bold transition-colors ${
                              isSelected && betType === 'SHOW' ? 'bg-[#0b3b24] text-white shadow-sm' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >Show</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            
            {/* Potential Rewards Card */}
            <div className={`rounded-xl text-white overflow-hidden shadow-lg sticky top-24 transition-colors ${
              selectedEntry ? 'bg-[#0b3b24]' : 'bg-slate-400'
            }`}>
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="opacity-80">◶</span>
                  Potential Rewards
                </h2>
              </div>
              
              <div className={`p-6 ${selectedEntry ? 'bg-[#0f4d2f]' : 'bg-slate-500'}`}>
                {selectedEntry ? (
                  <>
                    <div className="flex justify-between items-center mb-4 text-sm">
                      <span className="text-emerald-100">Current Selection</span>
                      <span className="font-bold">{horseName} ({betType})</span>
                    </div>
                    <div className="flex justify-between items-center mb-6 text-sm">
                      <span className="text-emerald-100">Odds</span>
                      <span className="font-bold text-emerald-300">{mockOdds.toFixed(1)}/1</span>
                    </div>

                    <div className="mb-6">
                      <label className="block text-xs text-emerald-100 mb-2">Stake (Tokens)</label>
                      <input 
                        type="number" 
                        value={stake}
                        onChange={(e) => setStake(Number(e.target.value))}
                        className="w-full bg-white rounded p-3 text-slate-900 font-bold outline-none"
                        min="1"
                      />
                    </div>

                    <div className="flex justify-between items-end mb-6 pt-4 border-t border-white/20">
                      <span className="text-sm font-medium">Estimated Return</span>
                      <span className="text-3xl font-bold text-emerald-300">{estimatedReturn}</span>
                    </div>

                    <button 
                      onClick={handleConfirmPrediction}
                      disabled={placingBet || stake <= 0}
                      className="w-full bg-white text-[#0b3b24] font-bold py-3.5 rounded-lg hover:bg-emerald-50 transition-colors uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {placingBet ? 'Processing...' : 'Confirm Prediction'}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8 text-white/80">
                    Select a horse and prediction type to view potential rewards.
                  </div>
                )}
              </div>
            </div>

            {/* Expert Insight */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full border-2 border-[#0b3b24]"></span>
                Expert Insight
              </h3>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop" alt="Arthur Pendelton" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Arthur Pendelton</div>
                  <div className="text-xs text-slate-500">Senior Bloodstock Analyst</div>
                </div>
              </div>

              <div className="border-l-4 border-slate-200 pl-4 py-1 mb-4">
                <p className="text-sm text-slate-600 italic">
                  "Pay close attention to track conditions. On a firm turf, pace setters early on might fade in the final furlong."
                </p>
              </div>

              <button className="text-sm font-bold text-[#0b3b24] flex items-center gap-1 hover:text-[#0f4d2f]">
                Read Full Analysis <ArrowRight size={14} />
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
