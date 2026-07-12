import type { ReactNode } from 'react';
import { CloudSun, Ruler, Trophy } from 'lucide-react';
import type { RaceDetailsVM } from '../types';

interface Props {
  going: RaceDetailsVM['going'];
  distance: RaceDetailsVM['distance'];
  raceTypeTile: RaceDetailsVM['raceTypeTile'];
}

interface Tile {
  icon: ReactNode;
  heading: string;
  value: string;
  sub: string;
}

export function RaceInfoTiles({ going, distance, raceTypeTile }: Props) {
  const tiles: Tile[] = [
    { icon: <CloudSun className="h-5 w-5" />, heading: 'GOING', value: going.label, sub: going.moisture },
    { icon: <Ruler className="h-5 w-5" />, heading: 'DISTANCE', value: distance.label, sub: distance.meters },
    { icon: <Trophy className="h-5 w-5" />, heading: 'RACE TYPE', value: raceTypeTile.label, sub: raceTypeTile.sub },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {tiles.map((t) => (
        <div key={t.heading} className="flex flex-col gap-1 rounded-2xl bg-subtle p-4">
          <span className="text-brand-700">{t.icon}</span>
          <span className="mt-1 text-[10px] font-semibold tracking-wider text-muted">{t.heading}</span>
          <span className="text-sm font-semibold text-ink">{t.value}</span>
          <span className="text-xs text-muted">{t.sub}</span>
        </div>
      ))}
    </div>
  );
}
