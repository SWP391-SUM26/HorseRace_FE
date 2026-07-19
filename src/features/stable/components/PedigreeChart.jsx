import { Card, CardHeader, CardBody, EmptyState } from "@/common/ui";

export function PedigreeChart({ pedigree }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-ink">Pedigree Chart</h2>
      </CardHeader>
      <CardBody>
        {!pedigree?.length ? (
          <EmptyState title="No pedigree data returned by API" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {pedigree.map((node) => (
              <div key={node.label} className="rounded-xl bg-subtle p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">{node.label}</p>
                <p className="mt-1 font-semibold text-ink">{node.name}</p>
                <p className="mt-0.5 text-xs text-muted">{node.detail}</p>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
