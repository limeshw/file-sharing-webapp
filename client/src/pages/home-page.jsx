import { Link } from "react-router-dom";
import { ArrowUpRight, ShieldCheck, TimerReset, Upload } from "lucide-react";
import { PageHero } from "../components/page-hero.jsx";
import { UploadForm } from "../components/upload-form.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card } from "../components/ui/card.jsx";

export function HomePage() {
  return (
    <div className="space-y-6">
      <PageHero />
      <UploadForm />

      <section className="grid gap-4 lg:grid-cols-3">
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

      <Card className="rounded-[32px] p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted">Recent transfers</p>
            <h2 className="mt-2 text-3xl font-semibold">See the files you shared from this browser.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              Use the dashboard to reopen recent links, check their status, and continue sharing when needed.
            </p>
          </div>
          <Button asChild variant="secondary">
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
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex size-12 items-center justify-center rounded-3xl bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
