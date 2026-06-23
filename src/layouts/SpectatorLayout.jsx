import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User } from 'lucide-react';

export default function SpectatorLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Live Races', path: '/spectator/live-races' },
    { name: 'Schedule', path: '/spectator/schedule' },
    { name: 'Predictions', path: '/spectator/predictions' },
    { name: 'Rewards', path: '/spectator/rewards' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/spectator/live-races" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0b3b24] rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
                </div>
                <span className="font-bold text-xl text-[#0b3b24] tracking-tight">Equine Elite</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-[#0b3b24] text-[#0b3b24]'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              <button className="text-slate-500 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <Search size={20} />
              </button>
              <button className="text-slate-500 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="text-slate-500 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors"
                title="View profile"
                aria-label="View user profile"
              >
                <User size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#2a3441] text-slate-300 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl text-emerald-400 tracking-tight">Equine Elite</span>
          </div>
          
          <div className="text-xs text-slate-400 flex flex-wrap justify-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Betting Integrity</a>
            <a href="#" className="hover:text-white transition-colors">Platform Status</a>
          </div>

          <div className="text-xs text-slate-500">
            © 2024 Equine Elite Racing. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
