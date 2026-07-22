import { Card, CardHeader, CardBody, EmptyState, Skeleton } from "@/common/ui";
import { formatMoney } from "@/common/lib/format";
import { useHorseStandings } from "../hooks";

/**
 * Horse league table from `GET /standings/horses`.
 *
 * The endpoint already existed and worked, but no page called it — jockeys and
 * predictors had a table and horses did not. Ranking comes from OFFICIAL race
 * results and the prize actually earned, never from `horse.lifetime_earnings`,
 * which no code path writes.
 */
export function HorseStandings({ myHorseNames = [] }) {
  const { data, isPending, isError } = useHorseStandings();

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-ink">Bảng xếp hạng ngựa</h2>
        <p className="text-xs text-muted">
          Theo số lần thắng, rồi tới tiền thưởng — từ kết quả đã công nhận
        </p>
      </CardHeader>
      <CardBody className="p-0">
        {isPending ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            title="Chưa tải được bảng xếp hạng"
            description="Vui lòng thử lại."
          />
        ) : (data ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Chưa có kết quả nào được công nhận.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Ngựa</th>
                  <th className="px-4 py-3 text-right">Thắng / Đua</th>
                  <th className="px-4 py-3 text-right">Tiền thưởng</th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((row) => {
                  const mine = myHorseNames.includes(row.name);
                  return (
                    <tr
                      key={row.jockeyUserId}
                      className={`border-b border-border last:border-0 ${
                        mine ? "bg-brand-50" : ""
                      }`}
                    >
                      <td className="px-4 py-2 text-muted">{row.rank}</td>
                      <td className="px-4 py-2 font-medium text-ink">
                        {row.name}
                        {mine && (
                          <span className="ml-2 text-xs text-brand-700">
                            ngựa của bạn
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-muted">
                        {row.wins} / {row.starts}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-ink">
                        {formatMoney(row.earnings)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
