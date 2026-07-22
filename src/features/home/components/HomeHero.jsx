import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/common/ui";
import { HomeNavBar } from "./HomeNavBar";
import heroBg from "@/assets/hero-horses.png";

export function HomeHero() {
  return (
    <header className="relative overflow-hidden bg-brand-900">
      {/* Faint horse photo behind a dark gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroBg})` }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-900/70 via-brand-900/80 to-brand-900"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <HomeNavBar />

        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center md:py-32">
          <span className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
            ✦ The Vanguard of Thoroughbred Management
          </span>

          <h1 className="text-5xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-6xl">
            Elite Power.
            <br />
            <span className="text-brand-50/90">Absolute Precision.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            The world's most sophisticated racing operating system. Unified data
            for the sport of kings, delivering real-time performance analytics
            and seamless syndicate oversight.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link to="/register/spectator">
              <Button size="lg" className="gap-2">
                Initialize Platform
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              to="/login"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/30 bg-transparent px-6 text-base font-medium text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              Request Credentials
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
