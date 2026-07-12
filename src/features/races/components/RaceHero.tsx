import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import heroBg from '@/assets/hero-horses.png';
import { formatDate } from '@/common/lib/format';

interface Props {
  raceName: string;
  tournamentName: string;
  venue: string;
  scheduledStartAt: string | null;
}

interface CountdownBox {
  value: string;
  label: string;
}

/** Derive an HH:MM:SS countdown (clamped to 0) from a future ISO timestamp. */
function computeCountdown(scheduledStartAt: string | null): CountdownBox[] {
  const target = scheduledStartAt ? new Date(scheduledStartAt).getTime() : NaN;
  const remainingMs = Number.isNaN(target) ? 0 : Math.max(target - Date.now(), 0);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return [
    { value: pad(hours), label: 'HOURS' },
    { value: pad(mins), label: 'MINS' },
    { value: pad(secs), label: 'SECS' },
  ];
}

export function RaceHero({ raceName, tournamentName, venue, scheduledStartAt }: Props) {
  const dateLabel = scheduledStartAt ? formatDate(scheduledStartAt) : 'TBD';
  const [countdown, setCountdown] = useState<CountdownBox[]>(() => computeCountdown(scheduledStartAt));

  useEffect(() => {
    setCountdown(computeCountdown(scheduledStartAt));
    const id = window.setInterval(() => setCountdown(computeCountdown(scheduledStartAt)), 1000);
    return () => window.clearInterval(id);
  }, [scheduledStartAt]);

  return (
    <div className="relative h-56 overflow-hidden rounded-2xl shadow-sm">
      <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-brand-900/70 to-brand-900/40" />

      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-4">
          <nav className="flex items-center gap-1 text-sm text-white/70">
            <span>Race Calendar</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">{tournamentName}</span>
          </nav>

          <div className="hidden shrink-0 rounded-xl bg-brand-900/50 p-3 backdrop-blur-sm sm:block">
            <p className="mb-2 text-center text-[10px] font-semibold tracking-wider text-white/70">
              POST TIME COUNTDOWN
            </p>
            <div className="flex items-center gap-1.5">
              {countdown.map((box, i) => (
                <div key={box.label} className="flex items-center gap-1.5">
                  <div className="flex w-12 flex-col items-center rounded-lg bg-white/10 px-2 py-1.5">
                    <span className="text-lg font-bold tabular-nums text-white">{box.value}</span>
                    <span className="text-[9px] tracking-wide text-white/60">{box.label}</span>
                  </div>
                  {i < countdown.length - 1 && <span className="text-lg font-bold text-white/60">:</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{raceName}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-white/80">
            <span>📍 {venue}</span>
            <span>📅 {dateLabel}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
