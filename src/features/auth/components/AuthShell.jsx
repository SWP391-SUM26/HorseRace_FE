import { Link } from "react-router-dom";
import { Button } from "@/common/ui";

export function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        <Link to="/" className="text-xl font-semibold text-brand-800">
          Equine Elite
        </Link>
        <Link to="/login">
          <Button size="sm">Login</Button>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">{children}</main>
    </div>
  );
}
