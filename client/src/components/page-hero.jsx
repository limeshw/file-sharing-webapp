import { ArrowRight, ShieldCheck, Sparkles, TimerReset } from "lucide-react";
import { Badge } from "./ui/badge.jsx";
import { Button } from "./ui/button.jsx";

export function PageHero() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="glass-panel-strong relative overflow-hidden rounded-[36px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="absolute inset-0 subtle-grid opacity-60" />
        <div className="relative">
          <Badge className="mb-5 bg-white/80 text-foreground dark:bg-white/8 dark:text-foreground">
            Premium transfer experience powered by your real backend
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold text-balance sm:text-5xl">
            Ship secure file links with a calmer, faster, more modern Linkify.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            This client follows the backend exactly: `POST /api/files/upload`, `POST /api/files/verify-password`, `POST /api/files/send`, and `GET /files/meta/:uuid` drive the entire experience.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <a href="#upload-panel">
                Start uploading
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href="/dashboard">View recent transfers</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <FeatureCard
          Icon={ShieldCheck}
          title="Password-gated downloads"
          description="Uses the backend's signed temporary access key flow instead of inventing fake login auth."
        />
        <FeatureCard
          Icon={TimerReset}
          title="Expiry-aware sharing"
          description="Mirrors the backend's `1h`, `24h`, and `7d` options and shows real expiration timing."
        />
        <FeatureCard
          Icon={Sparkles}
          title="Zero-guessing UI mapping"
          description="Frontend states are derived from actual API messages, error codes, rate limits, and file metadata."
        />
      </div>
    </section>
  );
}

function FeatureCard({ Icon, title, description }) {
  return (
    <div className="glass-panel rounded-[28px] p-5">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/80 via-blue-500/80 to-emerald-400/80 text-white">
        <Icon className="size-5" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
