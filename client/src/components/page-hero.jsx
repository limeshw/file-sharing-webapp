import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, TimerReset, Zap } from "lucide-react";
import { Badge } from "./ui/badge.jsx";
import { Button } from "./ui/button.jsx";

export function PageHero() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="glass-panel rounded-[32px] p-8 sm:p-12 relative overflow-hidden group">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
        
        <div className="relative z-10">
          <Badge variant="secondary" className="mb-6 inline-flex gap-1.5 items-center bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border-indigo-100 dark:border-indigo-500/20 px-3 py-1 text-xs sm:text-sm shadow-sm backdrop-blur-md">
            <Zap className="size-3.5" />
            <span>Effortless file sharing</span>
          </Badge>
          
          <h1 className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-bold text-balance leading-[1.15] tracking-tight">
            Upload once. Share one clean link. Let <span className="premium-gradient-text">Linkify</span> handle the rest.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Send files with optional password protection, automatic expiry, and a beautifully clear download experience on every device.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 items-center">
            <Button asChild size="lg" className="rounded-2xl text-base px-8 h-14">
              <a href="#upload-panel">
                Start sharing
                <ArrowRight className="size-5 ml-1" />
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-2xl text-base px-8 h-14 bg-white/50 dark:bg-slate-900/50">
              <Link to="/dashboard">View history</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <FeatureCard
          Icon={ShieldCheck}
          title="Bank-grade security"
          description="Add a password when needed and keep the download flow straightforward for the receiver."
        />
        <FeatureCard
          Icon={TimerReset}
          title="Smart auto-expiry"
          description="Choose exactly how long the link should stay active to keep temporary transfers under control."
        />
        <FeatureCard
          Icon={Sparkles}
          title="Beautifully simple"
          description="One clear share page, one copy action, and a frictionless path from upload to download."
        />
      </div>
    </section>
  );
}

function FeatureCard({ Icon, title, description }) {
  return (
    <div className="glass-panel rounded-[28px] p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group cursor-default relative overflow-hidden">
      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>
      
      <div className="flex gap-4 relative z-10">
        <div className="flex shrink-0 size-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
          <Icon className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
        </div>
      </div>
    </div>
  );
}
