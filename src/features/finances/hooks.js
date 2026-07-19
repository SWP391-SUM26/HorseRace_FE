import { useQuery } from "@tanstack/react-query";
import { financeOverviewMock } from "./mocks";
function fetchFinanceOverview() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(financeOverviewMock), 250);
  });
}
function useFinanceOverview() {
  return useQuery({
    queryKey: ["finances", "overview"],
    queryFn: fetchFinanceOverview
  });
}
export {
  useFinanceOverview
};
