import { Card, CardBody } from "@/common/ui";
function RaceDetails({ detail }) {
  const rows = [
    { label: "Course", value: detail.course },
    { label: "Distance", value: detail.distance },
    { label: "Grade", value: detail.grade },
    { label: "Purse", value: detail.purse }
  ];
  return <Card>
      <CardBody className="bg-subtle rounded-2xl">
        <h2 className="text-sm font-semibold text-ink">Selected Race Details</h2>
        <dl className="mt-3 flex flex-col gap-2.5">
          {rows.map((row) => <div key={row.label} className="flex items-center justify-between text-sm">
              <dt className="text-muted">{row.label}</dt>
              <dd className="font-medium text-ink">{row.value}</dd>
            </div>)}
        </dl>
      </CardBody>
    </Card>;
}
export {
  RaceDetails
};
