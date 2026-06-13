import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, ShieldCheck, TimerReset, Upload } from "lucide-react";
import { PageHero } from "../components/page-hero.jsx";
import { UploadForm } from "../components/upload-form.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card } from "../components/ui/card.jsx";

export function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#upload-panel") {
      const timer = setTimeout(() => {
        const element = document.getElementById("upload-panel");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="space-y-8">
      <PageHero />
      <UploadForm />

      <section className="grid gap-6 lg:grid-cols-3">
        <MiniStory
          Icon={Upload}
          title="Fast upload"
          description="Drop a file, choose an expiry, and create a share link in a few clicks."
        />
        <MiniStory
          Icon={ShieldCheck}
          title="Optional protection"
          description="Add a password only when you need extra control for the receiver."
        />
        <MiniStory
          Icon={TimerReset}
          title="Temporary by design"
          description="Every transfer has a clear lifetime so shared files do not stay around forever."
        />
      </section>

      <Card className="rounded-xl p-8 border border-border bg-card/40 shadow">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent transfers</p>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">See the files you shared from this browser.</h2>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              Use the dashboard to reopen recent links, check their status, and continue sharing when needed.
            </p>
          </div>
          <Button asChild variant="secondary" className="rounded-lg h-10 border border-border">
            <Link to="/dashboard">
              Open dashboard
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

function MiniStory({ Icon, title, description }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-6 shadow shadow-black/5 hover:-translate-y-0.5 transition-all duration-300">
      <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
        <Icon className="size-5" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
