import { Link } from "react-router-dom";
import { Briefcase, Users, Eye } from "lucide-react";
import { Button } from "@/common/ui";

/**
 * Role-based registration entry points.
 *
 * NOT part of FE-v2's home — v2 only ever linked to /register/spectator.
 * Carried over from the previous landing page so owners and jockeys keep a
 * public way in, rebuilt here in the v2 Tailwind idiom.
 *
 * Uses the canonical /register/* paths; the older /owner-register style
 * aliases are still routed in App.jsx but are deprecated.
 */
const ROLES = [
  {
    label: "Owner",
    to: "/register/owner",
    icon: <Briefcase className="h-5 w-5" />,
    description: "Register horses and oversee your stable portfolio.",
  },
  {
    label: "Jockey",
    to: "/register/jockey",
    icon: <Users className="h-5 w-5" />,
    description: "Manage rides, bookings and weight analytics.",
  },
  {
    label: "Spectator",
    to: "/register/spectator",
    icon: <Eye className="h-5 w-5" />,
    description: "Follow live races, results and predictions.",
  },
];

export function RegisterStrip() {
  return (
    <section id="register" className="scroll-mt-8 bg-brand-900 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-50/80">
            Start from the right portal
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            Register by role
          </h2>
          <p className="mt-3 text-white/70">
            Pick the portal that matches you, or sign in with existing
            credentials.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {ROLES.map((role) => (
            <div
              key={role.label}
              className="flex flex-col rounded-2xl border border-white/15 bg-white/5 p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-brand-50">
                {role.icon}
              </div>
              <p className="text-lg font-semibold text-white">{role.label}</p>
              <p className="mt-1.5 flex-1 text-sm text-white/60">
                {role.description}
              </p>
              <Link to={role.to} className="mt-6 block">
                <Button className="w-full">Register as {role.label}</Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-white/60">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-white underline underline-offset-4 transition-colors hover:text-brand-50"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
