import { useState } from "react";
import { Tabs } from "@/common/ui";
import RegistrationManagementPage from "./RegistrationManagementPage";
import RegistrationApprovalPage from "./RegistrationApprovalPage";

const TABS = [
  { key: "horses", label: "Horse Registrations" },
  { key: "applicants", label: "Applicant Approvals" },
];

/** One nav entry combining horse-registration review and applicant onboarding as tabs. */
export default function RefereeRegistrationsPage() {
  const [tab, setTab] = useState("horses");
  return (
    <div className="flex flex-col gap-5">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "horses" ? (
        <RegistrationManagementPage />
      ) : (
        <RegistrationApprovalPage />
      )}
    </div>
  );
}
