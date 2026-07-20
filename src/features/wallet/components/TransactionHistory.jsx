import { Badge, Card, CardBody, DataTable, Pagination } from '@/common/ui';
import { formatMoney } from '@/common/lib/format';

function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/** "BET_STAKE" → "Bet Stake". */
function humanizeCategory(value) {
  return value.toLowerCase().split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/** Paged VND ledger — DEBIT shows negative/red, CREDIT positive/green. */
export function TransactionHistory({ rows, loading, page, totalPages, onPageChange }) {
  const columns = [
    { key: 'date', header: 'Date', render: (t) => <span className="text-muted">{fmtTime(t.createdAt)}</span> },
    { key: 'category', header: 'Type', render: (t) => humanizeCategory(String(t.txnCategory)) },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right tabular-nums',
      render: (t) => {
        const debit = t.entryType === 'DEBIT';
        return (
          <span className={debit ? 'font-medium text-danger' : 'font-medium text-success'}>
            {debit ? '-' : '+'}{formatMoney(t.amount)}
          </span>
        );
      },
    },
    {
      key: 'balance',
      header: 'Balance After',
      className: 'text-right tabular-nums text-muted',
      render: (t) => formatMoney(t.balanceAfter),
    },
    {
      key: 'entry',
      header: '',
      render: (t) => (
        <Badge tone={t.entryType === 'DEBIT' ? 'danger' : 'success'}>{t.entryType}</Badge>
      ),
    },
  ];

  return (
    <Card>
      <CardBody className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Transaction History</h3>
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(t) => t.walletTxnId}
          loading={loading}
          emptyLabel="No transactions yet"
        />
        <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
      </CardBody>
    </Card>
  );
}
