import { ArrowUpRight, Database, ShieldCheck, TimerReset } from "lucide-react";
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
          Icon={Database}
          title="Backend storage flow"
          description="Multer keeps the file in memory, Cloudinary stores the asset, and MongoDB stores only metadata."
        />
        <MiniStory
          Icon={ShieldCheck}
          title="Download protection"
          description="Protected files are unlocked only after successful password verification and a signed access key."
        />
        <MiniStory
          Icon={TimerReset}
          title="Expiry behavior"
          description="Expired links return a `410` state and are cleaned from both MongoDB and Cloudinary by the backend."
        />
      </section>

      <Card className="rounded-[32px] bg-gradient-to-r from-slate-950 via-blue-950 to-emerald-950 p-8 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-white/55">Recent transfer tracking</p>
            <h2 className="mt-2 text-3xl font-semibold">Open the dashboard for your latest uploads from this browser.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
              The backend does not expose a list-all-files endpoint, so the dashboard intentionally uses local recent upload history and refreshes each card against `GET /files/meta/:uuid`.
            </p>
          </div>
          <Button asChild variant="secondary" className="bg-white/10 text-white hover:bg-white/16">
            <a href="/dashboard">
              Open dashboard
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}

function MiniStory({ Icon, title, description }) {
  return (
    <div className="glass-panel rounded-[30px] p-6">
      <div className="mb-4 flex size-12 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 text-white">
        <Icon className="size-5" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
