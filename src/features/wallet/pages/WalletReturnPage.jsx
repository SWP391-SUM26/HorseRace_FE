import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button, Card, CardBody, Spinner } from "@/common/ui";
import { useVnPayReturn } from "../hooks";

export default function WalletReturnPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const query = useVnPayReturn(search);

  if (query.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Spinner />
          <p className="text-sm">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  const success = !query.isError && (query.data?.success ?? false);
  const message = query.isError
    ? "We could not verify this payment. Please check your wallet history."
    : query.data?.message ?? (success ? "Your top-up was successful." : "Your top-up was not completed.");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col items-center gap-4 py-10 text-center">
          {success ? (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-success">
              <CheckCircle2 size={32} />
            </span>
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-danger">
              <XCircle size={32} />
            </span>
          )}
          <div>
            <h1 className="text-xl font-semibold text-ink">
              {success ? "Payment successful" : "Payment failed"}
            </h1>
            <p className="mt-1 text-sm text-muted">{message}</p>
          </div>
          <Button onClick={() => navigate("/app/wallet")}>Back to wallet</Button>
        </CardBody>
      </Card>
    </div>
  );
}
