import { Link } from "react-router-dom";
import { Button } from "./ui/button.jsx";
import { Card } from "./ui/card.jsx";

export function EmptyState({ title, description, actionLabel, actionHref }) {
  return (
    <Card className="rounded-xl p-10 text-center border border-border bg-card/45 shadow-lg">
      <h2 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
      {actionLabel && actionHref ? (
        <Button asChild className="mt-6 shadow-sm">
          <Link to={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </Card>
  );
}
