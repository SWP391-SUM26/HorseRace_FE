import { Card, CardBody } from "@/common/ui";

export function RaceDetails({ detail }) {
  const rows = [
    ["Course", detail.course],
    ["Distance", detail.distance],
    ["Grade", detail.grade],
    ["Purse", detail.purse]
  ];

  return (
    <Card>
      <CardBody>
        <h2 className="text-sm font-semibold text-ink">Selected Race Details</h2>
        <dl className="mt-4 flex flex-col gap-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 text-sm">
              <dt className="text-muted">{label}</dt>
              <dd className="font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </CardBody>
    </Card>
  );
}
