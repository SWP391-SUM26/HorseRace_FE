import { MapPin, Clock, ArrowRight } from 'lucide-react';

export default function Predictions() {
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Race Details & Field) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Race Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="inline-block bg-[#0b3b24]/10 text-[#0b3b24] text-xs font-bold px-2 py-1 rounded mb-3 uppercase tracking-wider">
                Grade 1 Stakes
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">The Royal Ascot Gold Cup</h2>
              <div className="flex items-center text-sm text-slate-500 gap-3">
                <span className="flex items-center gap-1"><MapPin size={14} /> Ascot Racecourse, UK</span>
                <span>•</span>
                <span>2m 4f</span>
                <span>•</span>
                <span>Turf</span>
              </div>
            </div>
            
            <div className="text-left md:text-right">
              <div className="text-lg font-bold text-slate-900">Post: 14:30 GMT</div>
              <div className="flex items-center gap-1 text-sm font-medium text-red-600 mt-1 justify-start md:justify-end">
                <Clock size={14} />
                Closes in 45m
              </div>
            </div>
          </div>

          {/* Field & Predictions */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Field & Predictions</h3>
            
            <div className="flex flex-col gap-4">
              
              {/* Horse 1 */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-12 h-12 bg-[#0b3b24] text-white flex items-center justify-center rounded-lg font-bold text-xl shrink-0">
                  1
                </div>
                <div className="flex-1 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold text-slate-900">Thunderstrike</h4>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded mx-auto sm:mx-0">Odds: 3/1</span>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap justify-center sm:justify-start gap-2">
                    <span>J: L. Dettori</span>
                    <span>|</span>
                    <span>T: J. Gosden</span>
                    <span>|</span>
                    <span>Form: 1-1-2</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Win</button>
                  <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Place</button>
                  <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Show</button>
                </div>
              </div>

              {/* Horse 2 - Selected */}
              <div className="bg-white rounded-xl border-2 border-[#0b3b24] p-4 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-[#0b3b24]"></div>
                <div className="w-12 h-12 bg-blue-100 text-blue-800 flex items-center justify-center rounded-lg font-bold text-xl shrink-0">
                  2
                </div>
                <div className="flex-1 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold text-slate-900">Midnight Phantom</h4>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2 py-0.5 rounded mx-auto sm:mx-0">Odds: 5/2 F</span>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap justify-center sm:justify-start gap-2">
                    <span>J: R. Moore</span>
                    <span>|</span>
                    <span>T: A. O'Brien</span>
                    <span>|</span>
                    <span>Form: 2-1-1</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto pr-2">
                  <button className="flex-1 sm:flex-none px-4 py-2 bg-[#0b3b24] text-white rounded text-sm font-bold shadow-sm transition-colors">Win</button>
                  <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Place</button>
                  <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Show</button>
                </div>
              </div>

              {/* Horse 3 */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 flex items-center justify-center rounded-lg font-bold text-xl shrink-0">
                  3
                </div>
                <div className="flex-1 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold text-slate-900">Crimson Tide</h4>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded mx-auto sm:mx-0">Odds: 8/1</span>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap justify-center sm:justify-start gap-2">
                    <span>J: W. Buick</span>
                    <span>|</span>
                    <span>T: C. Appleby</span>
                    <span>|</span>
                    <span>Form: 3-4-1</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Win</button>
                  <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Place</button>
                  <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Show</button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* Potential Rewards Card */}
          <div className="bg-[#0b3b24] rounded-xl text-white overflow-hidden shadow-lg sticky top-24">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="opacity-80">◶</span>
                Potential Rewards
              </h2>
            </div>
            
            <div className="p-6 bg-[#0f4d2f]">
              <div className="flex justify-between items-center mb-4 text-sm">
                <span className="text-emerald-100">Current Selection</span>
                <span className="font-bold">Midnight Phantom (Win)</span>
              </div>
              <div className="flex justify-between items-center mb-6 text-sm">
                <span className="text-emerald-100">Odds</span>
                <span className="font-bold text-emerald-300">5/2</span>
              </div>

              <div className="mb-6">
                <label className="block text-xs text-emerald-100 mb-2">Stake (Tokens)</label>
                <div className="bg-white rounded p-3 text-slate-900 font-bold">
                  100
                </div>
              </div>

              <div className="flex justify-between items-end mb-6 pt-4 border-t border-white/20">
                <span className="text-sm font-medium">Estimated Return</span>
                <span className="text-3xl font-bold text-emerald-300">350</span>
              </div>

              <button className="w-full bg-white text-[#0b3b24] font-bold py-3.5 rounded-lg hover:bg-emerald-50 transition-colors uppercase tracking-wide text-sm">
                Confirm Prediction
              </button>
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
                "Midnight Phantom looks exceptional on firm ground, but if the rain holds off, Thunderstrike's late acceleration could prove decisive over this distance. The pace will likely be dictated early by Crimson Tide."
              </p>
            </div>

            <button className="text-sm font-bold text-[#0b3b24] flex items-center gap-1 hover:text-[#0f4d2f]">
              Read Full Analysis <ArrowRight size={14} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
