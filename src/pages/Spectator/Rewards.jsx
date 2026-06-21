import { Bell, CheckCircle2, XCircle, Clock, Trophy, Lock, ArrowRight, BarChart2 } from 'lucide-react';

export default function Rewards() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Rewards & History</h1>
        <p className="text-slate-600">Track your performance and redeem elite privileges.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Available Balance */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 h-full flex flex-col justify-center">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available Balance</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-[#0b3b24]">12,450</span>
                  <span className="text-xl font-bold text-slate-400">PTS</span>
                </div>
              </div>
              <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                Elite Tier
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-500">Progress to Platinum Tier</span>
                <span className="text-slate-900">12,450 / 15,000</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#0b3b24] h-2.5 rounded-full" style={{ width: '83%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div>
          <div className="bg-white rounded-xl border border-slate-200 h-full flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center gap-2">
              <Bell className="text-slate-400" size={18} />
              <h2 className="font-bold text-slate-900">Recent Alerts</h2>
            </div>
            
            <div className="p-5 flex-1 flex flex-col gap-3">
              {/* Alert 1 */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="text-emerald-600 mt-0.5" size={16} />
                <div>
                  <div className="text-xs font-bold text-slate-900 mb-0.5">PREDICTION RESULT: WIN</div>
                  <div className="text-sm text-slate-600 mb-1">Race 4 at Ascot. You earned +450 pts.</div>
                  <div className="text-xs text-slate-400">2 hours ago</div>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                <Trophy className="text-slate-600 mt-0.5" size={16} />
                <div>
                  <div className="text-xs font-bold text-slate-900 mb-0.5">REWARD CLAIMED</div>
                  <div className="text-sm text-slate-600 mb-1">VIP Paddock Pass generated.</div>
                  <div className="text-xs text-slate-400">Yesterday</div>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg flex items-start gap-3">
                <XCircle className="text-red-500 mt-0.5" size={16} />
                <div>
                  <div className="text-xs font-bold text-slate-900 mb-0.5">PREDICTION RESULT: LOSS</div>
                  <div className="text-sm text-slate-600 mb-1">Race 2 at Meydan. -100 pts.</div>
                  <div className="text-xs text-slate-400">2 days ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Prediction History */}
      <div className="mb-12">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="text-slate-400" size={20} />
              Prediction History
            </h2>
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors">
              View All <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Event & Race</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Selection</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Type</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Outcome</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">Oct 24, 2023</td>
                  <td className="px-6 py-4 font-bold text-slate-900">Ascot - Race 4</td>
                  <td className="px-6 py-4 text-slate-700">Golden Horn</td>
                  <td className="px-6 py-4 text-slate-500">To Win</td>
                  <td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded uppercase">Win</span></td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">+450</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">Oct 22, 2023</td>
                  <td className="px-6 py-4 font-bold text-slate-900">Meydan - Race 2</td>
                  <td className="px-6 py-4 text-slate-700">Desert Storm</td>
                  <td className="px-6 py-4 text-slate-500">Place</td>
                  <td className="px-6 py-4"><span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 rounded uppercase">Loss</span></td>
                  <td className="px-6 py-4 text-right font-bold text-slate-600">-100</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">Oct 20, 2023</td>
                  <td className="px-6 py-4 font-bold text-slate-900">Churchill - Race 8</td>
                  <td className="px-6 py-4 text-slate-700">American Pharoah</td>
                  <td className="px-6 py-4 text-slate-500">Exacta</td>
                  <td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded uppercase">Win</span></td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">+1,200</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">Oct 18, 2023</td>
                  <td className="px-6 py-4 font-bold text-slate-900">Longchamp - Race 1</td>
                  <td className="px-6 py-4 text-slate-700">Enable</td>
                  <td className="px-6 py-4 text-slate-500">To Win</td>
                  <td className="px-6 py-4"><span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase">Pending</span></td>
                  <td className="px-6 py-4 text-right font-bold text-slate-400">--</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Trophy Room & Shop */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Trophy Room & Shop</h2>
        <p className="text-slate-600 mb-6">Redeem your accumulated points for exclusive platform benefits.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Shop Item 1 */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="h-40 bg-slate-800 relative">
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-2 py-1 rounded">
                5,000 PTS
              </div>
              {/* Abstract pattern placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-[#0b3b24] to-[#1a5c3a] opacity-80 flex items-center justify-center text-white/20">
                <Trophy size={64} />
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-bold text-lg text-slate-900 mb-2">Virtual Paddock Pass</h3>
              <p className="text-sm text-slate-600 mb-6 flex-1">
                Gain exclusive 24hr access to real-time paddock telemetry and pre-race veterinary notes.
              </p>
              <button className="w-full bg-[#0b3b24] text-white font-bold py-2.5 rounded-lg hover:bg-[#0f4d2f] transition-colors">
                Redeem Reward
              </button>
            </div>
          </div>

          {/* Shop Item 2 */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="h-40 bg-slate-800 relative">
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-2 py-1 rounded">
                12,000 PTS
              </div>
              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-indigo-900 opacity-80 flex items-center justify-center text-white/20">
                <BarChart2 size={64} />
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-bold text-lg text-slate-900 mb-2">Pro Analytics Unlock</h3>
              <p className="text-sm text-slate-600 mb-6 flex-1">
                Unlock Level 3 predictive models and historical trend analysis for the upcoming major weekend.
              </p>
              <button className="w-full bg-[#0b3b24] text-white font-bold py-2.5 rounded-lg hover:bg-[#0f4d2f] transition-colors">
                Redeem Reward
              </button>
            </div>
          </div>

          {/* Shop Item 3 (Locked) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="h-40 bg-slate-200 relative">
              <div className="absolute top-3 right-3 bg-white text-slate-500 text-xs font-bold px-2 py-1 rounded shadow-sm">
                25,000 PTS
              </div>
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-200 to-slate-300">
                <Lock size={32} className="mb-2" />
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-bold text-lg text-slate-900 mb-2">Micro-Syndicate Entry</h3>
              <p className="text-sm text-slate-600 mb-6 flex-1">
                1% fractional ownership entry into the upcoming seasonal yearling syndicate.
              </p>
              <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-2.5 rounded-lg cursor-not-allowed">
                Insufficient Points
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
