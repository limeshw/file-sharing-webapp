import { Button } from "./ui/button.jsx";
import { Card } from "./ui/card.jsx";

export function EmptyState({ title, description, actionLabel, actionHref }) {
  return (
    <Card className="rounded-[32px] p-10 text-center">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted">{description}</p>
      {actionLabel && actionHref ? (
        <Button asChild className="mt-6">
          <a href={actionHref}>{actionLabel}</a>
        </Button>
      ) : null}
    </Card>
  );
}
