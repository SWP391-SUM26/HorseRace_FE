import { Link } from "react-router-dom";
import { Button } from "@/common/ui";

export function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border bg-surface px-6 py-4">
        <Link to="/" className="text-xl font-semibold text-brand-800">
          Equine Elite
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-muted hover:text-ink">
            Support
          </Link>
          <Link to="/login">
            <Button size="sm">Login</Button>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </main>

      <footer className="border-t border-border bg-surface px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-sm text-muted sm:flex-row">
          <span className="font-semibold text-brand-800">Equine Elite</span>
          <nav className="flex gap-4">
            <Link to="/" className="hover:text-ink">
              Terms of Service
            </Link>
            <Link to="/" className="hover:text-ink">
              Privacy Policy
            </Link>
            <Link to="/" className="hover:text-ink">
              Help Center
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
