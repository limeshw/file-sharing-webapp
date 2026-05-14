import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, TimerReset } from "lucide-react";
import { Badge } from "./ui/badge.jsx";
import { Button } from "./ui/button.jsx";

export function PageHero() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[32px] border border-border bg-card p-7 shadow-glass sm:p-10">
        <h1 className="max-w-3xl text-4xl font-semibold text-balance sm:text-5xl">
          Upload once. Share one clean link. Let Linkify handle the rest.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Send files with optional password protection, automatic expiry, and a clear download experience on every screen size.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <a href="#upload-panel">
              Create link
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/dashboard">Recent transfers</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <FeatureCard
          Icon={ShieldCheck}
          title="Password protection"
          description="Add a password when needed and keep the download flow straightforward for the receiver."
        />
        <FeatureCard
          Icon={TimerReset}
          title="Automatic expiry"
          description="Choose how long the link should stay active and keep temporary transfers under control."
        />
        <FeatureCard
          Icon={Sparkles}
          title="Clean sharing flow"
          description="One clear share page, one copy action, and a simpler path from upload to download."
        />
      </div>
    </section>
  );
}

function FeatureCard({ Icon, title, description }) {
  return (
    <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
