import { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { PageHeader } from '@/common/components/PageHeader';
import { Card, CardBody, CardHeader, EmptyState, Skeleton, StatCard } from '@/common/ui';
import { useAuth } from '@/common/hooks/useAuth';
import { cn } from '@/common/lib/cn';
import { buildTrophies, buildWinTrend } from '../api';
import { useJockeyStats, useLeaderboard, useMyRides } from '../hooks';
import type { LeaderboardEntry, Trophy as TrophyVM, WinTrendPoint } from '../types';

export default function PerformancePage() {
  const { user } = useAuth();
  const jockeyUserId = user?.id ?? '';

  const statsQuery = useJockeyStats(!!jockeyUserId);
  const pastRidesQuery = useMyRides('PAST', !!jockeyUserId);
  const leaderboardQuery = useLeaderboard();

  const winTrend = useMemo(
    () => buildWinTrend(pastRidesQuery.data ?? []),
    [pastRidesQuery.data],
  );
  const trophies = useMemo(
    () => buildTrophies(pastRidesQuery.data ?? []),
    [pastRidesQuery.data],
  );

  const stats = statsQuery.data;

  return (
    <>
      <PageHeader
        title="Performance & Achievements"
        subtitle={`Career milestones and analytical breakdown for ${user?.fullName ?? '—'}.`}
      />

      {/* KPI row — all REAL from GET /jockeys/me/stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statsQuery.isPending ? (
          <>
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </>
        ) : statsQuery.isError || !stats ? (
          <Card className="flex h-28 items-center justify-center p-6 text-sm text-muted sm:col-span-3">
            Không tải được thống kê
          </Card>
        ) : (
          <>
            <StatCard label="Total Career Wins" value={stats.careerWins} hint="All-time" />
            <StatCard label="Top 3 Finish Rate" value={`${stats.top3Rate}%`} hint="This season" />
            <StatCard label="Avg Placement" value={stats.avgPlacement} hint="Lower is better" />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* LEFT — win trend + trophy cabinet (REAL-derived from ride history) */}
        <div className="space-y-6 lg:col-span-2">
          <WinTrendCard
            points={winTrend}
            loading={pastRidesQuery.isPending}
            error={pastRidesQuery.isError}
          />
          <TrophyCabinetCard
            trophies={trophies}
            loading={pastRidesQuery.isPending}
            error={pastRidesQuery.isError}
          />
        </div>

        {/* RIGHT — current rankings (REAL from GET /jockeys) */}
        <RankingsCard
          entries={leaderboardQuery.data ?? []}
          loading={leaderboardQuery.isPending}
          error={leaderboardQuery.isError}
          currentUserId={jockeyUserId}
        />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Win Trend — REAL-derived (wins per month from GET /assignments/me/rides).
 * Simple inline bar chart; no external chart lib.
 * ------------------------------------------------------------------ */

function WinTrendCard({
  points,
  loading,
  error,
}: {
  points: WinTrendPoint[];
  loading: boolean;
  error: boolean;
}) {
  const maxWins = Math.max(...points.map((m) => m.wins), 1);
  const totalWins = points.reduce((sum, m) => sum + m.wins, 0);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">Win Trend (Last 12 Months)</h2>
        <span className="text-sm text-muted">{totalWins} wins</span>
      </CardHeader>
      <CardBody>
        {loading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : error ? (
          <p className="flex h-48 items-center justify-center text-sm text-muted">
            Không tải được dữ liệu.
          </p>
        ) : totalWins === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <EmptyState
              title="Chưa có chiến thắng trong 12 tháng qua"
              description="Biểu đồ sẽ hiển thị số trận thắng theo tháng khi có kết quả mới."
            />
          </div>
        ) : (
          <div className="flex h-48 items-end justify-between gap-2">
            {points.map((m, i) => {
              // Highlight the strongest month(s) in brand-700 for visual accent.
              const highlight = m.wins > 0 && m.wins >= maxWins;
              return (
                <div key={`${m.month}-${i}`} className="flex h-full flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={cn(
                        'w-full rounded-t-md transition-all',
                        highlight ? 'bg-brand-700' : 'bg-brand-500/40',
                      )}
                      style={{ height: `${(m.wins / maxWins) * 100}%` }}
                      title={`${m.month}: ${m.wins} wins`}
                      aria-label={`${m.month}: ${m.wins} wins`}
                      data-index={i}
                    />
                  </div>
                  <span className="text-[11px] text-muted">{m.month}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Trophy Cabinet — REAL-derived = races the jockey won (finishPosition === 1).
 * ------------------------------------------------------------------ */

function TrophyCabinetCard({
  trophies,
  loading,
  error,
}: {
  trophies: TrophyVM[];
  loading: boolean;
  error: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">Trophy Cabinet</h2>
        <span className="text-sm text-muted">{trophies.length} wins</span>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted">Không tải được dữ liệu.</p>
        ) : trophies.length === 0 ? (
          <EmptyState
            title="Chưa có cúp"
            description="Các cuộc đua về nhất sẽ hiển thị tại đây."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {trophies.map((t) => (
              <div
                key={`${t.name}-${t.year}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-brand-700 bg-brand-800 p-4 text-center text-white shadow-sm"
              >
                <Trophy size={24} className="text-warning" />
                <p className="text-sm font-medium leading-tight">{t.name}</p>
                <p className="text-xs text-white/70">{t.year}</p>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Current Rankings — REAL = full jockey roster sorted by career wins.
 * ------------------------------------------------------------------ */

const RANK_SCOPES = [
  { key: 'global', label: 'Global' },
  { key: 'regional', label: 'Regional' },
] as const;
type RankScope = (typeof RANK_SCOPES)[number]['key'];

function RankingsCard({
  entries,
  loading,
  error,
  currentUserId,
}: {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: boolean;
  currentUserId: string;
}) {
  // Scope toggle is presentational — the BE has one global roster for now.
  const [scope, setScope] = useState<RankScope>('global');

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">Current Rankings</h2>
        <div className="flex gap-1 rounded-lg bg-subtle p-0.5">
          {RANK_SCOPES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setScope(s.key)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                scope === s.key ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardBody className="flex flex-1 flex-col gap-1">
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted">Không tải được bảng xếp hạng.</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted">Chưa có dữ liệu xếp hạng.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {entries.map((row) => {
              const isCurrent = !!currentUserId && row.jockeyUserId === currentUserId;
              return (
                <li
                  key={row.jockeyUserId}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                    isCurrent ? 'bg-brand-50 ring-1 ring-brand-700/30' : 'hover:bg-subtle/60',
                  )}
                >
                  <span
                    className={cn(
                      'w-5 shrink-0 text-sm font-semibold tabular-nums',
                      isCurrent ? 'text-brand-700' : 'text-muted',
                    )}
                  >
                    {row.rank}
                  </span>
                  <span className="inline-flex h-6 w-7 shrink-0 items-center justify-center rounded-md bg-subtle text-[10px] font-semibold text-muted">
                    {row.code}
                  </span>
                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate text-sm',
                      isCurrent ? 'font-semibold text-brand-800' : 'font-medium text-ink',
                    )}
                  >
                    {row.name}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                    {row.wins.toLocaleString('en-US')}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
