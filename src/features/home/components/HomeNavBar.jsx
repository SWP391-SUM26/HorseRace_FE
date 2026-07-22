import { Link } from "react-router-dom";
import { Button } from "@/common/ui";
import { useAuth } from "@/common/hooks/useAuth";
import { ROLE_HOME } from "@/common/config/roles";

// "Register" jumps to the role picker further down the page; the rest are
// placeholder marketing anchors carried over from the v2 design.
const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "Platform", href: "#" },
  { label: "Solutions", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Register", href: "#register" },
];

export function HomeNavBar() {
  const { user } = useAuth();

  return (
    <nav className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <Link to="/" className="text-lg font-semibold tracking-tight text-white">
        Equine Elite
      </Link>

      <ul className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-white/80 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      {user ? (
        <Link to={ROLE_HOME[user.role]}>
          <Button size="sm">Dashboard</Button>
        </Link>
      ) : (
        <Link to="/login">
          <Button size="sm">Login</Button>
        </Link>
      )}
    </nav>
  );
}
